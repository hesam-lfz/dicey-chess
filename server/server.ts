/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { isProfane } from 'no-profanity';
import { WebSocket, WebSocketServer } from 'ws';

import { ClientError, errorMiddleware, authMiddleware } from './lib/index.js';

type User = {
  userId: number;
  username: string;
  hashedPassword: string;
  rank: number;
};

type Auth = {
  username: string;
  password: string;
};

type SavedGame = {
  userId: number;
  at: number;
  duration: number;
  opponent: string;
  outcome: number;
  moveHistory: string;
  diceRollHistory: string;
  userPlaysWhite: boolean;
};

type InviteRequestResponse = {
  status: number;
  pin?: string;
};

const disallowedUsernames = ['AI', 'ai'];
// Game connection requests timeout after 5 min.
const pendingGameConnectionTimeout = 300000;
// Games timeout after 20 min.
const gameTimeout = 1200000;
// Timeout for waiting for a graceful closing of connection before a hard close:
const pendingGameConnectionCloseTimeout = 20000;

const pendingGameFriendInviteRequestsFrom: Record<string, string> = {};
const pendingGameFriendInviteRequestsTo: Record<string, string> = {};
const gameConnectionPins: Record<string, string> = {};
const pendingGameConnections: Record<string, WebSocket> = {};
const inProgressGameConnections: Record<string, WebSocket> = {};

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const hashKey = process.env.TOKEN_SECRET;
if (!hashKey) throw new Error('TOKEN_SECRET not found in .env');

// Create paths for static directories
const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

const app = express();

app.use(express.static(reactStaticDir));
// Static directory for file uploads server/public/
app.use(express.static(uploadsStaticDir));
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { username, password, rank } = req.body;
    if (!username || !password)
      throw new ClientError(400, 'Username and password are required fields');
    const usernameLength = username.length;
    const passwordLength = password.length;
    if (usernameLength < 5 || usernameLength > 15)
      throw new ClientError(
        400,
        'Username should be 5-15 characters. Please try again!'
      );
    if (passwordLength < 5 || passwordLength > 20)
      throw new ClientError(
        400,
        'Password should be 5-20 characters. Please try again!'
      );
    if (disallowedUsernames.includes(username) || isProfane(username))
      throw new ClientError(400, 'Username is not allowed');
    const hashedPassword = await argon2.hash(password);
    const sql = `
      insert into "users" ("username", "hashedPassword", "rank")
      values ($1, $2, $3)
      returning "userId", "username", "createdAt"
    `;
    const params = [username, hashedPassword, rank];
    const result = await db.query<User>(sql, params);
    const [user] = result.rows;
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/signin', async (req, res, next) => {
  try {
    const { username, password } = req.body as Partial<Auth>;
    if (!username || !password) throw new ClientError(401, 'invalid login');
    const sql = `
    select "userId",
           "hashedPassword",
           "rank"
      from "users"
     where "username" = $1
  `;
    const params = [username];
    const result = await db.query<User>(sql, params);
    const [user] = result.rows;
    if (!user) throw new ClientError(401, 'invalid login -- User not found!');
    const { userId, hashedPassword, rank } = user;
    if (!(await argon2.verify(hashedPassword, password)))
      throw new ClientError(401, 'invalid login -- Wrong password!');
    const payload = { userId, username, rank };
    const token = jwt.sign(payload, hashKey);
    res.json({ token, user: payload });
  } catch (err) {
    next(err);
  }
});

