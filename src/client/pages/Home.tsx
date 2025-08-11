"use client";

import React from 'react';
import { WidgetAdapter, WidgetsAll } from '../providers/WidgetProvider';
import { WidgetTypesAll } from '../providers/WidgetTypeProvider';
import { WidgetList } from '../components/WidgetList';

export const Home: React.FC = () => {
  return (
    <WidgetsAll>
      {/* <DebugPItemsQuery />
          <DebugWidgetList /> */}
      <WidgetList />
    </WidgetsAll>
  );
};
