import { useState } from "react";
import { Bot, User, X, Send, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'patient' | 'doctor' | 'pharmacy';
}

export default function AIAssistantModal({ isOpen, onClose, userRole }: AIAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: getWelcomeMessage(userRole),
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        context: `User role: ${userRole}`
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
      ]);
    },
    onError: (error: Error) => {
      toast({
        title: "AI Assistant Error",
        description: "Failed to get response from AI assistant. Please try again.",
        variant: "destructive",
      });
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I'm experiencing technical difficulties right now. Please try again later or contact support if this persists.",
          timestamp: new Date()
        }
      ]);
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  function getWelcomeMessage(role: string): string {
    switch (role) {
      case 'patient':
        return "Hello! I'm your AI health assistant. I can help you with symptom checking, health information, and general wellness guidance. How can I assist you today?";
      case 'doctor':
        return "Hello Doctor! I'm here to assist you with clinical decision support, differential diagnoses, drug interactions, and patient care insights. How can I help with your patient care today?";
      case 'pharmacy':
        return "Hello! I'm your AI pharmacy assistant. I can help with medication information, inventory optimization, drug interactions, and billing support. What can I assist you with today?";
      default:
        return "Hello! I'm your AI assistant. How can I help you today?";
    }
  }

  function getRoleColor(role: string): string {
    switch (role) {
      case 'patient':
        return 'text-patient';
      case 'doctor':
        return 'text-doctor';
      case 'pharmacy':
        return 'text-pharmacy';
      default:
        return 'text-primary';
    }
  }

  function getRoleBgColor(role: string): string {
    switch (role) {
      case 'patient':
        return 'bg-patient';
      case 'doctor':
        return 'bg-doctor';
      case 'pharmacy':
        return 'bg-pharmacy';
      default:
        return 'bg-primary';
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="h-5 w-5 text-primary mr-3" />
              <DialogTitle className="text-lg font-semibold">AI Health Assistant</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-ai-chat">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`rounded-lg p-3 max-w-sm ${
                    message.role === 'user'
                      ? `${getRoleBgColor(userRole)} text-white`
                      : 'bg-primary/5 text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 opacity-70`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className={`w-8 h-8 ${getRoleColor(userRole)}/10 rounded-full flex items-center justify-center shrink-0`}>
                    <User className={`h-4 w-4 ${getRoleColor(userRole)}`} />
                  </div>
                )}
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-6 border-t border-border">
          <div className="flex space-x-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your health question..."
              className="flex-1"
              disabled={chatMutation.isPending}
              data-testid="input-ai-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || chatMutation.isPending}
              data-testid="button-send-ai-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 mr-1" />
            All conversations are encrypted and HIPAA compliant
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
