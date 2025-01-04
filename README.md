# aaasobo-management-system

## Setup

### backend

#### Install Packages

```sh
cd backend
npm install
```

#### .env

Create the `.env` file in the `backend` directory with the following content:

```
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

FRONTEND_ORIGIN="http://localhost:3000"
POSTGRES_PRISMA_URL="postgresql://postgres:summer@localhost:5432/mydb?schema=public"
POSTGRES_URL_NON_POOLING="postgresql://postgres:summer@localhost:5432/mydb?schema=public"
PORT=4000
KEY1=98b5b9c9ef24f4280561d95beb2ee54c00e81dfa1abc9d008b35b66e6c2095cc
KEY2=7e3caf8440ad740910137a1890940347c44a5258f73784e822d0d705a1db3b70
```

Note that the following variables should be changed to match your local setup:

- `POSTGRES_PRISMA_URL`: postgres://<user>:<password>@localhost:<port>/<dbname>?schema=schema
- `POSTGRES_URL_NON_POOLING`

`KEY1` and `KEY2` are used for security purposes. They should be changed to a random string, for example, by running either of the following command:

```sh
openssl rand -hex 32
```

or

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Launch Database

If you are using Docker, you can launch the database with the following command:

```sh
npm run db:start
```

#### Prisma

```sh
npm run prisma:init
```

#### Start Server

```sh
npm run dev
```

The following message should be displayed:

```sh
$ npm run dev

> backend@1.0.0 dev
> nodemon --exec ts-node ./api/app.ts

[nodemon] 3.1.4
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: ts,json
[nodemon] starting `ts-node ./api/app.ts`
[Server]: http://localhost:4000
```

### frontend

#### Install Packages

```sh
cd frontend
npm install
```

#### (Optional) .env

Currently, the frontend does not require any environment variables. However, if you want to run the backend on a different port, you can create a `.env` file in the `frontend` directory with the following content:

```
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:4001
```

#### Start Next.js

```sh
npm run dev
```

The frontend should be available at [http://localhost:3000](http://localhost:3000).
