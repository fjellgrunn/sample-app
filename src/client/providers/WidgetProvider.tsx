
"use client";

import React, { createContext } from "react";

import {
  PItem,
  PItemAdapter,
  PItemLoad,
  PItemQuery,
  PItems,
  PItemsQuery,
} from "@fjell/providers";
import { IQFactory, ItemQuery, PriKey } from "@fjell/core";
import { Widget } from "../../model/Widget";
import { getWidgetCacheSync } from "../cache/ClientCache";

export const WidgetAdapterContext =
  createContext<PItemAdapter.ContextType<Widget, "widget"> | undefined>(undefined);

export const useWidgetAdapter = () => PItemAdapter.usePItemAdapter<
  Widget,
  "widget"
>(WidgetAdapterContext, 'WidgetAdapterContext');

export const WidgetAdapter: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Get cache instance synchronously (CacheInitializer has already initialized it)
  const widgetCache = getWidgetCacheSync();

  // Create a typed version of the Adapter component
  const TypedAdapter = PItemAdapter.Adapter as any;

  return (
    <TypedAdapter
      name='WidgetAdapter'
      cache={widgetCache}
      context={WidgetAdapterContext}
    >
      {children}
    </TypedAdapter>
  );
}

export const WidgetContext =
  createContext<PItem.ContextType<Widget, 'widget'> | undefined>(undefined);

export const useWidget = () =>
  PItem.usePItem<Widget, 'widget'>(WidgetContext, 'WidgetContext');

export const WidgetLoad: React.FC<{
  ik: PriKey<'widget'>;
  children: React.ReactNode;
}> = (
  { ik, children }: {
    ik: PriKey<'widget'>;
    children: React.ReactNode;
  }
) => PItemLoad<
  Widget,
  "widget"
>({
  name: 'WidgetLoad',
  ik,
  adapter: WidgetAdapterContext,
  context: WidgetContext,
  contextName: 'WidgetContext',
  children,
});

export type WidgetsContextType =
  PItems.ContextType<Widget, 'widget'>;

export const WidgetsContext =
  createContext<WidgetsContextType | undefined>(undefined);

export const useWidgets = () =>
  PItems.usePItems<Widget, 'widget'>(WidgetsContext, 'WidgetsContext') as WidgetsContextType;

export const WidgetQuery: React.FC<{
  query: ItemQuery;
  children: React.ReactNode;
  optional?: boolean;
}> = (
  { query, children, optional }: {
    query: ItemQuery;
    children: React.ReactNode;
    optional?: boolean;
  }
) => PItemQuery<
  Widget,
  "widget"
>({
  name: 'WidgetQuery',
  query,
  adapter: WidgetAdapterContext,
  context: WidgetContext,
  contextName: 'WidgetContext',
  children,
  optional,
});

export const WidgetsQuery: React.FC<{
  query?: ItemQuery;
  children: React.ReactNode;
}> = (
  { query, children }: {
    query?: ItemQuery;
    children: React.ReactNode;
  }
) => PItemsQuery<
  Widget,
  "widget"
>({
  name: 'WidgetsQuery',
  query,
  adapter: WidgetAdapterContext,
  context: WidgetsContext,
  contextName: 'WidgetsContext',
  children,
});

export const WidgetsAll: React.FC<{
  children: React.ReactNode;
}> = ({ children }: {
  children: React.ReactNode;
}) => {
  return <WidgetsQuery query={IQFactory.all().toQuery()}>{children}</WidgetsQuery>;
};
