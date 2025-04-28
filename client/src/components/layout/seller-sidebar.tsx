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
  PlusCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
  badge?: number;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  href, 
  icon, 
  children, 
  isActive,
  badge 
}) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        {icon}
        <span>{children}</span>
        {badge !== undefined && badge > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {badge}
          </Badge>
        )}
      </a>
    </Link>
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
    <div className="w-full max-w-xs">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            {t("seller.menu")}
          </h2>
          <div className="space-y-1">
            <SidebarLink 
              href="/seller/dashboard" 
              icon={<LayoutDashboard className="h-4 w-4" />}
              isActive={isActive("/seller/dashboard")}
            >
              {t("seller.dashboard")}
            </SidebarLink>
            <SidebarLink 
              href="/seller/listings" 
              icon={<Car className="h-4 w-4" />}
              isActive={isActive("/seller/listings")}
            >
              {t("seller.listings")}
            </SidebarLink>
            <SidebarLink 
              href="/seller/add-listing" 
              icon={<PlusCircle className="h-4 w-4" />}
              isActive={isActive("/seller/add-listing")}
            >
              {t("seller.addListing")}
            </SidebarLink>
            <SidebarLink 
              href="/seller/messages" 
              icon={<MessageSquare className="h-4 w-4" />}
              isActive={isActive("/seller/messages")}
              badge={unreadMessages}
            >
              {t("navigation.messages")}
            </SidebarLink>
          </div>
        </div>
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            {t("seller.settings")}
          </h2>
          <div className="space-y-1">
            <SidebarLink 
              href="/seller/edit-showroom" 
              icon={<Store className="h-4 w-4" />}
              isActive={isActive("/seller/edit-showroom")}
            >
              {t("seller.showroom")}
            </SidebarLink>
            <SidebarLink 
              href="/seller/subscription" 
              icon={<CreditCard className="h-4 w-4" />}
              isActive={isActive("/seller/subscription")}
            >
              {t("seller.subscription")}
            </SidebarLink>
            <SidebarLink 
              href="/seller/account" 
              icon={<Settings className="h-4 w-4" />}
              isActive={isActive("/seller/account")}
            >
              {t("seller.account")}
            </SidebarLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSidebar;