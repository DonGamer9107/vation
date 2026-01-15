
import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { decode, decodeAudioData, encode } from '../utils/helpers';
import { MicrophoneIcon, StopCircleIcon } from '@heroicons/react/24/solid';

const LiveChat: React.FC = () => {
    const [isActive, setIsActive] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("Click Start to begin conversation");

    // Use any for session promise reference as LiveSession type is not exported
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const stopConversation = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if(mediaStreamSourceRef.current){
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        setIsActive(false);
        setStatus("Conversation ended. Click Start to begin again.");
    }, []);

    const startConversation = useCallback(async () => {
        setError(null);
        setStatus("Initializing...");

        // Initialize audio contexts for real-time interaction
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Re-initializing GoogleGenAI with each start to ensure up-to-date config
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        setStatus("Connection open. Start speaking.");
                        mediaStreamSourceRef.current = audioContextRef.current!.createMediaStreamSource(stream);
                        scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);

                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            // CRITICAL: Solely rely on sessionPromise resolves to send data
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Process raw audio output from the model
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContextRef.current.destination);
                            source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }

                        // Stop all playback if interrupted
                        if (message.serverContent?.interrupted) {
                            for (const source of audioSourcesRef.current.values()) {
                                try { source.stop(); } catch(e) {}
                            }
                            audioSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`An error occurred: ${e.message}`);
                        console.error('Live session error:', e);
                        stopConversation();
                    },
                    onclose: () => {
                        console.debug('closed');
                        stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
            });
            setIsActive(true);
        } catch (e) {
            setError(`Could not access microphone or start session: ${(e as Error).message}`);
            console.error(e);
            setStatus("Error. Please check console and permissions.");
        }
    }, [stopConversation]);

    const createBlob = (data: Float32Array): Blob => {
        const int16 = new Int16Array(data.length);
        for (let i = 0; i < data.length; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Live AI Voice Conversation</h2>
                <p className="mt-1 text-sm text-gray-400">Have a real-time, low-latency voice conversation with an advanced AI assistant.</p>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 bg-gray-800 rounded-lg">
                <div className="relative flex items-center justify-center h-24 w-24">
                    {isActive && <div className="absolute h-full w-full bg-green-500 rounded-full animate-ping opacity-75"></div>}
                    <button
                        onClick={isActive ? stopConversation : startConversation}
                        className={`z-10 inline-flex items-center justify-center rounded-full p-6 text-white shadow-lg transition-colors ${
                            isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-gemini-blue hover:bg-blue-600'
                        }`}
                    >
                        {isActive ? <StopCircleIcon className="h-10 w-10" /> : <MicrophoneIcon className="h-10 w-10" />}
                    </button>
                </div>
                <p className="text-lg font-medium text-gray-300">{status}</p>
            </div>
            {error && <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300">{error}</div>}
        </div>
    );
};

export default LiveChat;
