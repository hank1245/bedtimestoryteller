import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../Button";

const TopBarContainer = styled.div<{ $variant: 'single' | 'split' }>`
  display: flex;
  justify-content: ${props => props.$variant === 'split' ? 'space-between' : 'flex-end'};
  align-items: center;
  margin-bottom: 24px;
  position: absolute;
  top: 20px;
  right: 20px;
  ${props => props.$variant === 'split' ? 'left: 20px;' : ''}
  z-index: 10;

  @media (max-width: 480px) {
    top: 16px;
    right: 16px;
    ${props => props.$variant === 'split' ? 'left: 16px;' : ''}
  }
`;

const SettingsButton = styled(Button)`
  font-size: 12px;
  padding: 6px 12px;
  min-height: 32px;
  width: auto;
  margin: 0;
  border-radius: 8px;
`;

interface TopBarProps {
  variant?: 'single' | 'split';
  leftContent?: React.ReactNode;
  showSettings?: boolean;
}

export default function TopBar({ 
  variant = 'single', 
  leftContent, 
  showSettings = true 
}: TopBarProps) {
  const navigate = useNavigate();

  return (
    <TopBarContainer $variant={variant}>
      {leftContent}
      {showSettings && (
        <SettingsButton
          $secondary
          onClick={() => navigate("/app/settings")}
        >
          Settings
        </SettingsButton>
      )}
    </TopBarContainer>
  );
}