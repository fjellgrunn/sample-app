import type { Cache } from '@fjell/cache';
import { CacheEventFactory } from '@fjell/cache';
import type { Item } from '@fjell/types';

/**
 * Clear query results and notify React hooks / subscribers.
 * clearQueryResults alone leaves useCacheQuery stale until a manual refetch.
 */
export const invalidateCacheQueries = async <
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
  cache: Cache<V, S, L1, L2, L3, L4, L5>,
  operation = 'manual_invalidate'
): Promise<void> => {
  await cache.cacheMap.clearQueryResults();
  cache.eventEmitter.emit(
    CacheEventFactory.createQueryInvalidatedEvent(
      [],
      'manual',
      { source: 'operation', context: { operation } }
    )
  );
};
