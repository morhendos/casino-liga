# SaaS Application Boilerplate

A streamlined, production-ready boilerplate for quickly building SaaS applications with a focus on authentication and basic functionality.

## Features

- 🔐 User authentication with Next-Auth
- 👤 User registration and login flow
- 🔒 Protected routes
- 📱 Responsive design using Tailwind CSS
- 🌙 Dark/light mode support
- 🔄 MongoDB integration with simplified connection handling

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Frontend**: React 18
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + Radix UI components
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone this repository

   ```bash
   git clone https://github.com/yourusername/saas-boilerplate.git
   cd saas-boilerplate
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Environment setup

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Start development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Customization Guide

### Renaming the Application

1. Update the name in `package.json`
2. Update the title and metadata in `src/app/layout.tsx`

### Adding New Features

The codebase is organized following Next.js best practices:

- **Pages**: Found in the `src/app` directory
- **Components**: Reusable UI elements in `src/components`
- **API Routes**: API handlers in `src/app/api` directory
- **Authentication**: Auth configuration in `src/lib/auth`
- **Database**: Database models in `src/models`

### Extending the Dashboard

The dashboard page at `src/app/dashboard/page.tsx` is a simple welcome page. You can extend it by:

1. Adding more sections to the dashboard
2. Creating subpages under the dashboard directory
3. Adding navigation components

## Project Structure

```
.
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── login/        # Login page
│   │   └── signup/       # Signup page
│   ├── components/       # Reusable components
│   │   ├── auth/         # Auth-related components
│   │   ├── common/       # Common UI components
│   │   ├── error/        # Error handling components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI primitives
│   ├── config/           # Configuration
│   ├── lib/              # Library code
│   │   ├── auth/         # Auth utilities
│   │   ├── db/           # Database utilities
│   │   ├── monitoring/   # Monitoring utilities
│   │   └── services/     # Service modules
│   ├── models/           # Database models
│   │   └── user.ts       # User model
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
└── README.md             # Project documentation
```

## Database Connection

This boilerplate uses a simplified approach to MongoDB connections:

- **Singleton Pattern**: Maintains a single, persistent database connection
- **Automatic Reconnection**: Handles connection drops gracefully
- **Connection Pooling**: Efficiently manages database resources
- **Error Handling**: Provides clear error messages and recovery mechanisms

For database operations, use the `withConnection` function:

```typescript
import { withConnection } from '@/lib/db';

async function getUserById(id: string) {
  return withConnection(async () => {
    // Database operations here
    return await UserModel.findById(id);
  });
}
```

## Authentication Flow

This boilerplate uses NextAuth.js with a Credentials provider for email/password authentication. The flow includes:

1. User registration with email validation
2. Secure login with JWT sessions
3. Protected routes that redirect to login when unauthenticated
4. Session management

## Deployment

This boilerplate is ready for deployment on various platforms:

- **Vercel**: Optimized for deployment on Vercel
- **MongoDB Atlas**: Recommended for database hosting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
