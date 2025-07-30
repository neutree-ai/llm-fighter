import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/game/api";
import { ApiKeyStoreProvider } from "@/lib/api-key-manager";

import "./index.css";

const router = createRouter({
  routeTree,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApiKeyStoreProvider>
        <RouterProvider router={router} />
      </ApiKeyStoreProvider>
    </QueryClientProvider>
  </StrictMode>
);
