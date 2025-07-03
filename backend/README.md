# Bedtime Storyteller Backend

This is an Express.js + SQLite backend for storing and retrieving user stories, with Clerk JWT authentication.

## Features

- Clerk JWT authentication middleware
- SQLite database for persistent story storage
- REST API endpoints:
  - `GET /api/stories` (list stories for the authenticated user)
  - `POST /api/stories` (create a new story for the authenticated user)

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set Clerk public key in `.env`:
   ```env
   CLERK_PEM_PUBLIC_KEY=your_clerk_jwt_public_key
   ```
3. Start the server:
   ```sh
   node index.js
   ```

## API Usage

- All requests require a valid Clerk JWT in the `Authorization: Bearer <token>` header.

---
