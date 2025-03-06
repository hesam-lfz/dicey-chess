/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import { ClientError, errorMiddleware } from './lib/index.js';

type User = {
  userId: number;
  username: string;
  hashedPassword: string;
};

type Auth = {
  username: string;
  password: string;
};

type SavedGame = {
  userId: number;
  at: number;
  duration: number;
  outcome: number;
  moveHistory: string;
  diceRollHistory: string;
  humanPlaysWhite: boolean;
};

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

// Create paths for static directories
const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

app.use(express.static(reactStaticDir));
// Static directory for file uploads server/public/
app.use(express.static(uploadsStaticDir));
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

// Load all games saved by the user (stored in database):
app.get('/api/games/:userId', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const sql = `
      select *
      from "games"
      where "userId" = $1
    `;
    const params = [userId];
    const result = await db.query(sql, params);
    if (!result.rows[0])
      throw new ClientError(404, `cannot find user ${userId}`);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Save a game by the user (store on database):
app.post('/api/games', async (req, res, next) => {
  try {
    const {
      userId,
      at,
      duration,
      outcome,
      moveHistory,
      diceRollHistory,
      humanPlaysWhite,
    } = req.body;
    if (
      typeof userId !== 'number' ||
      typeof at !== 'number' ||
      typeof duration !== 'number' ||
      typeof outcome !== 'number' ||
      !moveHistory ||
      !diceRollHistory ||
      typeof humanPlaysWhite !== 'boolean'
    ) {
      throw new ClientError(
        400,
        'Proper params for userId, at, duration, outcome, moveHistory, diceRollHistory, and humanPlaysWhite are required.'
      );
    }
    const sql = `
      insert into "games" ("userId", "at", "duration", "outcome", "moveHistory", "diceRollHistory", "humanPlaysWhite")
        values ($1, $2, $3, $4, $5, $6, $7)
        returning *
    `;
    const params = [
      userId,
      at,
      duration,
      outcome,
      moveHistory,
      diceRollHistory,
      humanPlaysWhite,
    ];
    const result = await db.query<SavedGame>(sql, params);
    const [savedGame] = result.rows;
    res.status(201).json(savedGame);
  } catch (err) {
    next(err);
  }
});

// Delete a game by the user (stored on database):
app.delete('/api/games', async (req, res, next) => {
  try {
    const { userId, at } = req.body;
    if (typeof userId !== 'number' || typeof at !== 'number') {
      throw new ClientError(
        400,
        'Proper params for userId and at are required.'
      );
    }
    const sql = `
      delete from "games"
        where "userId" = $1 and "at" = $2
        returning *
    `;
    const params = [userId, at];
    const result = await db.query<SavedGame>(sql, params);
    const [deletedGame] = result.rows;
    res.status(201).json(deletedGame);
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
