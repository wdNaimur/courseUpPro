import { useSyncExternalStore } from "react";

export const appRoutes = {
  home: "/",
  player: "/player",
  dashboard: "/dashboard",
} as const;

export type AppRoute = (typeof appRoutes)[keyof typeof appRoutes];

function normalizeRoute(pathname: string): AppRoute {
  if (pathname === appRoutes.player) {
    return appRoutes.player;
  }

  if (pathname === appRoutes.dashboard) {
    return appRoutes.dashboard;
  }

  return appRoutes.home;
}

function notifyRouteChange() {
  window.dispatchEvent(new Event("app-route-change"));
}

export function navigateTo(route: AppRoute, options?: { replace?: boolean }) {
  const currentRoute = normalizeRoute(window.location.pathname);
  if (currentRoute === route) {
    return;
  }

  if (options?.replace) {
    window.history.replaceState(null, "", route);
  } else {
    window.history.pushState(null, "", route);
  }

  notifyRouteChange();
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();

  window.addEventListener("popstate", handleChange);
  window.addEventListener("app-route-change", handleChange);

  return () => {
    window.removeEventListener("popstate", handleChange);
    window.removeEventListener("app-route-change", handleChange);
  };
}

function getSnapshot() {
  return normalizeRoute(window.location.pathname);
}

export function useAppRoute() {
  return useSyncExternalStore(subscribe, getSnapshot, () => appRoutes.home);
}
