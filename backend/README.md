# ClubConnect Backend

## Structure

```text
backend/
  src/
    config/
    constants/
    controllers/
    middlewares/
    models/
    routes/
    seeds/
    utils/
    app.js
    server.js
  .env.example
  package.json
```

## Installation

```bash
cd backend
npm install
cp .env.example .env
npm run seed:admin
npm run dev
```

## Main Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/admin/clubs`
- `POST /api/admin/create-staff`
- `GET /api/president/pending-members`
- `PUT /api/president/accept-member/:id`
- `PUT /api/president/reject-member/:id`
- `GET /api/users/me`
- `GET /api/clubs`

## Request / Response Examples

### Login

```json
POST /api/auth/login
{
  "email": "admin@clubconnect.com",
  "password": "Admin@123456"
}
```

```json
{
  "message": "Connexion réussie.",
  "token": "jwt_token_here",
  "user": {
    "_id": "661...",
    "name": "Platform Admin",
    "email": "admin@clubconnect.com",
    "role": "ADMIN",
    "status": "ACCEPTED",
    "club": null
  }
}
```

### Member Registration

```json
POST /api/auth/register
{
  "name": "Ali Ben Salah",
  "email": "ali@esprit.tn",
  "password": "StrongPass@123",
  "clubId": "661..."
}
```

```json
{
  "message": "Inscription enregistrée. En attente de validation par le président.",
  "user": {
    "_id": "662...",
    "name": "Ali Ben Salah",
    "email": "ali@esprit.tn",
    "role": "MEMBER",
    "status": "PENDING",
    "club": "661..."
  }
}
```

## Security Notes

- Passwords are hashed with `bcryptjs`.
- JWT is required for protected routes.
- Role checks are centralized in middleware.
- SMTP credentials and JWT secrets must stay in `.env`.
- In production, expose `generatedPassword` only by email, never in API responses.
