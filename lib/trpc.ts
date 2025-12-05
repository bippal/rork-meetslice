import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // First check for explicit environment variable
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (__DEV__) {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }

    // iOS simulator and web can use localhost
    return 'http://localhost:3000';
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        try {
          return await fetch(url, options);
        } catch (error) {
          console.error('=== tRPC FETCH ERROR ===');
          console.error('URL:', url);
          console.error('Error:', error);
          throw new Error(
            `Failed to connect to backend at ${getBaseUrl()}. ` +
            `Make sure the backend is running. ` +
            `If on a physical device, set EXPO_PUBLIC_RORK_API_BASE_URL to your computer's IP.`
          );
        }
      },
    }),
  ],
});
