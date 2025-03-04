/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import { ClientError, errorMiddleware } from './lib/index.js';

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
app.get('/api/games/:user', async (req, res, next) => {
  try {
    const user = Number(req.params.user);
    const sql = `
      select *
      from "games"
      where "user" = $1
    `;
    const params = [user];
    const result = await db.query(sql, params);
    if (!result.rows[0]) {
      throw new ClientError(404, `cannot find user ${user}`);
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

/*
// Save a game by the user (store on database):
app.post('/api/games', async (req, res, next) => {
  try {
    const { user, isCompleted = false } = req.body;
    if (!task || typeof isCompleted !== 'boolean') {
      throw new ClientError(400, 'task and isCompleted are required');
    }
    const sql = `
      insert into "todos" ("task", "isCompleted")
        values ($1, $2)
        returning *
    `;
    const params = [task, isCompleted];
    const result = await db.query<Todo>(sql, params);
    const [todo] = result.rows;
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});
*/

/*
 * Handles paths that aren't handled by any other route handler.
 * It responds with `index.html` to support page refreshes with React Router.
 * This must be the _last_ route, just before errorMiddleware.
 */
app.get('*', (req, res) => res.sendFile(`${reactStaticDir}/index.html`));

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log('Listening on port', process.env.PORT);
});
