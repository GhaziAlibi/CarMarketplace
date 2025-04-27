import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  MessageSquare,
  ArrowRight,
  Calendar,
  Car,
  Loader2,
  RefreshCw,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Conversation {
  userId: number;
  userName: string;
  lastMessageContent: string;
  lastMessageDate: string;
  unreadCount: number;
  messages: any[];
}

const SellerMessages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  
  // Fetch messages
  const {
    data: messages = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });
  
  // Fetch cars for context
  const { data: cars = [] } = useQuery({
    queryKey: ["/api/cars"],
  });
  
  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await apiRequest("PUT", `/api/messages/${messageId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content, carId }: { receiverId: number; content: string; carId?: number }) => {
      await apiRequest("POST", "/api/messages", { receiverId, content, carId });
    },
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Message sent",
        description: "Your reply has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });
  
  // Group messages into conversations
  const conversations: Conversation[] = React.useMemo(() => {
    const conversationMap = new Map<number, Conversation>();
    
    // Process each message
    messages.forEach((message: any) => {
      const otherUserId = message.senderId === user?.id ? message.receiverId : message.senderId;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          userName: `User #${otherUserId}`, // In a real app, you'd fetch user names
          lastMessageContent: message.content,
          lastMessageDate: message.createdAt,
          unreadCount: message.receiverId === user?.id && !message.isRead ? 1 : 0,
          messages: [message],
        });
      } else {
        const conversation = conversationMap.get(otherUserId)!;
        
        // Check if this is a newer message
        const messageDate = new Date(message.createdAt);
        const lastMessageDate = new Date(conversation.lastMessageDate);
        
        if (messageDate > lastMessageDate) {
          conversation.lastMessageContent = message.content;
          conversation.lastMessageDate = message.createdAt;
        }
        
        // Update unread count
        if (message.receiverId === user?.id && !message.isRead) {
          conversation.unreadCount += 1;
        }
        
        conversation.messages.push(message);
      }
    });
    
    // Sort and convert to array
    return Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime());
  }, [messages, user?.id]);
  
  // Filter conversations based on search
  const filteredConversations = conversations.filter(
    (conversation) => 
      conversation.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessageContent.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get current conversation
  const currentConversation = selectedConversation 
    ? conversations.find(c => c.userId === selectedConversation)
    : null;
  
  // Sort messages by date
  const sortedMessages = currentConversation
    ? [...currentConversation.messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : [];
  
  // Mark unread messages as read when conversation is selected
  React.useEffect(() => {
    if (currentConversation) {
      currentConversation.messages.forEach(message => {
        if (message.receiverId === user?.id && !message.isRead) {
          markAsReadMutation.mutate(message.id);
        }
      });
    }
  }, [currentConversation, user?.id]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return formatDate(dateString);
    }
  };
  
  // Get car info by ID
  const getCarInfo = (carId: number) => {
    const car = cars.find((c: any) => c.id === carId);
    return car ? car : null;
  };
  
  // Handle sending reply
  const handleSendReply = () => {
    if (!replyText.trim() || !selectedConversation) return;
    
    // Find the car ID from the conversation if available
    const carId = sortedMessages[0]?.carId;
    
    sendMessageMutation.mutate({
      receiverId: selectedConversation,
      content: replyText,
      carId,
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-8">
            <Button variant="ghost" className="mr-4" asChild>
              <Link href="/seller/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden min-h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Conversation List */}
              <div className="md:col-span-1 border-r">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search messages..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="overflow-y-auto h-[calc(600px-56px)]">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : isError ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="text-amber-500 mb-2">
                        <RefreshCw className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-medium">Error loading messages</h3>
                      <p className="text-sm text-gray-500 mt-1 mb-4">
                        There was a problem fetching your messages
                      </p>
                      <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/messages"] })}>
                        Retry
                      </Button>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <MessageSquare className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-medium">No messages found</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {searchQuery
                          ? "No messages match your search"
                          : "You don't have any messages yet"}
                      </p>
                    </div>
                  ) : (
                    <ul>
                      {filteredConversations.map((conversation) => (
                        <li
                          key={conversation.userId}
                          className={`border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer ${
                            selectedConversation === conversation.userId ? 'bg-gray-50' : ''
                          }`}
                          onClick={() => setSelectedConversation(conversation.userId)}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                  {conversation.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium">{conversation.userName}</p>
                                  <p className="text-sm text-gray-500 truncate max-w-[180px]">
                                    {conversation.lastMessageContent}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-500">
                                  {formatRelativeTime(conversation.lastMessageDate)}
                                </span>
                                {conversation.unreadCount > 0 && (
                                  <Badge className="mt-1 bg-accent">{conversation.unreadCount}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              {/* Message Area */}
              <div className="md:col-span-2 flex flex-col h-[600px]">
                {selectedConversation && currentConversation ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-4 border-b flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          {currentConversation.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{currentConversation.userName}</p>
                          <p className="text-xs text-gray-500">
                            {sortedMessages.length} messages
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        View History
                      </Button>
                    </div>
                    
                    {/* Car Info (if applicable) */}
                    {sortedMessages[0]?.carId && (
                      <div className="p-3 bg-gray-50 border-b">
                        <div className="flex items-center">
                          <Car className="h-4 w-4 text-gray-500 mr-2" />
                          <p className="text-sm text-gray-600">
                            Regarding: {
                              (() => {
                                const car = getCarInfo(sortedMessages[0].carId);
                                return car ? (
                                  <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                                    <Link href={`/cars/${car.id}`}>
                                      {car.title}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Link>
                                  </Button>
                                ) : `Car #${sortedMessages[0].carId}`;
                              })()
                            }
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {sortedMessages.map((message) => {
                        const isFromMe = message.senderId === user?.id;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isFromMe
                                  ? 'bg-primary text-white rounded-br-none'
                                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div
                                className={`text-xs mt-1 flex items-center ${
                                  isFromMe ? 'text-primary-foreground/80 justify-end' : 'text-gray-500'
                                }`}
                              >
                                <span>{formatDate(message.createdAt)}</span>
                                {isFromMe && message.isRead && (
                                  <CheckCircle className="h-3 w-3 ml-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Reply Area */}
                    <div className="p-4 border-t">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Type your message..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[60px] py-2"
                          />
                        </div>
                        <Button
                          onClick={handleSendReply}
                          disabled={!replyText.trim() || sendMessageMutation.isPending}
                        >
                          {sendMessageMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              Send
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No conversation selected</h3>
                    <p className="text-sm text-gray-500 max-w-md mt-2">
                      Select a conversation from the list to view messages and reply to customers.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SellerMessages;
