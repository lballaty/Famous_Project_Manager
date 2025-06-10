import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MessageCircle, X, Minimize2, Maximize2, Send, Users } from 'lucide-react';
import { ChatMessage } from '../types/sync';
import { indexedDB } from '../lib/indexedDB';
import { syncEngine } from '../lib/syncEngine';

interface FloatingChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [chatSize, setChatSize] = React.useState({ width: 320, height: 400 });
  const [isResizing, setIsResizing] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  React.useEffect(() => {
    loadMessages();
  }, []);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      await indexedDB.init();
      const chatMessages = await indexedDB.getChatMessages();
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser.id) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      content: newMessage.trim(),
      userId: currentUser.id,
      userName: currentUser.name || currentUser.email,
      timestamp: new Date().toISOString(),
      synced: false
    };

    try {
      await indexedDB.addChatMessage(message);
      await syncEngine.logChange('message', message.id, 'create', null, message);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Responsive chat size based on screen size
  const getResponsiveChatSize = () => {
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      return {
        width: Math.min(chatSize.width, window.innerWidth - 32),
        height: Math.min(chatSize.height, window.innerHeight - 100)
      };
    }
    return chatSize;
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg z-40"
        size="icon"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    );
  }

  const responsiveSize = getResponsiveChatSize();
  const isMobile = window.innerWidth < 640;

  return (
    <Card 
      className={`fixed shadow-2xl z-40 resize-none overflow-hidden ${
        isMobile 
          ? 'bottom-2 right-2 left-2' 
          : 'bottom-4 right-4'
      }`}
      style={!isMobile ? { 
        width: responsiveSize.width, 
        height: isMinimized ? 'auto' : responsiveSize.height 
      } : {
        height: isMinimized ? 'auto' : responsiveSize.height
      }}
    >
      <CardHeader className="p-3 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <CardTitle className="text-sm">Team Chat</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {messages.filter(m => !m.synced).length} local
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setIsMinimized(!isMinimized)}
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              onClick={onToggle}
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col" style={{ height: responsiveSize.height - 60 }}>
          <ScrollArea className="flex-1 p-3" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-2">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {message.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-medium truncate">
                        {message.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      {!message.synced && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          local
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 text-sm"
              />
              <Button onClick={sendMessage} size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};