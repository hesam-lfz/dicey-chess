/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

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
    if (!username || !password) {
      throw new ClientError(400, 'username and password are required fields');
    }
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
    if (!username || !password) {
      throw new ClientError(401, 'invalid login');
    }
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
    if (!user) {
      throw new ClientError(401, 'invalid login -- User not found!');
    }
    const { userId, hashedPassword, rank } = user;
    if (!(await argon2.verify(hashedPassword, password))) {
      throw new ClientError(401, 'invalid login -- Wrong password!');
    }
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
    // const userId = Number(req.params.userId);
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
    ) {
      throw new ClientError(
        400,
        'Proper params for userId, at, duration, opponent, outcome, moveHistory, diceRollHistory, and userPlaysWhite are required.'
      );
    }
    if (req.user?.userId !== userId) {
      throw new ClientError(
        400,
        'Params userId does not match userId in authentication.'
      );
    }
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
    if (typeof userId !== 'number' || typeof at !== 'number') {
      throw new ClientError(
        400,
        'Proper params for userId and at are required.'
      );
    }
    if (req.user?.userId !== userId) {
      throw new ClientError(
        400,
        'Params userId does not match userId in authentication.'
      );
    }
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
    if (!Number.isInteger(userId) || userId < 0) {
      throw new ClientError(400, 'userId must be a natural number');
    }
    const { rank } = req.body;
    if (typeof rank !== 'number') {
      throw new ClientError(400, 'rank (number) is required');
    }
    if (req.user?.userId !== userId) {
      throw new ClientError(
        400,
        'Params userId does not match userId in authentication.'
      );
    }
    const sql = `
      update "users"
        set "rank" = $1
        where "userId" = $2
        returning *
    `;
    const params = [rank, req.user?.userId];
    const result = await db.query(sql, params);
    const [user] = result.rows;
    if (!user) {
      throw new ClientError(404, `Cannot find user with userId ${userId}`);
    }
    res.json({ userId: user.userId, rank: user.rank });
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

app.listen(process.env.PORT, () => {
  console.log('Express server listening on port', process.env.PORT);
});
