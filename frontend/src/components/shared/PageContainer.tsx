import { Suspense, lazy } from "react";
import { Card, CardHeader, CardTitle, CardSubtitle } from "./Card";
const ThreeBackground = lazy(() => import("../background/ThreeBackground"));
import TopBar from "./TopBar";
import { PageWrapper, ContentWrapper, emojiColorCSS } from "./SharedStyles";

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
  intensity: 0.4,
  // Place moon top-left by default so it isn't hidden by content
  moonPosition: [-10, 10, -12],
  starsCount: 100,
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
      <Suspense fallback={null}>
        <ThreeBackground {...backgroundProps} />
      </Suspense>
      <Card>
        <TopBar {...topBarProps} />

        <PageWrapper>
          <ContentWrapper>
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
