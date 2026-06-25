"use client";

import React, { createContext } from "react";

import {
  CItem,
  CItemAdapter,
  CItemLoad,
  CItems,
  CItemsQuery,
} from "@fjell/providers";
import { ComKey, IQFactory, ItemQuery } from "@fjell/core";
import { WidgetComponent } from "../../model/WidgetComponent";
import { getWidgetComponentCacheSync } from "../cache/ClientCache";
import { WidgetContext } from "./WidgetProvider";

export const WidgetComponentAdapterContext =
  createContext<CItemAdapter.ContextType<WidgetComponent, "widgetComponent", "widget"> | undefined>(undefined);

export const useWidgetComponentAdapter = () => CItemAdapter.useCItemAdapter<
  WidgetComponent,
  "widgetComponent",
  "widget"
>(WidgetComponentAdapterContext, 'WidgetComponentAdapterContext');

export const WidgetComponentAdapter: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Get cache instance synchronously (CacheInitializer has already initialized it)
  const widgetComponentCache = getWidgetComponentCacheSync();

  // Create a typed version of the Adapter component
  const TypedAdapter = CItemAdapter.Adapter as any;

  return (
    <TypedAdapter
      name='WidgetComponentAdapter'
      cache={widgetComponentCache}
      context={WidgetComponentAdapterContext}
    >
      {children}
    </TypedAdapter>
  );
}

export const WidgetComponentContext =
  createContext<CItem.ContextType<WidgetComponent, 'widgetComponent', 'widget'> | undefined>(undefined);

export const useWidgetComponent = () =>
  CItem.useCItem<WidgetComponent, 'widgetComponent', 'widget'>(WidgetComponentContext, 'WidgetComponentContext');

export const WidgetComponentLoad: React.FC<{
  ik: ComKey<'widgetComponent', 'widget'>;
  children: React.ReactNode;
}> = (
  { ik, children }: {
    ik: ComKey<'widgetComponent', 'widget'>;
    children: React.ReactNode;
  }
) => CItemLoad<
  WidgetComponent,
  "widgetComponent",
  "widget"
>({
  name: 'WidgetComponentLoad',
  ik,
  adapter: WidgetComponentAdapterContext,
  context: WidgetComponentContext,
  contextName: 'WidgetComponentContext',
  parent: WidgetContext as any,
  parentContextName: 'WidgetContext',
  children,
});

export type WidgetComponentsContextType =
  CItems.ContextType<WidgetComponent, 'widgetComponent', 'widget'>;

export const WidgetComponentsContext =
  createContext<WidgetComponentsContextType | undefined>(undefined);

export const useWidgetComponents = () =>
  CItems.useCItems<WidgetComponent, 'widgetComponent', 'widget'>(WidgetComponentsContext, 'WidgetComponentsContext') as WidgetComponentsContextType;

export const WidgetComponentsQuery: React.FC<{
  query: ItemQuery;
  children: React.ReactNode;
}> = ({
  query,
  children
}: {
  query: ItemQuery;
  children: React.ReactNode;
}) => CItemsQuery<WidgetComponent, 'widgetComponent', 'widget'>({
  name: 'WidgetComponentsQuery',
  query,
  adapter: WidgetComponentAdapterContext,
  context: WidgetComponentsContext,
  contextName: 'WidgetComponentsContext',
  parent: WidgetContext as any,
  parentContextName: 'WidgetContext',
  children
});

// Hook to create widget component queries
export const useWidgetComponentQuery = () => {
  return {
    /**
     * Query all components
     */
    all: (): ItemQuery => IQFactory.all().toQuery(),

    /**
     * Query components by widget ID
     */
    byWidget: (widgetId: string): ItemQuery =>
      IQFactory.all().condition('widgetId', widgetId, '==').toQuery(),

    /**
     * Query components by status
     */
    byStatus: (status: 'pending' | 'active' | 'complete'): ItemQuery =>
      IQFactory.all().condition('status', status, '==').toQuery(),

    /**
     * Query active components
     */
    active: (): ItemQuery =>
      IQFactory.all().condition('status', 'active', '==').toQuery(),

    /**
     * Query components by component type
     */
    byComponentType: (componentTypeId: string): ItemQuery =>
      IQFactory.all().condition('componentTypeId', componentTypeId, '==').toQuery(),
  };
};
