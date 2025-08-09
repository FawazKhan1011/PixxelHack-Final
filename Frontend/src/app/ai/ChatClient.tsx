'use client';

import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, Bot, User, Plus, Menu, LogOut } from 'lucide-react';
import '../../styles/ai.css';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load API key from environment
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

const ChatClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const exitToDashboard = () => {
    router.push('/dashboard');
  };

  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; timestamp: Date }[]>([
    {
      role: 'bot',
      text: "Hello! I'm your wellness companion. I'm here to support your mental health journey. How are you feeling today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true); // New state for speech support
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const hasHandledQuery = useRef(false);

  useEffect(() => {
    if (hasHandledQuery.current) return;

    const promptFromQuery = searchParams.get('q');
    if (promptFromQuery) {
      setInput(promptFromQuery);
      handleSend(promptFromQuery);
      hasHandledQuery.current = true;
    }
  }, [searchParams]);

  // Setup SpeechRecognition
  useEffect(() => {
    type SpeechRecognitionConstructor = new () => SpeechRecognition;
    type WindowWithSpeechRecognition = Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognitionConstructor) {
      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript);
        setListening(false);
      };

      recognition.onerror = () => {
        setListening(false);
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: "Sorry, there was an issue with voice recognition. Please try again or type your message.",
            timestamp: new Date(),
          },
        ]);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSpeechSupported(false); // Handle unsupported browsers
    }
  }, []);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      role: 'user' as const,
      text: message.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = `You are "You Matter AI", a compassionate and empathetic wellness companion.
Your purpose is to support the user's mental and emotional well-being.
You will only answer questions related to mental health, self-care,
emotional support, stress management, mindfulness, and healthy habits.
If a user asks something unrelated to health or wellness, politely
redirect them back to wellness topics.
Keep your responses kind, warm, and encouraging.`;

      const result = await model.generateContent([
        { text: systemPrompt },
        { text: message.trim() },
      ]);

      const botReply = result.response.text();

      const reply = {
        role: 'bot' as const,
        text: botReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, reply]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: "I'm sorry, I had trouble responding just now. Can you try again?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoice = () => {
    if (recognitionRef.current && !listening && isSpeechSupported) {
      setListening(true);
      recognitionRef.current.start();
    } else if (!isSpeechSupported) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: "Voice recognition is not supported in this browser. Please type your message instead.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const newConversation = () => {
    setMessages([
      {
        role: 'bot',
        text: "Hello! I'm your wellness companion. I'm here to support your mental health journey. How are you feeling today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="wellness-chat-container">
      {/* Sidebar */}
      <div className={`wellness-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && (
            <div className="sidebar-brand">
              <Bot className="sidebar-icon" />
              <h1 className="sidebar-title">You Matter AI</h1>
            </div>
          )}
          <Button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="menu-icon" />
          </Button>
        </div>

        <div className="sidebar-content">
          <Button className="new-chat-btn" onClick={newConversation}>
            <Plus className="btn-icon" />
            {sidebarOpen && 'New Conversation'}
          </Button>

          {sidebarOpen && (
            <>
              <div className="recent-chats">
                <h3 className="section-title">Recent Chats</h3>
                <div className="chat-list"></div>
              </div>

              <div className="wellness-tip">
                <h4 className="tip-title">Daily Wellness Tip</h4>
                <p className="tip-text">Take 5 deep breaths. Breathe in calm, breathe out worry.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="wellness-main">
        {/* Header */}
        <header className="wellness-header">
          <div className="header-content">
            <div className="ai-avatar">
              <Bot className="avatar-icon" />
            </div>
            <div className="header-text">
              <h2 className="header-title">You Matter AI Assistant</h2>
              <p className="header-subtitle">Your personal wellness companion</p>
            </div>
          </div>
          <Button variant="outline" onClick={exitToDashboard} className="exit-btn">
            <LogOut className="btn-icon-small" />
            Exit
          </Button>
        </header>

        {/* Messages */}
        <section className="chat-area">
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? <User className="avatar-icon-small" /> : <Bot className="avatar-icon-small" />}
                </div>
                <div className="message-bubble">
                  <p className="message-text">{msg.text}</p>
                  <p className="message-time">{format(msg.timestamp, 'hh:mm a')}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message-wrapper bot">
                <div className="message-avatar">
                  <Bot className="avatar-icon-small" />
                </div>
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <span className="typing-text">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </section>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <div className="input-wrapper">
              <input
                className="chat-input"
                type="text"
                placeholder="Share your thoughts, feelings, or ask for wellness guidance..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                disabled={isLoading}
              />
              <div className="input-buttons">
                <Button
                  className="voice-btn"
                  variant={listening ? 'destructive' : 'outline'}
                  onClick={startVoice}
                  disabled={listening || !isSpeechSupported}
                  title="Speak"
                >
                  {listening ? <MicOff className="btn-icon-small" /> : <Mic className="btn-icon-small" />}
                </Button>
                <Button className="send-btn" onClick={() => handleSend(input)} disabled={!input.trim() || isLoading}>
                  <Send className="btn-icon-small" />
                </Button>
              </div>
            </div>
            <p className="disclaimer">
              This AI assistant provides wellness support but is not a replacement for professional mental health care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatClient;