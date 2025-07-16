import { useNavigate } from "react-router-dom";
import { Button } from "../Button";

interface BackButtonProps {
  to?: string;
  text?: string;
  onClick?: () => void;
  variant?: "small" | "normal";
  style?: React.CSSProperties;
  className?: string;
}

export default function BackButton({
  to = "/app",
  text = "← Back",
  onClick,
  variant = "small",
  style,
  className,
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(to);
    }
  };

  const isSmall = variant === "small";

  return (
    <Button
      $secondary
      $small={isSmall}
      onClick={handleClick}
      style={style}
      className={className}
    >
      {text}
    </Button>
  );
}
