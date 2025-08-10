import React from 'react';
import { useWidgetTypes } from '../providers/WidgetTypeProvider';

export const DebugWidgetTypes: React.FC = () => {
  const { items: widgetTypes, isLoading } = useWidgetTypes();

  console.log('DebugWidgetTypes render - widgetTypes:', widgetTypes);
  console.log('DebugWidgetTypes render - isLoading:', isLoading);

  return (
    <div style={{
      background: '#e8f4fd',
      padding: '20px',
      margin: '20px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      border: '1px solid #2196f3'
    }}>
      <h3>Widget Types Debug</h3>
      <div>Items count: {widgetTypes?.length || 0}</div>
      <div>Is loading: {String(isLoading)}</div>
      {widgetTypes?.slice(0, 3).map(item => (
        <div key={item.id} style={{ marginTop: '10px', padding: '5px', background: 'white' }}>
          <strong>{item.name}</strong> ({item.code}) - {item.id}
        </div>
      ))}
    </div>
  );
};
