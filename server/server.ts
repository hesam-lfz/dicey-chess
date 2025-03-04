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
  uniqid: number;
  userId: number;
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
    if (!result.rows[0]) {
      throw new ClientError(404, `cannot find user ${userId}`);
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Save a game by the user (store on database):
app.post('/api/games', async (req, res, next) => {
  try {
    const {
      uniqid,
      userId,
      duration,
      outcome,
      moveHistory,
      diceRollHistory,
      humanPlaysWhite,
    } = req.body;
    if (
      typeof uniqid !== 'number' ||
      typeof userId !== 'number' ||
      typeof duration !== 'number' ||
      !outcome ||
      !moveHistory ||
      !diceRollHistory ||
      humanPlaysWhite !== 'boolean'
    ) {
      throw new ClientError(
        400,
        'Proper params for uniqid, userId, duration, outcome, moveHistory, diceRollHistory, and humanPlaysWhite are required.'
      );
    }
    const sql = `
      insert into "games" ("uniqid", "userId", "duration", "outcome", "moveHistory", "diceRollHistory", "humanPlaysWhite")
        values ($1, $2, $3, $4, $5, $6, $7)
        returning *
    `;
    const params = [
      userId,
      uniqid,
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
