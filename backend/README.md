# REST API with JWT Authentication

Node.js + Express API with JWT access tokens, refresh tokens, and protected routes.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your JWT_SECRET and REFRESH_TOKEN_SECRET
npm start
```

## Environment Variables (.env.example)

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 3000) |
| JWT_SECRET | Secret for access token signing |
| REFRESH_TOKEN_SECRET | Secret for refresh token signing |
| ACCESS_TOKEN_EXPIRY | Access token TTL (e.g., 1h) |
| REFRESH_TOKEN_EXPIRY | Refresh token TTL (e.g., 7d) |

## Test Credentials

- **Username:** `admin`
- **Password:** `admin123`

---

## API Examples

### 1. Welcome (public)

```bash
curl http://localhost:3000/
```

### 2. Login (get tokens)

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "1h"
}
```

### 3. Access protected route (GET /users)

```bash
curl http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Replace `YOUR_ACCESS_TOKEN` with the `accessToken` from the login response.

### 4. Add user (POST /users)

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"username":"bob","email":"bob@example.com"}'
```

### 5. Refresh tokens

```bash
curl -X POST http://localhost:3000/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Tokens refreshed",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "1h"
}
```

### 6. Invalid login (401)

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}'
```

### 7. Unauthorized access (401)

```bash
curl http://localhost:3000/users
# No Authorization header
```

---

## Postman

1. **Login** – POST `http://localhost:3000/login`  
   Body (raw JSON): `{"username":"admin","password":"admin123"}`  
   Save `accessToken` from the response.

2. **Get users** – GET `http://localhost:3000/users`  
   Headers: `Authorization: Bearer {{accessToken}}`  
   Or add a variable `accessToken` and use it in the header.

3. **Refresh** – POST `http://localhost:3000/refresh`  
   Body (raw JSON): `{"refreshToken":"{{refreshToken}}"}`  
   Update `accessToken` and `refreshToken` from the response.

---

## Project Structure

```
backend/
├── .env.example
├── package.json
├── README.md
└── src/
    ├── app.js           # Express app
    ├── server.js        # Entry point
    ├── config/          # Config (dotenv)
    ├── data/            # In-memory users
    ├── middleware/      # JWT auth middleware
    ├── routes/          # index, auth, users
    └── utils/           # Token generation
```
