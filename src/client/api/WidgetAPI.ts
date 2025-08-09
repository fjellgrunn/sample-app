import { createPItemApi, PItemApi } from '@fjell/client-api';
import { ApiParams, getHttpApi } from '@fjell/http-api';
import type { Widget } from '../../model/Widget';
import type { WidgetType } from '../../model/WidgetType';

// Widget Summary interface for business analytics
export interface WidgetSummary {
  total: number;
  active: number;
  inactive: number;
  activePercentage: number;
}

// Create HttpApi configuration for browser environment
const createApiParams = (baseUrl: string = 'http://localhost:3000/api'): ApiParams => ({
  config: {
    url: baseUrl,
    requestCredentials: 'same-origin',
    clientName: 'fjell-sample-app-widget-client'
  },
  populateAuthHeader: async (isAuthenticated: boolean, headers: { [key: string]: string }) => {
    // In a real app, you'd get the token from your auth system
    if (isAuthenticated) {
      const token = localStorage.getItem('authToken') || 'demo-token';
      headers['Authorization'] = `Bearer ${token}`;
    }
  },
  uploadAsyncFile: async () => {
    // Mock implementation for file uploads
    return {
      headers: {},
      status: 200,
      mimeType: 'application/json',
      body: JSON.stringify({ success: true })
    };
  }
});

// Create HttpApi instance
const apiParams = createApiParams();
const baseHttpApi = getHttpApi(apiParams);

// fjell-express-router returns data directly, no wrapper needed
const httpApi = baseHttpApi;

// Create Fjell Client APIs for Widget and WidgetType
export const widgetApi: PItemApi<Widget, 'widget'> = createPItemApi(
  httpApi,
  'widget',
  'widgets', // API path
  {
    readAuthenticated: false,
    writeAuthenticated: true,
    enableErrorHandling: true,
    retryConfig: {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
      enableJitter: true
    }
  }
);

export const widgetTypeApi: PItemApi<WidgetType, 'widgetType'> = createPItemApi(
  httpApi,
  'widgetType',
  'widget-types', // API path
  {
    readAuthenticated: false,
    writeAuthenticated: true,
    enableErrorHandling: true,
    retryConfig: {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
      enableJitter: true
    }
  }
);
