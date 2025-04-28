import React from "react";
import Header from "./header";
import Footer from "./footer";
import SellerSidebar from "./seller-sidebar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface SellerLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const SellerLayout: React.FC<SellerLayoutProps> = ({ children, title, description }) => {
  const { user } = useAuth();

  // Fetch seller's messages to display unread count
  const {
    data: messages = [],
  } = useQuery<any[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });

  // Filter unread messages
  const unreadMessages = messages.filter((msg: any) => !msg.isRead && msg.receiverId === user?.id);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SellerSidebar unreadMessages={unreadMessages.length} />
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && <p className="text-gray-500 mt-1">{description}</p>}
            </div>
          </div>
          
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SellerLayout;