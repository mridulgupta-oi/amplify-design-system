/**
 * IconStoreProvider — fetches the icon manifest from the BFF and
 * persists it to MMKV for offline access.
 *
 * Behavior:
 *   - On mount: fetch manifest with `known_version` query param
 *   - 304 response: cache is current, no update needed
 *   - 200 response: update MMKV with new icons + version
 *   - Foreground re-fetch: after 1 hour in background, re-fetch on
 *     next foreground event
 *
 * Children render immediately — the icon store always has essentials
 * as a fallback, so manifest fetch is non-blocking.
 */
import React, { useEffect, useRef, useCallback, useState, createContext } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  getCachedVersion,
  getLastFetchTimestamp,
  persistManifest,
} from './useIconStore.js';

/**
 * Context that carries a revision counter. Incrementing this forces all
 * useIconStore() consumers to re-render after an async manifest fetch,
 * so they pick up the newly-persisted icons instead of showing placeholders.
 */
export const IconStoreRevisionContext = createContext<number>(0);

/** One hour in milliseconds. */
const REFETCH_INTERVAL_MS = 60 * 60 * 1000;

export interface IconStoreProviderProps {
  /** Base URL for the BFF (e.g. "https://api.amplify.club"). */
  bffBaseUrl: string;
  /** Auth token for authenticated requests. */
  authToken: string | null;
  children: React.ReactNode;
}

/**
 * Fetch the icon manifest from the BFF.
 *
 * Sends `known_version` as a query parameter so the server can return
 * 304 Not Modified when the client already has the latest version.
 */
async function fetchManifest(
  bffBaseUrl: string,
  authToken: string | null,
  knownVersion?: string,
): Promise<void> {
  const url = new URL('/v1/creator/assets/icons-manifest', bffBaseUrl);
  if (knownVersion) {
    url.searchParams.set('known_version', knownVersion);
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(url.toString(), { headers });

  // 304 — cache is current
  if (response.status === 304) return;

  if (!response.ok) {
    // Non-critical failure — icons fall back to essentials
    if (__DEV__) {
      console.warn(
        `[IconStore] Manifest fetch failed: ${response.status} ${response.statusText}`,
      );
    }
    return;
  }

  const data = (await response.json()) as {
    version: string;
    icons: Record<string, string>;
  };

  persistManifest(data.icons, data.version);
}

export const IconStoreProvider: React.FC<IconStoreProviderProps> = ({
  bffBaseUrl,
  authToken,
  children,
}) => {
  const lastFetchRef = useRef<number>(getLastFetchTimestamp());
  const [revision, setRevision] = useState(0);

  const doFetch = useCallback(() => {
    const version = getCachedVersion();
    fetchManifest(bffBaseUrl, authToken, version)
      .then(() => {
        // Bump revision so all useIconStore consumers re-render
        // and pick up the newly-persisted manifest icons.
        setRevision((r) => r + 1);
      })
      .catch((err) => {
        if (__DEV__) {
          console.warn('[IconStore] Manifest fetch error:', err);
        }
      });
    lastFetchRef.current = Date.now();
  }, [bffBaseUrl, authToken]);

  // Fetch on mount
  useEffect(() => {
    doFetch();
  }, [doFetch]);

  // Re-fetch when app comes to foreground after 1 hour
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const elapsed = Date.now() - lastFetchRef.current;
        if (elapsed >= REFETCH_INTERVAL_MS) {
          doFetch();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [doFetch]);

  // Provide revision counter so useIconStore consumers re-render on manifest load
  return React.createElement(
    IconStoreRevisionContext.Provider,
    { value: revision },
    children,
  );
};
