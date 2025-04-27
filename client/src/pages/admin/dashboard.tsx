import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Car,
  Users,
  Store,
  DollarSign,
  Clock,
  ChevronUp,
  ChevronDown,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { UserRole } from "@shared/schema";

const COLORS = ['#1a56db', '#3b82f6', '#f97316', '#10b981', '#ef4444'];

const AdminDashboard: React.FC = () => {
  // Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });
  
  // Fetch cars
  const { data: cars = [] } = useQuery({
    queryKey: ["/api/cars"],
  });
  
  // Fetch showrooms
  const { data: showrooms = [] } = useQuery({
    queryKey: ["/api/showrooms"],
  });
  
  // Count users by role
  const userCounts = {
    total: users.length,
    admin: users.filter((user: any) => user.role === UserRole.ADMIN).length,
    seller: users.filter((user: any) => user.role === UserRole.SELLER).length,
    buyer: users.filter((user: any) => user.role === UserRole.BUYER).length,
  };
  
  // Count cars by category
  const carCategoryCounts = cars.reduce((acc: any, car: any) => {
    acc[car.category] = (acc[car.category] || 0) + 1;
    return acc;
  }, {});
  
  // Count cars by make
  const carMakeCounts = cars.reduce((acc: any, car: any) => {
    acc[car.make] = (acc[car.make] || 0) + 1;
    return acc;
  }, {});
  
  // Prepare data for charts
  const userRoleData = [
    { name: 'Admin', value: userCounts.admin },
    { name: 'Seller', value: userCounts.seller },
    { name: 'Buyer', value: userCounts.buyer },
  ];
  
  const categoryData = Object.entries(carCategoryCounts).map(([name, value]) => ({
    name,
    value,
  }));
  
  const makeData = Object.entries(carMakeCounts).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Sample data for activity charts
  const activityData = [
    { name: 'Jan', listings: 4, sales: 2, users: 10 },
    { name: 'Feb', listings: 7, sales: 5, users: 15 },
    { name: 'Mar', listings: 10, sales: 7, users: 25 },
    { name: 'Apr', listings: 8, sales: 6, users: 20 },
    { name: 'May', listings: 12, sales: 9, users: 30 },
    { name: 'Jun', listings: 15, sales: 11, users: 35 },
  ];
  
  // Recent activities - simulated
  const recentActivities = [
    {
      id: 1,
      type: 'new_listing',
      title: 'New Listing Added',
      description: 'BMW X7 added by Premium Auto',
      time: '10 minutes ago',
      icon: <Plus className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-500',
    },
    {
      id: 2,
      type: 'sale',
      title: 'Sale Completed',
      description: 'Mercedes G63 sold by Luxury Motors',
      time: '2 hours ago',
      icon: <DollarSign className="h-4 w-4" />,
      color: 'bg-green-100 text-green-500',
    },
    {
      id: 3,
      type: 'new_user',
      title: 'New User Registered',
      description: 'John Doe joined as a buyer',
      time: '5 hours ago',
      icon: <Users className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-500',
    },
    {
      id: 4,
      type: 'showroom',
      title: 'New Showroom Created',
      description: 'Elite Automobiles started their shop',
      time: '1 day ago',
      icon: <Store className="h-4 w-4" />,
      color: 'bg-amber-100 text-amber-500',
    },
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage and monitor your marketplace</p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Button asChild>
                <Link href="/admin/listings">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Manage Listings
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Listings</p>
                    <p className="text-2xl font-bold">{cars.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                    <Car className="h-6 w-6" />
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
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
                    <p className="text-2xl font-bold">{userCounts.total}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <div className="flex items-center text-green-500">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>15%</span>
                  </div>
                  <span className="text-gray-500 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Active Showrooms</p>
                    <p className="text-2xl font-bold">{showrooms.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                    <Store className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <div className="flex items-center text-green-500">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>5%</span>
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
                    <p className="text-2xl font-bold">$8.2M</p>
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
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Monthly activity trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="listings" stroke="#1a56db" />
                      <Line type="monotone" dataKey="sales" stroke="#10b981" />
                      <Line type="monotone" dataKey="users" stroke="#f97316" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pie">
                  <TabsList className="mb-4">
                    <TabsTrigger value="pie">Pie Chart</TabsTrigger>
                    <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pie">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userRoleData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {userRoleData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  <TabsContent value="bar">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userRoleData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#1a56db" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activities */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex">
                      <div className={`h-9 w-9 rounded-full ${activity.color} flex items-center justify-center mr-3 flex-shrink-0`}>
                        {activity.icon}
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
            
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>API Services</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Operational
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Database</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Operational
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Storage</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Operational
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Authentication</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Operational
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">Last updated:</span>
                    </div>
                    <span className="text-sm">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
