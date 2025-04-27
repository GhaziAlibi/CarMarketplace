import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema, loginSchema, UserRole } from "@shared/schema";
import { useAuth, useLoginForm, useRegisterForm } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

const AuthPage: React.FC = () => {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [tab, setTab] = useState("login");
  
  // If user is already logged in, redirect to home
  if (user) {
    navigate("/");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left column - Auth forms */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-primary">
              Auto<span className="text-accent">Market</span>
            </h2>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {tab === "login" ? "Sign in to your account" : "Create an account"}
            </h2>
          </div>

          <Tabs defaultValue="login" value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm isLoading={loginMutation.isPending} onSubmit={loginMutation.mutate} />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm isLoading={registerMutation.isPending} onSubmit={registerMutation.mutate} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right column - Hero section */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1573044718732-4a1342b7c8a4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Luxury car showroom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent opacity-60"></div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          <h1 className="text-4xl font-extrabold text-white">
            Join the Premium Car Marketplace
          </h1>
          <p className="mt-4 text-lg text-white">
            Connect with luxury car showrooms, find your dream vehicle, and enjoy a seamless buying experience.
          </p>
          <div className="mt-8">
            <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary bg-white">
              Over 500+ premium cars available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LoginFormProps {
  isLoading: boolean;
  onSubmit: (data: z.infer<typeof loginSchema>) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ isLoading, onSubmit }) => {
  const formConfig = useLoginForm();
  const form = useForm<z.infer<typeof loginSchema>>(formConfig);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </Form>
  );
};

interface RegisterFormProps {
  isLoading: boolean;
  onSubmit: (data: z.infer<typeof insertUserSchema>) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ isLoading, onSubmit }) => {
  const formConfig = useRegisterForm();
  const form = useForm<z.infer<typeof insertUserSchema> & { confirmPassword: string }>(formConfig);
  
  const handleSubmit = (data: z.infer<typeof insertUserSchema> & { confirmPassword: string }) => {
    // Remove confirmPassword before submitting
    const { confirmPassword, ...registerData } = data;
    onSubmit(registerData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Choose a username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Create a password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Account Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={UserRole.BUYER} />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Buyer - I want to browse and purchase vehicles
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={UserRole.SELLER} />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Seller - I want to list vehicles for sale
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AuthPage;
