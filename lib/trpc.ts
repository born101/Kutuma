import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const trpc = createTRPCReact<AppRouter>();

const PROJECT_ID = 'o1xd3eliqi71eb1eha328' as const;
const RORK_PROJECT_API_URL = `https://rork.app/pa/${PROJECT_ID}` as const;

const stripProtocol = (value?: string | null) => {
  if (!value) {
    return null;
  }

  return value
    .replace(/^https?:\/\//, '')
    .replace(/^wss?:\/\//, '')
    .replace(/^exp:\/\//, '')
    .trim();
};

const stripTrailingSlash = (value: string) => value.replace(/\/$/, '');

const isTunnelHost = (host: string) => host.includes('exp.direct') || host.includes('ngrok');

const buildDevApiUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const webUrl = `${window.location.protocol}//${window.location.host}`;
    console.log('🕸️ Using web origin for API:', webUrl);
    return stripTrailingSlash(webUrl);
  }

  const hostUri = stripProtocol(Constants.expoConfig?.hostUri ?? Constants.manifest?.hostUri);
  const debuggerHost = stripProtocol(Constants.manifest?.debuggerHost);
  const resolvedHost = hostUri ?? debuggerHost;

  if (!resolvedHost) {
    return null;
  }

  if (isTunnelHost(resolvedHost)) {
    const tunnelHost = resolvedHost.split(':')[0];
    const tunnelUrl = `https://${tunnelHost}`;
    console.log('🛤️ Using Expo tunnel for API:', tunnelUrl);
    return tunnelUrl;
  }

  const [hostPart, portPart] = resolvedHost.split(':');
  const port = portPart ?? '8081';
  let host = hostPart;

  if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
    host = '10.0.2.2';
  }

  if (host === '0.0.0.0') {
    host = '127.0.0.1';
  }

  const lanUrl = `http://${host}:${port}`;
  console.log('📶 Using LAN dev API URL:', lanUrl);
  return lanUrl;
};

const getBaseUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const webUrl = `${window.location.protocol}//${window.location.host}`;
    console.log('🕸️ Web: Using localhost for API:', webUrl);
    return stripTrailingSlash(webUrl);
  }

  const derivedUrl = buildDevApiUrl();
  if (derivedUrl) {
    console.log('📱 Using derived dev URL:', derivedUrl);
    return stripTrailingSlash(derivedUrl);
  }

  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (envUrl) {
    const cleanUrl = stripTrailingSlash(envUrl);
    console.log('📡 Using ENV API URL:', cleanUrl);
    return cleanUrl;
  }
  
  console.log('🛰️ Falling back to project API URL:', RORK_PROJECT_API_URL);
  return stripTrailingSlash(RORK_PROJECT_API_URL);
};

const baseUrl = getBaseUrl();
const apiEndpoint = `${baseUrl}/api/trpc`;
console.log('🌍 tRPC Base URL:', baseUrl);
console.log('➡️ tRPC client will call:', apiEndpoint);

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: apiEndpoint,
      maxURLLength: 2083,
      async headers() {
        try {
          const token = await AsyncStorage.getItem('auth_token');
          return {
            ...(token ? { 'authorization': `Bearer ${token}` } : {}),
          };
        } catch {
          return {};
        }
      },
      async fetch(url, options) {
        const urlStr = typeof url === 'string' ? url : url.toString();
        console.log('🔄 tRPC Request:', urlStr);
        console.log('📦 Request method:', options?.method);
        
        if (!baseUrl) {
          console.error('❌ No API base URL configured');
          throw new Error('API not configured. Please check your environment settings.');
        }

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          const response = await fetch(url, {
            ...options,
            credentials: 'omit',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          console.log('📥 tRPC Response status:', response.status);
          console.log('📥 tRPC Response content-type:', response.headers.get('content-type'));
          
          if (!response.ok) {
            console.error('❌ tRPC Response error:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response body:', text.substring(0, 500));
            
            if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
              console.error('⚠️ Received HTML instead of JSON - server may be down or misconfigured');
            }
            
            const errorResponse = [
              {
                error: {
                  message: `Server error: ${response.status} ${response.statusText}`,
                  code: -32603,
                  data: {
                    code: 'INTERNAL_SERVER_ERROR',
                    httpStatus: response.status,
                  },
                },
              },
            ];
            
            return new Response(JSON.stringify(errorResponse), {
              status: 200,
              headers: { 'content-type': 'application/json' },
            });
          }
          
          const contentType = response.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            console.error('⚠️ Warning: Response is not JSON, content-type:', contentType);
            const text = await response.text();
            console.error('Non-JSON response body:', text.substring(0, 500));
            
            const errorResponse = [
              {
                error: {
                  message: 'Server returned non-JSON response',
                  code: -32603,
                  data: {
                    code: 'INTERNAL_SERVER_ERROR',
                    httpStatus: response.status,
                    contentType,
                  },
                },
              },
            ];
            
            return new Response(JSON.stringify(errorResponse), {
              status: 200,
              headers: { 'content-type': 'application/json' },
            });
          }
          
          console.log('✅ tRPC Response OK');
          return response;
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.error('❌ tRPC Request timeout');
            throw new Error('Request timeout. Please try again.');
          }
          console.error('❌ tRPC Fetch error:', error);
          throw error;
        }
      },
    }),
  ],
});
