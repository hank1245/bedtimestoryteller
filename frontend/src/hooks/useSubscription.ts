import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSubscription,
  updateSubscription,
  cancelSubscription,
  fetchPaymentHistory,
  createPaymentRecord,
  deleteUserAccount,
  fetchUserStats,
  fetchUserProfile,
  fetchUserPreferences,
  updateUserPreferences,
} from "../services/client";

// Hook for subscription data
export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for payment history
export const usePaymentHistory = () => {
  return useQuery({
    queryKey: ["paymentHistory"],
    queryFn: fetchPaymentHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for user statistics
export const useUserStats = () => {
  return useQuery({
    queryKey: ["userStats"],
    queryFn: fetchUserStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for user preferences
export const useUserPreferences = () => {
  return useQuery({
    queryKey: ["userPreferences"],
    queryFn: fetchUserPreferences,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for updating subscription
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
};

// Hook for cancelling subscription
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
};

// Hook for creating payment record
export const useCreatePaymentRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPaymentRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentHistory"] });
    },
  });
};

// Hook for deleting user account
export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: deleteUserAccount,
  });
};

// Hook for updating user preferences
export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
    },
  });
};
