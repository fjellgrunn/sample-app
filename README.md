# Fjell Sample App

A sample application demonstrating the Fjell Framework with Next.js frontend and Express API backend.

## Overview

This application showcases how to integrate the Fjell Framework with a modern web architecture that separates frontend and backend concerns. It demonstrates:

- **Frontend**: Next.js 15 application with React 19 and App Router
- **Backend**: Express.js API server with Fjell Framework integration
- **Widget Management**: Create, read, update, and delete widgets
- **Widget Types**: Categorize widgets by type
- **Offline Support**: IndexedDB-based caching for offline functionality
- **TypeScript**: Full type safety throughout the application

## Architecture

### Frontend (Port 3000)
The frontend is a Next.js 15 application that provides the user interface and handles client-side logic. It communicates with the backend API to perform data operations.

### Backend (Port 3001)
The backend is an Express.js API server that handles business logic, database operations, and provides RESTful endpoints. It integrates with the Fjell Framework for caching, providers, and registry management.

### Why Separate Frontend and Backend?

While Next.js is very capable and provides excellent API functionality through its built-in API routes, this sample application demonstrates a more realistic real-world architecture where:

- **Separation of Concerns**: Frontend and backend teams can work independently
- **Technology Flexibility**: Different technologies can be chosen for each layer
- **Scalability**: Frontend and backend can be scaled independently
- **Deployment Options**: Each layer can be deployed to different environments
- **Team Structure**: Frontend and backend developers can work in parallel
- **Testing**: Each layer can be tested independently

This model is common in enterprise applications where you might have:
- Multiple frontend applications consuming the same API
- Different backend services for different domains
- Microservices architecture
- Separate deployment pipelines for frontend and backend

## Features

- **Next.js 15 App Router**: Modern file-based routing for the frontend
- **Express.js API**: RESTful backend with Fjell Framework integration
- **Fjell Framework Integration**: Full integration with Fjell providers and cache
- **Responsive Design**: Mobile-first responsive UI
- **Offline Capability**: Works offline with IndexedDB caching
- **Error Boundaries**: Graceful error handling with React Error Boundaries

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Express.js, Node.js, TypeScript
- **Framework**: Fjell Framework (cache, providers, registry)
- **Database**: SQLite with Sequelize ORM
- **Styling**: CSS with responsive design
- **Build Tools**: Next.js built-in build system, esbuild for backend

## Getting Started

### Prerequisites

- Node.js 21+
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd fjell-sample-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the backend API server**:
   ```bash
   npm run api:dev
   ```
   The API will be available at `http://localhost:3001`

4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

5. **Open your browser** and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start frontend development server (port 3000)
- `npm run api:dev` - Start backend API development server (port 3001)
- `npm run build` - Build frontend for production
- `npm run api:build` - Build backend for production
- `npm run start` - Start production frontend server
- `npm run api:start` - Start production backend server
- `npm run lint` - Run ESLint on both frontend and backend
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests with Vitest

## Project Structure

```
fjell-sample-app/
├── app/                    # Next.js App Router (Frontend)
│   ├── layout.tsx         # Root layout with Fjell providers
│   ├── page.tsx           # Home page
│   ├── widget/[id]/       # Dynamic widget route
│   └── globals.css        # Global styles
├── src/
│   ├── client/            # Client-side components
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── providers/     # Fjell providers
│   │   └── cache/         # Cache configuration
│   ├── database/          # Database models and setup
│   ├── lib/               # Utility libraries
│   └── model/             # Data models
├── api/                   # Express.js API Backend
│   ├── server.ts          # Express server setup
│   ├── routes/            # API route definitions
│   ├── middleware/        # Express middleware
│   └── controllers/       # API controllers
├── tests/                 # Test files
└── package.json           # Dependencies and scripts
```

## API Endpoints

The Express backend provides the following RESTful endpoints:

- `GET /api/widgets` - Retrieve all widgets
- `POST /api/widgets` - Create a new widget
- `GET /api/widgets/:id` - Retrieve a specific widget
- `PUT /api/widgets/:id` - Update a specific widget
- `DELETE /api/widgets/:id` - Delete a specific widget
- `GET /api/widget-types` - Retrieve all widget types

## Data Flow

1. **Frontend Request**: User interacts with Next.js UI
2. **API Call**: Frontend makes HTTP request to Express backend
3. **Backend Processing**: Express server processes request with Fjell Framework
4. **Database Operation**: Sequelize ORM performs database operations
5. **Response**: Backend returns data to frontend
6. **UI Update**: Frontend updates UI with received data
7. **Offline Support**: IndexedDB provides offline data persistence

## Development

### Running Both Servers

For development, you'll need to run both servers:

```bash
# Terminal 1 - Backend API
npm run api:dev

# Terminal 2 - Frontend
npm run dev
```

### Adding New API Endpoints

1. Create a new route file in `api/routes/`
2. Add the route to `api/server.ts`
3. Create corresponding controller in `api/controllers/`
4. Update frontend to use the new endpoint

### Adding New Frontend Routes

1. Create a new directory in `app/` for your route
2. Add a `page.tsx` file for the route component
3. Import and use Fjell providers as needed

### Adding New Components

1. Create component in `src/client/components/`
2. Add `"use client"` directive if using hooks or browser APIs
3. Import Fjell providers as needed

## Testing

The app includes comprehensive tests using Vitest and React Testing Library:

```bash
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test -- --coverage # Run tests with coverage
```

## Building for Production

```bash
# Build both frontend and backend
npm run build             # Build frontend
npm run api:build         # Build backend

# Start production servers
npm run start             # Start frontend production server
npm run api:start         # Start backend production server
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000 and 3001 are available
2. **API Connection**: Verify the backend is running on port 3001
3. **IndexedDB Errors**: These are expected during server-side rendering and will resolve in the browser
4. **TypeScript Errors**: Run `npm run type-check` to identify type issues
5. **Build Errors**: Ensure all client components have `"use client"` directive

### Performance

- The app uses Next.js automatic code splitting
- Fjell cache provides efficient data access
- IndexedDB enables offline functionality
- Express backend can be optimized independently

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

Apache-2.0

## Support

For issues related to:
- **Fjell Framework**: Check the Fjell documentation
- **Next.js**: Refer to Next.js documentation
- **Express.js**: Refer to Express.js documentation
- **This App**: Open an issue in this repository

---

Built with Fjell Framework, Next.js, and Express.js
