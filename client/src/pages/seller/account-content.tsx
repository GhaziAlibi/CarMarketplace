import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  Key,
  AlertTriangle,
  UserCircle,
  Loader2,
  Save,
  Upload,
  Trash2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface AccountContentProps {
  userData: any;
}

// Profile update schema
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  avatar: z.any().optional(),
});

// Password change schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Please confirm your new password" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const AccountContent: React.FC<AccountContentProps> = ({ userData }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userData?.avatar || null);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: userData?.name || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
    }
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const userData = {
        ...values,
        avatar: avatarPreview,
      };
      
      const res = await apiRequest('PATCH', `/api/users/${user?.id}`, userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating profile",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (values: PasswordFormValues) => {
      const res = await apiRequest('POST', `/api/users/${user?.id}/change-password`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      return res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error changing password",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  // Form submission handlers
  const onProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    changePasswordMutation.mutate(values);
  };

  if (!userData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Loading account information...</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Settings
        </CardTitle>
        <CardDescription>
          Manage your account information and security settings
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Password & Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="relative h-32 w-32 rounded-full overflow-hidden border bg-background flex-shrink-0">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile Avatar" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-muted">
                      <UserCircle className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-muted-foreground">Profile Photo</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="avatar-upload"
                      onChange={handleAvatarChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4 pt-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormDescription>
                          Optional contact number for buyers to reach you
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <CardFooter className="border-t pt-6 px-0 pb-0 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    window.history.pushState(null, '', '/seller/dashboard');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                >
                  Cancel
                </Button>
                
                <Button 
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="security">
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <Alert variant="warning" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Security Notice</AlertTitle>
                <AlertDescription>
                  Make sure to use a strong, unique password that you don't use for other accounts.
                </AlertDescription>
              </Alert>
              
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your current password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Use at least 8 characters with a mix of letters, numbers, and symbols
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm your new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <CardFooter className="border-t pt-6 px-0 pb-0 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    window.history.pushState(null, '', '/seller/dashboard');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                >
                  Cancel
                </Button>
                
                <Button 
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AccountContent;