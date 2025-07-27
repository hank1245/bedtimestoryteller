import { create } from "zustand";

interface AudioGenerationStore {
  isGeneratingAudio: boolean;
  currentGeneratingStoryId: string | null;
  setIsGeneratingAudio: (isGenerating: boolean, storyId?: string) => void;
  canGenerateAudio: () => boolean;
}

export const useAudioGenerationStore = create<AudioGenerationStore>(
  (set, get) => ({
    isGeneratingAudio: false,
    currentGeneratingStoryId: null,

    setIsGeneratingAudio: (isGenerating: boolean, storyId?: string) => {
      set({
        isGeneratingAudio: isGenerating,
        currentGeneratingStoryId: isGenerating ? storyId || null : null,
      });
    },

    canGenerateAudio: () => {
      const state = get();
      // 전역적으로 오디오 생성 중이면 불가능
      return !state.isGeneratingAudio;
    },
  })
);
