import { useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { useRoutePrefetch } from "../../hooks/useRoutePrefetch";

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
  // naive mapping for common cases
  const targetKey = to.startsWith("/app/settings")
    ? ("settings" as const)
    : to.startsWith("/app/folder")
    ? ("folder" as const)
    : to.startsWith("/app/create")
    ? ("create" as const)
    : to.startsWith("/app/story")
    ? ("story" as const)
    : to.startsWith("/login")
    ? ("login" as const)
    : to === "/" || to.startsWith("/landing")
    ? ("root" as const)
    : ("app" as const);
  const prefetch = useRoutePrefetch(targetKey);

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
      aria-label={text || "Back"}
      style={style}
      className={className}
      onMouseEnter={prefetch.onMouseEnter}
      onFocus={prefetch.onFocus}
      onTouchStart={prefetch.onTouchStart}
    >
      {text}
    </Button>
  );
}
