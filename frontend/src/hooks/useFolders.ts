import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../services/client";

export interface Folder {
  id: number;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface FolderStory {
  id: number;
  title: string;
  created_at: string;
  age?: string;
  length?: string;
  added_at: string;
}

// Get all folders
export const useFolders = () => {
  return useQuery<Folder[]>({
    queryKey: ["folders"],
    queryFn: async () => {
      const response = await client.get("/folders");
      return response.data;
    },
  });
};

// Get stories in a folder
export const useFolderStories = (folderId: number) => {
  return useQuery<FolderStory[]>({
    queryKey: ["folders", folderId, "stories"],
    queryFn: async () => {
      const response = await client.get(`/folders/${folderId}/stories`);
      return response.data;
    },
    enabled: !!folderId,
  });
};

// Create folder
export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await client.post("/folders", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
};

// Update folder
export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; name: string; description?: string }) => {
      const response = await client.put(`/folders/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
};

// Delete folder
export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderId: number) => {
      const response = await client.delete(`/folders/${folderId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
};

// Add story to folder
export const useAddStoryToFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId, storyId }: { folderId: number; storyId: number }) => {
      const response = await client.post(`/folders/${folderId}/stories`, { storyId });
      return response.data;
    },
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: ["folders", folderId, "stories"] });
    },
  });
};

// Remove story from folder
export const useRemoveStoryFromFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId, storyId }: { folderId: number; storyId: number }) => {
      const response = await client.delete(`/folders/${folderId}/stories/${storyId}`);
      return response.data;
    },
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: ["folders", folderId, "stories"] });
    },
  });
};