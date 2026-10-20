# Help Desk – Full Stack TypeScript

A complete Help Desk system for opening and managing service tickets.

Customers submit tickets from a public form. An administrator signs in to a protected area, reviews the queue, searches and filters tickets, updates status and priority, deletes tickets, and exports the data to CSV.

## Starting Point

This project follows the architecture of the last Full Stack course project (user management):

- Vite + React + TypeScript + TailwindCSS + Radix UI
- Typed components, typed state, typed props
- Client `services` layer with a generic `fetch` helper and `ApiResponse<T>`
- Express + TypeScript + CORS
- MongoDB Native Driver with typed collections
- Database actions separated from routes
- Runtime validation of unknown request bodies
- ObjectId checks
- Loading / Error / Dialog patterns

The data model, pages, operations and UI were redesigned for Help Desk. This is not a renamed user-management app.

## Technologies

**Client:** Vite, React 18, TypeScript, TailwindCSS, Radix UI (Dialog, AlertDialog, Select), React Router, fetch

**Server:** Node.js, Express, TypeScript, MongoDB Native Driver, CORS, bcryptjs, jsonwebtoken

Not used (and not required): Zod, Mongoose, Redux, TanStack Table

## Pages

| Page | Route | Role |
| --- | --- | --- |
| New ticket | `/` | Public form for creating a ticket |
| Confirmation | `/confirmation` | Success message after create |
| Admin login | `/login` | Administrator authentication |
| Dashboard | `/admin/dashboard` | Totals by status and high priority |
| Ticket management | `/admin/tickets` | List, search, filter, view, update, delete, CSV |

Unauthenticated users who open an admin route are redirected to `/login`.

## Project Structure

```
helpdesk-final-project/
  client/                 React application
    src/components        Reusable UI
    src/pages             Router pages
    src/services          API layer
    src/types             Frontend types
    src/auth              Auth state and protected routes
    src/lib               Validation and date helpers
  server/                 Express application
    src/server            App and routes
    src/db                Connection, typed collections, actions, mappers
    src/type              Server types
    src/validation        Type guards and parsers
    src/auth              JWT helpers and middleware
  README.md
  README.he.md
  STUDENT_REVIEW.md
  STUDENT_REVIEW.he.md
  env.example
```

Responsibility split:

- **React** owns forms, state, routing and rendering.
- **API service** owns HTTP, headers and `ApiResponse<T>`.
- **Express** owns status codes, auth and request parsing.
- **Database layer** owns MongoDB operations only.

## Data Model

### Ticket (`tickets` collection)

`customerName`, `email`, `phone`, `title`, `description`, `category`, `priority`, `status`, `createdAt`, `updatedAt`

Category: `Hardware | Software | Network | Account | Other`  
Priority: `Low | Medium | High`  
Status: `Open | In Progress | Resolved`

A public ticket always starts as `Open`. The server sets `createdAt` and `updatedAt`. The MongoDB document is not identical to the public ticket returned to the client (`_id` becomes `id`, dates become ISO strings).

### Admin (`admins` collection)

`username`, `passwordHash`

The password is stored with bcrypt. It is never stored or returned as plain text.

## API

Prefix: `/api`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/tickets` | Public | Create ticket |
| POST | `/api/admin/login` | Public | Admin login |
| GET | `/api/tickets` | Admin | List tickets |
| GET | `/api/tickets/:id` | Admin | Get one ticket |
| PATCH | `/api/tickets/:id` | Admin | Update status / priority |
| DELETE | `/api/tickets/:id` | Admin | Delete ticket |
| GET | `/api/tickets/export/csv` | Admin | Download CSV |

Protected routes require `Authorization: Bearer <token>`.

## Authentication

1. On first server start, if the configured admin username does not exist, the server creates it and hashes `ADMIN_PASSWORD`.
2. `POST /api/admin/login` checks the username and password.
3. A successful login returns a JWT (8 hours).
4. The client stores the token locally and sends it on admin requests.
5. Logout removes the local auth state. The server then rejects further admin requests.
6. Failed login always returns the generic message `Invalid username or password`.

## Environment Variables

See `env.example`. Required values:

- `VITE_API_URL`
- `PORT`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `CLIENT_ORIGIN`

Do not commit `.env` files.

## Installation

```bash
cd client
npm install

cd ../server
npm install
```

Create `client/.env` from `client/.env.example`.  
Create `server/.env` from `server/.env.example`.

MongoDB must be running (local or Atlas). Put the connection string in `MONGODB_URI`.

## Run

Terminal 1 – server:

```bash
cd server
npm run dev
```

Terminal 2 – client:

```bash
cd client
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:3000/api

Default admin after first start (change these in `.env`):

- Username: `admin`
- Password: `Admin123!`

## Typecheck

```bash
cd client && npm run typecheck
cd ../server && npm run typecheck
```

Both projects use `strict: true`. There is no `any` and no `as any`.
