import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CarListingsPage from "@/pages/car-listings-page";
import CarDetailsPage from "@/pages/car-details-page";
import ShowroomsPage from "@/pages/showrooms-page";
import ShowroomDetailsPage from "@/pages/showroom-details-page";
import MessagesPage from "@/pages/messages-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminListings from "@/pages/admin/listings";
import AdminUsers from "@/pages/admin/users";
import SellerDashboardPage from "@/pages/seller/dashboard-seller";
import BuyerSavedCars from "@/pages/buyer/saved-cars";
import BuyerMessages from "@/pages/buyer/messages";
import { UserRole } from "@shared/schema";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/cars" component={CarListingsPage} />
      <Route path="/cars/:id" component={CarDetailsPage} />
      <Route path="/showrooms" component={ShowroomsPage} />
      <Route path="/showrooms/:id" component={ShowroomDetailsPage} />
      
      {/* Protected Routes */}
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/saved-cars" component={BuyerSavedCars} roles={[UserRole.BUYER]} />
      <ProtectedRoute path="/buyer/messages" component={BuyerMessages} roles={[UserRole.BUYER]} />
      
      {/* Seller Routes */}
      <ProtectedRoute path="/seller/dashboard" component={SellerDashboardPage} roles={[UserRole.SELLER]} />
      <ProtectedRoute path="/seller/listings" component={SellerDashboardPage} roles={[UserRole.SELLER]} />
      <ProtectedRoute path="/seller/add-listing" component={SellerDashboardPage} roles={[UserRole.SELLER]} />
      <ProtectedRoute path="/seller/messages" component={SellerDashboardPage} roles={[UserRole.SELLER]} />
      <ProtectedRoute path="/seller/edit-showroom" component={SellerDashboardPage} roles={[UserRole.SELLER]} />
      <ProtectedRoute path="/seller/subscription" component={SellerDashboardPage} roles={[UserRole.SELLER]} />
      <ProtectedRoute path="/seller/account" component={SellerDashboardPage} roles={[UserRole.SELLER]} />
      <ProtectedRoute path="/seller/edit-listing/:id" component={SellerDashboardPage} roles={[UserRole.SELLER]} />
      
      {/* Admin Routes */}
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} roles={[UserRole.ADMIN]} />
      <ProtectedRoute path="/admin/listings" component={AdminListings} roles={[UserRole.ADMIN]} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} roles={[UserRole.ADMIN]} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
