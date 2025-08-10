import React from 'react';
import { useWidgets } from '../providers/WidgetProvider';

export const DebugWidgetList: React.FC = () => {
  const widgetContext = useWidgets();

  console.log('DebugWidgetList render - widgetContext:', widgetContext);
  console.log('DebugWidgetList render - items:', widgetContext.items);
  console.log('DebugWidgetList render - isLoading:', widgetContext.isLoading);

  return (
    <div style={{
      background: '#f0f0f0',
      padding: '20px',
      margin: '20px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3>Widget Context Debug</h3>
      <div>Items count: {widgetContext.items?.length || 0}</div>
      <div>Is loading: {String(widgetContext.isLoading)}</div>
      <div>Context keys: {Object.keys(widgetContext).join(', ')}</div>
      {widgetContext.items?.slice(0, 2).map(item => (
        <div key={item.id} style={{ marginTop: '10px', padding: '5px', background: 'white' }}>
          {item.name} - {item.id}
        </div>
      ))}
    </div>
  );
};
