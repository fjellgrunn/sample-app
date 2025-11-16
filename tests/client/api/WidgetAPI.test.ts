import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock localStorage for auth header tests
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('WidgetAPI', () => {
  let mockGetHttpApi: any;
  let mockCreatePItemApi: any;
  let widgetAPI: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockClear();

    // Reset modules to get fresh imports
    vi.resetModules();

    // Mock the dependencies before importing
    mockGetHttpApi = vi.fn();
    mockCreatePItemApi = vi.fn();

    vi.doMock('@fjell/http-api', () => ({
      getHttpApi: mockGetHttpApi
    }));

    vi.doMock('@fjell/client-api', () => ({
      createPItemApi: mockCreatePItemApi
    }));

    // Setup mock returns
    const mockHttpApi = {
      httpGet: vi.fn(),
      httpPost: vi.fn(),
      httpPut: vi.fn(),
      httpDelete: vi.fn(),
      httpPostFile: vi.fn(),
      uploadAsync: vi.fn()
    };

    const mockPItemApi = {
      action: vi.fn(),
      all: vi.fn(),
      allAction: vi.fn(),
      allFacet: vi.fn(),
      one: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      remove: vi.fn(),
      update: vi.fn(),
      facet: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn()
    };

    mockGetHttpApi.mockReturnValue(mockHttpApi);
    mockCreatePItemApi.mockReturnValue(mockPItemApi);

    // Import the module after mocking
    widgetAPI = await import('../../../src/client/api/WidgetAPI');
  });

  describe('API Configuration', () => {
    it('should create HttpApi with default configuration', () => {
      expect(mockGetHttpApi).toHaveBeenCalledWith({
        config: {
          url: 'http://localhost:3001/api',
          requestCredentials: 'same-origin',
          clientName: 'fjell-sample-app-widget-client'
        },
        populateAuthHeader: expect.any(Function),
        uploadAsyncFile: expect.any(Function)
      });
    });
  });

  describe('Widget APIs Creation', () => {
    it('should create widgetApi with correct parameters', () => {
      // Verify widgetApi was created with correct parameters
      expect(mockCreatePItemApi).toHaveBeenCalledWith(
        expect.any(Object), // mockHttpApi
        'widget',
        'widgets',
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
    });

    it('should create widgetTypeApi with correct parameters', () => {
      // Verify widgetTypeApi was created with correct parameters
      expect(mockCreatePItemApi).toHaveBeenCalledWith(
        expect.any(Object), // mockHttpApi
        'widgetType',
        'widget-types',
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
    });

    it('should expose widgetApi and widgetTypeApi instances', () => {
      expect(widgetAPI.widgetApi).toBeDefined();
      expect(widgetAPI.widgetTypeApi).toBeDefined();
    });
  });

  describe('Auth Header Population', () => {
    let populateAuthHeader: (isAuthenticated: boolean, headers: { [key: string]: string }) => Promise<void>;

    beforeEach(() => {
      // Get the populateAuthHeader function from the API params
      const getHttpApiCall = mockGetHttpApi.mock.calls[0];
      if (getHttpApiCall) {
        populateAuthHeader = getHttpApiCall[0].populateAuthHeader;
      }
    });

    it('should not modify headers when not authenticated', async () => {
      const headers: { [key: string]: string } = {};

      await populateAuthHeader(false, headers);

      expect(headers).toEqual({});
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    });

    it('should add Authorization header when authenticated with stored token', async () => {
      const headers: { [key: string]: string } = {};
      mockLocalStorage.getItem.mockReturnValue('stored-auth-token');

      await populateAuthHeader(true, headers);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
      expect(headers.Authorization).toBe('Bearer stored-auth-token');
    });

    it('should use demo token when authenticated but no stored token', async () => {
      const headers: { [key: string]: string } = {};
      mockLocalStorage.getItem.mockReturnValue(null);

      await populateAuthHeader(true, headers);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
      expect(headers.Authorization).toBe('Bearer demo-token');
    });

    it('should use demo token when localStorage returns empty string', async () => {
      const headers: { [key: string]: string } = {};
      mockLocalStorage.getItem.mockReturnValue('');

      await populateAuthHeader(true, headers);

      expect(headers.Authorization).toBe('Bearer demo-token');
    });
  });

  describe('Upload Async File', () => {
    let uploadAsyncFile: () => Promise<any>;

    beforeEach(() => {
      // Get the uploadAsyncFile function from the API params
      const getHttpApiCall = mockGetHttpApi.mock.calls[0];
      if (getHttpApiCall) {
        uploadAsyncFile = getHttpApiCall[0].uploadAsyncFile;
      }
    });

    it('should return mock upload response', async () => {
      const result = await uploadAsyncFile();

      expect(result).toEqual({
        headers: {},
        status: 200,
        mimeType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    it('should return consistent response on multiple calls', async () => {
      const result1 = await uploadAsyncFile();
      const result2 = await uploadAsyncFile();

      expect(result1).toEqual(result2);
      expect(result1.status).toBe(200);
      expect(JSON.parse(result1.body)).toEqual({ success: true });
    });
  });

  describe('API Instance Properties', () => {
    it('should have all required PItemApi methods on widgetApi', () => {
      const requiredMethods = [
        'action', 'all', 'allAction', 'allFacet', 'one', 'get',
        'create', 'remove', 'update', 'facet', 'find', 'findOne'
      ];

      requiredMethods.forEach(method => {
        expect(widgetAPI.widgetApi).toHaveProperty(method);
        expect(typeof widgetAPI.widgetApi[method]).toBe('function');
      });
    });

    it('should have all required PItemApi methods on widgetTypeApi', () => {
      const requiredMethods = [
        'action', 'all', 'allAction', 'allFacet', 'one', 'get',
        'create', 'remove', 'update', 'facet', 'find', 'findOne'
      ];

      requiredMethods.forEach(method => {
        expect(widgetAPI.widgetTypeApi).toHaveProperty(method);
        expect(typeof widgetAPI.widgetTypeApi[method]).toBe('function');
      });
    });
  });

  describe('Configuration Options', () => {
    it('should configure both APIs with read operations as unauthenticated', () => {
      const widgetApiCall = mockCreatePItemApi.mock.calls.find(
        (call: any) => call[1] === 'widget'
      );
      const widgetTypeApiCall = mockCreatePItemApi.mock.calls.find(
        (call: any) => call[1] === 'widgetType'
      );

      expect(widgetApiCall[3].readAuthenticated).toBe(false);
      expect(widgetTypeApiCall[3].readAuthenticated).toBe(false);
    });

    it('should configure both APIs with write operations as authenticated', () => {
      const widgetApiCall = mockCreatePItemApi.mock.calls.find(
        (call: any) => call[1] === 'widget'
      );
      const widgetTypeApiCall = mockCreatePItemApi.mock.calls.find(
        (call: any) => call[1] === 'widgetType'
      );

      expect(widgetApiCall[3].writeAuthenticated).toBe(true);
      expect(widgetTypeApiCall[3].writeAuthenticated).toBe(true);
    });

    it('should enable error handling for both APIs', () => {
      const widgetApiCall = mockCreatePItemApi.mock.calls.find(
        (call: any) => call[1] === 'widget'
      );
      const widgetTypeApiCall = mockCreatePItemApi.mock.calls.find(
        (call: any) => call[1] === 'widgetType'
      );

      expect(widgetApiCall[3].enableErrorHandling).toBe(true);
      expect(widgetTypeApiCall[3].enableErrorHandling).toBe(true);
    });

    it('should configure identical retry settings for both APIs', () => {
      const expectedRetryConfig = {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        enableJitter: true
      };

      const widgetApiCall = mockCreatePItemApi.mock.calls.find(
        (call: any) => call[1] === 'widget'
      );
      const widgetTypeApiCall = mockCreatePItemApi.mock.calls.find(
        (call: any) => call[1] === 'widgetType'
      );

      expect(widgetApiCall[3].retryConfig).toEqual(expectedRetryConfig);
      expect(widgetTypeApiCall[3].retryConfig).toEqual(expectedRetryConfig);
    });
  });
});
