import styled from "styled-components";
import { Button } from "../shared/Button";
import { Modal, ModalContent } from "../shared/SharedStyles";

const StyledModalContent = styled(ModalContent)`
  background: rgba(20, 25, 40, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
`;

const ModalTitle = styled.h3`
  color: var(--text-primary);
  margin-bottom: 16px;
  font-size: 20px;
  margin-top: 0;
`;

const ModalDescription = styled.p`
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.6;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const DangerButton = styled(Button)`
  background: rgba(244, 67, 54, 0.8);
  border: 1px solid #f44336;

  &:hover {
    background: rgba(244, 67, 54, 1);
  }
`;

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDanger?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  isDanger = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const ConfirmButton = isDanger ? DangerButton : Button;

  return (
    <Modal onClick={onClose}>
      <StyledModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{title}</ModalTitle>
        <ModalDescription>{description}</ModalDescription>
        <ModalButtons>
          <Button $secondary onClick={onClose}>
            {cancelText}
          </Button>
          <ConfirmButton
            $primary={!isDanger}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </ConfirmButton>
        </ModalButtons>
      </StyledModalContent>
    </Modal>
  );
}
