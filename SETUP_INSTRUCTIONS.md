# Two Layer Cache Demo Setup Instructions

## Quick Start

The sample app consists of two parts:
1. **Next.js Frontend** (port 3000) - The React UI 
2. **Express API Server** (port 3001) - The backend API with Two Layer Cache

### Option 1: Run Both Together (Recommended)

```bash
cd sample-app
npm install
npm run dev:all
```

This will start:
- Next.js frontend at `http://localhost:3000`
- Express API server at `http://localhost:3001`

### Option 2: Run Separately

**Terminal 1 - Frontend:**
```bash
cd sample-app
npm run dev
```

**Terminal 2 - API Server:**
```bash
cd sample-app
npm run api:dev
```

## Accessing the Demo

1. **Two Layer Cache Demo:** http://localhost:3000/cache-demo
2. **API Documentation:** http://localhost:3001/api
3. **API Health Check:** http://localhost:3001/api/health
4. **Cache Info:** http://localhost:3001/api/cache/info

## Testing the Two Layer Cache

### Via Web Interface
1. Go to http://localhost:3000/cache-demo
2. Click the different query buttons to see cache behavior
3. Check browser console for detailed Two Layer Cache logs

### Via API Calls
```bash
# Complete queries (5 minute TTL)
curl http://localhost:3001/api/cache/widgets/all
curl http://localhost:3001/api/cache/widget-types/all

# Selective queries (1 minute TTL)  
curl http://localhost:3001/api/cache/widgets/active
curl http://localhost:3001/api/cache/widgets/recent
curl http://localhost:3001/api/cache/widgets/by-type/[id]

# Cache exploration
curl http://localhost:3001/api/cache/info
curl http://localhost:3001/api/cache/guide
```

## Troubleshooting

### Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
**Cause:** The Express API server (port 3001) is not running.
**Solution:** Make sure you start the API server with `npm run api:dev` or `npm run dev:all`

### Frontend shows "Failed to load widget types"
**Cause:** Can't connect to Express API server.
**Solution:** Verify the Express server is running on port 3001 and check console for network errors.

### No cache debug logs in browser console
**Cause:** Two Layer Cache debug logging may not be enabled.
**Solution:** Check that the cache configuration has `debug: true` and `twoLayer.debug: true`.

### Cache behavior not showing
**Cause:** Queries might not be hitting the cache layer.
**Solution:** 
1. Make sure both servers are running
2. Clear browser cache and IndexedDB storage
3. Check Network tab in dev tools for API request timing

## Development Notes

- The Express server rebuilds automatically when source files change
- Next.js hot-reloads the frontend automatically  
- IndexedDB storage persists between browser sessions
- Use the "Clear All Caches" button in the demo to reset cache state
- Check both server console output and browser console for debugging

## Architecture

```
Frontend (Next.js - Port 3000)
    ↓ HTTP requests
Backend (Express - Port 3001)
    ↓ Uses
Two Layer Cache (IndexedDB)
    ↓ Falls back to  
SQLite Database
```

The Two Layer Cache sits between the Express API and the SQLite database, providing:
- **Item Layer**: Individual items cached for 15 minutes
- **Query Layer**: Complete queries cached for 5 minutes  
- **Facet Layer**: Filtered queries cached for 1 minute
