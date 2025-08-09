# Fjell Sample Application

A comprehensive reference implementation demonstrating the fjell server-side stack with Express.js, featuring Widget and WidgetType models.

## Overview

This sample application showcases the complete fjell ecosystem for server-side development:

- **Express.js** web framework
- **SQLite** database with **Sequelize** ORM
- **Fjell Core** items and keys
- **Fjell Lib** for business logic
- **Fjell Lib-Sequelize** for database integration
- **Fjell Express-Router** for REST API
- **Fjell Logging** for structured logging

## Architecture

### Models

- **WidgetType** - Reference type with properties:
  - `id` (UUID)
  - `code` (unique string, uppercase)
  - `name` (display name)
  - `description` (optional)
  - `isActive` (boolean)

- **Widget** - Main entity with properties:
  - `id` (UUID)
  - `widgetTypeId` (reference to WidgetType)
  - `name` (display name)
  - `description` (optional)
  - `isActive` (boolean)
  - `data` (JSON configuration)

### Project Structure

```
src/
├── model/           # Fjell Item definitions
│   ├── Widget.ts
│   ├── WidgetType.ts
│   └── index.ts
├── database/        # Sequelize models and database setup
│   ├── database.ts
│   ├── models.ts
│   ├── seed.ts
│   └── index.ts
├── lib/            # Fjell Library objects and registry
│   ├── WidgetLib.ts
│   ├── WidgetTypeLib.ts
│   └── index.ts
├── routes/         # Express routes using fjell-express-router
│   ├── widgetRoutes.ts
│   ├── widgetTypeRoutes.ts
│   └── index.ts
└── index.ts        # Main Express application
```

## Quick Start

### Install Dependencies

```bash
npm install
```

### Build the Application

```bash
npm run build
```

### Start the Application

```bash
npm run dev
```

The application will start on http://localhost:3000

### Development Mode

```bash
npm run dev
```

This will build and start the application, automatically creating the SQLite database and seeding it with test data.

## API Endpoints

### General

- `GET /` - Application information and available endpoints
- `GET /api/health` - Health check
- `GET /api/status` - Status with database statistics
- `GET /api/dashboard` - Dashboard with summary data
- `GET /health/database` - Database-specific health check

### Widget Types (`/api/widget-types`)

- `GET /api/widget-types` - List all widget types
- `GET /api/widget-types/:id` - Get specific widget type
- `POST /api/widget-types` - Create new widget type
- `PUT /api/widget-types/:id` - Update widget type
- `DELETE /api/widget-types/:id` - Delete widget type
- `GET /api/widget-types/active` - Get only active widget types
- `GET /api/widget-types/by-code/:code` - Get widget type by code
- `POST /api/widget-types/validate` - Validate data without creating

### Widgets (`/api/widgets`)

- `GET /api/widgets` - List all widgets
- `GET /api/widgets/:id` - Get specific widget
- `POST /api/widgets` - Create new widget
- `PUT /api/widgets/:id` - Update widget
- `DELETE /api/widgets/:id` - Delete widget
- `GET /api/widgets/active` - Get only active widgets
- `GET /api/widgets/by-type/:widgetTypeId` - Get widgets by type ID
- `GET /api/widgets/by-type-code/:code` - Get widgets by type code
- `GET /api/widgets/with-type-info` - Get widgets with type information
- `POST /api/widgets/validate` - Validate data without creating

## Example Usage

### Create a Widget Type

```bash
curl -X POST http://localhost:3000/api/widget-types \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CUSTOM_BUTTON",
    "name": "Custom Button Widget",
    "description": "A customizable button component",
    "isActive": true
  }'
```

### Create a Widget

```bash
curl -X POST http://localhost:3000/api/widgets \
  -H "Content-Type: application/json" \
  -d '{
    "widgetTypeId": "widget-type-id-here",
    "name": "My Custom Button",
    "description": "A button for the homepage",
    "isActive": true,
    "data": {
      "text": "Click Me",
      "color": "blue",
      "size": "large"
    }
  }'
```

### Get Dashboard Data

```bash
curl http://localhost:3000/api/dashboard
```

## Features Demonstrated

### Fjell Core Integration

- **Items** with proper key structure (`PriKey<'widget'>`, `PriKey<'widgetType'>`)
- **Events** for tracking creation, updates, and deletion
- **References** between Widget and WidgetType

### Fjell Lib Integration

- **Registry** for managing library instances
- **Operations** for CRUD functionality
- **Validators** for data validation
- **Hooks** for lifecycle events
- **Mappers** for database/item transformation

### Fjell Express-Router Integration

- **PItemRouter** for automatic REST endpoint generation
- **Custom routes** for business-specific functionality
- **Error handling** and response formatting

### Fjell Logging Integration

- **Structured logging** throughout the application
- **Request/response logging** middleware
- **Error logging** with context

### Database Integration

- **SQLite** for simple, file-based storage
- **Sequelize** models with relationships
- **Automatic database initialization**
- **Test data seeding**
- **Health checks**

## Development Scripts

- `npm run build` - Build the application
- `npm run dev` - Build and start the application
- `npm start` - Start the built application
- `npm run lint` - Run ESLint
- `npm run clean` - Remove build artifacts
- `npm test` - Run tests with coverage

## Database

The application uses SQLite with a file named `sample-app.db` in the project root. The database is automatically created and seeded with test data on first run.

### Test Data

The application comes with pre-seeded test data including:

- 5 widget types (BUTTON, TEXT_INPUT, CHART, TABLE, LEGACY_WIDGET)
- 9 widgets of various types with different configurations
- Examples of active/inactive states
- Sample JSON data configurations

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Database Configuration

The database path can be configured in `src/database/database.ts`. By default, it uses `sample-app.db` in the project root.

## Architecture Benefits

This reference implementation demonstrates how fjell provides:

1. **Type Safety** - Full TypeScript integration with proper Item types
2. **Consistency** - Standardized patterns across all models
3. **Validation** - Built-in data validation with custom rules
4. **Logging** - Comprehensive, structured logging
5. **REST APIs** - Automatic REST endpoint generation
6. **Relationships** - Proper handling of entity relationships
7. **Events** - Built-in event tracking for all entities
8. **Extensibility** - Easy to add new models and functionality

This serves as a template for building production fjell applications with Express.js.
