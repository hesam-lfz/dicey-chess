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
  plus: boolean;
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

type OnlineGame = {
  userId: number;
  friendId: number;
  pending: boolean;
  pin: string;
};

type InviteRequestResponse = {
  status: number;
  pin?: string;
};

const disallowedUsernames = ['AI', 'ai'];
// Game connection requests timeout after 5 min.
const pendingGameConnectionTimeout = 300000;
// Games timeout after 30 min.
const gameTimeout = 1800000;
// Timeout for waiting for a graceful closing of connection before a hard close:
const pendingGameConnectionCloseTimeout = 20000;

const pendingGameFriendInviteRequestsFrom: Record<string, string> = {};
const pendingGameFriendInviteRequestsTo: Record<string, string> = {};

const pendingGameConnections: Record<string, WebSocket> = {};
const pendingGameFriendInviteRequestsClearTimeoutIds: Record<
  string,
  NodeJS.Timeout | null
> = {};
const pendingGameCloseTimeoutId1s: Record<string, NodeJS.Timeout | null> = {};
const pendingGameCloseTimeoutId2s: Record<string, NodeJS.Timeout | null> = {};
const pendingGameDataCleanupTimerIds: Record<string, NodeJS.Timeout | null> =
  {};
const inProgressGameCloseTimeoutIds: Record<string, NodeJS.Timeout | null> = {};
const gameConnectionPins: Record<string, string> = {};
const inProgressFriendGameInvitedFrom: Record<string, string> = {};
const inProgressGameConnections: Record<string, WebSocket> = {};
// To send each online game player the opponent's rank for the purpose of
// calculating the new player rank after game is done:
const onlineGamePlayerRanks: Record<string, number> = {};

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
    if (!/^[a-z0-9_.@]+$/.test(username)) {
      throw new ClientError(
        400,
        'Username should only contain alphanumeric characters!'
      );
    }
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
      insert into "users" ("username", "hashedPassword", "rank", "plus")
      values ($1, $2, $3, $4)
      returning "userId", "username", "createdAt"
    `;
    const params = [username, hashedPassword, rank, false];
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
           "rank",
           "plus"
      from "users"
     where "username" = $1
  `;
    const params = [username];
    const result = await db.query<User>(sql, params);
    const [user] = result.rows;
    if (!user) throw new ClientError(401, 'invalid login -- User not found!');
    const { userId, hashedPassword, rank, plus } = user;
    if (!(await argon2.verify(hashedPassword, password)))
      throw new ClientError(401, 'invalid login -- Wrong password!');
    const payload = { userId, username, rank, plus };
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
      from "savedGames"
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
      insert into "savedGames" ("userId", "at", "duration", "opponent", "outcome", "moveHistory", "diceRollHistory", "userPlaysWhite")
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
      delete from "savedGames"
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
app.put('/api/users/rank/:userId', authMiddleware, async (req, res, next) => {
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

// Update a user's stored plus account status in the database:
app.put('/api/users/plus/:userId', authMiddleware, async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId < 0)
      throw new ClientError(400, 'userId must be a natural number');
    const { plus } = req.body;
    if (typeof plus !== 'boolean')
      throw new ClientError(400, 'plus (boolean) is required');
    if (req.user?.userId !== userId)
      throw new ClientError(
        400,
        'Params userId does not match userId in authentication.'
      );
    const sql = `
      update "users"
        set "plus" = $1
        where "userId" = $2
        returning *
    `;
    const params = [plus, req.user?.userId];
    const result = await db.query(sql, params);
    const [user] = result.rows;
    if (!user)
      throw new ClientError(404, `Cannot find user with userId ${userId}`);
    res.json({ userId: user.userId, plus: user.plus });
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
app.get(
  '/api/invite/username/:username/isRecheck/:isRecheck',
  // '/api/invite/:username',
  authMiddleware,
  async (req, res, next) => {
    try {
      const isRecheckStr = req.params.isRecheck;
      if (typeof isRecheckStr !== 'string')
        throw new ClientError(400, 'Param isRecheck is required');
      const isRecheck = isRecheckStr === 'true';
      const requestingPlayerId = String(req.user!.userId);
      const priorRequestedFriendId =
        pendingGameFriendInviteRequestsFrom[requestingPlayerId];
      // If any pending prior request from user, cancel and refuse invite:
      if (!isRecheck && priorRequestedFriendId) {
        await cancelFriendInviteRequest(
          requestingPlayerId,
          priorRequestedFriendId,
          true
        );
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
             "username",
             "rank"
      from "users"
      where "username" = $1
    `;
      const params = [username];
      const result = await db.query(sql, params);
      const [user] = result.rows;
      if (!user)
        throw new ClientError(
          404,
          `Cannot find user with username ${username}`
        );
      if (user.userId === req.user?.userId)
        throw new ClientError(400, 'Cannot send invitation to self');
      const requestedPlayerId = String(user.userId);
      const requestedPlayerRank = user.rank;
      // Check if invite request possible:
      if (!isRecheck && pendingGameFriendInviteRequestsTo[requestedPlayerId])
        throw new ClientError(
          400,
          'There is already a pending friend invite request for the requested'
        );
      // Record the request:
      if (!isRecheck) {
        pendingGameFriendInviteRequestsFrom[requestingPlayerId] =
          requestedPlayerId;
        await databaseInsertPendingOnlineGame(
          requestingPlayerId,
          requestedPlayerId
        );
        pendingGameFriendInviteRequestsTo[requestedPlayerId] =
          requestingPlayerId;
        onlineGamePlayerRanks[requestedPlayerId] = requestedPlayerRank;
      }
      // status = 0 means both players did mutual invite,
      // status = 1 means only 1 way so far:
      const status =
        pendingGameFriendInviteRequestsFrom[requestedPlayerId] &&
        pendingGameFriendInviteRequestsTo[requestingPlayerId]
          ? 0
          : 1;
      // If handshake is complete (both players have invited each other),
      // establish a connection:
      /*
      console.log(
        'current requests from',
        JSON.stringify(pendingGameFriendInviteRequestsFrom),
        'current requests to',
        JSON.stringify(pendingGameFriendInviteRequestsTo)
      );
      */
      // timeout pending request after 5 min:
      // first clear if there's already a timer:
      const timeoutId =
        pendingGameFriendInviteRequestsClearTimeoutIds[requestingPlayerId];
      if (timeoutId) clearTimeout(timeoutId);
      // now add (or re-add) the timer:
      pendingGameFriendInviteRequestsClearTimeoutIds[requestingPlayerId] =
        setTimeout(
          async () =>
            await cancelFriendInviteRequest(
              requestingPlayerId,
              requestedPlayerId,
              true
            ),
          pendingGameConnectionTimeout
        );
      // return status of request:
      const responseData: InviteRequestResponse = { status };
      // if we're ready to start establishing connection, add a pin for socket communication:
      if (status === 0) {
        responseData.pin = generateConnectionPin();
        gameConnectionPins[requestingPlayerId] = responseData.pin!;
        await databaseStoreOnlineGamePin(requestingPlayerId, responseData.pin!);
        // Timeout game after a while:
        inProgressGameCloseTimeoutIds[requestingPlayerId] = setTimeout(
          async () => {
            delete gameConnectionPins[requestingPlayerId];
            await databaseDeleteOnlineGame(requestingPlayerId);
          },
          gameTimeout
        );
      }
      res.json(responseData);
    } catch (err) {
      next(err);
    }
  }
);

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

  let theUserId: string;

  // Remove connection after a while, if game hasn't gotten started or ended normally:
  let inProgressGameCloseTimeoutId1: NodeJS.Timeout | null;

  const pendingGameCloseTimeoutId1 = setTimeout(() => {
    pendingGameCloseTimeoutId2s[theUserId] = closeStaleGameConnection(ws);
  }, pendingGameConnectionTimeout);

  ws.on('message', async (message) => {
    // console.log(`Received: ${message}`);
    const { userId, pin, type, msg } = JSON.parse(message.toString());
    if (!userId) throw new ClientError(400, 'Websocket message missing userId');
    const friendId = (
      type === 'connection'
        ? pendingGameFriendInviteRequestsFrom
        : inProgressFriendGameInvitedFrom
    )[userId];
    if (!friendId)
      throw new ClientError(400, 'There is no pending invite from userId');
    if (!(pin && gameConnectionPins[userId] === pin))
      throw new ClientError(400, 'Websocket message with invalid pin');
    if (type === 'connection') {
      if (msg === 'open') {
        pendingGameCloseTimeoutId1s[userId] = pendingGameCloseTimeoutId1;
        theUserId = userId;
        ws.send(JSON.stringify({ type: 'connection', msg: 'hand' }));
      } else if (msg === 'shake') {
        pendingGameConnections[userId] = ws;
        // remove after a while (if game hasn't gotten started):
        pendingGameDataCleanupTimerIds[userId] = setTimeout(
          () => removeStaleGameData(userId),
          pendingGameConnectionTimeout
        );
        const friendWs = pendingGameConnections[friendId];
        if (friendWs) {
          // Both parties established connection and game is ready:
          const msg = {
            type: 'connection',
            msg: 'ready',
            data: {
              color: 'w',
              opponentRank: onlineGamePlayerRanks[friendId],
            },
          };
          // Randomize player colors and send both players game ready message:
          const connections = [ws, friendWs];
          const randomIndex = Math.floor(Math.random() * 2);
          msg.data.opponentRank =
            onlineGamePlayerRanks[randomIndex === 0 ? friendId : userId];
          connections[randomIndex].send(JSON.stringify(msg));
          msg.data.color = 'b';
          msg.data.opponentRank =
            onlineGamePlayerRanks[randomIndex === 0 ? userId : friendId];
          connections[randomIndex === 0 ? 1 : 0].send(JSON.stringify(msg));
          delete onlineGamePlayerRanks[userId];
          delete onlineGamePlayerRanks[friendId];
          // Move game from pending to in-progress:
          // Clear timeouts set out to clear unsuccessful connection attempts:
          const tidUser = pendingGameDataCleanupTimerIds[userId];
          if (tidUser) {
            clearTimeout(tidUser);
            delete pendingGameDataCleanupTimerIds[userId];
          }
          const tidFriend = pendingGameDataCleanupTimerIds[friendId];
          if (tidFriend) {
            clearTimeout(tidFriend);
            delete pendingGameDataCleanupTimerIds[friendId];
          }
          const tid1User = pendingGameCloseTimeoutId1s[userId];
          if (tid1User) {
            clearTimeout(tid1User);
            delete pendingGameCloseTimeoutId1s[userId];
          }
          const tid1Friend = pendingGameCloseTimeoutId1s[friendId];
          if (tid1Friend) {
            clearTimeout(tid1Friend);
            delete pendingGameCloseTimeoutId1s[friendId];
          }
          const tid2User = pendingGameCloseTimeoutId2s[userId];
          if (tid2User) {
            clearTimeout(tid2User);
            delete pendingGameCloseTimeoutId2s[userId];
          }
          const tid2Friend = pendingGameCloseTimeoutId2s[friendId];
          if (tid2Friend) {
            clearTimeout(tid2Friend);
            delete pendingGameCloseTimeoutId2s[friendId];
          }
          await cancelFriendInviteRequest(userId, friendId, false);
          delete pendingGameConnections[userId];
          delete pendingGameConnections[friendId];
          delete pendingGameFriendInviteRequestsFrom[userId];
          delete pendingGameFriendInviteRequestsTo[friendId];
          inProgressFriendGameInvitedFrom[userId] = friendId;
          inProgressFriendGameInvitedFrom[friendId] = userId;
          await databaseSetOnlineGameAsInProgress(userId, friendId);
          inProgressGameConnections[userId] = ws;
          inProgressGameConnections[friendId] = friendWs;
          // Timeout game after a while:
          inProgressGameCloseTimeoutId1 = setTimeout(() => {
            closeStaleGameConnectionAndRemoveData(userId, null);
          }, gameTimeout);
        }
      }
    } else if (type === 'game') {
      // forwarding a game event (roll or move) from the user to the opponent:
      const friendWs = inProgressGameConnections[friendId];
      if (!friendWs)
        throw new ClientError(
          400,
          'Websocket connection for friend was not found!'
        );
      if (['roll', 'move'].includes(msg)) {
        friendWs.send(message.toString());
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected', theUserId);
    // alert the opponent player that connection is closed and game aborted:
    const friendId =
      inProgressFriendGameInvitedFrom[theUserId] ||
      pendingGameFriendInviteRequestsFrom[theUserId];
    if (friendId) {
      const friendWs =
        inProgressGameConnections[friendId] || pendingGameConnections[friendId];
      if (friendWs)
        friendWs.send(JSON.stringify({ type: 'game', msg: 'abort' }));
    }
    // force connections close and remove any cache data related to this game:
    closeStaleGameConnectionAndRemoveData(
      theUserId,
      inProgressGameCloseTimeoutId1
    );
    // cacheLog();
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Removes friend invite request (called after connection established or invite timeouts):
const cancelFriendInviteRequest = async (
  requestingUserId: string,
  requestedUserId: string | undefined,
  deleteDatabaseEntry: boolean
): Promise<void> => {
  const priorRequestedFriendId =
    pendingGameFriendInviteRequestsFrom[requestingUserId];
  if (priorRequestedFriendId) {
    delete pendingGameFriendInviteRequestsFrom[requestingUserId];
    if (deleteDatabaseEntry) await databaseDeleteOnlineGame(requestingUserId);
    if (
      requestedUserId &&
      pendingGameFriendInviteRequestsTo[requestedUserId] === requestingUserId
    ) {
      delete pendingGameFriendInviteRequestsTo[requestedUserId];
      if (deleteDatabaseEntry) await databaseDeleteOnlineGame(requestedUserId);
    }
  }
  let timeoutId =
    pendingGameFriendInviteRequestsClearTimeoutIds[requestingUserId];
  if (timeoutId) clearTimeout(timeoutId);
  delete pendingGameFriendInviteRequestsClearTimeoutIds[requestingUserId];
  if (requestedUserId) {
    timeoutId = pendingGameFriendInviteRequestsClearTimeoutIds[requestedUserId];
    if (timeoutId) clearTimeout(timeoutId);
    delete pendingGameFriendInviteRequestsClearTimeoutIds[requestedUserId];
  }
};

// Closes game connection and remove any cache data related to game:
const closeStaleGameConnectionAndRemoveData = (
  userId: string,
  inProgressGameCloseTimeoutId1: NodeJS.Timeout | null
): void => {
  if (inProgressGameCloseTimeoutId1) {
    clearTimeout(inProgressGameCloseTimeoutId1);
    inProgressGameCloseTimeoutId1 = null;
  }
  const connection =
    inProgressGameConnections[userId] || pendingGameConnections[userId];
  if (connection) closeStaleGameConnection(connection);
  const timeoutId = inProgressGameCloseTimeoutIds[userId];
  if (timeoutId) {
    delete inProgressGameCloseTimeoutIds[userId];
    clearTimeout(timeoutId);
  }
  removeStaleGameData(userId);
};

// Removes any cached data on a game that's ended:
const removeStaleGameData = async (userId: string): Promise<void> => {
  const friendId =
    inProgressFriendGameInvitedFrom[userId] ||
    pendingGameFriendInviteRequestsFrom[userId];
  delete pendingGameConnections[userId];
  delete pendingGameFriendInviteRequestsFrom[userId];
  delete pendingGameFriendInviteRequestsTo[userId];
  delete pendingGameFriendInviteRequestsClearTimeoutIds[userId];
  delete inProgressGameConnections[userId];
  delete inProgressFriendGameInvitedFrom[userId];
  delete inProgressGameCloseTimeoutIds[userId];
  delete gameConnectionPins[userId];
  delete onlineGamePlayerRanks[userId];
  await databaseDeleteOnlineGame(userId);
  if (friendId) {
    delete pendingGameFriendInviteRequestsTo[friendId];
    delete pendingGameFriendInviteRequestsFrom[friendId];
    delete pendingGameFriendInviteRequestsClearTimeoutIds[friendId];
    delete pendingGameConnections[friendId];
    delete inProgressFriendGameInvitedFrom[friendId];
    delete inProgressGameConnections[friendId];
    delete inProgressGameCloseTimeoutIds[friendId];
    delete gameConnectionPins[friendId];
    delete onlineGamePlayerRanks[friendId];
    await databaseDeleteOnlineGame(friendId);
  }
  await cancelFriendInviteRequest(userId, friendId, false);
};

// Starts the process of forcing a game connection to close, forcing a
// a termination if client is unresponsive after a while:
const closeStaleGameConnection = (
  connection: WebSocket
): NodeJS.Timeout | null => {
  // If connection is already closed, then nothing to do:
  if (!connection || connection.readyState === connection.CLOSED) return null;
  // If connection is not already closing, start the closing process:
  if (connection.readyState !== connection.CLOSING) connection.close();
  // check back later and if it is still pending close, force close it then:
  return setTimeout(
    () => closeStaleGameConnectionCheck(connection, 1),
    pendingGameConnectionCloseTimeout
  );
};

// Helper for function above to force a connection termination if needed:
const closeStaleGameConnectionCheck = (
  connection: WebSocket,
  attemptNumber: number = 1
): void => {
  // If connection is already closed, then nothing to do:
  if (connection.readyState === connection.CLOSED) return;
  if (attemptNumber <= 1)
    // check back later and if it is still pending close, force close it then:
    setTimeout(
      () => closeStaleGameConnectionCheck(connection, attemptNumber + 1),
      pendingGameConnectionCloseTimeout
    );
  // force a terminate
  else connection.terminate();
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

const cacheLog = (): void => {
  console.log(
    'pendingGameFriendInviteRequestsFrom',
    pendingGameFriendInviteRequestsFrom,
    'pendingGameFriendInviteRequestsTo',
    pendingGameFriendInviteRequestsTo,
    'pendingGameConnections',
    Object.keys(pendingGameConnections),
    'pendingGameFriendInviteRequestsClearTimeoutIds',
    Object.keys(pendingGameFriendInviteRequestsClearTimeoutIds),
    'pendingGameCloseTimeoutId1s',
    Object.keys(pendingGameCloseTimeoutId1s),
    'pendingGameCloseTimeoutId2s',
    Object.keys(pendingGameCloseTimeoutId2s),
    'pendingGameDataCleanupTimerIds',
    Object.keys(pendingGameDataCleanupTimerIds),
    'inProgressGameCloseTimeoutIds',
    Object.keys(inProgressGameCloseTimeoutIds),
    'inProgressFriendGameInvitedFrom',
    inProgressFriendGameInvitedFrom,
    'inProgressGameConnections',
    Object.keys(inProgressGameConnections),
    'gameConnectionPins',
    gameConnectionPins,
    'onlineGamePlayerRanks',
    JSON.stringify(onlineGamePlayerRanks)
  );
};

// If the online game data isn't already in database, it'll create entry
// (one way invite):
const databaseInsertPendingOnlineGame = async (
  userId: string,
  friendId: string
): Promise<boolean> => {
  try {
    const sql1 = `
    select "userId", "friendId"
      from "onlineGames"
     where "userId" = $1
  `;
    const params1 = [+userId];
    const result1 = await db.query<OnlineGame>(sql1, params1);
    const [entry] = result1.rows;
    if (entry) {
      // console.log('pending online entry already exists');
      return false;
    } else {
      const sql2 = `
      insert into "onlineGames" ("userId", "friendId", "pending", "pin")
        values ($1, $2, $3, $4)
        returning *
      `;
      const params2 = [+userId, +friendId, true, ''];
      await db.query<OnlineGame>(sql2, params2);
      return true;
    }
  } catch (err) {
    console.log('db error', err);
    return false;
  }
};

// Modifies pending column to false in an online game db entry
// (called when game is starting and no longer pending):
const databaseSetOnlineGameAsInProgress = async (
  userId: string,
  friendId: string
): Promise<boolean> => {
  try {
    const sql = `
      update "onlineGames"
        set "pending" = $3
        where "userId" = $1 or "userId" = $2
        returning *
    `;
    const params = [+userId, +friendId, false];
    await db.query<OnlineGame>(sql, params);
    return true;
  } catch (err) {
    console.log('db error', err);
    return false;
  }
};

// Deletes online game entry from database:
const databaseDeleteOnlineGame = async (userId: string): Promise<boolean> => {
  try {
    const sql = `
      delete from "onlineGames"
        where "userId" = $1
        returning *
    `;
    const params = [+userId];
    await db.query<OnlineGame>(sql, params);
    return true;
  } catch (err) {
    console.log('db error', err);
    return false;
  }
};

// Sets the pin column for online game entry:
const databaseStoreOnlineGamePin = async (
  userId: string,
  pin: string
): Promise<boolean> => {
  try {
    const sql = `
      update "onlineGames"
        set "pin" = $2
        where "userId" = $1
        returning *
    `;
    const params = [+userId, pin];
    await db.query<OnlineGame>(sql, params);
    return true;
  } catch (err) {
    console.log('db error', err);
    return false;
  }
};

// Gets current entries for online games currently stored in the database:
const databaseGetOnlineGames = async (): Promise<OnlineGame[]> => {
  try {
    const sql = `
    select "userId", "friendId", "pending", "pin"
      from "onlineGames"
  `;
    const result = await db.query<OnlineGame>(sql);
    // console.log('databaseGetOnlineGames', result.rows);
    return result.rows;
  } catch (err) {
    console.log('db error', err);
    return [];
  }
};

// Delete any expired online game data from the database:
const databaseDeleteExpiredOnlineGames = async (): Promise<OnlineGame[]> => {
  try {
    const sql = `
    delete from "onlineGames"
      where "at" < now() - interval '1 day'
      returning *
    `;
    const result = await db.query<OnlineGame>(sql);
    // console.log('databaseDeleteExpiredOnlineGames', result.rows);
    return result.rows;
  } catch (err) {
    console.log('db error', err);
    return [];
  }
};

// Database operations that we want run at the start of server process:
setTimeout(async () => {
  // Retrieve any existing online game data from the database:
  const onlineGames: OnlineGame[] = await databaseGetOnlineGames();
  // console.log('retrieved onlineGames:', onlineGames);

  onlineGames.forEach((g: OnlineGame) => {
    const { userId, friendId, pending, pin } = g;
    const theUserId = String(userId);
    const theFriendId = String(friendId);
    gameConnectionPins[theUserId] = pin;
    if (pending) {
      pendingGameFriendInviteRequestsFrom[theUserId] = theFriendId;
      pendingGameFriendInviteRequestsTo[theFriendId] = theUserId;
    } else inProgressFriendGameInvitedFrom[theUserId] = theFriendId;
  });

  // Delete any expired online game data from the database:
  const expiredOnlineGames: OnlineGame[] =
    await databaseDeleteExpiredOnlineGames();
  // console.log('expired & deleted onlineGames:', expiredOnlineGames);
}, 1000);
