"use client";
import React from 'react';
import { Widget } from '@/client/pages/Widget';
import { WidgetLoad } from '@/client/providers/WidgetProvider';

interface WidgetPageProps {
  params: Promise<{
    id: string
  }>
}

export default function WidgetPage({ params }: WidgetPageProps) {

  const { id } = React.use(params);

  return id && (
    <WidgetLoad ik={{ kt: 'widget', pk: id }}>
      <Widget />
    </WidgetLoad>
  )
}
