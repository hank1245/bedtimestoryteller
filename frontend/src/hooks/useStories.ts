import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  fetchStories,
  fetchStoryById,
  createStory,
  deleteStory,
  setAuthToken,
} from "../services/client";

// Query Keys
export const queryKeys = {
  stories: ["stories"] as const,
  story: (id: number) => ["stories", id] as const,
};

// Fetch all stories
export const useStories = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.stories,
    queryFn: async () => {
      const token = await getToken();
      console.log("useStories - token:", token?.substring(0, 20) + "...");
      setAuthToken(token);
      return fetchStories();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single story
export const useStory = (id: number) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: queryKeys.story(id),
    queryFn: async () => {
      const token = await getToken();
      setAuthToken(token);
      return fetchStoryById(id);
    },
    enabled: !!id,
  });
};

// Create story mutation
export const useCreateStory = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ title, story }: { title: string; story: string }) => {
      const token = await getToken();
      setAuthToken(token);
      return createStory(title, story);
    },
    onSuccess: () => {
      // Invalidate and refetch stories list
      queryClient.invalidateQueries({ queryKey: queryKeys.stories });
    },
  });
};

// Delete story mutation
export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (storyId: number) => {
      const token = await getToken();
      setAuthToken(token);
      return deleteStory(storyId);
    },
    onSuccess: () => {
      // Invalidate and refetch stories list
      queryClient.invalidateQueries({ queryKey: queryKeys.stories });
    },
  });
};

// Upload audio mutation
export const useUploadAudio = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      storyId,
      audioBlob,
      voice,
    }: {
      storyId: string;
      audioBlob: Blob;
      voice: string;
    }) => {
      const token = await getToken();
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
      const formData = new FormData();
      formData.append("audio", audioBlob, `story-${storyId}-${voice}.mp3`);
      formData.append("voice", voice);

      const response = await fetch(
        `${API_BASE_URL}/api/stories/${storyId}/audio`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload audio");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific story to refetch audio data
      queryClient.invalidateQueries({
        queryKey: queryKeys.story(parseInt(variables.storyId)),
      });
    },
  });
};
