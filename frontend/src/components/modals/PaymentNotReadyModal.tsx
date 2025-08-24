import React from "react";
import styled from "styled-components";
import { Button } from "../shared/Button";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  color: var(--text-primary);
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
`;

const ModalDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
  text-align: center;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 24px 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: var(--text-secondary);

  &::before {
    content: "✨";
    margin-right: 8px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`;

interface PaymentNotReadyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentNotReadyModal: React.FC<PaymentNotReadyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>🚀 Premium Features Coming Soon!</ModalTitle>
        <ModalDescription>
          We're working hard to bring you the best payment experience. For now,
          enjoy unlimited access to all features completely free!
        </ModalDescription>

        <FeatureList>
          <FeatureItem>Unlimited story generation</FeatureItem>
          <FeatureItem>All voice options available</FeatureItem>
          <FeatureItem>Folder organization</FeatureItem>
          <FeatureItem>No restrictions during beta</FeatureItem>
        </FeatureList>

        <ModalDescription>
          <strong>Good news:</strong> All premium features are currently
          available for free while we're in beta. Start creating unlimited
          stories today!
        </ModalDescription>

        <ButtonContainer>
          <Button onClick={onClose} style={{ background: "#4CAF50" }}>
            Got it, thanks!
          </Button>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PaymentNotReadyModal;
