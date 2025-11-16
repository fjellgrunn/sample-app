# Fjell Cache with IndexedDB

This directory demonstrates how to use fjell-cache with IndexedDB for persistent browser storage.

## Key Features Demonstrated

1. **IndexedDB Configuration**: Both `WidgetCache.ts` and `WidgetTypeCache.ts` are configured to use IndexedDB for persistent storage across browser sessions.

2. **Asynchronous Initialization**: The `CacheInitializer` component in `providers/CacheInitializer.tsx` handles the asynchronous nature of IndexedDB initialization, ensuring the database is ready before the app renders.

3. **Offline Support**: Once data is cached in IndexedDB, the app can work offline and persist data across browser sessions.

## Implementation Details

### Cache Configuration
```typescript
const createCacheOptions = (dbName: string, storeName: string) => ({
  cacheType: 'indexedDB' as const,
  indexedDBConfig: {
    dbName,         // Name of the IndexedDB database
    version: 1,     // Database version
    storeName      // Object store name within the database
  },
  // ... other options
});
```

### Benefits of IndexedDB

1. **Persistence**: Data survives browser restarts
2. **Large Storage**: Can store significantly more data than localStorage
3. **Performance**: Asynchronous operations don't block the UI
4. **Offline First**: Enables true offline-first applications

### Viewing IndexedDB Data

To see the cached data in your browser:
1. Open DevTools (F12)
2. Go to Application tab
3. Expand IndexedDB in the left sidebar
4. Look for databases named `WidgetAppCache_Widgets` and `WidgetAppCache_WidgetTypes`

## Cache Event System

The caches are configured with event subscriptions (see `index.ts`) that demonstrate cross-cache invalidation patterns when data changes.
