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
}

export const useAudioPlayer = ({
  voices,
  storyId,
  story,
}: UseAudioPlayerProps) => {
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

  const uploadAudioMutation = useUploadAudio();
  const { addToast } = useToast();
  const { getToken } = useAuth();
  
  // 전역 오디오 생성 상태 관리
  const { 
    isGeneratingAudio, 
    setIsGeneratingAudio, 
    canGenerateAudio 
  } = useAudioGenerationStore();

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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
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

    // 전역 상태에서 오디오 생성 가능 여부 확인
    if (!canGenerateAudio()) {
      addToast("warning", "Audio is currently being generated. Please wait...");
      return;
    }

    // If currently playing the same voice, just toggle play/pause
    if (currentAudio && isPlaying) {
      await togglePlayPause();
      return;
    }

    // If audio exists but not playing, just play it
    if (currentAudio && !isPlaying) {
      await safePlay(currentAudio);
      setIsPlaying(true);
      return;
    }

    // First, try to load saved audio for this voice
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
      // Check if API key is available
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        console.error("❌ OpenAI API key is not configured");
        addToast("error", "OpenAI API key is not configured");
        return;
      }
    } else {
      // If saved audio exists but we reached here, it means there was an error loading it
      addToast("error", "Unable to load audio. Please try again later.");
      return;
    }

    setIsGeneratingAudio(true, storyId);

    try {
      const cleanText = cleanTextForSpeech(story);
      const selectedVoiceConfig = voices[selectedVoice];


      if (!selectedVoiceConfig) {
        throw new Error(`Voice configuration not found for: ${selectedVoice}`);
      }

      addToast("info", "Generating audio...");

      // Generate audio with slow, calm speed optimized for bedtime stories
      const audioBlob = await generateSpeechWithOpenAI({
        text: cleanText,
        voice: selectedVoice as keyof typeof openaiVoices,
        speed: 0.9, // Slow speed for calm bedtime reading
        instructions:
          "A tone for reading bedtime stories to children. Calm and very slowly, with emotion in each word, pausing for 1.5 second between sentences or paragraphs.",
      });


      // Upload audio to server if storyId exists
      if (storyId) {
        try {
          const result = await uploadAudioMutation.mutateAsync({
            storyId,
            audioBlob,
            voice: selectedVoice,
          });

          // Update saved URLs
          setSavedAudioUrls((prev) => ({
            ...prev,
            [selectedVoice]: `${API_BASE_URL}${result.audioUrl}`,
          }));

          addToast("success", "Audio saved successfully");
        } catch (error) {
          console.error("❌ Failed to upload audio:", error);
          addToast("warning", "Audio generated but not saved to server");
        }
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

      audioRef.current = audioElement;
      setCurrentAudio(audioElement);
      setCurrentVoice(selectedVoice);

      const cleanup = setupAudioEventListeners(audioElement);
      cleanupRef.current = cleanup;

      await safePlay(audioElement);
      setIsPlaying(true);
      addToast("success", "Audio generated and playing");
    } catch (error) {
      console.error("❌ Error generating audio:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addToast("error", `Failed to generate audio: ${errorMessage}`);
    } finally {
      setIsGeneratingAudio(false);
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
