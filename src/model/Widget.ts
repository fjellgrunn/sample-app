import { Item, PriKey } from '@fjell/core';

/**
 * Widget represents a widget instance with a reference to its type
 */
export interface Widget extends Item<'widget'> {
  id: string;
  widgetTypeId: string;
  name: string;
  description?: string;
  isActive: boolean;
  data?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;

  // References to related objects
  refs?: {
    widgetType: PriKey<'widgetType'>;
  };
}

/**
 * Properties for creating a new Widget (without the key and events)
 */
export interface WidgetProperties {
  widgetTypeId: string;
  name: string;
  description?: string;
  isActive?: boolean;
  data?: Record<string, any>;
}
