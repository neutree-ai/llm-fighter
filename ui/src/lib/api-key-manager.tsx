import { createContext, useContext, useReducer, type ReactNode } from "react";

type ApiKeyState = Record<
  string,
  {
    p1Key: string;
    p2Key: string;
  }
>;

type ApiKeyAction =
  | {
      type: "SET_API_KEYS";
      gameId: string;
      payload: { p1Key: string; p2Key: string };
    }
  | { type: "REMOVE_API_KEYS"; gameId: string }
  | { type: "CLEAR_ALL_API_KEYS" };

const initialState: ApiKeyState = {};

function apiKeyReducer(state: ApiKeyState, action: ApiKeyAction): ApiKeyState {
  switch (action.type) {
    case "SET_API_KEYS":
      return {
        ...state,
        [action.gameId]: action.payload,
      };
    case "REMOVE_API_KEYS": {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.gameId]: removed, ...rest } = state;
      return rest;
    }
    case "CLEAR_ALL_API_KEYS":
      return {};
    default:
      return state;
  }
}

const ApiKeyStoreContext = createContext<{
  state: ApiKeyState;
  dispatch: React.Dispatch<ApiKeyAction>;
} | null>(null);

export function ApiKeyStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(apiKeyReducer, initialState);

  return (
    <ApiKeyStoreContext.Provider value={{ state, dispatch }}>
      {children}
    </ApiKeyStoreContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApiKeyStore() {
  const context = useContext(ApiKeyStoreContext);
  if (!context) {
    throw new Error("useApiKeyStore must be used within ApiKeyStoreProvider");
  }

  const { state, dispatch } = context;

  return {
    apiKeys: state,
    setApiKeys: (gameId: string, keys: { p1Key: string; p2Key: string }) => {
      dispatch({ type: "SET_API_KEYS", gameId, payload: keys });
    },
    removeApiKeys: (gameId: string) => {
      dispatch({ type: "REMOVE_API_KEYS", gameId });
    },
    clearAllApiKeys: () => {
      dispatch({ type: "CLEAR_ALL_API_KEYS" });
    },
    getApiKeys: (gameId: string) => state[gameId] || null,
  };
}
