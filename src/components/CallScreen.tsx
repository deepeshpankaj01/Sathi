"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Menu, X, Plus } from 'lucide-react';

interface CallScreenProps {
  companionId: 'male' | 'female';
  onEndCall: () => void;
}

type Conversation = {
  id: string;
  title: string;
  mode: string;
  updated_at: string;
}

export function CallScreen({ companionId, onEndCall }: CallScreenProps) {
  const [mode, setMode] = useState<'general' | 'student' | 'business' | 'job'>('general');
  const [micActive, setMicActive] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  // Audio state
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const processedTextRef = useRef<string>('');

  const [waveform, setWaveform] = useState<number[]>([10, 18, 28, 36, 28, 18, 10]); 

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const isMale = companionId === 'male';
  const name = isMale ? 'Veer' : 'Tara';

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages, append } = useChat({
    api: '/api/chat',
    body: {
      companionId,
      mode,
      conversationId: activeConversationId
    }
  });

  useEffect(() => {
    if (error) {
      toast.error('Error connecting to Sathi. Please check your API keys.');
    }
  }, [error]);

  // --- TTS Engine ---
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && !isLoading) {
      const textToSpeak = lastMsg.content;
      if (textToSpeak && textToSpeak !== processedTextRef.current) {
        processedTextRef.current = textToSpeak;
        playTTS(textToSpeak);
      }
    }
  }, [messages, isLoading]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
  };

  const playTTS = async (text: string) => {
    try {
      initAudio();
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, companionId })
      });
      if (!res.ok) throw new Error('TTS Failed');
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyserRef.current!);
      analyserRef.current!.connect(audioContextRef.current!.destination);
      
      source.onended = () => {
        setIsSpeaking(false);
        setWaveform([10, 18, 28, 36, 28, 18, 10]); // Reset
      };
      
      source.start(0);
      setIsSpeaking(true);
      drawWaveform();
    } catch (e) {
      console.error(e);
      toast.error('Using browser voice fallback.');
      const synth = window.speechSynthesis;
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-IN';
      synth.speak(utt);
    }
  };

  const drawWaveform = () => {
    if (!analyserRef.current || !isSpeaking) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const bars = [];
    const step = Math.floor(dataArray.length / 7);
    for (let i = 0; i < 7; i++) {
      const val = dataArray[i * step] || 0;
      const height = Math.max(4, (val / 255) * 40);
      bars.push(height);
    }
    setWaveform(bars);
    
    if (isSpeaking) {
      requestAnimationFrame(drawWaveform);
    }
  };

  useEffect(() => {
    if (isSpeaking) drawWaveform();
  }, [isSpeaking]);

  // --- STT Engine ---
  const toggleMic = async () => {
    if (micActive) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setMicActive(false);
      toast.success('Audio recorded, transcribing...');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;
        audioChunksRef.current = [];

        mr.ondataavailable = e => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mr.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach(t => t.stop());
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');
          
          try {
            const res = await fetch('/api/stt', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.text) {
              append({ role: 'user', content: data.text });
            } else {
              toast.error('Could not transcribe audio.');
            }
          } catch (err) {
            toast.error('Speech recognition failed.');
          }
        };

        mr.start();
        setMicActive(true);
        toast('Listening...', { icon: '🎤' });
      } catch (e) {
        toast.error('Microphone access denied. Please allow it in settings.');
      }
    }
  };

  // --- Base logic ---
  useEffect(() => {
    setIsLoadingConversations(true);
    fetch(`/api/conversations?companionId=${companionId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConversations(data);
          if (data.length > 0) {
            loadConversation(data[0].id);
          } else {
            startNewConversation();
          }
        } else {
          startNewConversation();
        }
      })
      .catch(() => {
        toast.error('Failed to load history.');
        startNewConversation();
      })
      .finally(() => setIsLoadingConversations(false));
  }, [companionId]);

  const loadConversation = async (id: string) => {
    setActiveConversationId(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    const res = await fetch(`/api/messages?conversationId=${id}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setMessages(data.map((m: { id: string; role: 'user' | 'assistant'; content: string }) => ({
        id: m.id,
        role: m.role,
        content: m.content
      })));
    }
  };

  const startNewConversation = async () => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companionId, mode })
    });
    const data = await res.json();
    if (data.id) {
      setConversations([data, ...conversations]);
      setActiveConversationId(data.id);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      setMessages([{
        id: 'initial-greeting',
        role: 'assistant',
        content: `Hey! I'm ${name}, your Sathi 😊 I'm here to listen, guide, and just be that friend you can share everything with. How's your day going yaar?`
      }]);
    } else {
      toast.error('Could not create conversation. Please check your DB connection.');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCallTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleModeChange = (newMode: 'general' | 'student' | 'business' | 'job') => {
    setMode(newMode);
    toast.success(`Switched to ${newMode} mode.`);
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-divider flex justify-between items-center shrink-0">
        <span className="font-semibold text-[13px] text-ink uppercase tracking-wide">Chats</span>
        <div className="flex gap-2">
          <a href="/settings" className="bg-transparent border border-divider rounded px-2 py-1 text-xs cursor-pointer hover:bg-parchm text-ink-soft transition-colors hover:text-ink no-underline">⚙️</a>
          <button onClick={startNewConversation} className="bg-transparent border border-divider rounded px-2 py-1 text-xs cursor-pointer hover:bg-parchm text-ink-soft transition-colors hover:text-ink"><Plus size={14}/></button>
        </div>
      </div>
      <div className="flex flex-col p-2 gap-1 overflow-y-auto custom-scrollbar flex-1">
        {isLoadingConversations ? (
          // Skeleton Loader
          [1, 2, 3].map(i => (
            <div key={i} className="p-3 rounded-lg animate-pulse flex flex-col gap-2">
              <div className="h-4 bg-divider rounded w-3/4"></div>
              <div className="h-3 bg-divider/50 rounded w-1/2"></div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center p-6 text-center h-full opacity-50">
            <div className="text-[32px] mb-2">👋</div>
            <p className="text-sm font-medium text-ink-soft">No past chats</p>
            <p className="text-xs text-ink-faint mt-1">Start a new conversation with {name}.</p>
          </div>
        ) : (
          conversations.map(c => (
            <div 
              key={c.id} 
              onClick={() => loadConversation(c.id)}
              className={`p-3 rounded-lg cursor-pointer text-sm transition-colors ${activeConversationId === c.id ? 'bg-parchm font-medium border border-divider' : 'hover:bg-parchm/50'}`}
            >
              <div className="truncate text-ink">{c.title}</div>
              <div className="text-xs text-ink-faint mt-1">{new Date(c.updated_at).toLocaleDateString()}</div>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-cream animate-fade-up">
      {/* Navbar */}
      <div className="flex items-center justify-between px-[20px] md:px-[26px] py-[14px] border-b border-divider bg-cream/90 backdrop-blur-[10px] shrink-0 z-20">
        <div className="flex items-center gap-[12px]">
          <button 
            className="md:hidden flex items-center justify-center w-10 h-10 border border-divider rounded-full text-ink hover:bg-parchm transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          
          <div 
            className={`w-10 h-10 rounded-full hidden md:flex items-center justify-center bg-cover bg-center border-[1.5px] ${isMale ? 'border-m/25' : 'border-f/20'}`}
            style={{ backgroundImage: `url(/api/avatar/${isMale ? 'veer' : 'tara'})` }}
          >
          </div>
          <div>
            <div className="font-semibold text-[15px] text-ink">{name}</div>
            <div className="flex items-center gap-[6px] text-[12px] text-green font-medium">
              <div className="w-[7px] h-[7px] bg-green rounded-full shadow-[0_0_7px_rgba(45,122,79,0.55)] animate-pulse-custom"></div> 
              Connected
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[16px]">
          <div className="font-mono text-[14px] text-ink-soft bg-ivory border border-divider rounded-full px-[14px] py-[5px]">
            {formatTime(callTime)}
          </div>
          <div className="hidden lg:flex gap-[5px] bg-ivory border border-divider rounded-full p-[4px]">
            {(['general', 'student', 'business', 'job'] as const).map(m => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`px-[16px] py-[6px] rounded-full border-none font-sans text-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  mode === m ? (isMale ? 'bg-m text-white shadow-[0_2px_10px_rgba(160,98,26,.15)]' : 'bg-f text-white shadow-[0_2px_10px_rgba(158,61,90,.15)]') : 'bg-transparent text-ink-soft hover:bg-parchm hover:text-ink'
                }`}
              >
                {m === 'general' ? '💬 General' : m === 'student' ? '📚 Student' : m === 'business' ? '💼 Business' : '🏢 Job'}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onEndCall}
          className="flex items-center gap-[7px] bg-red border-none text-white px-[18px] md:px-[22px] py-[10px] rounded-full font-sans text-[13px] font-semibold cursor-pointer transition-all shadow-[0_4px_14px_rgba(192,57,43,.3)] hover:brightness-110 hover:scale-[1.03]"
        >
          📵 End
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 relative flex overflow-hidden min-h-0">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-[15] md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`absolute md:relative flex-col border-r border-divider bg-ivory h-full w-[260px] z-20 transform transition-transform duration-300 ease-in-out flex shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <SidebarContent />
        </div>

        {/* Center Area (Avatar & Chat) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_400px] h-full overflow-hidden">
          {/* Avatar Area */}
          <div className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,var(--tw-gradient-from)_0%,var(--tw-gradient-via)_40%,var(--tw-gradient-to)_100%)] from-m-pale via-ivory to-cream flex items-center justify-center">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_500px_380px_at_50%_40%,rgba(160,98,26,0.15)_0%,transparent_65%)] animate-float-y" style={{ animationDuration: '5s' }}></div>
            
            <div className="relative z-[2] flex flex-col items-center gap-[20px]">
              <div className="w-[180px] h-[180px] md:w-[240px] md:h-[240px] relative transition-transform duration-75" style={{ transform: isSpeaking ? `scale(${1 + (waveform[3] || 0) / 400})` : 'scale(1)' }}>
                <div 
                  className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden animate-float-y bg-cover bg-center shadow-[0_12px_44px_rgba(160,98,26,0.25)]`} 
                  style={{ 
                    animationDuration: '4s',
                    backgroundImage: `url(/api/avatar/${isMale ? 'veer' : 'tara'})`,
                    filter: isSpeaking ? `brightness(${1 + (waveform[3] || 0) / 200})` : 'brightness(1)',
                    transition: 'filter 75ms linear'
                  }}
                >
                </div>
                <div className="absolute -inset-[3px] rounded-full shadow-[0_0_0_1.5px_rgba(254,240,220,1),0_12px_44px_rgba(160,98,26,0.15)] pointer-events-none"></div>
                {/* Rings */}
                <div className={`absolute rounded-full border ${isMale ? 'border-m/20' : 'border-f/20'} -inset-[10px] animate-ring-rot transition-opacity duration-75`} style={{ opacity: isSpeaking ? 0.8 : 0.4 }}></div>
                <div className={`absolute rounded-full border ${isMale ? 'border-m/20' : 'border-f/20'} -inset-[20px] animate-ring-rot transition-opacity duration-75`} style={{ animationDirection: 'reverse', animationDuration: '14s', opacity: isSpeaking ? 0.6 : 0.3 }}></div>
                <div className={`absolute rounded-full border ${isMale ? 'border-m/20' : 'border-f/20'} -inset-[32px] animate-ring-rot transition-opacity duration-75`} style={{ animationDuration: '22s', opacity: isSpeaking ? 0.4 : 0.1 }}></div>
              </div>

              <div className="flex items-end justify-center gap-[5px] h-[40px]">
                {isSpeaking ? (
                  waveform.map((h, i) => (
                    <div key={i} className="w-[4px] bg-m rounded-full transition-all duration-75" style={{ height: `${h}px` }}></div>
                  ))
                ) : isLoading ? (
                  <div className="flex items-end gap-[5px] h-[40px]">
                    <div className="w-[4px] bg-m rounded-full animate-pulse-custom h-[20px]" style={{ animationDelay: '0s' }}></div>
                    <div className="w-[4px] bg-m rounded-full animate-pulse-custom h-[30px]" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-[4px] bg-m rounded-full animate-pulse-custom h-[20px]" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                ) : (
                  <div className="text-ink-soft text-[14px]">Here for you 🎧</div>
                )}
              </div>

              <div>
                <div className="font-serif text-[30px] font-bold text-ink tracking-tight text-center">{name}</div>
              </div>
            </div>

            <div className="hidden lg:flex absolute bottom-[22px] right-[22px] w-[106px] h-[124px] rounded-[17px] bg-ivory border-[1.5px] border-divider flex-col items-center justify-center gap-[6px] text-[28px] text-ink-soft shadow-[0_4px_18px_rgba(90,70,30,.08)] cursor-pointer transition-all hover:border-m hover:shadow-[0_4px_18px_rgba(160,98,26,0.15)]">
              🧑<span className="text-[11px] text-ink-faint font-medium">Your cam</span>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="flex flex-col border-t md:border-t-0 md:border-l border-divider bg-ivory min-h-[50vh] md:min-h-0 relative">
            <div className="px-[18px] py-[14px] border-b border-divider text-[11.5px] font-semibold uppercase tracking-[1.5px] text-ink-soft shrink-0">
              Chat with {name}
            </div>
            
            <div className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-[14px] scroll-smooth custom-scrollbar">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-[9px] animate-fade-up ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div 
                    className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[15px] shrink-0 mt-[3px] border border-divider bg-cover bg-center ${m.role === 'user' ? 'bg-parchm' : 'bg-white'}`}
                    style={{ backgroundImage: m.role !== 'user' ? `url(/api/avatar/${isMale ? 'veer' : 'tara'})` : undefined }}
                  >
                    {m.role === 'user' ? '🧑' : ''}
                  </div>
                  <div className={`max-w-[85%] px-[15px] py-[12px] rounded-[18px] text-[14px] leading-[1.65] break-words shadow-[0_2px_8px_rgba(90,70,30,.08)] ${m.role === 'user' ? (isMale ? 'bg-gradient-to-br from-m to-m-mid text-white rounded-tr-[4px]' : 'bg-gradient-to-br from-f to-f-mid text-white rounded-tr-[4px]') : 'bg-white text-ink border border-divider rounded-tl-[4px]'}`}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className={`flex gap-[9px] animate-fade-up`}>
                  <div 
                    className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[15px] shrink-0 mt-[3px] border border-divider bg-white bg-cover bg-center`}
                    style={{ backgroundImage: `url(/api/avatar/${isMale ? 'veer' : 'tara'})` }}
                  ></div>
                  <div className="px-[15px] py-[12px] rounded-[18px] bg-white border border-divider rounded-tl-[4px] shadow-[0_2px_8px_rgba(90,70,30,.08)] flex items-center gap-1">
                     <div className="w-[6px] h-[6px] bg-ink-faint rounded-full animate-pulse-custom"></div>
                     <div className="w-[6px] h-[6px] bg-ink-faint rounded-full animate-pulse-custom" style={{ animationDelay: '0.2s' }}></div>
                     <div className="w-[6px] h-[6px] bg-ink-faint rounded-full animate-pulse-custom" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-[14px] border-t border-divider flex gap-[8px] items-end shrink-0 bg-ivory">
              <button 
                type="button" 
                onClick={toggleMic} 
                className={`w-[44px] h-[44px] rounded-full border-[1.5px] shrink-0 flex items-center justify-center text-[18px] transition-all cursor-pointer ${micActive ? 'bg-red border-red text-white animate-pulse-custom' : 'border-divider bg-white text-ink-soft hover:border-m hover:text-m'}`}
              >
                {micActive ? '⏹️' : '🎤'}
              </button>
              <textarea
                className="flex-1 bg-white border-[1.5px] border-divider rounded-[16px] px-[15px] py-[12px] font-sans text-[14px] text-ink resize-none min-h-[44px] max-h-[120px] outline-none transition-colors focus:border-m leading-[1.5] shadow-inner"
                placeholder="Type anything… I'm here."
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                  }
                }}
              />
              <button type="submit" disabled={!input.trim() || isLoading} className="w-[44px] h-[44px] rounded-full border-none shrink-0 flex items-center justify-center text-[18px] transition-all bg-gradient-to-br from-[#A0621A] to-[#C07828] text-white shadow-[0_4px_14px_rgba(160,98,26,.15)] hover:scale-[1.1] hover:brightness-110 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer">
                ➤
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
