import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Car, User, Store, MessageCircle, Heart, LogOut, Settings, ChevronDown, Menu } from "lucide-react";
import { UserRole } from "@shared/schema";

const Header: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navLinks = [
    { title: "Home", path: "/", active: location === "/" },
    { title: "Browse Cars", path: "/cars", active: location.startsWith("/cars") },
    { title: "Showrooms", path: "/showrooms", active: location.startsWith("/showrooms") },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getRoleBasedLinks = () => {
    if (!user) return null;

    switch (user.role) {
      case UserRole.ADMIN:
        return (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/listings">Manage Listings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/users">Manage Users</Link>
            </DropdownMenuItem>
          </>
        );
      case UserRole.SELLER:
        return (
          <>
            <DropdownMenuItem asChild>
              <Link href="/seller/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/seller/add-listing">Add Listing</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/seller/messages">Messages</Link>
            </DropdownMenuItem>
          </>
        );
      case UserRole.BUYER:
        return (
          <>
            <DropdownMenuItem asChild>
              <Link href="/saved-cars">Saved Cars</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/buyer/messages">Messages</Link>
            </DropdownMenuItem>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/">
              <span className="text-2xl font-bold text-primary cursor-pointer">
                Auto<span className="text-accent">Market</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`px-3 py-2 text-sm font-medium hover:text-primary transition-colors ${
                  link.active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Sell Your Car button - show only for sellers and if logged in */}
            {user && user.role === UserRole.SELLER && (
              <div className="hidden md:block">
                <Button asChild variant="default" size="sm">
                  <Link href="/seller/add-listing">
                    <Car className="mr-2 h-4 w-4" /> Add Listing
                  </Link>
                </Button>
              </div>
            )}

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-muted">
                      <AvatarImage src={user.avatar || ""} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {getRoleBasedLinks()}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/auth">Login / Register</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>
                      <span className="text-2xl font-bold text-primary">
                        Auto<span className="text-accent">Market</span>
                      </span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 mt-6">
                    {navLinks.map((link) => (
                      <SheetClose key={link.path} asChild>
                        <Link 
                          href={link.path}
                          className={`px-3 py-2 text-base font-medium hover:text-primary transition-colors ${
                            link.active ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {link.title}
                        </Link>
                      </SheetClose>
                    ))}
                    
                    {user ? (
                      <>
                        <div className="py-2">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={user.avatar || ""} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </div>
                        
                        <SheetClose asChild>
                          {user.role === UserRole.ADMIN && (
                            <Link 
                              href="/admin/dashboard"
                              className="px-3 py-2 text-base font-medium"
                            >
                              Admin Dashboard
                            </Link>
                          )}
                          {user.role === UserRole.SELLER && (
                            <Link 
                              href="/seller/dashboard"
                              className="px-3 py-2 text-base font-medium"
                            >
                              Seller Dashboard
                            </Link>
                          )}
                          {user.role === UserRole.BUYER && (
                            <Link 
                              href="/saved-cars"
                              className="px-3 py-2 text-base font-medium"
                            >
                              Saved Cars
                            </Link>
                          )}
                        </SheetClose>
                        
                        <SheetClose asChild>
                          <Link 
                            href="/messages"
                            className="px-3 py-2 text-base font-medium"
                          >
                            Messages
                          </Link>
                        </SheetClose>
                        
                        <div className="px-3 py-2">
                          <Button onClick={handleLogout} variant="destructive" className="w-full">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                          </Button>
                        </div>
                      </>
                    ) : (
                      <SheetClose asChild>
                        <Link href="/auth">
                          <Button className="w-full">Login / Register</Button>
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
