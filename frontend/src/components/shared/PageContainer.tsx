import { Suspense, lazy } from "react";
import { Card, CardHeader, CardTitle, CardSubtitle } from "./Card";
const ThreeBackground = lazy(() => import("../background/ThreeBackground"));
import TopBar from "./TopBar";
import { PageWrapper, ContentWrapper, emojiColorCSS } from "./SharedStyles";
import {
  BACKGROUND_INTENSITY_DEFAULT,
  MOON_POSITION_TOP_LEFT,
  STARS_COUNT_DEFAULT,
} from "../../constants/background";

interface ThreeBackgroundProps {
  intensity?: number;
  moonPosition?: [number, number, number];
  starsCount?: number;
}

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  emoji?: string;
  backgroundProps?: ThreeBackgroundProps;
  topBarProps?: {
    variant?: "single" | "split";
    leftContent?: React.ReactNode;
    showSettings?: boolean;
  };
  showBottomButton?: boolean;
  bottomButtonText?: string;
  onBottomButtonClick?: () => void;
}

const defaultBackgroundProps: ThreeBackgroundProps = {
  intensity: BACKGROUND_INTENSITY_DEFAULT,
  moonPosition: MOON_POSITION_TOP_LEFT,
  starsCount: STARS_COUNT_DEFAULT,
};

export default function PageContainer({
  children,
  title,
  subtitle,
  emoji,
  backgroundProps = defaultBackgroundProps,
  topBarProps = {},
  showBottomButton = false,
  bottomButtonText,
  onBottomButtonClick,
}: PageContainerProps) {
  return (
    <>
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        style={{
          position: "absolute",
          left: "-999px",
          top: 0,
          background: "#000",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: 4,
        }}
        onFocus={(e) => {
          // Reveal when focused
          e.currentTarget.style.left = "16px";
          e.currentTarget.style.top = "16px";
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = "-999px";
          e.currentTarget.style.top = "0";
        }}
      >
        Skip to main content
      </a>
      <Suspense fallback={null}>
        <ThreeBackground {...backgroundProps} />
      </Suspense>
      <Card>
        <TopBar {...topBarProps} />

        <PageWrapper>
          <ContentWrapper as="main" id="main-content" tabIndex={-1}>
            {(title || subtitle) && (
              <CardHeader style={{ marginTop: 20 }}>
                {title && (
                  <CardTitle>
                    {emoji && <span className="emoji-color">{emoji}</span>}{" "}
                    {title}
                  </CardTitle>
                )}
                {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
              </CardHeader>
            )}

            {children}
          </ContentWrapper>

          {showBottomButton && onBottomButtonClick && bottomButtonText && (
            <button
              onClick={onBottomButtonClick}
              aria-label={bottomButtonText}
              style={{
                bottom: -30,
                background: "var(--primary-color)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {bottomButtonText}
            </button>
          )}
        </PageWrapper>
      </Card>

      {/* Global emoji styling */}
      <style>{emojiColorCSS}</style>
    </>
  );
}
