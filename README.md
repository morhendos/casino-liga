# Casino Liga

A management system for padel leagues and tournaments.

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
mongodb://localhost:27017/casino_liga
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
- `/src/components` - React components
- `/src/lib` - Core functionality
    - `/src/lib/db` - Database connection and models
    - `/src/lib/auth` - Authentication mechanisms
- `/src/utils` - Utility functions

## Database Models

- `Player` - Player profile information
- `Team` - Team of two players
- `League` - League settings and metadata
- `Match` - Match information and results
- `Ranking` - Team standings in leagues

## License

Private project - All rights reserved.
