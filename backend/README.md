# ClubConnect Backend

## Structure

```text
backend/
  src/
    config/
    constants/
    controllers/
    middlewares/
    models/      # Added Group.js, Message.js
    routes/      # Added groupRoutes.js
    services/    # Added channelService.js
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
npm run seed:admin  # Also initializes global channels
npm run dev
```

## Main Endpoints

### Auth & Clubs
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/admin/clubs`
- `POST /api/admin/create-staff`
- `GET /api/president/pending-members`
- `PUT /api/president/accept-member/:id`
- `PUT /api/president/reject-member/:id`
- `GET /api/users/me`
- `GET /api/clubs`

### Communication Channels (New)
- `GET /api/v1/groups` - List user's active groups
- `GET /api/v1/groups/:id/messages` - Get group chat history (paginated)
*Presidents only:*
- `POST /api/v1/groups` - Create custom project/event group
- `POST /api/v1/groups/:id/members` - Add member to custom group
- `DELETE /api/v1/groups/:id/members/:uid` - Remove member from custom group

## Communication Channels Logic

The system automatically manages group memberships through a centralized **Channel Service**.

### Automated Hooks
- **Club Creation**: Automatically creates `General`, `Staff`, and `Admin ↔ President` private channels.
- **Member Acceptance**: Automatically adds validated members to the `General` club channel.
- **Staff Management**: Automatically syncs staff members to relevant internal and global staff channels.
- **Role Changes**: Automatically handles president transitions, archiving old private channels and creating new ones.
- **Member Removal**: Systematically cleans up all group memberships when a user leaves a club.

### Global Channels
The platform maintains two system-wide channels initialized on server startup:
- **All Staff**: Includes all club staff and platform admins.
- **All Presidents**: Private channel for all club presidents and platform admins.

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
- Channel logic is protected by fire-and-forget safety guards to prevent request crashes.
- SMTP credentials and JWT secrets must stay in `.env`.
- In production, expose `generatedPassword` only by email, never in API responses.

