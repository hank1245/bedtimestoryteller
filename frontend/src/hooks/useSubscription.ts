import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
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
  setAuthToken,
} from "../services/client";

// Hook for subscription data
export const useSubscription = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const token = await getToken();
      setAuthToken(token);
      return fetchSubscription();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for payment history
export const usePaymentHistory = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["paymentHistory"],
    queryFn: async () => {
      const token = await getToken();
      setAuthToken(token);
      return fetchPaymentHistory();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for user statistics
export const useUserStats = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      const token = await getToken();
      setAuthToken(token);
      return fetchUserStats();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for user profile
export const useUserProfile = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const token = await getToken();
      setAuthToken(token);
      return fetchUserProfile();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for user preferences
export const useUserPreferences = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["userPreferences"],
    queryFn: async () => {
      const token = await getToken();
      setAuthToken(token);
      return fetchUserPreferences();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for updating subscription
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (subscriptionData: any) => {
      const token = await getToken();
      setAuthToken(token);
      return updateSubscription(subscriptionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
};

// Hook for cancelling subscription
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      setAuthToken(token);
      return cancelSubscription();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
};

// Hook for creating payment record
export const useCreatePaymentRecord = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (paymentData: any) => {
      const token = await getToken();
      setAuthToken(token);
      return createPaymentRecord(paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentHistory"] });
    },
  });
};

// Hook for deleting user account
export const useDeleteAccount = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      setAuthToken(token);
      return deleteUserAccount();
    },
  });
};

// Hook for updating user preferences
export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (preferences: any) => {
      const token = await getToken();
      setAuthToken(token);
      return updateUserPreferences(preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
    },
  });
};
