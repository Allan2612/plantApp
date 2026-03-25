declare module "@firebase/auth/dist/rn/index" {
  export function getReactNativePersistence(
    storage: unknown,
  ): import("firebase/auth").Persistence;
}