// Load all games saved by the user (stored in database):
app.get('/api/games', authMiddleware, async (req, res, next) => {
  try {
    const sql = `
      select *
      from "games"
      where "userId" = $1
      order by "at" desc
    `;
    const params = [req.user?.userId];
    const result = await db.query(sql, params);
    if (!result.rows[0])
      throw new ClientError(404, `Cannot find user ${req.user?.userId}!`);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Save a game by the user (store on database):
app.post('/api/games', authMiddleware, async (req, res, next) => {
  try {
    const {
      userId,
      at,
      duration,
      opponent,
      outcome,
      moveHistory,
      diceRollHistory,
      userPlaysWhite,
    } = req.body;
    if (
      typeof userId !== 'number' ||
      typeof at !== 'number' ||
      typeof duration !== 'number' ||
      typeof opponent !== 'string' ||
      typeof outcome !== 'number' ||
      !moveHistory ||
      !diceRollHistory ||
      typeof userPlaysWhite !== 'boolean'
    )
      throw new ClientError(
        400,
        'Proper params for userId, at, duration, opponent, outcome, moveHistory, diceRollHistory, and userPlaysWhite are required.'
      );
    if (req.user?.userId !== userId)
      throw new ClientError(
        400,
        'Params userId does not match userId in authentication.'
      );
    const sql = `
      insert into "games" ("userId", "at", "duration", "opponent", "outcome", "moveHistory", "diceRollHistory", "userPlaysWhite")
        values ($1, $2, $3, $4, $5, $6, $7, $8)
        returning *
    `;
    const params = [
      req.user?.userId,
      at,
      duration,
      opponent,
      outcome,
      moveHistory,
      diceRollHistory,
      userPlaysWhite,
    ];
    const result = await db.query<SavedGame>(sql, params);
    const [savedGame] = result.rows;
    res.status(201).json(savedGame);
  } catch (err) {
    next(err);
  }
});

// Delete a game by the user (stored on database):
app.delete('/api/games', authMiddleware, async (req, res, next) => {
  try {
    const { userId, at } = req.body;
    if (typeof userId !== 'number' || typeof at !== 'number')
      throw new ClientError(
        400,
        'Proper params for userId and at are required.'
      );
    if (req.user?.userId !== userId)
      throw new ClientError(
        400,
        'Params userId does not match userId in authentication.'
      );
    const sql = `
      delete from "games"
        where "userId" = $1 and "at" = $2
        returning *
    `;
    const params = [req.user?.userId, at];
    const result = await db.query<SavedGame>(sql, params);
    const [deletedGame] = result.rows;
    res.status(201).json(deletedGame);
  } catch (err) {
    next(err);
  }
});

// Update a user's stored rank in the database:
app.put('/api/users/:userId', authMiddleware, async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId < 0)
      throw new ClientError(400, 'userId must be a natural number');
    const { rank } = req.body;
    if (typeof rank !== 'number')
      throw new ClientError(400, 'rank (number) is required');
    if (req.user?.userId !== userId)
      throw new ClientError(
        400,
        'Params userId does not match userId in authentication.'
      );
    const sql = `
      update "users"
        set "rank" = $1
        where "userId" = $2
        returning *
    `;
    const params = [rank, req.user?.userId];
    const result = await db.query(sql, params);
    const [user] = result.rows;
    if (!user)
      throw new ClientError(404, `Cannot find user with userId ${userId}`);
    res.json({ userId: user.userId, rank: user.rank });
  } catch (err) {
    next(err);
  }
});

