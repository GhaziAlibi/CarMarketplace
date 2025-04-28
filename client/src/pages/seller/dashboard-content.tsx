import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Car,
  MessageSquare,
  DollarSign,
  Clock,
  ChevronUp,
  Plus,
  Eye,
  Loader2,
  Store,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardContentProps {
  showroom: any;
  cars: any[];
  messages: any[];
  isLoadingCars: boolean;
  isLoadingMessages: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  showroom,
  cars,
  messages,
  isLoadingCars,
  isLoadingMessages
}) => {
  // Filter unread messages
  const unreadMessages = messages.filter((msg: any) => !msg.isRead && msg.receiverId === showroom?.userId);
  
  // Sample data for charts (would be real data in a production app)
  const viewsData = [
    { name: 'Mon', views: 23 },
    { name: 'Tue', views: 45 },
    { name: 'Wed', views: 32 },
    { name: 'Thu', views: 67 },
    { name: 'Fri', views: 89 },
    { name: 'Sat', views: 101 },
    { name: 'Sun', views: 78 },
  ];
  
  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoadingCars) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <>
      {/* Showroom Details */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-white shadow-md overflow-hidden flex-shrink-0">
              <img
                src={showroom?.logo || "https://placehold.co/200x200?text=Showroom"}
                alt={showroom?.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h2 className="text-xl font-bold">{showroom?.name}</h2>
                  <p className="text-gray-500">{showroom?.city}, {showroom?.country}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 text-primary mr-1" />
                      <span>{cars.length} Listings</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 text-primary mr-1" />
                      <span>{unreadMessages.length} Unread Messages</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/showrooms/${showroom?.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Showroom
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" 
                    onClick={() => {
                      window.history.pushState(null, '', '/seller/edit-showroom');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Showroom
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Listings</p>
                <p className="text-2xl font-bold">{cars.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                <Car className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="flex items-center text-green-500">
                <ChevronUp className="h-4 w-4 mr-1" />
                <span>2</span>
              </div>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Views</p>
                <p className="text-2xl font-bold">435</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                <Eye className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="flex items-center text-green-500">
                <ChevronUp className="h-4 w-4 mr-1" />
                <span>12%</span>
              </div>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Sales</p>
                <p className="text-2xl font-bold">$78,500</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="flex items-center text-green-500">
                <ChevronUp className="h-4 w-4 mr-1" />
                <span>8%</span>
              </div>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Listing Views</CardTitle>
            <CardDescription>Daily views for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#1a56db" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Your latest inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMessages ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.slice(0, 5).map((message: any) => (
                  <div key={message.id} className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      message.isRead ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-500'
                    }`}>
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">User #{message.senderId}</p>
                        {!message.isRead && (
                          <Badge variant="secondary" className="bg-accent text-white text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {message.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        <Clock className="inline h-3 w-3 mr-1" /> 
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No messages yet</p>
              </div>
            )}
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => {
                window.history.pushState(null, '', '/seller/messages');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              View All Messages
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Listings */}
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Listings</CardTitle>
            <CardDescription>Manage your vehicle listings</CardDescription>
          </div>
          <Button
            onClick={() => {
              window.history.pushState(null, '', '/seller/add-listing');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {cars.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Car</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Listed Date</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cars.map((car: any) => (
                    <TableRow key={car.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={car.images && car.images[0] ? car.images[0] : "https://placehold.co/100x60?text=No+Image"}
                              alt={car.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{car.title}</div>
                            <div className="text-sm text-gray-500">
                              {car.year} • {car.make} {car.model}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(car.price)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                            ${car.is_sold ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}
                          `}
                        >
                          {car.is_sold ? 'Sold' : 'Available'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(car.createdAt)}</TableCell>
                      <TableCell>158</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/cars/${car.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => {
                              window.history.pushState(null, '', `/seller/edit-listing/${car.id}`);
                              window.dispatchEvent(new PopStateEvent('popstate'));
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Listings Yet</h3>
              <p className="text-gray-500 mb-4">Add your first car listing to start selling</p>
              <Button
                onClick={() => {
                  window.history.pushState(null, '', '/seller/add-listing');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Listing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardContent;