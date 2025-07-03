// TypeScript global type declaration for Clerk Auth Token on window

export {}; // ensure this is a module

declare global {
  interface Window {
    __clerkAuthToken?: string;
    __clerkGetToken?: () => Promise<string | null>;
  }
}