// Receives a request to play an online friend.
// Records the request parties and if both parties have sent the request
// Sends status (1 = waiting for other player's invite, 0 = ready)
// First checks if friend username exists in the database, and fails if not.
// If this is 2nd+ attempt from client (as its waiting for other party to
// also send invite): isRecheck = true
app.get('/api/invite/:username', authMiddleware, async (req, res, next) => {
  try {
    const { isRecheck } = req.body;
    if (typeof isRecheck !== 'string')
      throw new ClientError(400, 'Param isRecheck is required');
    const requestingPlayerId = String(req.user!.userId);
    const priorRequestedFriendId =
      pendingGameFriendInviteRequestsFrom[requestingPlayerId];
    // If any pending prior request from user, cancel and refuse invite:
    if (!isRecheck && priorRequestedFriendId) {
      cancelFriendInviteRequest(requestingPlayerId, priorRequestedFriendId);
      throw new ClientError(
        400,
        'There is already a pending friend invite request from the requester'
      );
    }
    const username = req.params.username;
    if (!username || typeof username !== 'string') {
      throw new ClientError(400, 'Proper username is required');
    }
    const sql = `
      select "userId",
             "username"
      from "users"
      where "username" = $1
    `;
    const params = [username];
    const result = await db.query(sql, params);
    const [user] = result.rows;
    if (!user)
      throw new ClientError(404, `Cannot find user with username ${username}`);
    if (user.userId === req.user?.userId)
      throw new ClientError(400, 'Cannot send invitation to self');
    const requestedPlayerId = String(user.userId);
    // Check if invite request possible:
    if (!isRecheck && pendingGameFriendInviteRequestsTo[requestedPlayerId])
      throw new ClientError(
        400,
        'There is already a pending friend invite request for the requested'
      );
    // Record the request:
    pendingGameFriendInviteRequestsFrom[requestingPlayerId] = requestedPlayerId;
    pendingGameFriendInviteRequestsTo[requestedPlayerId] = requestingPlayerId;
    // status = 0 means both players did mutual invite,
    // status = 1 means only 1 way so far:
    const status =
      pendingGameFriendInviteRequestsFrom[requestedPlayerId] &&
      pendingGameFriendInviteRequestsTo[requestingPlayerId]
        ? 0
        : 1;
    // If handshake is complete (both players have invited each other),
    // establish a connection:
    console.log(
      'current requests from',
      JSON.stringify(pendingGameFriendInviteRequestsFrom),
      'current requests to',
      JSON.stringify(pendingGameFriendInviteRequestsTo)
    );
    // timeout pending request after 5 min:
    setTimeout(
      () => cancelFriendInviteRequest(requestingPlayerId, requestedPlayerId),
      pendingGameConnectionTimeout
    );
    // return status of request:
    const responseData: InviteRequestResponse = { status };
    // if we're ready to start establishing connection, add a pin for socket communication:
    if (status === 0) {
      responseData.pin = generateConnectionPin();
      gameConnectionPins[requestingPlayerId] = responseData.pin!;
      // Timeout game after a while:
      setTimeout(() => {
        delete gameConnectionPins[requestingPlayerId];
      }, gameTimeout);
    }
    res.json(responseData);
  } catch (err) {
    next(err);
  }
});

/*
 * Handles paths that aren't handled by any other route handler.
 * It responds with `index.html` to support page refreshes with React Router.
 * This must be the _last_ route, just before errorMiddleware.
 */
app.get('*', (req, res) => res.sendFile(`${reactStaticDir}/index.html`));

app.use(errorMiddleware);

// HTTP server to handle incoming HTTP requests:
const server = app.listen(process.env.PORT, () => {
  console.log('Express server listening on port', process.env.PORT);
});

// WebSocket server to handle online game connections (between 2 players):
const wsServer = new WebSocketServer({ server });

