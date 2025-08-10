import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Widget } from '../../model/Widget';
import { useWidgetTypes } from '../providers/WidgetTypeProvider';

interface WidgetCardProps {
  widget: Widget;
  onEdit?: (widget: Widget) => void;
  onDelete?: (widget: Widget) => void;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  widget,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  const { items: widgetTypes } = useWidgetTypes();

  const formatData = (data: any) => {
    if (!data) return 'No data';
    return JSON.stringify(data, null, 2);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getWidgetTypeName = () => {
    const widgetType = widgetTypes.find(wt => wt.id === widget.widgetTypeId);
    return widgetType ? `${widgetType.name} (${widgetType.code})` : widget.widgetTypeId;
  };

  const handleCardClick = () => {
    navigate(`/widget/${widget.id}`);
  };

  return (
    <div className={`widget-card ${!widget.isActive ? 'inactive' : ''}`} onClick={handleCardClick}>
      <div className="widget-header">
        <h3 className="widget-name">{widget.name}</h3>
        <div className="widget-status">
          <span className={`status-badge ${widget.isActive ? 'active' : 'inactive'}`}>
            {widget.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {widget.description && (
        <p className="widget-description">{widget.description}</p>
      )}

      <div className="widget-details">
        <div className="detail-row">
          <span className="label">ID:</span>
          <span className="value">{widget.id}</span>
        </div>
        <div className="detail-row">
          <span className="label">Type:</span>
          <span className="value">{getWidgetTypeName()}</span>
        </div>
        <div className="detail-row">
          <span className="label">Created:</span>
          <span className="value">{formatDate(widget.createdAt ?? new Date())}</span>
        </div>
        <div className="detail-row">
          <span className="label">Updated:</span>
          <span className="value">{formatDate(widget.updatedAt ?? new Date())}</span>
        </div>
      </div>

      {widget.data && (
        <div className="widget-data">
          <h4>Data:</h4>
          <pre className="data-display">{formatData(widget.data)}</pre>
        </div>
      )}

      <div className="widget-actions">
        {onEdit && (
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(widget);
            }}
          >
            Edit
          </button>
        )}
        {onDelete && widget.isActive && (
          <button
            className="btn btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(widget);
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
