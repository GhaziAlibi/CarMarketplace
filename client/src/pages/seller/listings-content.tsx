import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Plus, 
  Eye, 
  Settings, 
  Car, 
  Loader2,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ListingsContentProps {
  showroom: any;
  cars: any[];
  isLoadingCars: boolean;
}

const ListingsContent: React.FC<ListingsContentProps> = ({
  showroom,
  cars,
  isLoadingCars
}) => {
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Listings</CardTitle>
            <CardDescription>Manage your vehicle listings</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
            <Button
              onClick={() => {
                window.history.pushState(null, '', '/seller/add-listing');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Listing
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {cars?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Car</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Listed Date</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Inquiries</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cars?.map((car: any) => (
                    <TableRow key={car.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-20 bg-gray-100 rounded overflow-hidden">
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
                        {car.is_sold ? (
                          <div className="flex items-center">
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            <span className="text-red-500">Sold</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            <span className="text-green-500">Available</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(car.createdAt)}</TableCell>
                      <TableCell>158</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/cars/${car.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              window.history.pushState(null, '', `/seller/edit-listing/${car.id}`);
                              window.dispatchEvent(new PopStateEvent('popstate'));
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Edit
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

export default ListingsContent;