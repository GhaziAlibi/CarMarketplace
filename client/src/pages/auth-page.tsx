import React, { useState, useEffect } from "react";
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

  // Use useEffect to handle redirection after render
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

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
              {tab === "login"
                ? "Sign in to your account"
                : "Create an account"}
            </h2>
          </div>

          <Tabs
            defaultValue="login"
            value={tab}
            onValueChange={setTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm
                isLoading={loginMutation.isPending}
                onSubmit={loginMutation.mutate}
              />
            </TabsContent>

            <TabsContent value="register">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 text-sm text-blue-700">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Note: Seller accounts can only be created by system administrators. Please contact admin if you need a seller account.
                </p>
              </div>
              <RegisterForm
                isLoading={registerMutation.isPending}
                onSubmit={registerMutation.mutate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right column - Hero section */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1744042246407-f216e4aa80de?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Luxury car showroom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent opacity-60"></div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          <h1 className="text-4xl font-extrabold text-white">
            Join the Premium Car Marketplace
          </h1>
          <p className="mt-4 text-lg text-white">
            Connect with luxury car showrooms, find your dream vehicle, and
            enjoy a seamless buying experience.
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
  const { loginMutation } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  
  // Watch for errors from the login mutation
  useEffect(() => {
    if (loginMutation.isError) {
      const error = loginMutation.error as Error;
      if ((error as any).status === 403) {
        setFormError("Account disabled. Please contact an administrator.");
      } else if (error.message) {
        setFormError(error.message);
      } else {
        setFormError("Invalid username or password.");
      }
    } else {
      setFormError(null);
    }
  }, [loginMutation.isError, loginMutation.error]);

  const handleSubmit = (data: z.infer<typeof loginSchema>) => {
    setFormError(null);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {formError && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 text-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {formError}
            </div>
          </div>
        )}
      
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
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
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
  const form = useForm<
    z.infer<typeof insertUserSchema> & { confirmPassword: string }
  >(formConfig);
  const { registerMutation } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  
  // Watch for errors from the registration mutation
  useEffect(() => {
    if (registerMutation.isError) {
      const error = registerMutation.error as Error;
      
      if (error.message.includes("Username already exists")) {
        setFormError("This username is already taken. Please choose another one.");
      } else if (error.message.includes("Email already exists")) {
        setFormError("An account with this email already exists. Try logging in instead.");
      } else if (error.message) {
        setFormError(error.message);
      } else {
        setFormError("Could not create account. Please try again.");
      }
    } else {
      setFormError(null);
    }
  }, [registerMutation.isError, registerMutation.error]);

  const handleSubmit = (
    data: z.infer<typeof insertUserSchema> & { confirmPassword: string },
  ) => {
    // Remove confirmPassword before submitting
    setFormError(null);
    const { confirmPassword, ...registerData } = data;
    onSubmit(registerData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {formError && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 text-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {formError}
            </div>
          </div>
        )}
      
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
                <Input
                  type="password"
                  placeholder="Create a password"
                  {...field}
                />
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
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  {...field}
                />
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
                  {/* Seller registration disabled - only admins can create seller accounts */}
                  <FormItem className="flex items-center space-x-3 space-y-0 opacity-50">
                    <FormControl>
                      <RadioGroupItem value={UserRole.SELLER} disabled />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Seller - Contact admin to create a seller account
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
