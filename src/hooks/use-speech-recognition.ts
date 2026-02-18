import { useCallback, useRef, useState } from "react";
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
} from "../components/interview/types";

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  const startSpeechRecognition = useCallback(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      console.warn(
        "Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.",
      );
      return;
    }

    const SpeechRecognitionCtor =
      (
        window as unknown as {
          SpeechRecognition?: new () => SpeechRecognition;
          webkitSpeechRecognition?: new () => SpeechRecognition;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          SpeechRecognition?: new () => SpeechRecognition;
          webkitSpeechRecognition?: new () => SpeechRecognition;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognitionRef.current = recognition;
    isListeningRef.current = true;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let fullTranscript = "";

    recognition.onstart = () => {
      console.log("🎤 Speech recognition started");
      setIsListening(true);
      isListeningRef.current = true;
      fullTranscript = "";
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          fullTranscript += `${transcript} `;
        } else {
          interimTranscript += transcript;
        }
      }

      let processedTranscript = fullTranscript + interimTranscript;

      processedTranscript = processedTranscript
        .replace(/\b(dot|period)\b/gi, ".")
        .replace(/\bcomma\b/gi, ",")
        .replace(/\bquestion mark\b/gi, "?")
        .replace(/\bexclamation mark\b/gi, "!")
        .replace(/\bcolon\b/gi, ":")
        .replace(/\bsemicolon\b/gi, ";")
        .replace(/\bnew line\b/gi, "\n")
        .replace(/\bnew paragraph\b/gi, "\n\n");

      if (processedTranscript.trim()) {
        onTranscript(processedTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error("🎤 Speech recognition error:", event.error);

      if (event.error === "aborted") {
        if (!isListeningRef.current) return;
        console.log("🎤 Speech recognition was aborted, attempting restart...");
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              console.log("🎤 Speech recognition restarted after abort");
            } catch (restartError) {
              console.error("🎤 Failed to restart recognition:", restartError);
              isListeningRef.current = false;
              setIsListening(false);
            }
          }
        }, 100);
        return;
      }

      if (event.error === "no-speech") {
        console.log("🎤 No speech detected, continuing...");
        return;
      } else if (event.error === "audio-capture") {
        console.warn(
          "Microphone access denied. Please allow microphone access and try again.",
        );
      } else if (event.error === "not-allowed") {
        console.warn(
          "Microphone access not allowed. Please enable microphone permissions.",
        );
      }

      isListeningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("🎤 Speech recognition ended");

      if (isListeningRef.current && recognitionRef.current) {
        console.log("🎤 Restarting speech recognition...");
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (restartError) {
              console.error("🎤 Failed to restart recognition:", restartError);
              isListeningRef.current = false;
              setIsListening(false);
              recognitionRef.current = null;
            }
          }
        }, 100);
      } else {
        isListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("🎤 Failed to start speech recognition:", error);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [onTranscript]);

  const stopSpeechRecognition = useCallback(() => {
    console.log("🎤 Stopping speech recognition");
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  return {
    isListening,
    startSpeechRecognition,
    stopSpeechRecognition,
  };
}
