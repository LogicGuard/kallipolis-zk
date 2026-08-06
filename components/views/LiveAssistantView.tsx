
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import { connectToLiveAssistant } from '../../services/geminiService';
import { MicIcon, AudioIcon, ActivityIcon, CpuIcon, ShieldCheckIcon, ThreatIcon } from '../Icons';
import { LiveServerMessage } from '@google/genai';

const LiveAssistantView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<{ type: 'user' | 'ai', text: string }[]>([]);
  const [currentOutput, setCurrentOutput] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Helper: Decode raw PCM
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encodePCM = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current = null;
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setIsListening(false);
    setAudioLevel(0);
  }, []);

  const startSession = async () => {
    setPermissionError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch((err) => {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              setPermissionError(true);
          }
          throw err;
      });

      setIsActive(true);
      setTranscription([]);
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      source.connect(analyzerRef.current);
      
      const callbacks = {
        onopen: () => {
          setIsListening(true);
          source.connect(processor);
          processor.connect(audioContextRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) {
            setCurrentOutput(prev => prev + message.serverContent!.outputTranscription!.text);
          } else if (message.serverContent?.inputTranscription) {
            setCurrentInput(prev => prev + message.serverContent!.inputTranscription!.text);
          }
          
          if (message.serverContent?.turnComplete) {
            const input = currentInput;
            const output = currentOutput;
            if (input) setTranscription(prev => [...prev, { type: 'user', text: input }]);
            if (output) setTranscription(prev => [...prev, { type: 'ai', text: output }]);
            setCurrentInput('');
            setCurrentOutput('');
          }

          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && outputAudioContextRef.current) {
            const ctx = outputAudioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decodeBase64(base64Audio), ctx);
            const audioSource = ctx.createBufferSource();
            audioSource.buffer = buffer;
            audioSource.connect(ctx.destination);
            audioSource.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(audioSource);
            audioSource.onended = () => sourcesRef.current.delete(audioSource);
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e: any) => {
          console.error('Session Error', e);
          stopSession();
        },
        onclose: () => {
          stopSession();
        }
      };

      const sessionPromise = connectToLiveAssistant(callbacks);
      sessionRef.current = await sessionPromise;

      processor.onaudioprocess = (e: any) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const base64Data = encodePCM(inputData);
        sessionRef.current?.sendRealtimeInput({
          media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });

        if (analyzerRef.current) {
            const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
            analyzerRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average);
        }
      };

    } catch (err) {
      console.error('Failed to start session', err);
      stopSession();
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-sm">
                    <MicIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-white">Live Specialist</h1>
                    <p className="text-xs text-gray-500 font-mono">Real-Time Voice-to-Security Intelligence</p>
                </div>
            </div>
            {isActive && (
                <div className="flex items-center gap-4 bg-black/40 border border-white/5 px-4 py-2 rounded-sm">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] text-gray-600 font-mono uppercase font-bold tracking-widest">Connection_Strength</span>
                        <div className="flex gap-0.5 mt-1">
                            {[1,2,3,4].map(i => <div key={i} className={`w-1 h-2 rounded-sm ${i <= 3 ? 'bg-blue-500' : 'bg-gray-800'}`}></div>)}
                        </div>
                    </div>
                    <div className="w-px h-6 bg-white/10"></div>
                    <div className="flex items-center gap-2">
                        <ActivityIcon className="w-3.5 h-3.5 text-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-gray-400 uppercase">Uplink_Sustained</span>
                    </div>
                </div>
            )}
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            {/* Visualizer & Controls */}
            <div className="lg:col-span-7 flex flex-col gap-6 h-full">
                <Card className="flex-1 flex flex-col items-center justify-center p-8 bg-[#050505] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                    
                    {/* HUD Overlays */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1">
                        <div className="text-[8px] font-mono text-gray-600 uppercase font-bold tracking-widest">Biometric_Kernel</div>
                        <div className="text-[10px] text-blue-400 font-mono">KALLIPOLIS_ZK_S1</div>
                    </div>

                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                        <div className="text-[8px] font-mono text-gray-600 uppercase font-bold tracking-widest">Encryption</div>
                        <div className="text-[10px] text-green-500 font-mono">AES_256_ACTIVE</div>
                    </div>

                    {/* Central Visualization */}
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {permissionError ? (
                                <motion.div 
                                    key="permission-denied"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center px-8"
                                >
                                    <ThreatIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-2">Microphone_Access_Denied</h3>
                                    <p className="text-[10px] font-mono text-gray-500 uppercase leading-relaxed">
                                        Please enable microphone permissions in your browser settings to utilize the Live Specialist uplink.
                                    </p>
                                    <Button 
                                        onClick={startSession}
                                        className="mt-6 !bg-red-500 !text-white text-[9px]"
                                    >
                                        RETRY_HANDSHAKE
                                    </Button>
                                </motion.div>
                            ) : isActive ? (
                                <motion.div 
                                    key="active-vis"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0"
                                >
                                    <motion.div 
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1 + (audioLevel / 200), opacity: 0.5 }}
                                        className="absolute inset-0 border border-blue-500/20 rounded-full"
                                    />
                                    <motion.div 
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 0.8 + (audioLevel / 150), opacity: 0.2 }}
                                        className="absolute inset-0 bg-blue-500/10 rounded-full"
                                    />
                                    <motion.div 
                                        animate={{ 
                                            rotate: 360,
                                            scale: [1, 1.05, 1]
                                        }}
                                        transition={{ 
                                            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                                            scale: { duration: 2, repeat: Infinity }
                                        }}
                                        className="absolute inset-4 border border-dashed border-blue-500/30 rounded-full"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative z-10 p-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                                            <CpuIcon className={`w-12 h-12 ${audioLevel > 20 ? 'text-blue-400' : 'text-gray-600'} transition-colors duration-200`} />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="offline"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center"
                                >
                                    <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MicIcon className="w-8 h-8 text-gray-800" />
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-700 uppercase tracking-[0.3em]">Specialist_Offline</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-12 flex flex-col items-center">
                        {!permissionError && (
                            <Button 
                                onClick={isActive ? stopSession : startSession}
                                className={`px-12 py-5 rounded-sm text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${isActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-black hover:bg-gray-100'}`}
                            >
                                {isActive ? 'Terminate_Uplink' : 'Initialize_Specialist'}
                            </Button>
                        )}
                        <p className="mt-4 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                            {isActive ? 'Listening_For_Instructions...' : permissionError ? 'Awaiting_System_Fix' : 'Awaiting_Voice_Handshake'}
                        </p>
                    </div>
                </Card>

                {/* Live Transcription Bar */}
                <Card className="h-32 bg-[#080808] border-white/10 p-4 relative overflow-hidden flex flex-col">
                    <div className="absolute top-2 right-4 text-[8px] font-mono text-gray-700 uppercase tracking-tighter">Live_Transcription</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-2">
                         {currentInput && (
                            <div className="text-xs font-mono text-blue-300 border-l-2 border-blue-500 pl-3 mb-2 animate-pulse">
                                [USER]: {currentInput}
                            </div>
                         )}
                         {currentOutput && (
                            <div className="text-xs font-mono text-gray-300 border-l-2 border-gray-700 pl-3 mb-2">
                                [AI]: {currentOutput}
                            </div>
                         )}
                         {!currentInput && !currentOutput && !isActive && (
                            <div className="text-xs font-mono text-gray-700 uppercase text-center mt-6">Buffer_Empty</div>
                         )}
                    </div>
                </Card>
            </div>

            {/* Logs & History */}
            <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
                 <Card className="flex-1 flex flex-col bg-[#030303] border-white/10 p-0 overflow-hidden shadow-2xl">
                    <div className="p-3 border-b border-white/5 bg-[#080808] flex justify-between items-center">
                        <h2 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Tactical_Brief_History</h2>
                        <ShieldCheckIcon className="w-3.5 h-3.5 text-gray-800" />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                        {transcription.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-20">
                                <ActivityIcon className="w-12 h-12 mb-4" />
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em]">History_Log_Empty</span>
                            </div>
                        ) : (
                            transcription.map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-3 rounded-sm border ${item.type === 'user' ? 'bg-blue-500/5 border-blue-500/10 ml-4' : 'bg-white/5 border-white/5 mr-4'}`}
                                >
                                    <div className="text-[8px] font-mono font-bold uppercase text-gray-600 mb-1">
                                        {item.type === 'user' ? 'Transmission_Ingest' : 'Specialist_Response'}
                                    </div>
                                    <p className="text-[11px] font-mono text-gray-400 leading-relaxed">{item.text}</p>
                                </motion.div>
                            ))
                        )}
                    </div>
                    
                    <div className="p-2 border-t border-white/5 bg-black/40 text-center">
                         <span className="text-[8px] font-mono text-gray-700 uppercase tracking-tighter">End_Of_History_Buffer</span>
                    </div>
                 </Card>
            </div>
        </div>
    </div>
  );
};

export default LiveAssistantView;
