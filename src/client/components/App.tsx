import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { RootAdapters } from '../providers/RootAdapters';
import { WidgetList } from './WidgetList';
import { WidgetPage } from './WidgetPage';
import { FjellErrorBoundary } from './ErrorBoundary';
import { WidgetsAll } from '../providers/WidgetProvider';
import { WidgetTypesAll } from '../providers/WidgetTypeProvider';
import { DebugWidgetList } from './DebugWidgetList';
import { DebugPItemsQuery } from './DebugPItemsQuery';
import { CacheDebugger } from './CacheDebugger';
import { AdapterEventDebugger } from './AdapterEventDebugger';
import { CacheFixTest } from './CacheFixTest';
// import { DebugCacheContents } from './DebugCacheContents';
// import { DetailedCacheDebug } from './DetailedCacheDebug';

export const App: React.FC = () => {
  return (
    <FjellErrorBoundary>
      <Router>
        <RootAdapters>
          {/* <DebugCacheContents />
          <DetailedCacheDebug /> */}
          <div className="app">
            <header className="app-header">
              <h1>Fjell Sample App</h1>
              <p>Widget Management System</p>
            </header>

            <main className="app-main">
              <FjellErrorBoundary>
                <Routes>
                  <Route path="/" element={
                    <WidgetTypesAll>
                      <WidgetsAll>
                        <CacheFixTest />
                        <CacheDebugger />
                        <AdapterEventDebugger />
                        {/* <DebugPItemsQuery />
                        <DebugWidgetList /> */}
                        <WidgetList />
                      </WidgetsAll>
                    </WidgetTypesAll>
                  } />
                  <Route path="/widget/:id" element={
                    <WidgetTypesAll>
                      <WidgetsAll>
                        <WidgetPage />
                      </WidgetsAll>
                    </WidgetTypesAll>
                  } />
                </Routes>
              </FjellErrorBoundary>
            </main>

            <footer className="app-footer">
              <p>Built with Fjell Framework</p>
            </footer>
          </div>
        </RootAdapters>
      </Router>
    </FjellErrorBoundary>
  );
};
