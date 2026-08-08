"use client";

import { useCallback, useRef, useState } from "react";

interface GeminiLiveMessage {
  serverContent?: {
    modelTurn?: {
      parts?: {
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }[];
    };
  };
  toolCall?: unknown;
  setupComplete?: unknown;
}

function base64FromBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function bytesFromBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function useGeminiLive(apiKey: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const stopRecording = useCallback(() => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();

    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
  }, []);

  const playPcmAudio = useCallback(async (base64Data: string) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const bytes = bytesFromBase64(base64Data);
    const pcmData = new Int16Array(bytes.buffer);

    const audioBuffer = ctx.createBuffer(1, pcmData.length, 24000);
    const channelData = audioBuffer.getChannelData(0);

    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 32768.0;
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();
  }, []);

  const startRecording = useCallback(async () => {
    const ctx = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = ctx;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);

        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
        }

        const buffer = new Uint8Array(pcm16.buffer);
        const base64 = base64FromBytes(buffer);

        const audioMessage = {
          realtimeInput: {
            mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: base64 }],
          },
        };

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(audioMessage));
        }
      };

      source.connect(processor);
      processor.connect(ctx.destination);
    } catch (err) {
      console.error("Failed to start recording:", err);
      ctx.close();
    }
  }, []);

  const connect = useCallback(() => {
    if (!apiKey) {
      console.error("API Key required for Gemini Live");
      return;
    }

    const host = "generativelanguage.googleapis.com";
    const url = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      setIsSpeaking(false);

      const setupMessage = {
        setup: {
          model: "models/gemini-2.0-flash-exp",
          generationConfig: {
            responseModalities: ["AUDIO"],
          },
        },
      };
      wsRef.current?.send(JSON.stringify(setupMessage));
      startRecording();
    };

    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data) as GeminiLiveMessage;

      if (msg.serverContent?.modelTurn) {
        setIsSpeaking(true);
        const parts = msg.serverContent.modelTurn.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith("audio/pcm")) {
              playPcmAudio(part.inlineData.data);
            }
          }
        }
        setIsSpeaking(false);
      }

      if (msg.toolCall) {
        console.log("Tool call received:", msg.toolCall);
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      setIsSpeaking(false);
      stopRecording();
    };

    wsRef.current.onerror = (err) => {
      console.error("Gemini Live WebSocket error:", err);
    };
  }, [apiKey, startRecording, stopRecording, playPcmAudio]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    stopRecording();
  }, [stopRecording]);

  const sendText = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          realtimeInput: {
            mediaChunks: [
              {
                mimeType: "text/plain",
                data: btoa(text),
              },
            ],
          },
        }),
      );
    }
  }, []);

  return { isConnected, isSpeaking, connect, disconnect, sendText };
}
