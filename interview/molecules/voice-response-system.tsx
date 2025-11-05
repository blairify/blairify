"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VoiceResponseSystemProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export function VoiceResponseSystem({
  isEnabled,
  onToggle,
}: VoiceResponseSystemProps) {
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rtcConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Speech synthesis removed - not working properly
  // This component now only handles voice input (speech recognition)

  const cleanup = useCallback(() => {
    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.close();
      rtcConnectionRef.current = null;
    }

    setConnectionStatus("disconnected");
  }, []);

  const initializeRTCConnection = useCallback(async () => {
    try {
      setConnectionStatus("connecting");

      // Create RTC peer connection
      const rtcConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      rtcConnectionRef.current = rtcConnection;

      // Handle connection state changes
      rtcConnection.onconnectionstatechange = () => {
        const state = rtcConnection.connectionState;
        console.log("RTC Connection state:", state);

        if (state === "connected") {
          setConnectionStatus("connected");
        } else if (state === "disconnected" || state === "failed") {
          setConnectionStatus("disconnected");
        }
      };

      // Handle audio stream
      rtcConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (audioRef.current) {
          audioRef.current.srcObject = remoteStream;
        }
      };

      // For now, simulate connection success
      // In production, you'd connect to your FastRTC server here
      setTimeout(() => {
        setConnectionStatus("connected");
      }, 1000);
    } catch (error) {
      console.error("Failed to initialize RTC connection:", error);
      setConnectionStatus("disconnected");
    }
  }, []);

  // Initialize FastRTC connection
  useEffect(() => {
    if (!isEnabled) {
      cleanup();
      return;
    }

    initializeRTCConnection();

    return cleanup;
  }, [isEnabled, cleanup, initializeRTCConnection]);

  // Speech synthesis removed - component now only shows voice status

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500";
      case "connecting":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Voice Ready";
      case "connecting":
        return "Connecting...";
      default:
        return "Voice Off";
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Voice Status Badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`text-xs ${getStatusColor()} cursor-help`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-1 ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "connecting"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-gray-400"
                }`}
              />
              {getStatusText()}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Voice responses temporarily disabled</p>
          </TooltipContent>
        </Tooltip>

        {/* Voice Control Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isEnabled ? "default" : "outline"}
              size="sm"
              onClick={onToggle}
              className="h-8 px-3"
              aria-label={
                isEnabled ? "Disable voice responses" : "Enable voice responses"
              }
            >
              {isEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Voice responses temporarily disabled</p>
          </TooltipContent>
        </Tooltip>

        {/* Hidden audio element for RTC audio */}
        <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }}>
          <track kind="captions" srcLang="en" label="English captions" />
        </audio>
      </div>
    </TooltipProvider>
  );
}
