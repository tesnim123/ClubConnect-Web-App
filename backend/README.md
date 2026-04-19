# ClubConnect Backend

Backend Node.js/Express pour la gestion des clubs universitaires avec MongoDB, JWT, NodeMailer et Socket.IO.

## Stack

- Express pour l'API REST
- MongoDB + Mongoose pour la persistence
- JWT pour l'authentification
- NodeMailer pour les emails de credentials
- Socket.IO pour les channels temps reel

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
    services/
    utils/
    app.js
    server.js
```

## Roles

- `ADMIN`
- `PRESIDENT`
- `VICE_PRESIDENT`
- `STAFF`
- `MEMBER`

## Demarrage

```bash
cd backend
cp .env.example .env
npm install
npm run seed:admin
npm run dev
```

## Modeles

### User

- `name`
- `email`
- `password` hashé
- `role`
- `status`
- `staffTitle`
- `club`
- `mustChangePassword`

### Club

- `name`
- `description`
- `president`
- `vicePresident`
- `staff[]`
- `members[]`

### Channel

- `name`
- `key`
- `type`
- `club`
- `isSystem`
- `createdBy`
- `members[]`

### Message

- `channel`
- `sender`
- `content`

### Post

- `title`
- `content`
- `type`
- `status`
- `club`
- `author`
- `validatedBy`
- `publishedAt`

## Canaux systeme

Lors de la creation d'un club, le backend cree automatiquement :

1. `GENERAL` du club
2. `STAFF` du club
3. `GLOBAL_STAFF`
4. `ADMIN_PRESIDENT` du club
5. `GLOBAL_PRESIDENTS`

Regles appliquees :

- L'admin est ajoute a tous les canaux sauf le `GENERAL` du club.
- Le president rejoint automatiquement `GENERAL`, `STAFF`, `ADMIN_PRESIDENT`, `GLOBAL_STAFF`, `GLOBAL_PRESIDENTS`.
- Le vice-president rejoint `GENERAL`, `STAFF`, `ADMIN_PRESIDENT`, `GLOBAL_STAFF`, `GLOBAL_PRESIDENTS`.
- Un staff rejoint `GENERAL`, `STAFF`, `GLOBAL_STAFF`.
- Un membre valide rejoint `GENERAL`.
- Les canaux personnalises sont crees par le president avec la liste d'utilisateurs autorises.

## Regles forum

- Les posts `EVENT` publies sont consultables publiquement.
- Un `ADMIN`, `PRESIDENT`, `VICE_PRESIDENT` ou `STAFF` publie directement.
- Un `MEMBER` cree un post en statut `PENDING`.
- L'admin peut publier ou rejeter un post en attente.

## Endpoints principaux

### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`
- `PUT /api/auth/change-password`

### Clubs publics

- `GET /api/clubs`

### Admin

- `GET /api/admin/clubs`
- `GET /api/admin/clubs/:id`
- `POST /api/admin/clubs`
- `PUT /api/admin/clubs/:id`
- `DELETE /api/admin/clubs/:id`
- `POST /api/admin/create-staff`
- `GET /api/admin/posts/pending`
- `PATCH /api/admin/posts/:id/publish`
- `PATCH /api/admin/posts/:id/reject`

### President / Vice-president

- `GET /api/president/pending-members`
- `PUT /api/president/accept-member/:id`
- `PUT /api/president/reject-member/:id`
- `POST /api/president/staff`
- `POST /api/president/channels`

Notes :
- `POST /api/president/staff` et `POST /api/president/channels` sont reserves au president.
- La validation des membres est ouverte au president et au vice-president.

### Utilisateur connecte

- `GET /api/users/me`
- `GET /api/channels/my`
- `GET /api/channels/:id/messages`
- `POST /api/posts`

### Forum public

- `GET /api/posts/public/events`
- `GET /api/posts/club/:clubId`

## WebSocket

Connexion Socket.IO :

```js
const socket = io("http://localhost:5000", {
  auth: {
    token: "JWT_TOKEN",
  },
});
```

Evenements emis par le serveur :

- `socket:ready`
  - renvoie `userId` et `joinedChannelIds`
- `channels:sync`
  - renvoie les channels mis a jour quand l'utilisateur gagne un nouvel acces
- `channel:message:new`
  - nouveau message dans une room
- `member:accepted`
  - notification de validation du membre

Evenement emis par le client :

- `channel:message`
  - payload: `{ channelId, content }`

## Flux complet exemple

1. Lancer `npm run seed:admin`.
2. Se connecter avec l'admin par defaut.
3. Appeler `POST /api/admin/clubs` avec :

```json
{
  "name": "Google Developer Student Club",
  "description": "Club tech universitaire",
  "presidentName": "Sarra Ben Salem",
  "presidentEmail": "sarra@esprit.tn"
}
```

4. Le backend cree :
- le club
- le compte president
- les 5 canaux systeme
- l'email de credentials temporaires

5. Le president se connecte avec les identifiants recus, puis appelle `PUT /api/auth/change-password`.
6. Le president ajoute un staff via `POST /api/president/staff`.
7. Le backend cree le compte staff, l'ajoute aux channels staff adaptes et envoie son email.
8. Un etudiant s'inscrit via `POST /api/auth/register`.
9. Son compte reste `PENDING`.
10. Le president ou le vice-president valide via `PUT /api/president/accept-member/:id`.
11. Le membre est ajoute automatiquement au canal general du club et peut acceder au forum.
12. Un membre publie un post :
- s'il est `MEMBER`, le post reste `PENDING`
- s'il est bureau ou admin, le post est `PUBLISHED`
13. Les evenements publies remontent publiquement via `GET /api/posts/public/events`.

## Notes d'integration frontend

- Le frontend doit conserver le JWT et le passer :
  - dans `Authorization: Bearer <token>` pour REST
  - dans `auth.token` pour Socket.IO
- Apres `channels:sync`, le frontend peut rappeler `GET /api/channels/my` pour recharger le panneau des canaux.
- En dev sans SMTP configure, NodeMailer bascule en `jsonTransport` et loggue l'email dans la console.

## Verification minimale

Commande executee pendant l'implementation :

```bash
node --input-type=module -e "import('./src/app.js')"
```

Le module Express se charge correctement. Pour un test complet, il faut une instance MongoDB disponible et un frontend branche sur les nouvelles routes.
