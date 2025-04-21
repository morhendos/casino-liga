# Padeliga

*Tu liga. Tu juego.*

A management system for padel leagues and tournaments.

## Features

- **League Management**: Create and manage padel leagues with customizable settings
- **Team Registration**: Form teams of two players and join leagues
- **Match Scheduling**: Schedule matches between teams, either manually or automatically
- **Result Tracking**: Record match results and view league standings
- **Public Leagues**: Make leagues publicly accessible for non-authenticated users
- **User Authentication**: Secure login and role-based permissions

## Installation

```bash
npm install
```

## Environment Setup

The application uses environment variables for configuration. You need to create a local environment file to run the application.

```bash
npm run prepare-env
```

This will create a `.env.local` file from the template. Edit this file to add your MongoDB connection details and other configuration.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Configuration

This application requires MongoDB. By default, it connects to a local MongoDB instance at:

```
mongodb://localhost:27017/padeliga
```

To use a different MongoDB instance, set the `MONGODB_URI` environment variable in your `.env.local` file.

## Required Environment Variables

The following environment variables are required for the application to run:

- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js (at least 32 characters)

In production, the following additional variables are required:

- `NEXTAUTH_URL` - Base URL of your application

See `.env.local.template` for a complete list of available environment variables.

## Project Structure

- `/src/app` - NextJS App Router
  - `/src/app/(public)` - Public-facing pages (no login required)
  - `/src/app/api` - API routes including public endpoints
  - `/src/app/dashboard` - Admin and user dashboard pages (login required)
- `/src/components` - React components
  - `/src/components/public` - Components for public pages
- `/src/lib` - Core functionality
  - `/src/lib/db` - Database connection and models
  - `/src/lib/auth` - Authentication mechanisms
- `/src/utils` - Utility functions
- `/docs` - Documentation files

## Database Models

- `Player` - Player profile information
- `Team` - Team of two players
- `League` - League settings and metadata
- `Match` - Match information and results
- `Ranking` - Team standings in leagues

## Documentation

For more detailed information about specific features, check the documentation files in the `/docs` directory:

- [Public League Feature](/docs/PUBLIC-LEAGUE-FEATURE.md) - Details about the public league implementation
- [Implementation Status](/IMPLEMENTATION-STATUS.md) - Current status of feature implementations
- [Setup Guide](/SETUP.md) - Detailed setup instructions

## License

Private project - All rights reserved.
