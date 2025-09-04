import { useState, useRef, useEffect } from "react";
import {
  generateSpeechWithOpenAI,
  cleanTextForSpeech,
  voices as openaiVoices,
} from "../services/openai-tts";
import { useUploadAudio } from "./useStories";
import { useToast } from "../stores/toastStore";
import { useAudioGenerationStore } from "../stores/audioStore";
import { useAuth } from "@clerk/clerk-react";

interface Voice {
  voiceId: string;
  name: string;
}

interface UseAudioPlayerProps {
  voices: Record<string, Voice>;
  storyId?: string;
  story: string;
  title?: string;
}

export const useAudioPlayer = ({
  voices,
  storyId,
  story,
  title,
}: UseAudioPlayerProps) => {
  // Mounted flag to avoid state updates after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [selectedVoice, setSelectedVoice] = useState<string>("coral");
  const [currentVoice, setCurrentVoice] = useState<string>("coral");
  const [savedAudioUrls, setSavedAudioUrls] = useState<Record<string, string>>(
    {}
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const generationCancelledRef = useRef<boolean>(false);
  // Track which story the currentAudio belongs to, to avoid cross-story reuse
  const currentAudioStoryIdRef = useRef<string | undefined>(
    storyId ? String(storyId) : undefined
  );

  const uploadAudioMutation = useUploadAudio();
  const { addToast, addActionToast } = useToast();
  const { getToken } = useAuth();

  // 전역 오디오 생성 상태 관리
  const { beginGeneration, endGeneration } = useAudioGenerationStore();

  // API URL 환경변수
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  // Check for saved audio when component mounts
  useEffect(() => {
    const checkSavedAudio = async () => {
      if (storyId) {
        try {
          const token = await getToken();
          const response = await fetch(
            `${API_BASE_URL}/api/stories/${storyId}`,
            {
              credentials: "include",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const storyData = await response.json();
            if (storyData.audio_urls) {
              // Convert relative URLs to absolute URLs
              const absoluteUrls: Record<string, string> = {};
              Object.entries(storyData.audio_urls).forEach(([voice, url]) => {
                absoluteUrls[voice] = `${API_BASE_URL}${url}`;
              });
              setSavedAudioUrls(absoluteUrls);
            } else {
            }
          }
        } catch (error) {
          console.error("Failed to check saved audio:", error);
        }
      }
    };
    checkSavedAudio();
  }, [storyId, API_BASE_URL, getToken]);

  // Reset any existing audio when navigating to a different story
  useEffect(() => {
    const sid = storyId ? String(storyId) : undefined;
    if (currentAudioStoryIdRef.current !== sid) {
      // Different story now; clean up previous audio element if any
      if (currentAudio) {
        try {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          if (currentAudio.src && currentAudio.src.startsWith("blob:")) {
            URL.revokeObjectURL(currentAudio.src);
          }
        } catch (e) {
          console.error("Error cleaning audio on story change:", e);
        }
      }
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      setCurrentAudio(null);
      setIsPlaying(false);
      // Update the current story id reference
      currentAudioStoryIdRef.current = sid;
    }
  }, [storyId, currentAudio]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      generationCancelledRef.current = true;
      if (currentAudio) {
        try {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          // Clean up object URL to prevent memory leaks
          if (currentAudio.src && currentAudio.src.startsWith("blob:")) {
            URL.revokeObjectURL(currentAudio.src);
          }
        } catch (error) {
          console.error("Error cleaning up audio:", error);
        }
      }
      // Clean up event listeners
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [currentAudio]);

  // Reset audio when voice changes (only if not currently playing)
  useEffect(() => {
    if (currentAudio && !isPlaying && selectedVoice !== currentVoice) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      } catch (error) {
        console.error("Error resetting audio on voice change:", error);
      }
    }
  }, [selectedVoice, currentAudio, isPlaying, currentVoice]);

  // Safe play function to handle AbortError
  const safePlay = async (audioElement: HTMLAudioElement): Promise<void> => {
    try {
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ Audio play error:", error.name, error.message);
        // Handle AbortError gracefully (common when user clicks buttons rapidly)
        if (error.name === "AbortError") {
          return;
        }
        // Handle other errors
        console.error("🔥 Audio play error:", error);
        addToast("error", `Failed to play audio: ${error.message}`);
      }
    }
  };

  const generateAndPlayAudio = async () => {
    // If currently playing the same voice, just toggle play/pause
    if (
      currentAudio &&
      currentAudioStoryIdRef.current ===
        (storyId ? String(storyId) : undefined) &&
      isPlaying
    ) {
      await togglePlayPause();
      return;
    }

    // If audio exists but not playing, just play it
    if (
      currentAudio &&
      currentAudioStoryIdRef.current ===
        (storyId ? String(storyId) : undefined) &&
      !isPlaying
    ) {
      await safePlay(currentAudio);
      setIsPlaying(true);
      return;
    }

    // First, try to load saved audio for this voice (allowed even if another generation is in progress)
    const savedUrl = savedAudioUrls[selectedVoice];

    // Always try to use saved audio if it exists, regardless of current state
    if (savedUrl) {
      try {
        const audioElement = new Audio();
        audioElement.crossOrigin = "anonymous";
        audioElement.preload = "auto";
        audioElement.volume = 1.0;
        audioElement.src = savedUrl;

        // Wait for the audio to be ready
        await new Promise((resolve, reject) => {
          audioElement.addEventListener("canplaythrough", resolve, {
            once: true,
          });
          audioElement.addEventListener("error", reject, { once: true });
          audioElement.load();
        });

        audioRef.current = audioElement;
        setCurrentAudio(audioElement);
        setCurrentVoice(selectedVoice);
        currentAudioStoryIdRef.current = storyId ? String(storyId) : undefined;

        const cleanup = setupAudioEventListeners(audioElement);
        cleanupRef.current = cleanup;

        await safePlay(audioElement);
        setIsPlaying(true);
        addToast("success", "Playing saved audio");
        return;
      } catch (error) {
        console.error("❌ Failed to load saved audio:", error);
        addToast(
          "error",
          "Unable to load saved audio. Please try again later."
        );
        return; // Don't generate new audio on error, just return
      }
    }

    // Only generate new audio if no saved audio exists
    if (!savedUrl) {
      // Resolve voice config first
      const selectedVoiceConfig = voices[selectedVoice];
      if (!selectedVoiceConfig) {
        addToast(
          "error",
          `Voice configuration not found for: ${selectedVoice}`
        );
        return;
      }
      // Atomically acquire the global generation lock with story title and voice label
      const acquired = beginGeneration(
        storyId,
        selectedVoice,
        title,
        selectedVoiceConfig.name
      );
      if (!acquired) {
        addToast(
          "warning",
          "Another audio is being generated. Please wait a moment..."
        );
        return;
      }
      // Reset any existing audio so Play won't resume an old source
      if (currentAudio) {
        try {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        } catch {}
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
        setCurrentAudio(null);
        setIsPlaying(false);
      }
      // Check if API key is available
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        console.error("❌ OpenAI API key is not configured");
        addToast("error", "OpenAI API key is not configured");
        endGeneration();
        return;
      }
    } else {
      // If saved audio exists but we reached here, it means there was an error loading it
      addToast("error", "Unable to load audio. Please try again later.");
      return;
    }

    try {
      const cleanText = cleanTextForSpeech(story);
      const selectedVoiceConfig = voices[selectedVoice];

      if (!selectedVoiceConfig) {
        throw new Error(`Voice configuration not found for: ${selectedVoice}`);
      }

      addToast(
        "info",
        `Generating audio in ${selectedVoiceConfig.name} voice...`
      );

      // Generate audio with slow, calm speed optimized for bedtime stories
      const audioBlob = await generateSpeechWithOpenAI({
        text: cleanText,
        voice: selectedVoice as keyof typeof openaiVoices,
        speed: 0.9, // Slow speed for calm bedtime reading
        instructions:
          "A tone for reading bedtime stories to children. Calm and very slowly, with emotion in each word, pausing for 1.5 second between sentences or paragraphs.",
      });

      const unmounted = !isMountedRef.current || generationCancelledRef.current;

      // Upload audio to server if storyId exists
      if (storyId) {
        try {
          const result = await uploadAudioMutation.mutateAsync({
            storyId,
            audioBlob,
            voice: selectedVoice,
          });

          // Update saved URLs only if still mounted
          if (!unmounted) {
            setSavedAudioUrls((prev) => ({
              ...prev,
              [selectedVoice]: `${API_BASE_URL}${result.audioUrl}`,
            }));
          }
          if (!unmounted) {
            addToast("success", "Audio saved successfully");
          }
        } catch (error) {
          console.error("❌ Failed to upload audio:", error);
          if (!unmounted) {
            addToast("warning", "Audio generated but not saved to server");
          }
        }
      }

      // If unmounted, stop here after ensuring upload attempt
      if (unmounted) {
        if (storyId) {
          addActionToast(
            "Audio generation completed",
            "Open story",
            { path: "/app/story", state: { id: storyId } },
            "info",
            10000
          );
        }
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);

      const audioElement = new Audio();
      audioElement.crossOrigin = "anonymous";
      audioElement.preload = "auto";
      audioElement.volume = 1.0;
      audioElement.src = audioUrl;

      // Wait for the audio to be ready
      await new Promise((resolve, reject) => {
        audioElement.addEventListener("canplaythrough", resolve, {
          once: true,
        });
        audioElement.addEventListener("error", reject, { once: true });
        audioElement.load();
      });

      if (!isMountedRef.current || generationCancelledRef.current) {
        // Clean up generated URL if we won't use it
        try {
          URL.revokeObjectURL(audioUrl);
        } catch {}
        return;
      }

      audioRef.current = audioElement;
      setCurrentAudio(audioElement);
      setCurrentVoice(selectedVoice);
      currentAudioStoryIdRef.current = storyId ? String(storyId) : undefined;

      const cleanup = setupAudioEventListeners(audioElement);
      cleanupRef.current = cleanup;

      // Do not auto-play after generation; wait for explicit user action
      setIsPlaying(false);
      addToast("success", "Audio is ready to play");
    } catch (error) {
      console.error("❌ Error generating audio:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (isMountedRef.current && !generationCancelledRef.current) {
        addToast("error", `Failed to generate audio: ${errorMessage}`);
      }
    } finally {
      endGeneration();
    }
  };

  const setupAudioEventListeners = (audioElement: HTMLAudioElement) => {
    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handleError = (error: Event) => {
      console.error("Audio error:", error);
      setIsPlaying(false);
      setCurrentAudio(null);
      addToast("error", "Audio playback error");
    };

    audioElement.addEventListener("ended", handleEnded);
    audioElement.addEventListener("pause", handlePause);
    audioElement.addEventListener("play", handlePlay);
    audioElement.addEventListener("error", handleError);

    // Return cleanup function
    return () => {
      audioElement.removeEventListener("ended", handleEnded);
      audioElement.removeEventListener("pause", handlePause);
      audioElement.removeEventListener("play", handlePlay);
      audioElement.removeEventListener("error", handleError);
    };
  };

  const togglePlayPause = async () => {
    if (!currentAudio) return;

    try {
      if (isPlaying) {
        currentAudio.pause();
        setIsPlaying(false);
      } else {
        await safePlay(currentAudio);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      try {
        currentAudio.pause();
        // 정지 시 currentTime을 0으로 설정하지 않음 - 현재 위치를 유지
        setIsPlaying(false);
        // currentAudio를 null로 설정하지 않음 - 재생 컨트롤을 유지
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    }
  };

  const restartAudio = async () => {
    if (currentAudio) {
      try {
        currentAudio.currentTime = 0;
        await safePlay(currentAudio);
        setIsPlaying(true);
      } catch (error) {
        console.error("Error restarting audio:", error);
      }
    }
  };

  return {
    // States
    isPlaying,
    currentAudio,
    selectedVoice,
    savedAudioUrls,

    // Actions
    generateAndPlayAudio,
    togglePlayPause,
    stopAudio,
    restartAudio,
    setSelectedVoice,
  };
};
