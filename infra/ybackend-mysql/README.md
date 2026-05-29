# ybackend MySQL (Docker)

This folder provides a **MySQL 8.0 + phpMyAdmin** stack that matches the defaults used in [`ybackend`](https://github.com/christiansojor/ybackend).

## Start the database

1. Copy env file:

```bash
cp .env.example .env
```

2. Start containers:

```bash
docker compose up -d
```

## Connections

- **MySQL host**: `127.0.0.1`
- **MySQL port**: `3307`
- **Database**: `handson_c`
- **User / Pass**: `handson_c` / `handson_c`
- **phpMyAdmin**: `http://localhost:8083`

## Make ybackend use this MySQL

In your `ybackend` `.env`:

```env
DATABASE_URL="mysql://handson_c:handson_c@127.0.0.1:3307/handson_c?serverVersion=8.0.32&charset=utf8mb4"
```

Then in the `ybackend` project, create the schema:

```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

That’s the “complete” part: **containers + DB + schema** (via migrations). The tables come from the entity/migrations in `ybackend`, not from this repo.

