import { useState, useRef, useEffect } from "react";

interface ChatInterfaceProps {
  onGenerate: (prompt: string) => void;
  onClear: () => void;
  isGenerating: boolean;
  prompt: string;
  setPrompt: (prompt: string) => void;
  isDarkMode: boolean;
  resetChat?: boolean; // Added to trigger chat reset
  externalSystemMessage?: string; // New prop for system feedback
  onUserPrompt?: (prompt: string) => void; // New callback for user prompt
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "system" | "thinking";
  timestamp: Date;
}

const MAX_PROMPT_LENGTH = 1000;

// Default welcome message
const DEFAULT_WELCOME_MESSAGE = {
  id: "welcome",
  content: "What kind of app would you like me to build?",
  sender: "system" as const,
  timestamp: new Date(),
};

export default function ChatInterface({
  onGenerate,
  onClear,
  isGenerating,
  prompt,
  setPrompt,
  isDarkMode,
  resetChat,
  externalSystemMessage,
  onUserPrompt
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    DEFAULT_WELCOME_MESSAGE
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const promptProcessedRef = useRef(false);
  
  // Theme-dependent styles
  const themeClasses = isDarkMode 
    ? {
        bg: "bg-gray-950",
        border: "border-gray-800",
        text: "text-white",
        textSecondary: "text-gray-400",
        input: "bg-gray-900 border-gray-700",
        userMessage: "bg-blue-600 text-white",
        systemMessage: "bg-gray-800 text-white",
      }
    : {
        bg: "bg-white",
        border: "border-gray-200",
        text: "text-gray-900",
        textSecondary: "text-gray-600",
        input: "bg-white border-gray-300",
        userMessage: "bg-blue-500 text-white",
        systemMessage: "bg-gray-100 text-gray-800",
      };
  
  // Reset chat when resetChat changes
  useEffect(() => {
    if (resetChat) {
      setMessages([DEFAULT_WELCOME_MESSAGE]);
      promptProcessedRef.current = false;
    }
  }, [resetChat]);
  
  // Add existing prompt as user message if it exists on component mount
  // Only run once by using a ref to track if the prompt has been processed
  useEffect(() => {
    if (prompt && messages && messages.length === 1 && !promptProcessedRef.current) {
      promptProcessedRef.current = true;
      setMessages(prev => [
        ...prev,
        {
          id: "existing-prompt",
          content: prompt,
          sender: "user",
          timestamp: new Date(),
        }
      ]);
    }
  }, [prompt, messages]);
  
  // Add system message from parent when it changes
  useEffect(() => {
    if (externalSystemMessage) {
      setMessages(prev => [
        ...prev,
        {
          id: 'system-' + Date.now().toString(),
          content: externalSystemMessage,
          sender: 'system',
          timestamp: new Date(),
        }
      ]);
    }
  }, [externalSystemMessage]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() && !isGenerating) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputValue.trim(),
        sender: "user",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setPrompt(inputValue); // Update the parent prompt state
      setInputValue(""); // Clear input field
      // Notify parent of user prompt
      if (onUserPrompt) onUserPrompt(userMessage.content);
      // Remove internal onGenerate call here
      // Add thinking message (optional, parent can control this too)
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: "thinking-" + Date.now().toString(),
            content: "Thinking...",
            sender: "thinking",
            timestamp: new Date(),
          },
        ]);
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setInputValue("");
    onClear(); // Call the parent clear function
  };

  return (
    <div className={`flex flex-col h-full ${themeClasses.bg} overflow-hidden transition-colors duration-200`}>
      {/* Chat messages - Made font bigger and increased padding */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.sender === "thinking" ? (
              <div className={`text-sm ${themeClasses.textSecondary} italic ml-2 transition-colors duration-200`}>
                {message.content}
              </div>
            ) : (
              <div
                className={`max-w-[85%] rounded-md p-3 transition-colors duration-200 ${
                  message.sender === "user"
                    ? themeClasses.userMessage
                    : themeClasses.systemMessage
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
        {isGenerating && !messages.find(m => m.sender === "thinking") && (
          <div className="flex justify-start">
            <div className={`max-w-[85%] rounded-md p-3 ${themeClasses.systemMessage} transition-colors duration-200`}>
              <div className="flex items-center text-sm">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating app...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area - Updated to match image */}
      <div className={`p-3 border-t ${themeClasses.border} ${themeClasses.bg} transition-colors duration-200`}>
        <div className="flex items-center">
          <div className="relative flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Make me a business tool for retail managers..."
              className={`w-full p-2.5 pr-10 text-sm border ${themeClasses.input} rounded-md resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${themeClasses.text} transition-colors duration-200`}
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={isGenerating || !inputValue.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-1 rounded-full bg-blue-600 flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1 px-2">
          <button 
            onClick={handleClearChat} 
            className={`text-xs ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors duration-150`}
          >
            Clear chat
          </button>
          <div className={`text-xs ${themeClasses.textSecondary} transition-colors duration-200`}>
            {inputValue.length}/{MAX_PROMPT_LENGTH}
          </div>
        </div>
      </div>
    </div>
  );
}