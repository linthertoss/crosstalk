import { useRef, useState, useCallback, useEffect } from "react";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

export function useDeepgram(
  apiKey,
  handleTranscriptUpdate,
  handleInterimTranscriptUpdate
) {
  const deepgram = useRef(null);
  const liveRef = useRef(null);

  // State to track the live transcription status
  const [isListening, setIsListening] = useState(false);

  // Initialize the Deepgram SDK
  const initializeDeepgram = useCallback(() => {
    deepgram.current = createClient(apiKey);
  }, [apiKey]);

  // Function to activate the microphone and start transcribing
  const activateMicrophone = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      const live = deepgram.current.listen.live({
        punctuate: true,
      });

      live.on(LiveTranscriptionEvents.Open, () => {
        mediaRecorder.start();
        setIsListening(true);
      });

      live.on(LiveTranscriptionEvents.Transcript, (data) => {
        if (data.is_final) {
          handleTranscriptUpdate(data);
        } else {
          handleInterimTranscriptUpdate(data);
        }
      });

      live.on(LiveTranscriptionEvents.Close, () => {
        setIsListening(false);
      });

      liveRef.current = live;

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0 && live.getReadyState()) {
          live.send(event.data);
        }
      });
    });
  }, [handleTranscriptUpdate, handleInterimTranscriptUpdate]);

  // Cleanup function to stop transcription and release resources
  const stopTranscription = useCallback(() => {
    if (liveRef.current) {
      liveRef.current.finish();
      setIsListening(false);
    }
  }, []);

  // Initialize Deepgram on mount
  useEffect(() => {
    initializeDeepgram();
    return () => stopTranscription(); // Cleanup on unmount
  }, [initializeDeepgram, stopTranscription]);

  return { activateMicrophone, isListening };
}
