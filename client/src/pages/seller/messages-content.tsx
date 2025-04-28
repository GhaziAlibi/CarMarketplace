import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { MessageSquare, Send, Search, User, Clock, Loader2, Check, ChevronDown } from "lucide-react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface MessagesContentProps {
  messages: any[];
  isLoadingMessages: boolean;
}

// Form schema
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(500, "Message is too long")
});

type MessageFormValues = z.infer<typeof messageSchema>;

const MessagesContent: React.FC<MessagesContentProps> = ({ 
  messages, 
  isLoadingMessages 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  
  // Group messages by conversation
  const conversations = React.useMemo(() => {
    const conversationMap = new Map();
    
    if (messages && messages.length > 0) {
      messages.forEach(message => {
        // In a real app, you'd have a proper conversation ID
        // For demo, we'll create a unique ID based on the users involved
        const otherUserId = message.senderId === user?.id ? message.receiverId : message.senderId;
        const conversationId = `conv_${Math.min(user?.id || 0, otherUserId)}_${Math.max(user?.id || 0, otherUserId)}`;
        
        if (!conversationMap.has(conversationId)) {
          const otherUser = {
            id: otherUserId,
            // In a real app, you'd fetch these details from the API
            name: `User #${otherUserId}`,
            avatar: null
          };
          
          conversationMap.set(conversationId, {
            id: conversationId,
            otherUser,
            messages: [],
            lastMessage: null,
            unreadCount: 0
          });
        }
        
        const conversation = conversationMap.get(conversationId);
        conversation.messages.push(message);
        
        // Calculate unread count
        if (!message.isRead && message.receiverId === user?.id) {
          conversation.unreadCount++;
        }
      });
      
      // Sort messages and find last message for each conversation
      for (const conversation of conversationMap.values()) {
        conversation.messages.sort((a: any, b: any) => {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        
        if (conversation.messages.length > 0) {
          conversation.lastMessage = conversation.messages[conversation.messages.length - 1];
        }
      }
    }
    
    return Array.from(conversationMap.values());
  }, [messages, user]);

  // Filter and sort conversations
  const filteredConversations = React.useMemo(() => {
    let filtered = [...conversations];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(conv => 
        conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.messages.some((msg: any) => 
          msg.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply tab filter
    if (activeTab === 'unread') {
      filtered = filtered.filter(conv => conv.unreadCount > 0);
    }
    
    // Sort by latest message
    filtered.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      
      return new Date(b.lastMessage.createdAt).getTime() - 
             new Date(a.lastMessage.createdAt).getTime();
    });
    
    return filtered;
  }, [conversations, searchTerm, activeTab]);
  
  // Message form setup
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: ""
    }
  });
  
  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: number[]) => {
      const res = await apiRequest('POST', '/api/messages/mark-read', { messageIds });
      return res.json();
    },
    onSuccess: () => {
      // Refetch messages to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to mark messages as read: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (values: MessageFormValues) => {
      if (!selectedConversation) return null;
      
      const messageData = {
        senderId: user?.id,
        receiverId: selectedConversation.otherUser.id,
        content: values.content,
        isRead: false
      };
      
      const res = await apiRequest('POST', '/api/messages', messageData);
      return res.json();
    },
    onSuccess: () => {
      // Reset form and refetch messages
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Handle conversation selection
  const selectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    
    // Mark unread messages as read
    const unreadMessageIds = conversation.messages
      .filter((msg: any) => !msg.isRead && msg.receiverId === user?.id)
      .map((msg: any) => msg.id);
    
    if (unreadMessageIds.length > 0) {
      markAsReadMutation.mutate(unreadMessageIds);
    }
  };
  
  // Handle message submission
  const onSubmit = (values: MessageFormValues) => {
    sendMessageMutation.mutate(values);
  };

  // Format date for display
  const formatMessageDate = (date: string | Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, "h:mm a");
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return format(messageDate, "MMM d");
    }
  };
  
  if (isLoadingMessages) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="md:col-span-1 overflow-hidden">
        <CardHeader className="space-y-4 px-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {conversations.reduce((count, conv) => count + conv.unreadCount, 0) > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-primary text-white">
                    {conversations.reduce((count, conv) => count + conv.unreadCount, 0)}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="px-0 pb-0 max-h-[500px] overflow-y-auto">
          {filteredConversations.length > 0 ? (
            <div className="divide-y">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "flex items-start gap-3 p-4 transition-colors cursor-pointer hover:bg-muted",
                    selectedConversation?.id === conversation.id ? "bg-muted" : "",
                    conversation.unreadCount > 0 ? "bg-primary/5" : ""
                  )}
                  onClick={() => selectConversation(conversation)}
                >
                  <Avatar>
                    <AvatarImage src={conversation.otherUser.avatar || ""} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium truncate">
                        {conversation.otherUser.name}
                      </p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                          {formatMessageDate(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage.senderId === user?.id && (
                          <span className="inline-flex items-center mr-1">
                            <Check className="h-3 w-3 mr-1" />
                            You:
                          </span>
                        )}
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                  
                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-primary text-white ml-1">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium mb-1">No conversations found</h3>
              <p className="text-sm text-gray-500">
                {searchTerm ? "Try a different search term" : "You don't have any messages yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Conversation View */}
      <Card className="md:col-span-2 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 px-6">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.otherUser.avatar || ""} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <CardTitle className="text-lg">
                    {selectedConversation.otherUser.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedConversation.messages.length} message{selectedConversation.messages.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Mark All as Read</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            
            <CardContent className="pb-0 px-6 flex-grow overflow-y-auto max-h-[400px]">
              <div className="space-y-4">
                {selectedConversation.messages.map((message: any) => {
                  const isCurrentUser = message.senderId === user?.id;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={cn(
                        "flex",
                        isCurrentUser ? "justify-end" : "justify-start"
                      )}
                    >
                      <div 
                        className={cn(
                          "max-w-[80%] rounded-lg p-3",
                          isCurrentUser 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-secondary"
                        )}
                      >
                        <p>{message.content}</p>
                        <div 
                          className={cn(
                            "flex items-center text-xs mt-1",
                            isCurrentUser 
                              ? "text-primary-foreground/70" 
                              : "text-muted-foreground"
                          )}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {formatMessageDate(message.createdAt)}
                          {isCurrentUser && (
                            <Check className={cn(
                              "h-3 w-3 ml-1", 
                              message.isRead ? "text-green-300" : ""
                            )} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            
            <CardFooter className="p-4 border-t mt-auto">
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit(onSubmit)} 
                  className="flex items-end w-full gap-2"
                >
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Textarea
                            placeholder="Type your message..."
                            className="min-h-[80px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-24"
                    disabled={sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardFooter>
          </>
        ) : (
          <div className="flex items-center justify-center p-12 h-full">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a conversation from the list to view messages
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MessagesContent;