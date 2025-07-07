import { useState, useRef, useEffect } from "react";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { useUploadAudio } from "./useStories";
import { useToast } from "../stores/toastStore";
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
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [selectedVoice, setSelectedVoice] = useState<string>("amelia");
  const [currentVoice, setCurrentVoice] = useState<string>("amelia");
  const [savedAudioUrls, setSavedAudioUrls] = useState<Record<string, string>>(
    {}
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const uploadAudioMutation = useUploadAudio();
  const { addToast } = useToast();
  const { getToken } = useAuth();

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
            console.log("📂 Story data received:", storyData);
            if (storyData.audio_urls) {
              console.log("🎵 Audio URLs found:", storyData.audio_urls);
              // Convert relative URLs to absolute URLs
              const absoluteUrls: Record<string, string> = {};
              Object.entries(storyData.audio_urls).forEach(([voice, url]) => {
                absoluteUrls[voice] = `${API_BASE_URL}${url}`;
              });
              setSavedAudioUrls(absoluteUrls);
              console.log("✅ Saved audio URLs updated:", absoluteUrls);
            } else {
              console.log("ℹ️ No audio URLs found for this story");
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

  // Clean text for speech synthesis
  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/##\s*/g, "") // Remove markdown headers
      .replace(/\*/g, "") // Remove asterisks
      .replace(/\n\n+/g, ". ") // Replace multiple newlines with period and space
      .replace(/\n/g, ". ") // Replace single newlines with period and space
      .replace(/\.\s*\./g, ".") // Remove duplicate periods
      .replace(/([.!?])\s*([A-Z])/g, "$1.......... $2") // Add very long pauses between sentences
      .replace(/,\s*([A-Z])/g, ",..... $1") // Add longer pause after commas before capitals
      .replace(/([.!?])\s*$/, "$1..........") // Add very long pause at the end
      .replace(/\band\b/g, "and,....") // Add longer comma after "and" for natural pause
      .replace(/\bbut\b/g, "but,....") // Add longer comma after "but" for natural pause
      .replace(/\bonce upon a time\b/gi, "Once upon a time,....") // Add longer pause after opening
      .replace(/\bthe end\b/gi, ".......... The End.") // Add very long dramatic pause before ending
      .replace(/\bthen\b/g, "then,....") // Add pause after "then"
      .replace(/\bso\b/g, "so,....") // Add pause after "so"
      .replace(/\bafter\b/g, "after,....") // Add pause after "after"
      .replace(/\bsuddenly\b/g, "suddenly,....") // Add pause after "suddenly"
      .replace(/\bwhen\b/g, "when,....") // Add pause after "when"
      .replace(/\bwhile\b/g, "while,....") // Add pause after "while"
      .trim();
  };

  // Safe play function to handle AbortError
  const safePlay = async (audioElement: HTMLAudioElement): Promise<void> => {
    try {
      console.log("🎵 Attempting to play audio...");
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        await playPromise;
        console.log("✅ Audio playing successfully");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ Audio play error:", error.name, error.message);
        // Handle AbortError gracefully (common when user clicks buttons rapidly)
        if (error.name === "AbortError") {
          console.log("⏹️ Audio play aborted (user interaction)");
          return;
        }
        // Handle other errors
        console.error("🔥 Audio play error:", error);
        addToast("error", `Failed to play audio: ${error.message}`);
      }
    }
  };

  const generateAndPlayAudio = async () => {
    console.log("🎬 generateAndPlayAudio called", {
      isGeneratingAudio,
      currentAudio: !!currentAudio,
      isPlaying,
      selectedVoice,
      savedAudioUrls: Object.keys(savedAudioUrls),
    });

    if (isGeneratingAudio) {
      console.log("⏸️ Already generating audio, returning");
      return;
    }

    // If currently playing the same voice, just toggle play/pause
    if (currentAudio && isPlaying) {
      console.log("⏯️ Audio already playing, toggling pause");
      await togglePlayPause();
      return;
    }

    // If audio exists but not playing, just play it
    if (currentAudio && !isPlaying) {
      console.log("▶️ Audio exists but not playing, resuming");
      await safePlay(currentAudio);
      setIsPlaying(true);
      return;
    }

    // First, try to load saved audio for this voice
    const savedUrl = savedAudioUrls[selectedVoice];
    console.log(
      "💾 Checking saved audio for voice:",
      selectedVoice,
      "URL:",
      savedUrl
    );
    if (savedUrl && (!currentAudio || selectedVoice !== currentVoice)) {
      console.log("📂 Loading saved audio from:", savedUrl);
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
        addToast("warning", "Saved audio failed, generating new one...");
      }
    }

    // Check if API key is available
    if (!import.meta.env.VITE_ELEVENLABS_API_KEY) {
      console.error("❌ ElevenLabs API key is not configured");
      addToast("error", "ElevenLabs API key is not configured");
      return;
    }

    setIsGeneratingAudio(true);
    console.log("🎙️ Starting audio generation...");

    try {
      const elevenlabs = new ElevenLabsClient({
        apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
      });

      const cleanText = cleanTextForSpeech(story);
      const selectedVoiceConfig = voices[selectedVoice];

      console.log("🎵 Voice config:", selectedVoiceConfig);
      console.log("📝 Clean text length:", cleanText.length);

      if (!selectedVoiceConfig) {
        throw new Error(`Voice configuration not found for: ${selectedVoice}`);
      }

      addToast("info", "Generating audio...");

      const audio = await elevenlabs.textToSpeech.convert(
        selectedVoiceConfig.voiceId,
        {
          text: cleanText,
          modelId: "eleven_turbo_v2_5",
          outputFormat: "mp3_44100_128",
          voiceSettings: {
            stability: 0.85,
            similarityBoost: 0.75,
            style: 0.35,
            speed: 0.82,
            useSpeakerBoost: true,
          },
        }
      );

      console.log("✅ Audio generated from ElevenLabs");
      const audioBlob = await convertAudioStreamToBlob(audio);
      console.log("📦 Audio blob created:", audioBlob.size, "bytes");

      // Upload audio to server if storyId exists
      if (storyId) {
        console.log("⬆️ Uploading audio to server...");
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

          console.log("✅ Audio uploaded successfully");
          addToast("success", "Audio saved successfully");
        } catch (error) {
          console.error("❌ Failed to upload audio:", error);
          addToast("warning", "Audio generated but not saved to server");
        }
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("🔗 Audio URL created:", audioUrl);

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
      console.log("🏁 Audio generation completed");
    }
  };

  const setupAudioEventListeners = (audioElement: HTMLAudioElement) => {
    const handleEnded = () => {
      setIsPlaying(false);
      // 오디오가 끝났을 때도 currentAudio를 유지하여 재생 버튼을 계속 표시
      // setCurrentAudio(null);
      // if (cleanupRef.current) {
      //   cleanupRef.current();
      //   cleanupRef.current = null;
      // }
    };

    const handlePause = () => {
      console.log("🎵 Audio paused event");
      setIsPlaying(false);
    };

    const handlePlay = () => {
      console.log("🎵 Audio play event");
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

  const convertAudioStreamToBlob = async (
    audio: ReadableStream
  ): Promise<Blob> => {
    const reader = audio.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const audioBuffer = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    let offset = 0;
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    return new Blob([audioBuffer], { type: "audio/mpeg" });
  };

  const togglePlayPause = async () => {
    if (!currentAudio) return;

    console.log("🎵 togglePlayPause called, current state:", {
      isPlaying,
      currentTime: currentAudio.currentTime,
      paused: currentAudio.paused,
    });

    try {
      if (isPlaying) {
        console.log("⏸️ Pausing audio");
        currentAudio.pause();
        setIsPlaying(false);
      } else {
        console.log("▶️ Playing audio");
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
        console.log("🔄 Restarting audio from beginning");
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
    isGeneratingAudio,
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
