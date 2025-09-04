import { create } from "zustand";

interface AudioGenerationStore {
  isGeneratingAudio: boolean;
  currentGeneratingStoryId: string | null;
  currentGeneratingVoiceId: string | null;
  currentGeneratingStoryTitle: string | null;
  currentGeneratingVoiceLabel: string | null;
  setIsGeneratingAudio: (
    isGenerating: boolean,
    storyId?: string,
    voiceId?: string
  ) => void;
  canGenerateAudio: () => boolean;
  beginGeneration: (
    storyId?: string,
    voiceId?: string,
    storyTitle?: string,
    voiceLabel?: string
  ) => boolean;
  endGeneration: () => void;
}

export const useAudioGenerationStore = create<AudioGenerationStore>(
  (set, get) => ({
    isGeneratingAudio: false,
    currentGeneratingStoryId: null,
    currentGeneratingVoiceId: null,
    currentGeneratingStoryTitle: null,
    currentGeneratingVoiceLabel: null,

    setIsGeneratingAudio: (
      isGenerating: boolean,
      storyId?: string,
      voiceId?: string
    ) => {
      set({
        isGeneratingAudio: isGenerating,
        currentGeneratingStoryId: isGenerating ? storyId || null : null,
        currentGeneratingVoiceId: isGenerating ? voiceId || null : null,
      });
    },

    canGenerateAudio: () => {
      const state = get();
      // 전역적으로 오디오 생성 중이면 불가능
      return !state.isGeneratingAudio;
    },

    beginGeneration: (
      storyId?: string,
      voiceId?: string,
      storyTitle?: string,
      voiceLabel?: string
    ) => {
      const { isGeneratingAudio } = get();
      if (isGeneratingAudio) return false;
      set({
        isGeneratingAudio: true,
        currentGeneratingStoryId: storyId || null,
        currentGeneratingVoiceId: voiceId || null,
        currentGeneratingStoryTitle: storyTitle || null,
        currentGeneratingVoiceLabel: voiceLabel || null,
      });
      return true;
    },

    endGeneration: () => {
      set({
        isGeneratingAudio: false,
        currentGeneratingStoryId: null,
        currentGeneratingVoiceId: null,
        currentGeneratingStoryTitle: null,
        currentGeneratingVoiceLabel: null,
      });
    },
  })
);
