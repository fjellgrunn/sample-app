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
import { WidgetType } from "../../model/WidgetType";
import { widgetTypeCache } from "../cache";

export const WidgetTypeAdapterContext =
  createContext<PItemAdapter.ContextType<WidgetType, "widgetType"> | undefined>(undefined);

export const useWidgetTypeAdapter = () => PItemAdapter.usePItemAdapter<
  WidgetType,
  "widgetType"
>(WidgetTypeAdapterContext, 'WidgetTypeAdapterContext');

export const WidgetTypeAdapter: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Create a typed version of the Adapter component
  const TypedAdapter = PItemAdapter.Adapter as React.FC<{
    name: string;
    cache: typeof widgetTypeCache;
    context: typeof WidgetTypeAdapterContext;
    children: React.ReactNode;
  }>;

  return (
    <TypedAdapter
      name='WidgetTypeAdapter'
      cache={widgetTypeCache}
      context={WidgetTypeAdapterContext}
    >
      {children}
    </TypedAdapter>
  );
}

export const WidgetTypeContext =
  createContext<PItem.ContextType<WidgetType, 'widgetType'> | undefined>(undefined);

export const useWidgetType = () =>
  PItem.usePItem<WidgetType, 'widgetType'>(WidgetTypeContext, 'WidgetTypeContext');

export const WidgetTypeLoad: React.FC<{
  ik: PriKey<'widgetType'>;
  children: React.ReactNode;
}> = (
  { ik, children }: {
    ik: PriKey<'widgetType'>;
    children: React.ReactNode;
  }
) => PItemLoad<
  WidgetType,
  "widgetType"
>({
  name: 'WidgetTypeLoad',
  ik,
  adapter: WidgetTypeAdapterContext,
  context: WidgetTypeContext,
  contextName: 'WidgetTypeContext',
  children,
});

export type WidgetTypesContextType =
  PItems.ContextType<WidgetType, 'widgetType'>;

export const WidgetTypesContext =
  createContext<WidgetTypesContextType | undefined>(undefined);

export const useWidgetTypes = () =>
  PItems.usePItems<WidgetType, 'widgetType'>(WidgetTypesContext, 'WidgetTypesContext') as WidgetTypesContextType;

export const WidgetTypeQuery: React.FC<{
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
  WidgetType,
  "widgetType"
>({
  name: 'WidgetTypeQuery',
  query,
  adapter: WidgetTypeAdapterContext,
  context: WidgetTypeContext,
  contextName: 'WidgetTypeContext',
  children,
  optional,
});

export const WidgetTypesQuery: React.FC<{
  query?: ItemQuery;
  children: React.ReactNode;
}> = (
  { query, children }: {
    query?: ItemQuery;
    children: React.ReactNode;
  }
) => PItemsQuery<
  WidgetType,
  "widgetType"
>({
  name: 'WidgetTypesQuery',
  query,
  adapter: WidgetTypeAdapterContext,
  context: WidgetTypesContext,
  contextName: 'WidgetTypesContext',
  children,
});

export const WidgetTypesAll: React.FC<{
  children: React.ReactNode;
}> = ({ children }: {
  children: React.ReactNode;
}) => {
  return <WidgetTypesQuery query={IQFactory.all().toQuery()}>{children}</WidgetTypesQuery>;
};
