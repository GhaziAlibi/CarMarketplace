import React from "react";
import { useSubscription, SubscriptionFeatures, UserSubscription } from "@/hooks/use-subscription";
import { useTranslation } from "react-i18next";
import { SubscriptionTier } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BarChart3, LineChart, PieChart, TrendingUp, Lock, CreditCard } from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Mock data - in a real application, this would come from your backend API
const viewsData = [
  { name: 'Jan', views: 420 },
  { name: 'Feb', views: 380 },
  { name: 'Mar', views: 520 },
  { name: 'Apr', views: 480 },
  { name: 'May', views: 620 },
  { name: 'Jun', views: 580 },
  { name: 'Jul', views: 720 },
  { name: 'Aug', views: 680 },
  { name: 'Sep', views: 820 },
  { name: 'Oct', views: 780 },
  { name: 'Nov', views: 880 },
  { name: 'Dec', views: 940 },
];

const weeklyViewsData = [
  { name: 'Mon', views: 123 },
  { name: 'Tue', views: 145 },
  { name: 'Wed', views: 132 },
  { name: 'Thu', views: 167 },
  { name: 'Fri', views: 189 },
  { name: 'Sat', views: 201 },
  { name: 'Sun', views: 178 },
];

const salesData = [
  { name: 'Jan', sales: 4 },
  { name: 'Feb', sales: 3 },
  { name: 'Mar', sales: 5 },
  { name: 'Apr', sales: 4 },
  { name: 'May', sales: 6 },
  { name: 'Jun', sales: 5 },
  { name: 'Jul', sales: 7 },
  { name: 'Aug', sales: 6 },
  { name: 'Sep', sales: 8 },
  { name: 'Oct', sales: 7 },
  { name: 'Nov', sales: 8 },
  { name: 'Dec', sales: 9 },
];

const sourcesData = [
  { name: 'Direct Traffic', value: 35 },
  { name: 'Search Engines', value: 45 },
  { name: 'Social Media', value: 15 },
  { name: 'Referrals', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Component to display subscription upgrade information
const SubscriptionUpgrade: React.FC<{ subscription: UserSubscription | null | undefined }> = ({ subscription }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center h-[500px] p-6 text-center">
      <div className="w-20 h-20 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <Lock className="h-10 w-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold mb-3">
        {t("analytics.upgradeTitle") || "Analytics Locked"}
      </h2>
      <p className="text-gray-500 mb-6 max-w-md">
        {t("analytics.upgradeDescription") || 
         "Access to detailed analytics is available to Premium and VIP subscription tiers. Upgrade your subscription to unlock insights that will help grow your business."}
      </p>
      <Button className="px-6" onClick={() => {
        window.history.pushState(null, '', '/seller/subscription');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }}>
        <CreditCard className="h-4 w-4 mr-2" />
        {t("analytics.upgradeButton") || "Upgrade Subscription"}
      </Button>
    </div>
  );
};

interface AnalyticsContentProps {
  showroom?: any;
  cars?: any[];
}

const AnalyticsContent: React.FC<AnalyticsContentProps> = ({
  showroom,
  cars = []
}) => {
  const { t } = useTranslation();
  const { subscription, tier, features, isLoading, error } = useSubscription();
  const [activeTab, setActiveTab] = React.useState("overview");
  
  // Display loading indicator while fetching subscription data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Show error message if there was a problem loading subscription
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {t("analytics.errorLoading") || "Failed to load analytics data. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Free users see upgrade prompt
  if (tier === SubscriptionTier.FREE) {
    return <SubscriptionUpgrade subscription={subscription} />;
  }
  
  // Only PREMIUM and VIP tiers can access analytics
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("analytics.title") || "Analytics Dashboard"}</h1>
          <p className="text-muted-foreground">
            {t("analytics.subtitle") || "Track your showroom and car listing performance"}
          </p>
        </div>
        
        {/* Only show this for VIP members */}
        {tier === SubscriptionTier.VIP && (
          <Button variant="outline" onClick={() => window.print()}>
            <TrendingUp className="h-4 w-4 mr-2" />
            {t("analytics.exportReport") || "Export Report"}
          </Button>
        )}
      </div>
      
      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("analytics.totalListings") || "Total Listings"}</p>
                <p className="text-2xl font-bold">{cars.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("analytics.totalViews") || "Total Views"}</p>
                <p className="text-2xl font-bold">2,854</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                <LineChart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("analytics.conversionRate") || "Conversion Rate"}</p>
                <p className="text-2xl font-bold">4.3%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("analytics.trafficSources") || "Traffic Sources"}</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                <PieChart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main tabs for different analytics views */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t("analytics.overview") || "Overview"}</TabsTrigger>
          <TabsTrigger value="traffic">{t("analytics.traffic") || "Traffic"}</TabsTrigger>
          <TabsTrigger value="sources">{t("analytics.sources") || "Sources"}</TabsTrigger>
          {tier === SubscriptionTier.VIP && (
            <TabsTrigger value="advanced">{t("analytics.advanced") || "Advanced"}</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.monthlyViews") || "Monthly Views"}</CardTitle>
              <CardDescription>
                {t("analytics.monthlyViewsDesc") || "Total views tracked across all listings per month"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} views`, 'Views']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="views" fill="#1a56db" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.weeklyViews") || "Weekly Views"}</CardTitle>
              <CardDescription>
                {t("analytics.weeklyViewsDesc") || "Views distribution throughout the week"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={weeklyViewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} views`, 'Views']}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#1a56db" 
                    activeDot={{ r: 8 }} 
                    name="Views"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.trafficSources") || "Traffic Sources"}</CardTitle>
              <CardDescription>
                {t("analytics.trafficSourcesDesc") || "Where your visitors are coming from"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={sourcesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced tab only for VIP subscribers */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.monthlySales") || "Monthly Sales"}</CardTitle>
              <CardDescription>
                {t("analytics.monthlySalesDesc") || "Cars sold per month in the current year"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} cars`, 'Sales']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#10b981" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Additional advanced analytics could be added here */}
        </TabsContent>
      </Tabs>
      
      {/* Subscription tier notice */}
      <Alert className="bg-blue-50 text-blue-800 border-blue-100">
        <AlertTitle>
          {tier === SubscriptionTier.PREMIUM 
            ? (t("analytics.premiumTier") || "Premium Tier Analytics") 
            : (t("analytics.vipTier") || "VIP Tier Analytics")}
        </AlertTitle>
        <AlertDescription>
          {tier === SubscriptionTier.PREMIUM 
            ? (t("analytics.premiumDesc") || "You have access to standard analytics features. Upgrade to VIP for advanced reports and data exports.") 
            : (t("analytics.vipDesc") || "You have full access to all analytics features including advanced reports and data exports.")}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AnalyticsContent;