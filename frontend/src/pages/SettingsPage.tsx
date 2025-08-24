import {
  MOON_POSITION_TOP_LEFT,
  STARS_COUNT_DEFAULT,
  BACKGROUND_INTENSITY_DEFAULT,
} from "../constants/background";
import { useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import styled from "styled-components";
import { CardTitle, CardSubtitle } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { useToast } from "../stores/toastStore";
import PageContainer from "../components/shared/PageContainer";
import BackButton from "../components/shared/BackButton";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import PaymentNotReadyModal from "../components/modals/PaymentNotReadyModal";
import { exportUserData } from "../services/client";
import {
  useSubscription,
  useCancelSubscription,
  useDeleteAccount,
  useUserStats,
  useUserProfile,
} from "../hooks/useSubscription";

const SectionContainer = styled.div`
  margin-top: 40px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding-right: 8px;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const SettingsSection = styled.div`
  margin-bottom: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionContent = styled.div`
  color: var(--text-secondary);
  line-height: 1.6;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${(props) =>
    props.$status === "active"
      ? "rgba(76, 175, 80, 0.2)"
      : props.$status === "cancelled"
      ? "rgba(244, 67, 54, 0.2)"
      : "rgba(255, 193, 7, 0.2)"};
  color: ${(props) =>
    props.$status === "active"
      ? "#4CAF50"
      : props.$status === "cancelled"
      ? "#F44336"
      : "#FFC107"};
`;

const PaymentHistoryTable = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  overflow: hidden;
`;

const PaymentRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const PaymentHeader = styled(PaymentRow)`
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  color: var(--text-secondary);
`;

const DangerButton = styled(Button)`
  background: rgba(244, 67, 54, 0.8);
  border: 1px solid #f44336;

  &:hover {
    background: rgba(244, 67, 54, 1);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #aaa;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;

  &.small {
    font-size: 16px;
  }
`;

export default function SettingsPage() {
  const { signOut } = useClerk();
  const { addToast } = useToast();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Use custom hooks
  const { data: subscription, isLoading: subscriptionLoading } =
    useSubscription();
  // Temporarily disable payment history loading since payment system isn't ready
  const paymentHistory: any[] = [];
  const paymentsLoading = false;
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const cancelSubscriptionMutation = useCancelSubscription();
  const deleteAccountMutation = useDeleteAccount();

  const handleCancelSubscription = () => {
    cancelSubscriptionMutation.mutate(undefined, {
      onSuccess: () => {
        addToast("success", "Subscription cancelled successfully");
        setShowCancelModal(false);
      },
      onError: () => {
        addToast("error", "Failed to cancel subscription");
      },
    });
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        addToast("success", "Account deleted successfully");
        signOut();
      },
      onError: () => {
        addToast("error", "Failed to delete account");
      },
    });
  };

  const handleExportData = async () => {
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `storyteller-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast("success", "Data exported successfully");
    } catch (error) {
      addToast("error", "Failed to export data");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  return (
    <PageContainer
      backgroundProps={{
        intensity: BACKGROUND_INTENSITY_DEFAULT,
        moonPosition: MOON_POSITION_TOP_LEFT,
        starsCount: STARS_COUNT_DEFAULT,
      }}
      topBarProps={{
        variant: "split",
        leftContent: <BackButton to="/app" text="Back to Stories" />,
        showSettings: false,
      }}
    >
      <SectionContainer>
        <div style={{ marginBottom: "32px", paddingTop: "20px" }}>
          <CardTitle>
            <span className="emoji-color">⚙️</span> Settings
          </CardTitle>
          <CardSubtitle>Manage your account and subscription</CardSubtitle>
        </div>

        {/* Account Overview */}
        <SettingsSection>
          <SectionTitle>
            <span>👤</span> Account Overview
          </SectionTitle>
          <SectionContent>
            {profileLoading || statsLoading ? (
              <div>Loading account info...</div>
            ) : (
              <StatsGrid>
                <StatCard>
                  <StatLabel>Total Stories</StatLabel>
                  <StatValue>{userStats?.story_count || 0}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Active Days</StatLabel>
                  <StatValue>{userStats?.active_days || 0}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Member Since</StatLabel>
                  <StatValue className="small">
                    {userStats?.member_since
                      ? formatDate(userStats.member_since)
                      : "N/A"}
                  </StatValue>
                </StatCard>
                {userProfile?.email && (
                  <StatCard>
                    <StatLabel>Email</StatLabel>
                    <StatValue
                      className="small"
                      style={{ wordBreak: "break-all" }}
                    >
                      {userProfile.email}
                    </StatValue>
                  </StatCard>
                )}
              </StatsGrid>
            )}
          </SectionContent>
        </SettingsSection>

        {/* Subscription Status */}
        <SettingsSection>
          <SectionTitle>
            <span>💳</span> Subscription Status
          </SectionTitle>
          <SectionContent>
            {subscriptionLoading ? (
              <div>Loading subscription info...</div>
            ) : subscription ? (
              <div>
                <div style={{ marginBottom: "12px" }}>
                  <strong>Plan:</strong> {subscription.plan_type}{" "}
                  <StatusBadge $status={subscription.status}>
                    {subscription.status}
                  </StatusBadge>
                </div>
                {subscription.expires_at && (
                  <div style={{ marginBottom: "12px" }}>
                    <strong>Expires:</strong>{" "}
                    {formatDate(subscription.expires_at)}
                  </div>
                )}
                <div style={{ marginBottom: "16px" }}>
                  <strong>Started:</strong>{" "}
                  {formatDate(subscription.started_at)}
                </div>
                {subscription.status === "active" &&
                  subscription.plan_type !== "free" && (
                    <Button
                      $secondary
                      onClick={() => setShowCancelModal(true)}
                      disabled={cancelSubscriptionMutation.isPending}
                      style={{ marginRight: "12px" }}
                    >
                      {cancelSubscriptionMutation.isPending
                        ? "Cancelling..."
                        : "Cancel Subscription"}
                    </Button>
                  )}
                {subscription.plan_type === "free" && (
                  <div
                    style={{
                      background: "rgba(76, 175, 80, 0.1)",
                      padding: "16px",
                      borderRadius: "8px",
                      marginTop: "16px",
                    }}
                  >
                    <div style={{ marginBottom: "12px", fontWeight: "600" }}>
                      Upgrade to Premium
                    </div>
                    <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                      ✨ Unlimited stories
                    </div>
                    <Button
                      onClick={() => setShowPaymentModal(true)}
                      style={{ background: "#4CAF50" }}
                    >
                      Upgrade Now - $3.99/month
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div>No subscription found</div>
            )}
          </SectionContent>
        </SettingsSection>

        {/* Payment History */}
        <SettingsSection>
          <SectionTitle>
            <span>📋</span> Payment History
          </SectionTitle>
          <SectionContent>
            {paymentsLoading ? (
              <div>Loading payment history...</div>
            ) : paymentHistory.length > 0 ? (
              <PaymentHistoryTable>
                <PaymentHeader>
                  <div>Description</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Date</div>
                </PaymentHeader>
                {paymentHistory.map((payment: any) => (
                  <PaymentRow key={payment.id}>
                    <div>{payment.description || "Subscription Payment"}</div>
                    <div>{formatAmount(payment.amount, payment.currency)}</div>
                    <div>
                      <StatusBadge $status={payment.status}>
                        {payment.status}
                      </StatusBadge>
                    </div>
                    <div>{formatDate(payment.payment_date)}</div>
                  </PaymentRow>
                ))}
              </PaymentHistoryTable>
            ) : (
              <EmptyState>No payment history found</EmptyState>
            )}
          </SectionContent>
        </SettingsSection>

        {/* Account Management */}
        <SettingsSection>
          <SectionTitle>
            <span>👤</span> Account Management
          </SectionTitle>
          <SectionContent>
            <div style={{ marginBottom: "16px" }}>
              Manage your account settings and account deletion.
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Button $secondary onClick={() => signOut()}>
                Logout
              </Button>
              <DangerButton
                onClick={() => setShowDeleteModal(true)}
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending
                  ? "Deleting..."
                  : "Delete Account"}
              </DangerButton>
            </div>
          </SectionContent>
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection>
          <SectionTitle>
            <span>📁</span> Data Management
          </SectionTitle>
          <SectionContent>
            <div style={{ marginBottom: "16px" }}>
              Export your data for backup or migration purposes.
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Button $secondary onClick={handleExportData}>
                Export My Data
              </Button>
            </div>
          </SectionContent>
        </SettingsSection>
      </SectionContainer>

      {/* Modals */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period."
        confirmText="Cancel Subscription"
        cancelText="Keep Subscription"
        isLoading={cancelSubscriptionMutation.isPending}
        isDanger={true}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to permanently delete your account? This will remove all your stories, payment history, and account data. This action cannot be undone."
        confirmText="Delete Account"
        cancelText="Cancel"
        isLoading={deleteAccountMutation.isPending}
        isDanger={true}
      />

      <PaymentNotReadyModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </PageContainer>
  );
}
