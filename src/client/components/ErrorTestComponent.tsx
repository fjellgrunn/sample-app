import React, { useState } from 'react';
import { useAsyncError } from '@fjell/providers';

export const ErrorTestComponent: React.FC = () => {
  const [shouldThrowSync, setShouldThrowSync] = useState(false);
  const { throwAsyncError } = useAsyncError();

  // This will throw a synchronous error that Error Boundary will catch
  if (shouldThrowSync) {
    throw new Error('Test synchronous error with enhanced stack trace');
  }

  const handleAsyncError = async () => {
    try {
      // Simulate an async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Test async error with enhanced stack trace'));
        }, 100);
      });
    } catch (error) {
      throwAsyncError(error as Error);
    }
  };

  const handleTypeError = () => {
    // This will cause a TypeError
    const obj: any = null;
    obj.nonExistentMethod();
  };

  return (
    <div style={{
      padding: '20px',
      margin: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px'
    }}>
      <h3>Error Testing Component</h3>
      <p>Use these buttons to test the enhanced error boundaries:</p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShouldThrowSync(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Throw Sync Error
        </button>

        <button
          onClick={handleAsyncError}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ea580c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Throw Async Error
        </button>

        <button
          onClick={handleTypeError}
          style={{
            padding: '8px 16px',
            backgroundColor: '#7c2d12',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Throw TypeError
        </button>
      </div>

      <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        Each button will trigger a different type of error to demonstrate the enhanced error boundaries and stack traces.
      </p>
    </div>
  );
};
