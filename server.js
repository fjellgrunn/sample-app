import 'source-map-support/register.js';
import express from 'express';
import { getLogger } from '@fjell/logging';
import { Database } from './dist/database/index.js';
import { initializeLibraryRegistry } from './dist/lib/index.js';
import { createApiRoutes } from './dist/routes/index.js';

const logger = getLogger('SampleAppAPI');
const PORT = process.env.API_PORT || 3001;

/**
 * Fjell Sample Application API Server
 *
 * This server provides the REST API endpoints while Next.js handles the frontend.
 * It runs on port 3001 by default.
 */
class SampleAppAPI {
  constructor() {
    this.app = express();
    this.database = new Database();
    this.server = null;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    logger.info('Starting API server initialization...');

    try {
      // Initialize database
      logger.info('Initializing database...');
      await this.database.initialize();

      // Initialize library registry
      logger.info('Initializing library registry...');
      const { libraries } = await initializeLibraryRegistry(this.database);

      // Configure Express middleware
      this.configureMiddleware();

      // Setup API routes
      logger.info('Setting up API routes...');
      const apiRoutes = createApiRoutes(libraries.widget, libraries.widgetType);
      this.app.use('/api', apiRoutes);

      // Setup additional routes
      this.setupAdditionalRoutes();

      // Setup error handling
      this.setupErrorHandling();

      logger.info('API server initialization completed successfully', {
        libraries: Object.keys(libraries),
        port: PORT
      });

    } catch (error) {
      logger.error('API server initialization failed', { error });
      throw error;
    }
  }

  /**
   * Configure Express middleware
   */
  configureMiddleware() {
    logger.info('Configuring Express middleware...');

    // Parse JSON bodies
    this.app.use(express.json({ limit: '10mb' }));

    // Parse URL-encoded bodies
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // CORS middleware for cross-origin requests
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-Name');

      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Request logging middleware
    this.app.use((req, res, next) => {
      const start = Date.now();

      // Log request
      logger.info('Incoming API request', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        contentType: req.get('Content-Type')
      });

      // Log response
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('API request completed', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`
        });
      });

      next();
    });
  }

  /**
   * Setup additional routes
   */
  setupAdditionalRoutes() {
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Fjell Sample App API Server',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/api/health',
          status: '/api/status',
          dashboard: '/api/dashboard',
          widgetTypes: '/api/widget-types',
          widgets: '/api/widgets'
        },
        note: 'Frontend is served by Next.js on port 3000'
      });
    });

    // API info endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Fjell Sample App API',
        version: '1.0.0',
        description: 'REST API for Widget Management System',
        baseUrl: `/api`,
        endpoints: {
          health: '/api/health',
          status: '/api/status',
          dashboard: '/api/dashboard',
          widgetTypes: '/api/widget-types',
          widgets: '/api/widgets'
        }
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use('*', (req, res) => {
      logger.warn('Route not found', { url: req.originalUrl });
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      logger.error('Unhandled error', { error, url: req.url });

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Start the server
   */
  async start() {
    try {
      await this.initialize();

      this.server = this.app.listen(PORT, () => {
        logger.info('API server started successfully', {
          port: PORT,
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString()
        });

        console.log(`🚀 Fjell Sample App API Server running on http://localhost:${PORT}`);
        console.log(`📱 Frontend available at http://localhost:3000`);
        console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
      });

      // Graceful shutdown
      this.server.on('close', () => {
        logger.info('API server shutting down...');
      });

    } catch (error) {
      logger.error('Failed to start API server', { error });
      process.exit(1);
    }
  }

  /**
   * Stop the server
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          logger.info('API server stopped');
          resolve();
        });
      });
    }
  }

  /**
   * Get the Express app instance
   */
  getApp() {
    return this.app;
  }

  /**
   * Get the database instance
   */
  getDatabase() {
    return this.database;
  }
}

// Start the server
async function main() {
  const api = new SampleAppAPI();

  // Graceful shutdown
  const gracefulShutdown = async () => {
    logger.info('Received shutdown signal, shutting down gracefully...');
    await api.stop();
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  try {
    await api.start();
  } catch (error) {
    logger.error('Failed to start API server', { error });
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unhandled error in main', { error });
  process.exit(1);
});
