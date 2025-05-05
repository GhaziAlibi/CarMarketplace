import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, formatDistanceToNow } from "date-fns";
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  Clock, 
  Loader2, 
  Check, 
  ChevronDown, 
  Phone, 
  Video, 
  PenSquare, 
  FilterX, 
  Archive, 
  ArrowLeft,
  X,
  Paperclip,
  Image as ImageIcon,
  ChevronRight,
  RefreshCw,
  Bell,
  BellOff
} from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuLabel
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
  // Reference for message list scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when conversation changes or new messages
  useEffect(() => {
    if (selectedConversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation]);
  
  // Mobile view state
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileConversation, setShowMobileConversation] = useState(false);
  
  // Check if mobile view on mount and window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  // Group messages by conversation
  const conversations = React.useMemo(() => {
    const conversationMap = new Map();
    
    if (messages && messages.length > 0) {
      // First pass - create all conversations
      messages.forEach(message => {
        // In a real app, you'd have a proper conversation ID
        // For demo, we'll create a unique ID based on the users involved
        const otherUserId = message.senderId === user?.id ? message.receiverId : message.senderId;
        const conversationId = `conv_${Math.min(user?.id || 0, otherUserId)}_${Math.max(user?.id || 0, otherUserId)}`;
        
        if (!conversationMap.has(conversationId)) {
          // Create a descriptive name based on the user ID (in a real app, you'd fetch actual user data)
          let userName = "User";
          if (otherUserId === 1) {
            userName = "Admin";
          } else if (otherUserId === 2) {
            userName = "Seller";
          } else if (otherUserId === 3) {
            userName = "Buyer";
          } else {
            userName = `User #${otherUserId}`;
          }

          const otherUser = {
            id: otherUserId,
            name: userName,
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
      });
      
      // Second pass - add messages to conversations
      messages.forEach(message => {
        const otherUserId = message.senderId === user?.id ? message.receiverId : message.senderId;
        const conversationId = `conv_${Math.min(user?.id || 0, otherUserId)}_${Math.max(user?.id || 0, otherUserId)}`;
        
        const conversation = conversationMap.get(conversationId);
        conversation.messages.push(message);
        
        // Calculate unread count
        if (!message.isRead && message.receiverId === user?.id) {
          conversation.unreadCount++;
        }
      });
      
      // Sort messages and find last message for each conversation
      const conversationsArray = Array.from(conversationMap.values());
      
      for (const conversation of conversationsArray) {
        // Sort messages chronologically
        conversation.messages.sort((a: any, b: any) => {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        
        if (conversation.messages.length > 0) {
          conversation.lastMessage = conversation.messages[conversation.messages.length - 1];
        }
      }
      
      return conversationsArray;
    }
    
    return [];
  }, [messages, user]);

  // Filter and sort conversations
  const filteredConversations = React.useMemo(() => {
    let filtered = [...(conversations || [])];
    
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
      
      console.log("Sending message with data:", messageData);
      const res = await apiRequest('POST', '/api/messages', messageData);
      const data = await res.json();
      console.log("Message sent response:", data);
      return data;
    },
    onSuccess: (newMessage) => {
      // Reset form and refetch messages
      form.reset();
      
      // Optimistically update the UI with the new message
      if (newMessage && selectedConversation) {
        // Add the new message to the conversation
        selectedConversation.messages.push(newMessage);
        selectedConversation.lastMessage = newMessage;
        
        // Force a refresh of the conversation component
        setSelectedConversation({...selectedConversation});
        
        // Also refresh the messages data from the server
        queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      }
      
      // Auto scroll to bottom
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
        variant: "default"
      });
    },
    onError: (error: any) => {
      console.error("Failed to send message:", error);
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
  
  // Handle mobile conversation selection
  const handleSelectConversation = (conversation: any) => {
    selectConversation(conversation);
    if (isMobileView) {
      setShowMobileConversation(true);
    }
  };
  
  // Handle back button in mobile view  
  const handleBackToList = () => {
    setShowMobileConversation(false);
  };
  
  // Mark all messages as read in the current conversation
  const markAllAsRead = () => {
    if (!selectedConversation) return;
    
    const unreadMessageIds = selectedConversation.messages
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
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }
  
  // Render conversation list
  const renderConversationList = () => (
    <Card className="h-full overflow-hidden border-0 md:border">
      <CardHeader className="space-y-4 px-4 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5" />
            <span>Messages</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/messages'] })}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-9 py-5 rounded-full bg-muted border-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 top-1.5 h-7 w-7 p-0 rounded-full"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Tabs 
          defaultValue="all" 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 h-9 p-1">
            <TabsTrigger value="all" className="text-xs h-7">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs h-7">
              Unread
              {(conversations || []).reduce((count, conv) => count + conv.unreadCount, 0) > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-1 h-5 min-w-5 px-1.5 rounded-full"
                >
                  {(conversations || []).reduce((count, conv) => count + conv.unreadCount, 0)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-xs h-7">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="px-0 pb-0 h-[calc(100vh-280px)] md:h-[500px] overflow-hidden">
        <ScrollArea className="h-full">
          {filteredConversations?.length > 0 ? (
            <div className="divide-y">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "flex items-start gap-3 p-4 transition-colors cursor-pointer hover:bg-muted relative",
                    selectedConversation?.id === conversation.id ? "bg-muted" : "",
                    conversation.unreadCount > 0 ? "bg-primary/5" : ""
                  )}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={conversation.otherUser.avatar || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {conversation.otherUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate text-base">
                        {conversation.otherUser.name}
                      </p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-1">
                          {formatMessageDate(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate mt-1 pr-6">
                        {conversation.lastMessage.senderId === user?.id && (
                          <span className="inline-flex items-center mr-1 text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            You:
                          </span>
                        )}
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                  
                  {conversation.unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute top-4 right-4 h-6 min-w-6 rounded-full flex items-center justify-center p-0"
                    >
                      {conversation.unreadCount}
                    </Badge>
                  )}
                  
                  {/* Preview of sender status */}
                  <div className="absolute right-4 bottom-4 w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-medium mb-1">No conversations found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Try a different search term" : "You don't have any messages yet"}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setSearchTerm('')}
                >
                  <FilterX className="h-4 w-4 mr-2" />
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
  
  // Render conversation view
  const renderConversationView = () => (
    <Card className="h-full flex flex-col bg-card border-0 md:border">
      {selectedConversation ? (
        <>
          <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 px-6 pb-3 border-b">
            <div className="flex items-center gap-3">
              {isMobileView && showMobileConversation && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-8 w-8 mr-1" 
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={selectedConversation.otherUser.avatar || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedConversation.otherUser.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <CardTitle className="text-lg">
                  {selectedConversation.otherUser.name}
                </CardTitle>
                <CardDescription className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Online
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Call</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Video className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Video Call</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={markAllAsRead}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark All as Read
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" />
                    Mute Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Conversation
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-grow overflow-hidden">
            <ScrollArea className="h-[calc(100vh-300px)] md:h-[380px] px-6 py-4">
              {selectedConversation.messages.length > 0 ? (
                <div className="space-y-4">
                  {/* Date separator */}
                  <div className="relative my-6">
                    <Separator className="absolute inset-0 flex items-center" aria-hidden="true" />
                    <div className="relative flex justify-center">
                      <span className="bg-card px-3 text-xs text-muted-foreground">
                        {format(new Date(selectedConversation.messages[0].createdAt), "MMMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  
                  {selectedConversation.messages.map((message: any, idx: number) => {
                    const isCurrentUser = message.senderId === user?.id;
                    const showAvatar = !isCurrentUser && 
                      (idx === 0 || selectedConversation.messages[idx - 1].senderId !== message.senderId);
                    
                    return (
                      <div key={message.id} className="space-y-2">
                        <div 
                          className={cn(
                            "flex items-end gap-2",
                            isCurrentUser ? "justify-end" : "justify-start"
                          )}
                        >
                          {!isCurrentUser && showAvatar ? (
                            <Avatar className="h-8 w-8 mb-1">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {selectedConversation.otherUser.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : !isCurrentUser ? (
                            <div className="w-8"></div>
                          ) : null}
                          
                          <div 
                            className={cn(
                              "max-w-[75%] rounded-2xl py-2 px-3",
                              isCurrentUser 
                                ? "bg-primary text-primary-foreground rounded-br-sm" 
                                : "bg-muted rounded-bl-sm"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                        
                        <div 
                          className={cn(
                            "flex items-center text-xs mb-1",
                            isCurrentUser ? "justify-end mr-2" : "justify-start ml-10" 
                          )}
                        >
                          <span className={cn("text-muted-foreground text-[10px]")}>
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                          {isCurrentUser && (
                            <Check className={cn(
                              "h-3 w-3 ml-1", 
                              message.isRead ? "text-green-500" : "text-muted-foreground/50"
                            )} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Send a message to start the conversation</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="p-4 border-t mt-auto bg-card">
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="flex items-end w-full gap-2"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach File</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send Image</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1 relative">
                      <FormControl>
                        <Textarea
                          placeholder="Type your message..."
                          className="min-h-[44px] max-h-[120px] py-3 resize-none pr-12 rounded-2xl"
                          {...field}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                            }
                          }}
                        />
                      </FormControl>
                      <Button 
                        type="submit" 
                        size="icon" 
                        className="h-8 w-8 rounded-full absolute right-2 bottom-2"
                        disabled={sendMessageMutation.isPending || !form.formState.isValid}
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardFooter>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Select a conversation to view your messages or start a new conversation with a potential buyer.
          </p>
          <Button variant="outline" className="gap-2">
            <PenSquare className="h-4 w-4" />
            New Message
          </Button>
        </div>
      )}
    </Card>
  );
  
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6">
      {/* Mobile view handling */}
      {isMobileView ? (
        <>
          {showMobileConversation && selectedConversation ? 
            renderConversationView() : 
            renderConversationList()
          }
        </>
      ) : (
        <>
          {/* Desktop view - side by side */}
          <div className="md:col-span-1">{renderConversationList()}</div>
          <div className="md:col-span-2">{renderConversationView()}</div>
        </>
      )}
    </div>
  );
};

export default MessagesContent;