"use client";

import React, { useEffect, useState } from 'react';

interface ClientOnlyProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ClientOnlyProvider ensures that children only render on the client-side.
 * This prevents SSR issues with browser-only code like IndexedDB.
 */
export const ClientOnlyProvider: React.FC<ClientOnlyProviderProps> = ({
  children,
  fallback = <div>Loading...</div>
}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
