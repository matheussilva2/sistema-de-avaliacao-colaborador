import { Button } from "@heroui/react";
import { RotateCcw, X } from "lucide-react";
import { flushSync } from "react-dom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
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
  timeoutMs: number;
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

      window.clearTimeout(action.timerId);
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

      // Cada tela mantém o snapshot anterior no callback onUndo. Forçar a
      // atualização síncrona evita que a interface espere uma nova busca na API
      // para exibir os dados restaurados.
      flushSync(() => {
        action.onUndo();
        removeNotification(id);
      });

      window.location.reload();
    },
    [removeNotification],
  );

  const scheduleUndoableAction = useCallback(
    (request: UndoableActionRequest) => {
      const id = request.id ?? crypto.randomUUID();
      const timeoutMs = request.timeoutMs ?? DEFAULT_UNDO_TIMEOUT_MS;
      const existingAction = pendingActionsRef.current.get(id);

      if (existingAction) {
        window.clearTimeout(existingAction.timerId);
        pendingActionsRef.current.delete(id);
      }

      request.onStart();

      const timerId = window.setTimeout(() => {
        void runCommit(id);
      }, timeoutMs);

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
          timeoutMs,
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
                onClick={() => void runCommit(notification.id)}
                className="rounded-md p-1 text-neutral-500 transition hover:bg-gray-100 hover:text-neutral-900"
                aria-label="Confirmar ação agora"
                title="Confirmar ação agora"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <CountdownTimer timeoutMs={notification.timeoutMs} />
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

function CountdownTimer({ timeoutMs }: { timeoutMs: number }) {
  const progressStyle: CSSProperties = {
    animation: `undo-countdown ${timeoutMs}ms linear forwards`,
  };

  return (
    <div
      className="relative size-9 shrink-0"
      aria-label="Tempo restante para confirmar a ação"
      role="img"
      title="A ação será confirmada quando o anel terminar"
    >
      <svg viewBox="0 0 36 36" className="size-full" aria-hidden="true">
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-primary-100"
        />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset="0"
          strokeLinecap="round"
          className="origin-center -rotate-90 text-primary"
          style={progressStyle}
        />
      </svg>
    </div>
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
