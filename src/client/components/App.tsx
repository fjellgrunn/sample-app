import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { WidgetContextProvider } from '../providers/WidgetProvider';
import { WidgetList } from './WidgetList';
import { WidgetPage } from './WidgetPage';

export const App: React.FC = () => {
  return (
    <Router>
      <WidgetContextProvider>
        <div className="app">
          <header className="app-header">
            <h1>Fjell Sample App</h1>
            <p>Widget Management System</p>
          </header>

          <main className="app-main">
            <Routes>
              <Route path="/" element={<WidgetList />} />
              <Route path="/widget/:id" element={<WidgetPage />} />
            </Routes>
          </main>

          <footer className="app-footer">
            <p>Built with Fjell Framework</p>
          </footer>
        </div>
      </WidgetContextProvider>
    </Router>
  );
};
