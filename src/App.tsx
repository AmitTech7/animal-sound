/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Info, X, Music, Sparkles, Shuffle } from "lucide-react";
import { ANIMAL_SOUNDS, AnimalSound } from "./constants";

// --- Types ---

interface LiveSession {
  sendRealtimeInput: (input: { audio?: { data: string; mimeType: string }; video?: { data: string; mimeType: string }; text?: string }) => void;
  sendToolResponse: (response: { functionResponses: { name: string; response: any; id: string }[] }) => void;
  close: () => void;
}

// --- App Component ---

export default function App() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentAnimal, setCurrentAnimal] = useState<AnimalSound | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [sequenceQueue, setSequenceQueue] = useState<AnimalSound[]>([]);
  const [volume, setVolume] = useState(1.0);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<LiveSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const animalAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- Audio Handling ---

  const playNextChunk = useCallback(() => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0 || isPlayingRef.current) {
      return;
    }

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;
    const buffer = audioContextRef.current.createBuffer(1, chunk.length, 24000);
    buffer.getChannelData(0).set(chunk);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      isPlayingRef.current = false;
      playNextChunk();
    };
    source.start();
  }, []);

  const handleAnimalSound = (animalName: string) => {
    const animal = ANIMAL_SOUNDS.find(a => a.name.toLowerCase() === animalName.toLowerCase());
    if (animal) {
      setCurrentAnimal(animal);
      if (animalAudioRef.current) {
        try {
          animalAudioRef.current.volume = volume;
          animalAudioRef.current.src = animal.url;
          const playPromise = animalAudioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error("Playback interrupted or failed:", err);
              setIsPlayingSound(false);
              setError(`Could not play the ${animal.name} sound. It might be blocked by your browser.`);
            });
          }
          setIsPlayingSound(true);
        } catch (err) {
          console.error("Audio setup error:", err);
          setIsPlayingSound(false);
          setError("Failed to initialize audio playback.");
        }
      }
      return { success: true, animal: animal.name };
    }
    return { success: false, error: "Animal not found" };
  };

  const handleSetVolume = (newVolume: number) => {
    const normalizedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(normalizedVolume);
    if (animalAudioRef.current) {
      animalAudioRef.current.volume = normalizedVolume;
    }
    return { success: true, volume: normalizedVolume };
  };

  const handleRandomSound = () => {
    const randomIndex = Math.floor(Math.random() * ANIMAL_SOUNDS.length);
    const randomAnimal = ANIMAL_SOUNDS[randomIndex];
    
    // Use Web Speech API to announce the name
    const msg = new SpeechSynthesisUtterance(`Playing a random sound: the ${randomAnimal.name}`);
    msg.onend = () => {
      handleAnimalSound(randomAnimal.name);
    };
    window.speechSynthesis.speak(msg);
  };

  const handleCategorySequence = (category: 'animal' | 'bird') => {
    const filtered = ANIMAL_SOUNDS.filter(a => a.category === category);
    // Shuffle or just take a few
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 5);
    setSequenceQueue(shuffled);
    return { success: true, count: shuffled.length, animals: shuffled.map(a => a.name) };
  };

  useEffect(() => {
    if (sequenceQueue.length > 0 && !isPlayingSound) {
      const next = sequenceQueue[0];
      
      // Use Web Speech API to announce the name
      const msg = new SpeechSynthesisUtterance(`Next is the ${next.name}`);
      msg.onend = () => {
        handleAnimalSound(next.name);
        setSequenceQueue(prev => prev.slice(1));
      };
      window.speechSynthesis.speak(msg);
    }
  }, [sequenceQueue, isPlayingSound]);

  // --- Gemini Session ---

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Setup Audio Context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `You are a friendly Animal Sound Explorer guide. 
          Your job is to help users hear animal and bird sounds. 
          You can understand and respond in both English and Hindi. 
          When a user asks to hear a specific animal or bird sound (even in Hindi, like "Sher ki awaaz sunao"), use 'playAnimalSound' with the English name.
          When a user asks to hear "animal sounds" or "bird sounds" in general, use 'playCategorySequence' with the correct category.
          When a user asks for a "random" sound or "any" sound, use 'playRandomSound'.
          When a user asks to adjust the volume (e.g., "louder", "quieter", "set volume to 50%"), use 'setVolume'.
          The volume range is 0.0 to 1.0. If a user says "louder", increase it by 0.2. If they say "quieter", decrease it by 0.2.
          Before playing a sequence, announce that you are going to play a few sounds one by one.
          For each sound in a sequence, you should ideally say the name, but the tool will handle the playback.
          Respond in the language the user is using (English or Hindi).
          Available animals: ${ANIMAL_SOUNDS.filter(a => a.category === 'animal').map(a => a.name).join(", ")}.
          Available birds: ${ANIMAL_SOUNDS.filter(a => a.category === 'bird').map(a => a.name).join(", ")}.`,
          tools: [{
            functionDeclarations: [
              {
                name: "playAnimalSound",
                description: "Plays the real recording of a specific animal or bird sound.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    animalName: {
                      type: Type.STRING,
                      description: "The name of the animal or bird.",
                    },
                  },
                  required: ["animalName"],
                },
              },
              {
                name: "playCategorySequence",
                description: "Plays a sequence of sounds from a specific category (animal or bird).",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    category: {
                      type: Type.STRING,
                      enum: ["animal", "bird"],
                      description: "The category of sounds to play.",
                    },
                  },
                  required: ["category"],
                },
              },
              {
                name: "playRandomSound",
                description: "Plays a random animal or bird sound from the library.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {},
                },
              },
              {
                name: "setVolume",
                description: "Sets the volume of the animal sounds.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    volume: {
                      type: Type.NUMBER,
                      description: "The volume level from 0.0 to 1.0.",
                    },
                  },
                  required: ["volume"],
                },
              }
            ],
          }],
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            startMic();
          },
          onmessage: async (message) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const binaryString = atob(part.inlineData.data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  
                  // Gemini Live API returns Int16 PCM
                  const int16Data = new Int16Array(bytes.buffer);
                  const float32Data = new Float32Array(int16Data.length);
                  for (let i = 0; i < int16Data.length; i++) {
                    float32Data[i] = int16Data[i] / 32768.0;
                  }
                  
                  audioQueueRef.current.push(float32Data);
                  playNextChunk();
                }
              }
            }

            if (message.toolCall) {
              const responses = message.toolCall.functionCalls.map(call => {
                if (call.name === "playAnimalSound") {
                  const result = handleAnimalSound(call.args.animalName as string);
                  return { name: call.name, response: result, id: call.id };
                }
                if (call.name === "playCategorySequence") {
                  const result = handleCategorySequence(call.args.category as 'animal' | 'bird');
                  return { name: call.name, response: result, id: call.id };
                }
                if (call.name === "playRandomSound") {
                  handleRandomSound();
                  return { name: call.name, response: { success: true }, id: call.id };
                }
                if (call.name === "setVolume") {
                  const result = handleSetVolume(call.args.volume as number);
                  return { name: call.name, response: result, id: call.id };
                }
                return { name: call.name, response: { error: "Unknown function" }, id: call.id };
              });
              sessionRef.current?.sendToolResponse({ functionResponses: responses });
            }

            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
            }
          },
          onclose: () => {
            setIsConnected(false);
            stopMic();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error. Please try again.");
            setIsConnecting(false);
          }
        }
      });

      sessionRef.current = session;
    } catch (err) {
      console.error("Failed to start session:", err);
      setError("Failed to initialize. Check your API key.");
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    sessionRef.current = null;
    stopMic();
    setIsConnected(false);
    audioQueueRef.current = [];
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      if (!audioContextRef.current) return;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Simple script processor for now as worklets need external files
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM (simplified)
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current?.sendRealtimeInput({
          audio: { data: base64Data, mimeType: "audio/pcm;rate=24000" }
        });
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      setIsListening(true);
    } catch (err) {
      console.error("Mic access denied:", err);
      setError("Microphone access denied.");
    }
  };

  const stopMic = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setIsListening(false);
  };

  useEffect(() => {
    animalAudioRef.current = new Audio();
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0502] text-white font-sans selection:bg-orange-500/30 overflow-hidden flex flex-col">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-600/20">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Animal Explorer</h1>
            <p className="text-xs text-white/40 uppercase tracking-widest">Speak Mode Active</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-400">Live</span>
            </div>
          )}
          <button 
            onClick={() => setError(null)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <Info className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {!isConnected ? (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center max-w-md"
            >
              <div className="mb-8 relative inline-block">
                <div className="absolute inset-0 bg-orange-600/20 blur-3xl rounded-full" />
                <div className="relative w-32 h-32 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Discover the Wild</h2>
              <p className="text-white/60 mb-10 leading-relaxed">
                Start a conversation and ask to hear any of our 30+ animal recordings. 
                Try saying <span className="text-orange-400 italic">"Play the sound of a lion"</span>.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={startSession}
                  disabled={isConnecting}
                  className="group relative px-8 py-4 bg-white text-black font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                    {isConnecting ? "Connecting..." : "Start Conversation"}
                    {!isConnecting && <Play className="w-5 h-5 fill-current" />}
                  </span>
                </button>

                <button
                  onClick={handleRandomSound}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Shuffle className="w-5 h-5 text-orange-500" />
                  Random Sound
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Visualizer / Status */}
              <div className="flex flex-col items-center">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  {/* Outer Ring */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-dashed border-white/10 rounded-full"
                  />
                  
                  {/* Pulse Rings */}
                  {isListening && [1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                      className="absolute inset-0 border border-orange-500/30 rounded-full"
                    />
                  ))}

                  {/* Center Icon */}
                  <div className="relative w-40 h-40 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-inner">
                    {isPlayingSound ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <Volume2 className="w-16 h-16 text-orange-500" />
                      </motion.div>
                    ) : (
                      <Mic className={`w-16 h-16 ${isListening ? 'text-orange-500' : 'text-white/20'}`} />
                    )}
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <h3 className="text-2xl font-medium mb-2">
                    {isPlayingSound ? `Playing ${currentAnimal?.name}` : isListening ? "Listening..." : "Paused"}
                  </h3>
                  <p className="text-white/40 text-sm italic">
                    {isPlayingSound ? "Listen to the call of the wild" : "Ask for an animal sound"}
                  </p>
                </div>
              </div>

              {/* Animal Grid / Info */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">Wild Explorer</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                      <Volume2 className="w-3.5 h-3.5 text-orange-500" />
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={volume} 
                        onChange={(e) => handleSetVolume(parseFloat(e.target.value))}
                        className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleRandomSound}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group"
                        title="Play Random Sound"
                      >
                        <Shuffle className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                      </button>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-md">{ANIMAL_SOUNDS.length} Sounds</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                  {/* Animals Section */}
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-4">Animals</h5>
                    <div className="grid grid-cols-3 gap-3">
                      {ANIMAL_SOUNDS.filter(a => a.category === 'animal').map((animal) => (
                        <button
                          key={animal.name}
                          onClick={() => handleAnimalSound(animal.name)}
                          className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:bg-white/10 border ${
                            currentAnimal?.name === animal.name && isPlayingSound 
                              ? 'border-orange-500/50 bg-orange-500/10' 
                              : 'border-transparent'
                          }`}
                        >
                          <span className="text-3xl">{animal.icon}</span>
                          <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">{animal.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Birds Section */}
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-4">Birds</h5>
                    <div className="grid grid-cols-3 gap-3">
                      {ANIMAL_SOUNDS.filter(a => a.category === 'bird').map((animal) => (
                        <button
                          key={animal.name}
                          onClick={() => handleAnimalSound(animal.name)}
                          className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:bg-white/10 border ${
                            currentAnimal?.name === animal.name && isPlayingSound 
                              ? 'border-orange-500/50 bg-orange-500/10' 
                              : 'border-transparent'
                          }`}
                        >
                          <span className="text-3xl">{animal.icon}</span>
                          <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">{animal.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={stopSession}
                  className="mt-6 w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl border border-red-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <MicOff className="w-4 h-4" />
                  End Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-500 text-white rounded-full shadow-2xl flex items-center gap-3"
          >
            <Info className="w-5 h-5" />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Audio Element for Animal Sounds */}
      <audio 
        ref={animalAudioRef} 
        onPlay={() => setIsPlayingSound(true)}
        onEnded={() => setIsPlayingSound(false)}
        onError={(e) => {
          const target = e.target as HTMLAudioElement;
          console.error("Audio element error:", target.error);
          setIsPlayingSound(false);
          setError(`Oops! We couldn't load the ${currentAnimal?.name || 'animal'} sound.`);
        }}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
