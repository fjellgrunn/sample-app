import React, { useEffect, useState } from 'react';
import { useWidgets } from '../providers/WidgetProvider';
import { WidgetCard } from './WidgetCard';
import type { Widget } from '../../model/Widget';
import type { WidgetSummary } from '../api/WidgetAPI';

export const WidgetList: React.FC = () => {
  const { items: widgets, isLoading: loading, remove: deleteWidget } = useWidgets();
  const [summary, setSummary] = useState<WidgetSummary | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // Load summary data
  useEffect(() => {
    const loadSummary = async () => {
      try {
        // Calculate summary from widgets data
        const active = widgets.filter(w => w.isActive).length;
        const total = widgets.length;
        const inactive = total - active;
        const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;

        setSummary({
          total,
          active,
          inactive,
          activePercentage
        });
      } catch (error) {
        console.error('Failed to calculate summary:', error);
      }
    };

    loadSummary();
  }, [widgets]);

  const handleDelete = async (widget: Widget) => {
    if (window.confirm(`Are you sure you want to delete "${widget.name}"?`)) {
      try {
        await deleteWidget(widget.key);
      } catch (error) {
        console.error('Failed to delete widget:', error);
        alert('Failed to delete widget. Please try again.');
      }
    }
  };

  const filteredWidgets = widgets.filter(widget =>
    showInactive || widget.isActive
  );

  if (loading) {
    return (
      <div className="widget-list-container">
        <div className="loading">Loading widgets...</div>
      </div>
    );
  }

  return (
    <div className="widget-list-container">
      <div className="widget-list-header">
        <h2>Widgets</h2>
        <small style={{ color: '#666', marginLeft: '10px' }}>
          (Using IndexedDB Cache)
        </small>
        <div className="widget-controls">
          <button
            className="btn btn-secondary"
            onClick={() => { }}
          >
            Refresh
          </button>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show inactive widgets
          </label>
        </div>
      </div>

      {summary && (
        <div className="widget-summary">
          <div className="summary-card">
            <h3>Summary</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-value">{summary.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat">
                <span className="stat-value">{summary.active}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat">
                <span className="stat-value">{summary.inactive}</span>
                <span className="stat-label">Inactive</span>
              </div>
              <div className="stat">
                <span className="stat-value">{summary.activePercentage}%</span>
                <span className="stat-label">Active Rate</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="widget-grid">
        {filteredWidgets.length === 0 ? (
          <div className="no-widgets">
            {showInactive
              ? 'No widgets found.'
              : 'No active widgets found. Try showing inactive widgets.'
            }
          </div>
        ) : (
          filteredWidgets.map(widget => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
