import { useEffect, useRef, useState } from "react";

export function useSpeechSynthesis() {
  const synth = useRef(window.speechSynthesis);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    function populateVoiceList() {
      if (typeof speechSynthesis === "undefined") {
        return;
      }
      let allVoices = synth.current.getVoices();
      setVoices(allVoices);
      setSelectedVoice(
        allVoices.find((voice) => voice.name === "Google UK English Male") ||
          allVoices[0]
      );
    }

    populateVoiceList();
    if (
      typeof speechSynthesis !== "undefined" &&
      speechSynthesis.onvoiceschanged !== undefined
    ) {
      speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, []);

  const speak = (text) => {
    if (!synth.current) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice =
      voices.find((voice) => voice.name === selectedVoice) || null;
    synth.current.speak(utterance);
  };

  return { speak, voices, selectedVoice, setSelectedVoice };
}
