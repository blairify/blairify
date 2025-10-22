/**
 * Cookie utility functions
 * Provides a cleaner interface for cookie operations
 */

export const cookieUtils = {
  /**
   * Set a cookie with the given name, value, and options
   */
  set: (
    name: string,
    value: string,
    options: {
      path?: string;
      expires?: string;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
    } = {},
  ) => {
    const { path = "/", expires, secure = true, sameSite = "strict" } = options;

    // Try to use Cookie Store API if available
    if ("cookieStore" in window) {
      const cookieOptions: {
        name: string;
        value: string;
        path: string;
        secure: boolean;
        sameSite: string;
        expires?: number;
      } = {
        name,
        value,
        path,
        secure,
        sameSite,
      };

      if (expires) {
        cookieOptions.expires = new Date(expires).getTime();
      }

      try {
        (
          window as { cookieStore: { set: (options: unknown) => void } }
        ).cookieStore.set(cookieOptions);
        return;
      } catch (error) {
        console.warn(
          "Cookie Store API failed, falling back to document.cookie:",
          error,
        );
      }
    }

    // Fallback to document.cookie (intentional fallback when Cookie Store API unavailable)
    let cookieString = `${name}=${value}; path=${path}`;

    if (expires) {
      cookieString += `; expires=${expires}`;
    }

    if (secure) {
      cookieString += "; secure";
    }

    cookieString += `; samesite=${sameSite}`;

    // biome-ignore lint/suspicious/noDocumentCookie: Intentional fallback when Cookie Store API is unavailable
    document.cookie = cookieString;
  },

  /**
   * Clear a cookie by setting it to expire in the past
   */
  clear: (name: string, path: string = "/") => {
    // Try to use Cookie Store API if available
    if ("cookieStore" in window) {
      try {
        (
          window as {
            cookieStore: {
              delete: (options: { name: string; path: string }) => void;
            };
          }
        ).cookieStore.delete({ name, path });
        return;
      } catch (error) {
        console.warn(
          "Cookie Store API delete failed, falling back to document.cookie:",
          error,
        );
      }
    }

    // Fallback to document.cookie (intentional fallback when Cookie Store API unavailable)
    // biome-ignore lint/suspicious/noDocumentCookie: Intentional fallback when Cookie Store API is unavailable
    document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },

  /**
   * Get a cookie value by name
   */
  get: (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  },
};
