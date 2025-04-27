import React from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { carSearchSchema } from "@shared/schema";

type SearchFormValues = z.infer<typeof carSearchSchema>;

const SearchForm: React.FC = () => {
  const [_, setLocation] = useLocation();
  
  // Create form with default values
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(carSearchSchema),
    defaultValues: {
      make: "",
      model: "",
      priceRange: "",
    },
  });

  const onSubmit = (data: SearchFormValues) => {
    // Create query string from form data (remove empty values)
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    setLocation(`/cars?${params.toString()}`);
  };

  return (
    <Card className="bg-white shadow-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All Makes" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Makes</SelectItem>
                      <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                      <SelectItem value="BMW">BMW</SelectItem>
                      <SelectItem value="Audi">Audi</SelectItem>
                      <SelectItem value="Porsche">Porsche</SelectItem>
                      <SelectItem value="Lexus">Lexus</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All Models" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Models</SelectItem>
                      <SelectItem value="S-Class">S-Class</SelectItem>
                      <SelectItem value="7 Series">7 Series</SelectItem>
                      <SelectItem value="A8">A8</SelectItem>
                      <SelectItem value="911">911</SelectItem>
                      <SelectItem value="LS">LS</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priceRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Range</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Price" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Any Price</SelectItem>
                      <SelectItem value="0-50000">Under $50,000</SelectItem>
                      <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
                      <SelectItem value="100000-200000">$100,000 - $200,000</SelectItem>
                      <SelectItem value="200000-">$200,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Button type="submit" className="w-full">
              Search Vehicles
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SearchForm;
