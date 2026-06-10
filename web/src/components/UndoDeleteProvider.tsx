import { Button } from "@heroui/react";
import { RotateCcw, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const DEFAULT_UNDO_TIMEOUT_MS = 5000;

type UndoableActionRequest = {
  id?: string;
  title: string;
  description?: string;
  timeoutMs?: number;
  onStart: () => void;
  onUndo: () => void;
  onCommit: () => Promise<void> | void;
  onCommitError?: (error: unknown) => void;
};

type UndoNotification = {
  id: string;
  title: string;
  description?: string;
};

type PendingUndoAction = UndoableActionRequest & {
  id: string;
  timerId: number;
};

type UndoDeleteContextValue = {
  scheduleUndoableAction: (request: UndoableActionRequest) => string;
  scheduleUndoableDelete: (request: UndoableActionRequest) => string;
};

const UndoDeleteContext = createContext<UndoDeleteContextValue | null>(null);

export function UndoDeleteProvider({ children }: { children: ReactNode }) {
  const pendingActionsRef = useRef(new Map<string, PendingUndoAction>());
  const [notifications, setNotifications] = useState<UndoNotification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const runCommit = useCallback(
    async (id: string) => {
      const action = pendingActionsRef.current.get(id);

      if (!action) {
        return;
      }

      pendingActionsRef.current.delete(id);
      removeNotification(id);

      try {
        await action.onCommit();
      } catch (error) {
        action.onCommitError?.(error);
      }
    },
    [removeNotification],
  );

  const undoAction = useCallback(
    (id: string) => {
      const action = pendingActionsRef.current.get(id);

      if (!action) {
        return;
      }

      window.clearTimeout(action.timerId);
      pendingActionsRef.current.delete(id);
      removeNotification(id);
      action.onUndo();
    },
    [removeNotification],
  );

  const dismissNotification = useCallback(
    (id: string) => {
      removeNotification(id);
    },
    [removeNotification],
  );

  const scheduleUndoableAction = useCallback(
    (request: UndoableActionRequest) => {
      const id = request.id ?? crypto.randomUUID();
      const existingAction = pendingActionsRef.current.get(id);

      if (existingAction) {
        window.clearTimeout(existingAction.timerId);
        pendingActionsRef.current.delete(id);
      }

      request.onStart();

      const timerId = window.setTimeout(() => {
        void runCommit(id);
      }, request.timeoutMs ?? DEFAULT_UNDO_TIMEOUT_MS);

      pendingActionsRef.current.set(id, {
        ...request,
        id,
        timerId,
      });

      setNotifications((current) => [
        ...current.filter((notification) => notification.id !== id),
        {
          id,
          title: request.title,
          description: request.description,
        },
      ]);

      return id;
    },
    [runCommit],
  );

  const scheduleUndoableDelete = useCallback(
    (request: UndoableActionRequest) => scheduleUndoableAction(request),
    [scheduleUndoableAction],
  );

  useEffect(() => {
    return () => {
      pendingActionsRef.current.forEach((action) => {
        window.clearTimeout(action.timerId);
      });
      pendingActionsRef.current.clear();
    };
  }, []);

  const contextValue = useMemo(
    () => ({ scheduleUndoableAction, scheduleUndoableDelete }),
    [scheduleUndoableAction, scheduleUndoableDelete],
  );

  return (
    <UndoDeleteContext.Provider value={contextValue}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-50 flex w-[min(420px,calc(100vw-3rem))] flex-col gap-3"
        aria-live="polite"
      >
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="rounded-md border border-gray-200 bg-white p-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-neutral-900">{notification.title}</p>
                {notification.description && (
                  <p className="mt-1 text-sm text-neutral-600">
                    {notification.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissNotification(notification.id)}
                className="rounded-md p-1 text-neutral-500 transition hover:bg-gray-100 hover:text-neutral-900"
                aria-label="Fechar aviso"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                className="bg-primary text-white"
                onPress={() => undoAction(notification.id)}
              >
                <RotateCcw size={16} />
                Desfazer
              </Button>
            </div>
          </div>
        ))}
      </div>
    </UndoDeleteContext.Provider>
  );
}

export function useUndoableDelete() {
  const context = useContext(UndoDeleteContext);

  if (!context) {
    throw new Error("useUndoableDelete must be used inside UndoDeleteProvider");
  }

  return context;
}

export function useUndoableAction() {
  const context = useContext(UndoDeleteContext);

  if (!context) {
    throw new Error("useUndoableAction must be used inside UndoDeleteProvider");
  }

  return context;
}
