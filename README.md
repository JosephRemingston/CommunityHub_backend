tsconfig.json
yarn test
# Community Hub Backend

This repository contains the backend for the Community Hub application. The codebase in this repo is a Node.js application (CommonJS/ES modules) with an existing runtime entrypoint `index.js` and a `dist/` folder. The project also includes TypeScript dev-dependencies and typings, but the runnable entrypoint in the repository root is `index.js`.

This README has been updated to match the code that is present in the repository (scripts, dependencies, and entrypoint).

## What is present right now

- Runtime entrypoint: `index.js` (project root)
- Compiled output / build artifacts (if any): `dist/` folder
- Source directories: `controllors/`, `routes/`, `models/`, `middleware/`, `utils/`
- `package.json` contains project scripts and a set of dependencies used at runtime (Express, Mongoose, bcrypt, jsonwebtoken, etc.)

## Prerequisites

- Node.js (the project uses Node to run `index.js`). Use nvm to manage Node versions if needed.
- npm (or yarn)

## Exact scripts (from `package.json`)

- start: `node index.js`
- dev: `node index.js` (this project currently runs the same command for `dev`)
- test: `echo "Error: no test specified" && exit 1`

To run the server locally after installing dependencies:

```bash
npm install
npm start
```

Or use the `dev` script (note it currently points to the same command as `start`):

```bash
npm run dev
```

## Key dependencies (from `package.json`)

- express — web framework
- mongoose — MongoDB ODM
- bcrypt — password hashing
- body-parser — request body parsing
- cors — CORS handling
- jsonwebtoken — JWT support
- fs — filesystem (note: core `fs` is built-in; `fs` appears in dependencies as an npm package but Node provides `fs` natively)

Dev dependencies include TypeScript, ts-node, and type definitions for Node/Express.

## Environment variables

There is no `.env` file included here. Typical environment variables you should provide when running this backend include:

- PORT — port the server listens on (e.g. `3000`)
- DATABASE_URL — MongoDB connection string (since `mongoose` is present)
- JWT_SECRET — secret used to sign JWT tokens

Create a `.env` (or `.env.local`) file in the project root and populate these values, or export them in your shell before starting the server.

Example:

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/community_hub
JWT_SECRET=your_jwt_secret_here
```

## Project structure (actual folders present)

```
index.js
dist/
controllors/
middleware/
models/
routes/
utils/
package.json
package-lock.json
node_modules/
```

Note: The repository does not contain `index.ts` at the root. If you prefer to work in TypeScript, check for `.ts` sources in `src/` or the `dist/` folder; otherwise the runtime entrypoint is `index.js`.

## Running & Developing

1. Install dependencies

```bash
npm install
```

2. Start the server

```bash
npm start
```

3. Development

If you'd like to develop in TypeScript locally, you can install `ts-node`/`typescript` (already present in devDependencies) and run TypeScript sources directly — but the repository currently provides `index.js` as the main entrypoint. If you want, I can add a `src/` structure and scripts to build from TypeScript to JavaScript.

## Notes & recommended next steps

- Consider adding a `.env.example` listing required environment variables.
- If you intend to develop in TypeScript, add a source folder (`src/`) and a `build` script using `tsc` to compile to `dist/` or `index.js`.
- Fix the `dev` script to use `ts-node` or `nodemon` for hot-reload during development.
- Remove the `fs` npm dependency if the code only uses Node's built-in `fs` module.

If you'd like, I can update the README further to include exact runtime instructions, create a `.env.example`, or add a proper `dev` script and `build` script based on how you'd like to work (pure JS or TypeScript development). Tell me which option you prefer.