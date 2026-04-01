import { useSyncExternalStore } from "react";

export const appRoutes = {
  home: "/",
  playerBase: "/player",
  dashboard: "/dashboard",
} as const;

export type AppRouteName = "home" | "player" | "dashboard";

export type AppRoute = {
  name: AppRouteName;
  path: string;
  courseSlug?: string;
};

export function slugifyCourseName(courseName: string) {
  return courseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildPlayerRoute(courseName: string) {
  const slug = slugifyCourseName(courseName);
  return slug ? `${appRoutes.playerBase}/${slug}` : appRoutes.playerBase;
}

function normalizeRoute(pathname: string): AppRoute {
  if (pathname === appRoutes.playerBase) {
    return {
      name: "player",
      path: appRoutes.playerBase,
    };
  }

  if (pathname.startsWith(`${appRoutes.playerBase}/`)) {
    const courseSlug = pathname.slice(appRoutes.playerBase.length + 1);
    return {
      name: "player",
      path: pathname,
      courseSlug: courseSlug || undefined,
    };
  }

  if (pathname === appRoutes.dashboard) {
    return {
      name: "dashboard",
      path: appRoutes.dashboard,
    };
  }

  return {
    name: "home",
    path: appRoutes.home,
  };
}

function notifyRouteChange() {
  window.dispatchEvent(new Event("app-route-change"));
}

export function navigateTo(route: AppRoute, options?: { replace?: boolean }) {
  const currentRoute = normalizeRoute(window.location.pathname);
  if (currentRoute.path === route.path) {
    return;
  }

  if (options?.replace) {
    window.history.replaceState(null, "", route.path);
  } else {
    window.history.pushState(null, "", route.path);
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

let cachedPathname = "";
let cachedRoute: AppRoute = {
  name: "home",
  path: appRoutes.home,
};

function getSnapshot() {
  const pathname = window.location.pathname;
  if (pathname === cachedPathname) {
    return cachedRoute;
  }

  cachedPathname = pathname;
  cachedRoute = normalizeRoute(pathname);
  return cachedRoute;
}

export function useAppRoute() {
  return useSyncExternalStore(subscribe, getSnapshot, (): AppRoute => ({
    name: "home",
    path: appRoutes.home,
  }));
}
