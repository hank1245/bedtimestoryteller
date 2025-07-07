import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  isConfirm?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  addConfirmToast: (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (type: ToastType, message: string, duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, message, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  addConfirmToast: (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const toast: Toast = {
      id,
      type: "warning",
      message,
      duration: 0, // 확인 토스트는 자동으로 사라지지 않음
      isConfirm: true,
      onConfirm: () => {
        onConfirm();
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },
      onCancel: () => {
        onCancel?.();
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));

// Helper hook for easier usage
export const useToast = () => {
  const { addToast, addConfirmToast, removeToast, clearAllToasts } =
    useToastStore();

  return {
    addToast,
    addConfirmToast,
    removeToast,
    clearAllToasts,
  };
};
