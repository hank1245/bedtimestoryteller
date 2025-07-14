import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../Button";

const StyledBackButton = styled(Button)`
  font-size: 12px;
  padding: 6px 12px;
  min-height: 32px;
  width: auto;
  margin: 0;
  border-radius: 8px;
`;

interface BackButtonProps {
  to?: string;
  text?: string;
  onClick?: () => void;
}

export default function BackButton({ 
  to = "/app", 
  text = "← Back", 
  onClick 
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(to);
    }
  };

  return (
    <StyledBackButton $secondary onClick={handleClick}>
      {text}
    </StyledBackButton>
  );
}