import React from 'react';
import { WidgetAdapter } from './WidgetProvider';
import { WidgetTypeAdapter } from './WidgetTypeProvider';
import { CacheInitializer } from './CacheInitializer';

interface RootAdaptersProps {
  children: React.ReactNode;
}

/**
 * RootAdapters wraps all the fjell-providers adapters at the application root level.
 * This ensures that cache contexts are available throughout the entire application.
 */
export const RootAdapters: React.FC<RootAdaptersProps> = ({ children }) => {
  return (
    <CacheInitializer>
      <WidgetTypeAdapter>
        <WidgetAdapter>
          {children}
        </WidgetAdapter>
      </WidgetTypeAdapter>
    </CacheInitializer>
  );
};
