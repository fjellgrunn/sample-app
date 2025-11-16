"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { WidgetAdapter, WidgetsAll } from '../providers/WidgetProvider';
import { WidgetTypesAll } from '../providers/WidgetTypeProvider';
import { WidgetPage } from '../components/WidgetPage';

export const Widget: React.FC = () => {
  const params = useParams();
  const widgetId = params?.id as string;

  return (
    <WidgetPage widgetId={widgetId} />
  );
};