wsServer.on('connection', (ws) => {
  console.log('Client connected');

  // Remove connection after a while, if game hasn't gotten started:
  let pendingGameCloseTimerId2: NodeJS.Timeout | null;
  const pendingGameCloseTimerId1 = setTimeout(() => {
    pendingGameCloseTimerId2 = closeStaleGameConnection(ws, true);
  }, pendingGameConnectionTimeout);

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    const { userId, pin, type, data } = JSON.parse(message.toString());
    if (!userId) throw new ClientError(400, 'Websocket message missing userId');
    const friendId = pendingGameFriendInviteRequestsFrom[userId];
    if (!friendId)
      throw new ClientError(400, 'There is no pending invite from userId');
    if (!(pin && gameConnectionPins[userId] === pin))
      throw new ClientError(400, 'Websocket message with invalid pin');
    if (type === 'connection') {
      if (data === 'open') {
        ws.send(JSON.stringify({ type: 'connection', data: 'hand' }));
      } else if (data === 'shake') {
        pendingGameConnections[userId] = ws;
        // remove after a while (if game hasn't gotten started):
        const pendingGameDataCleanupTimerId = setTimeout(
          () => removeStaleGameData(userId),
          pendingGameConnectionTimeout
        );
        const friendWs = pendingGameConnections[friendId];
        if (friendWs) {
          // Both parties established connection and game is ready:
          const msg = JSON.stringify({ type: 'connection', data: 'ready' });
          ws.send(msg);
          friendWs.send(msg);
          // Move game from pending to in-progress:
          // Clear timeouts set out to clear unsuccessful connection attempts:
          clearTimeout(pendingGameDataCleanupTimerId);
          clearTimeout(pendingGameCloseTimerId1);
          if (pendingGameCloseTimerId2) clearTimeout(pendingGameCloseTimerId2);
          delete pendingGameConnections[userId];
          delete pendingGameConnections[friendId];
          inProgressGameConnections[userId] = ws;
          inProgressGameConnections[friendId] = friendWs;
          // Timeout game after a while:
          setTimeout(() => {
            closeStaleGameConnection(userId, false);
            removeStaleGameData(userId);
          }, gameTimeout);
        } else {
          // One party hasn't established connection yet. Tell the user
          // to wait and retry later:
          ws.send('wait');
        }
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Removes friend invite request (called after invite timeouts):
const cancelFriendInviteRequest = (
  requestingUserId: string,
  requestedUserId: string
): void => {
  const priorRequestedFriendId =
    pendingGameFriendInviteRequestsFrom[requestingUserId];
  if (priorRequestedFriendId) {
    delete pendingGameFriendInviteRequestsFrom[requestingUserId];
    if (pendingGameFriendInviteRequestsTo[requestedUserId] === requestingUserId)
      delete pendingGameFriendInviteRequestsTo[requestedUserId];
  }
};

// Generates a random pin for user connections
const generateConnectionPin = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * 26);
    result += chars[randomIndex];
  }
  return result;
};

// Starts the process of forcing a game connection to close, forcing a
// a termination if client is unresponsive after a while:
const closeStaleGameConnection = (
  connection: WebSocket,
  isForPendingGame: boolean
): NodeJS.Timeout | null => {
  // If connection is already closed, then nothing to do:
  if (!connection || connection.readyState === connection.CLOSED) return null;
  // If connection is not already closing, start the closing process:
  if (connection.readyState !== connection.CLOSING) connection.close();
  // check back later and if it is still pending close, force close it then:
  return setTimeout(
    () => closeStaleGameConnectionCheck(connection, isForPendingGame, 1),
    isForPendingGame ? pendingGameConnectionCloseTimeout : gameTimeout
  );
};

// Helper for function above to force a connection termination if needed:
const closeStaleGameConnectionCheck = (
  connection: WebSocket,
  isForPendingGame: boolean,
  attemptNumber: number = 1
): void => {
  // If connection is already closed, then nothing to do:
  if (connection.readyState === connection.CLOSED) return;
  if (attemptNumber <= 1)
    // check back later and if it is still pending close, force close it then:
    setTimeout(
      () =>
        closeStaleGameConnectionCheck(
          connection,
          isForPendingGame,
          attemptNumber + 1
        ),
      isForPendingGame ? pendingGameConnectionCloseTimeout : gameTimeout
    );
  // force a terminate
  else connection.terminate();
};

// Removes any cached data on a game that's ended:
const removeStaleGameData = (userId: string): void => {
  delete pendingGameConnections[userId];
  delete inProgressGameConnections[userId];
};

/*

// server.js
import { WebSocketServer } from 'ws';


//const wss = new WebSocketServer({ port: 8080 }); // <-- NO
//const wsServer = new webSocketServer({ httpServer: server });
const wsServer = new WebSocket.Server({ httpServer: server }); //?

wsServer.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', message => {
    console.log(`Received: ${message}`);
    ws.send(`Server: ${message}`); // Echo the message back to the client
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});

console.log('WebSocket server is running on ws://localhost:8080');

// client.js
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected to server');
  ws.send('Hello from client!');
});

ws.on('message', message => {
  console.log(`Received: ${message}`);
});

ws.on('close', () => {
  console.log('Disconnected from server');
});

ws.on('error', error => {
  console.error('WebSocket error:', error);
});

// Send a message every 3 seconds
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send('Another message from client');
  }
}, 3000);

*/
