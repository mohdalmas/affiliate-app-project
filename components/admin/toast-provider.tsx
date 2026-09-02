"use client";

import { createContext, Suspense, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ToastType = "success" | "error";
type Toast = { id: number; message: string; type: ToastType };
type ToastContextValue = { showToast: (message: string, type?: ToastType) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

// Every admin action that saves/deletes/modifies something should end
// with visible feedback — this is that feedback. Two ways in:
//   1. A client component (DeleteButton) calls showToast() directly after
//      its await resolves or rejects.
//   2. A server action redirects via lib/admin/toast-redirect.ts's
//      redirectWithToast(), landing on a URL with a `?toast=` param —
//      ToastParamListener below picks that up, shows it, then strips it
//      from the URL so a refresh doesn't repeat it.
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`rounded-md px-4 py-3 text-sm font-medium shadow-hover border animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "error"
                ? "bg-destructive text-destructive-foreground border-destructive"
                : "bg-success text-success-foreground border-success"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
      <Suspense>
        <ToastParamListener showToast={showToast} />
      </Suspense>
    </ToastContext.Provider>
  );
}

function ToastParamListener({
  showToast,
}: {
  showToast: (message: string, type?: ToastType) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toastMessage = searchParams.get("toast");

  useEffect(() => {
    if (!toastMessage) return;
    showToast(toastMessage, "success");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // Deliberately only re-runs when the toast param itself changes — not
    // on every searchParams/router identity change, or this would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastMessage]);

  return null;
}
