import { useState } from "react";
import type { SpeechRecognition, SpeechRecognitionEvent } from "../types";

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  let recognitionRef: SpeechRecognition | null = null;

  const startSpeechRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.",
      );
      return;
    }

    const SpeechRecognition =
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

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef = recognition;

      recognition.continuous = true; // Keep recording until manually stopped
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let fullTranscript = "";

      recognition.onstart = () => {
        console.log("🎤 Speech recognition started");
        setIsListening(true);
        fullTranscript = ""; // Reset transcript when starting
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

        // Process punctuation commands and show transcript
        let processedTranscript = fullTranscript + interimTranscript;

        // Replace punctuation commands
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
          console.log(
            "🎤 Speech recognition was aborted, attempting restart...",
          );
          // Don't set listening to false for aborted errors, try to restart
          setTimeout(() => {
            if (recognitionRef) {
              try {
                recognitionRef.start();
                console.log("🎤 Speech recognition restarted after abort");
              } catch (restartError) {
                console.error(
                  "🎤 Failed to restart recognition:",
                  restartError,
                );
                setIsListening(false);
              }
            }
          }, 100);
          return;
        }

        if (event.error === "no-speech") {
          console.log("🎤 No speech detected, continuing...");
          // Don't stop listening for no-speech errors
          return;
        } else if (event.error === "audio-capture") {
          alert(
            "Microphone access denied. Please allow microphone access and try again.",
          );
        } else if (event.error === "not-allowed") {
          alert(
            "Microphone access not allowed. Please enable microphone permissions.",
          );
        }

        // Only stop listening for serious errors
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log("🎤 Speech recognition ended");

        // If we're still supposed to be listening, restart recognition
        if (isListening && recognitionRef) {
          console.log("🎤 Restarting speech recognition...");
          setTimeout(() => {
            if (recognitionRef) {
              try {
                recognitionRef.start();
              } catch (restartError) {
                console.error(
                  "🎤 Failed to restart recognition:",
                  restartError,
                );
                setIsListening(false);
                recognitionRef = null;
              }
            }
          }, 100);
        } else {
          setIsListening(false);
          recognitionRef = null;
        }
      };

      try {
        recognition.start();
      } catch (error) {
        console.error("🎤 Failed to start speech recognition:", error);
        setIsListening(false);
      }
    }
  };

  const stopSpeechRecognition = () => {
    console.log("🎤 Stopping speech recognition");
    if (recognitionRef) {
      recognitionRef.stop();
      recognitionRef = null;
    }
    setIsListening(false);
  };

  return {
    isListening,
    startSpeechRecognition,
    stopSpeechRecognition,
  };
}
