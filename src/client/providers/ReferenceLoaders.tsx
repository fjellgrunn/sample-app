"use client";

import React from 'react';
import { WidgetTypesAll } from '../providers/WidgetTypeProvider';
import { ClientOnlyProvider } from '../providers/ClientOnlyProvider';

interface ReferenceLoadersProps {
  children: React.ReactNode;
}

/**
 * ReferenceLoaders wraps all the fjell-providers adapters at the application root level.
 * This ensures that cache contexts are available throughout the entire application.
 * The ClientOnlyProvider prevents cache initialization during SSR.
 *
 * This is used to load references for the application.
 *
 * It is used to load the widget and widget type adapters.
 *
 * It is used to load the cache initializer.
 */
export const ReferenceLoaders: React.FC<ReferenceLoadersProps> = ({ children }) => {
  return (
    <ClientOnlyProvider fallback={<div className="loading-screen">Initializing application...</div>}>
      <WidgetTypesAll>
        {children}
      </WidgetTypesAll>
    </ClientOnlyProvider >
  );
};
