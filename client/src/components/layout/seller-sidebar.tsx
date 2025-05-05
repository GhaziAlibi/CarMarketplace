import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Car, 
  MessageSquare, 
  Store, 
  Settings, 
  CreditCard,
  PlusCircle,
  Menu,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
  badge?: number;
}

const NavLink: React.FC<NavLinkProps> = ({ 
  href, 
  icon, 
  children, 
  isActive,
  badge 
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-primary/10 text-foreground"
      )}
      onClick={() => {
        window.history.pushState(null, '', href);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }}
    >
      {icon}
      <span>{children}</span>
      {badge !== undefined && badge > 0 && (
        <Badge variant="secondary" className="ml-1 text-xs py-0 h-5 min-w-5 flex items-center justify-center">
          {badge}
        </Badge>
      )}
    </div>
  );
};

interface SellerSidebarProps {
  unreadMessages?: number;
}

const SellerSidebar: React.FC<SellerSidebarProps> = ({ 
  unreadMessages = 0
}) => {
  const [location] = useLocation();
  const { t } = useTranslation();
  
  const isActive = (path: string) => location === path;

  return (
    <div className="w-full">
      {/* Desktop horizontal navigation */}
      <div className="hidden md:block">
        <div className="bg-white border-b mb-6">
          <div className="flex items-center px-4 h-14 gap-1">
            {/* Main links */}
            <NavLink 
              href="/seller/dashboard" 
              icon={<LayoutDashboard className="h-4 w-4" />}
              isActive={isActive("/seller/dashboard")}
            >
              {t("seller.dashboard")}
            </NavLink>
            <NavLink 
              href="/seller/listings" 
              icon={<Car className="h-4 w-4" />}
              isActive={isActive("/seller/listings")}
            >
              {t("seller.listings")}
            </NavLink>
            <NavLink 
              href="/seller/add-listing" 
              icon={<PlusCircle className="h-4 w-4" />}
              isActive={isActive("/seller/add-listing")}
            >
              {t("seller.addListing")}
            </NavLink>
            <NavLink 
              href="/seller/messages" 
              icon={<MessageSquare className="h-4 w-4" />}
              isActive={isActive("/seller/messages")}
              badge={unreadMessages}
            >
              {t("navigation.messages")}
            </NavLink>
            
            <NavLink 
              href="/seller/analytics" 
              icon={<BarChart3 className="h-4 w-4" />}
              isActive={isActive("/seller/analytics")}
            >
              {t("seller.analytics") || "Analytics"}
            </NavLink>
            
            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            
            {/* Settings links */}
            <NavLink 
              href="/seller/edit-showroom" 
              icon={<Store className="h-4 w-4" />}
              isActive={isActive("/seller/edit-showroom")}
            >
              {t("seller.showroom")}
            </NavLink>
            <NavLink 
              href="/seller/subscription" 
              icon={<CreditCard className="h-4 w-4" />}
              isActive={isActive("/seller/subscription")}
            >
              {t("seller.subscription")}
            </NavLink>
            <NavLink 
              href="/seller/account" 
              icon={<Settings className="h-4 w-4" />}
              isActive={isActive("/seller/account")}
            >
              {t("seller.account")}
            </NavLink>
          </div>
        </div>
      </div>
      
      {/* Mobile dropdown menu */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between bg-white border-b px-4 h-14">
          <h2 className="font-semibold">
            {isActive("/seller/dashboard") && t("seller.dashboard")}
            {isActive("/seller/listings") && t("seller.listings")}
            {isActive("/seller/add-listing") && t("seller.addListing")}
            {isActive("/seller/messages") && t("navigation.messages")}
            {isActive("/seller/analytics") && (t("seller.analytics") || "Analytics")}
            {isActive("/seller/edit-showroom") && t("seller.showroom")}
            {isActive("/seller/subscription") && t("seller.subscription")}
            {isActive("/seller/account") && t("seller.account")}
          </h2>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-md hover:bg-gray-100">
              <Menu className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                className={cn(
                  "flex items-center cursor-pointer gap-2",
                  isActive("/seller/dashboard") && "bg-primary/10"
                )}
                onClick={() => {
                  window.history.pushState(null, '', '/seller/dashboard');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{t("seller.dashboard")}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className={cn(
                  "flex items-center cursor-pointer gap-2",
                  isActive("/seller/listings") && "bg-primary/10"
                )}
                onClick={() => {
                  window.history.pushState(null, '', '/seller/listings');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                <Car className="h-4 w-4" />
                <span>{t("seller.listings")}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className={cn(
                  "flex items-center cursor-pointer gap-2",
                  isActive("/seller/add-listing") && "bg-primary/10"
                )}
                onClick={() => {
                  window.history.pushState(null, '', '/seller/add-listing');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                <PlusCircle className="h-4 w-4" />
                <span>{t("seller.addListing")}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className={cn(
                  "flex items-center cursor-pointer gap-2",
                  isActive("/seller/messages") && "bg-primary/10"
                )}
                onClick={() => {
                  window.history.pushState(null, '', '/seller/messages');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{t("navigation.messages")}</span>
                {unreadMessages > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs py-0 h-5 min-w-5 flex items-center justify-center">
                    {unreadMessages}
                  </Badge>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem 
                className={cn(
                  "flex items-center cursor-pointer gap-2",
                  isActive("/seller/analytics") && "bg-primary/10"
                )}
                onClick={() => {
                  window.history.pushState(null, '', '/seller/analytics');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                <BarChart3 className="h-4 w-4" />
                <span>{t("seller.analytics") || "Analytics"}</span>
              </DropdownMenuItem>
              
              <div className="h-px bg-gray-200 my-2"></div>
              
              <DropdownMenuItem 
                className={cn(
                  "flex items-center cursor-pointer gap-2",
                  isActive("/seller/edit-showroom") && "bg-primary/10"
                )}
                onClick={() => {
                  window.history.pushState(null, '', '/seller/edit-showroom');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                <Store className="h-4 w-4" />
                <span>{t("seller.showroom")}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className={cn(
                  "flex items-center cursor-pointer gap-2",
                  isActive("/seller/subscription") && "bg-primary/10"
                )}
                onClick={() => {
                  window.history.pushState(null, '', '/seller/subscription');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                <CreditCard className="h-4 w-4" />
                <span>{t("seller.subscription")}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className={cn(
                  "flex items-center cursor-pointer gap-2",
                  isActive("/seller/account") && "bg-primary/10"
                )}
                onClick={() => {
                  window.history.pushState(null, '', '/seller/account');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                <Settings className="h-4 w-4" />
                <span>{t("seller.account")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default SellerSidebar;