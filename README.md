# dicey-chess-web

A full-stack TypeScript ReactJS website featuring a variation of the game of chess called "Dicey Chess"

## Dicey Chess

![Logo](https://www.diceychess.com/assets/dicey-chess-logo-c-DZNgtflK.png)

Dicey Chess is a variation of the game of chess involving two dice. On each turn, the player rolls 2 dice and then makes
N consecutive chess moves, where N is the difference between the number of dots between the 2 dice:
For example, _4_ moves if the dice roll was 5 & 1, and _0_ moves if the dice roll was 5 & 5.

## Live Website

Play at: [Dicey Chess](https://www.diceychess.com/)

## Getting Started

---

### Run and test project setup

#### Getting Started

1. Install all dependencies with `npm install`.

#### Create the database

If your project will be using a database, create it now.

1. Start PostgreSQL
   ```sh
   sudo service postgresql start
   ```
1. Create database (replace `name-of-database` with a name of your choosing, such as the name of your app)
   ```sh
   createdb name-of-database
   ```
1. In the `server/.env` file, in the `DATABASE_URL` value, replace `changeMe` with the name of your database, from the last step
1. While you are editing `server/.env`, also change the value of `TOKEN_SECRET` to a custom value, without spaces.
1. Make the same changes to `server/.env.example`.

If your project will _not_ be using a database, edit `package.json` to remove the `dev:db` script.

#### Start the development servers

1. Start all the development servers with the `"dev"` script:
   ```sh
   npm run dev
   ```
1. Later, when you wish to stop the development servers, type `Ctrl-C` in the terminal where the servers are running.

#### Verify the client

1. A React app has already been created for you.
1. Take a minute to look over the code in `client/src/App.tsx` to get an idea of what it is doing.
1. Go to the app in your browser. You should see the message from the server below the React logo, and in the browser console.
   ![](md.assets/client-server.png)
1. If you see the message from the server in your browser you are good to go, your client and server are communicating.

#### Set up the database

1. In your browser navigate to the site you used for your database design.
1. Export your database as PostgreSQL, this should generate the SQL code for creating your database tables.
1. In a separate terminal, run `npm run db:import` to create your tables
1. Use `psql` to verify your tables were created successfully. Your database and tables should be listed; if not, stop here and reach out to an instructor for help
1. At this point your database is setup and you are good to start using it. However there is no data in your database, which isn't necessarily a bad thing, but if you want some starting data in your database you need to add insert statements into the `database/data.sql` file. You can add whatever starting data you need/want.
1. After any changes to `database/schema.sql` or `database/data.sql` re-run the `npm run db:import` command to update your database. Use `psql` to verify your changes were successfully applied.

## Deployment

Once your template is set up and functional, deploy it. This will get all the deployment issues ironed out early. During development, you should re-deploy frequently to make sure that your code works properly in your production environment.

---

### Available `npm` commands explained

Below is an explanation of all included `npm` commands in the root `package.json`. Several are only used for deployment purposes and should not be necessary for development.

1. `start`
   - The `start` script starts the Node server in `production` mode, without any file watchers.
1. `build`
   - The `build` script executes `npm run build` in the context of the `client` folder. This builds your React app for production. This is used during deployment, and not commonly needed during development.
1. `db:import`
   - The `db:import` script executes `database/import.sh`, which executes the `database/schema.sql` and `database/data.sql` files to build and populate your database.
1. `dev`
   - Starts all the development servers.
1. `lint`
   - Runs ESLint against all the client and server code.
1. `psql`
   - When used on the EC2 instance, runs `psql` attached to the project database. Helpful for debugging issues with the database.
1. `tsc`
   - Runs the TypeScript compiler against all the client and server code.
1. Not directly used by developer
   1. `install:*`
   - These scripts install dependencies in the `client` and `server` folders, and copy `.env.example` to `.env` if it doesn't already exist.
   1. `dev:*`
   - These scripts start the individual development servers.
   1. `lint:*`
   - These scripts run lint in the client and server directories.
   1. `tsc:*`
   - These scripts run tsc in the client and server directories.
   1. `postinstall`
      - The `postinstall` script is automatically run when you run `npm install`. It is executed after the dependencies are installed. Specifically for this project the `postinstall` script is used to install the `client` and `server` dependencies.
   1. `prepare`
      - The `prepare` script is similar to `postinstall` — it is executed before `install`. Specifically for this project it is used to install `husky`.
   1. `deploy`
      - The `deploy` script is used to deploy the project by pushing the `main` branch to the `pub` branch, which triggers the GitHub Action that deploys the project.
