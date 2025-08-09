import { Item } from '@fjell/core';

/**
 * WidgetType represents a type of widget that can be created
 * It serves as a reference type for the Widget model
 */
export interface WidgetType extends Item<'widgetType'> {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Properties for creating a new WidgetType (without the key and events)
 */
export interface WidgetTypeProperties {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}
