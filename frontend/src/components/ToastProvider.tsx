import type React from "react";
import styled, { keyframes } from "styled-components";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToastStore, ToastType } from "../stores/toastStore";
import { useNavigate } from "react-router-dom";

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const ToastContainerStyled = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
`;

const ToastItem = styled.div<{ $type: ToastType }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background: ${(props) => {
    switch (props.$type) {
      case "success":
        return "rgba(34, 197, 94, 0.1)";
      case "error":
        return "rgba(239, 68, 68, 0.1)";
      case "warning":
        return "rgba(245, 158, 11, 0.1)";
      case "info":
        return "rgba(59, 130, 246, 0.1)";
      default:
        return "rgba(255, 255, 255, 0.1)";
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.$type) {
        case "success":
          return "rgba(34, 197, 94, 0.2)";
        case "error":
          return "rgba(239, 68, 68, 0.2)";
        case "warning":
          return "rgba(245, 158, 11, 0.2)";
        case "info":
          return "rgba(59, 130, 246, 0.2)";
        default:
          return "rgba(255, 255, 255, 0.2)";
      }
    }};
  color: ${(props) => {
    switch (props.$type) {
      case "success":
        return "#22c55e";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#3b82f6";
      default:
        return "var(--text-primary)";
    }
  }};
  animation: ${slideIn} 0.3s ease-out;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ToastIcon = styled.div`
  display: flex;
  align-items: center;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ToastMessage = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
`;

const ToastCloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 8px;
`;

const ConfirmButton = styled.button<{ $variant: "confirm" | "cancel" }>`
  background: ${(props) =>
    props.$variant === "confirm"
      ? "rgba(239, 68, 68, 0.8)"
      : "rgba(107, 114, 128, 0.8)"};
  border: none;
  color: white;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.$variant === "confirm"
        ? "rgba(239, 68, 68, 1)"
        : "rgba(107, 114, 128, 1)"};
  }
`;

const ActionButton = styled.button`
  background: rgba(59, 130, 246, 0.85);
  border: none;
  color: white;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-left: 8px;

  &:hover {
    background: rgba(59, 130, 246, 1);
  }
`;

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case "success":
      return <CheckCircle />;
    case "error":
      return <AlertCircle />;
    case "warning":
      return <AlertCircle />;
    case "info":
      return <Info />;
    default:
      return <Info />;
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();
  const navigate = useNavigate();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <ToastContainerStyled
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          $type={toast.type}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <ToastIcon>{getToastIcon(toast.type)}</ToastIcon>
          <ToastMessage>{toast.message}</ToastMessage>
          {toast.isConfirm ? (
            <ConfirmButtons>
              <ConfirmButton
                $variant="confirm"
                aria-label="Confirm delete"
                onClick={() => toast.onConfirm?.()}
              >
                Delete
              </ConfirmButton>
              <ConfirmButton
                $variant="cancel"
                aria-label="Cancel"
                onClick={() => toast.onCancel?.()}
              >
                Cancel
              </ConfirmButton>
            </ConfirmButtons>
          ) : toast.actionLabel && toast.actionRoute ? (
            <>
              <ActionButton
                aria-label={toast.actionLabel}
                onClick={() => {
                  navigate(toast.actionRoute!.path, {
                    state: toast.actionRoute!.state,
                  });
                  removeToast(toast.id);
                }}
              >
                {toast.actionLabel}
              </ActionButton>
              <ToastCloseButton aria-label="Dismiss notification" onClick={() => removeToast(toast.id)}>
                <X />
              </ToastCloseButton>
            </>
          ) : (
            <ToastCloseButton aria-label="Dismiss notification" onClick={() => removeToast(toast.id)}>
              <X />
            </ToastCloseButton>
          )}
        </ToastItem>
      ))}
    </ToastContainerStyled>
  );
};

// Re-export the hook for easier imports
export { useToast } from "../stores/toastStore";
