import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Star,
  Car,
  Loader2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

const AdminListings: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCars, setSelectedCars] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const itemsPerPage = 10;
  
  // Fetch all cars
  const { 
    data: cars = [], 
    isLoading, 
    isError, 
  } = useQuery({
    queryKey: ["/api/cars"],
  });
  
  // Fetch all showrooms to display names
  const { data: showrooms = [] } = useQuery({
    queryKey: ["/api/showrooms"],
  });
  
  // Delete car mutation
  const deleteMutation = useMutation({
    mutationFn: async (carId: number) => {
      await apiRequest("DELETE", `/api/cars/${carId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      toast({
        title: "Car deleted",
        description: "The car listing has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setCarToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete car",
        variant: "destructive",
      });
    },
  });
  
  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (carIds: number[]) => {
      // In a real app, you'd have a bulk delete endpoint
      // For now, we'll delete them one by one
      await Promise.all(carIds.map(id => apiRequest("DELETE", `/api/cars/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      toast({
        title: "Listings deleted",
        description: `${selectedCars.length} listings have been successfully deleted.`,
      });
      setSelectedCars([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete cars",
        variant: "destructive",
      });
    },
  });
  
  // Toggle featured status mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ carId, featured }: { carId: number, featured: boolean }) => {
      await apiRequest("POST", `/api/cars/${carId}/featured`, { featured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      toast({
        title: "Featured status updated",
        description: "The car featured status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update featured status",
        variant: "destructive",
      });
    },
  });
  
  // Filter and sort data
  const filteredCars = cars.filter((car: any) => {
    const matchesSearch = 
      car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !selectedStatus || car.status === selectedStatus;
    const matchesCategory = !selectedCategory || car.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Get showroom name by ID
  const getShowroomName = (showroomId: number) => {
    const showroom = showrooms.find((s: any) => s.id === showroomId);
    return showroom ? showroom.name : "Unknown";
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Handle bulk selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCars(paginatedCars.map((car: any) => car.id));
    } else {
      setSelectedCars([]);
    }
  };
  
  // Handle single selection
  const handleSelectCar = (carId: number, checked: boolean) => {
    if (checked) {
      setSelectedCars([...selectedCars, carId]);
    } else {
      setSelectedCars(selectedCars.filter(id => id !== carId));
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedCars.length > 0) {
      bulkDeleteMutation.mutate(selectedCars);
    }
  };
  
  // Handle single delete
  const handleDelete = (carId: number) => {
    setCarToDelete(carId);
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    if (carToDelete !== null) {
      deleteMutation.mutate(carToDelete);
    }
  };
  
  // Toggle featured status
  const toggleFeatured = (carId: number, currentStatus: boolean) => {
    toggleFeaturedMutation.mutate({
      carId,
      featured: !currentStatus
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" className="mr-4" asChild>
              <Link href="/admin/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Manage Listings</h1>
          </div>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 w-full md:max-w-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search listings..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Truck">Truck</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {selectedCars.length > 0 && (
            <div className="bg-white border rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
              <div>
                <span className="font-medium">{selectedCars.length} items selected</span>
              </div>
              <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteMutation.isPending}>
                {bulkDeleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete Selected
              </Button>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <Card>
              <CardContent className="py-10 flex flex-col items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Error Loading Listings</h3>
                <p className="text-gray-500 mb-4">There was a problem fetching the car listings.</p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cars"] })}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : filteredCars.length === 0 ? (
            <Card>
              <CardContent className="py-10 flex flex-col items-center justify-center">
                <Car className="h-10 w-10 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Listings Found</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedStatus || selectedCategory
                    ? "No cars match your current filters."
                    : "There are no car listings in the system yet."}
                </p>
                {(searchQuery || selectedStatus || selectedCategory) && (
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedStatus("");
                      setSelectedCategory("");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              paginatedCars.length > 0 &&
                              paginatedCars.every((car: any) => 
                                selectedCars.includes(car.id)
                              )
                            }
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>Car</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Showroom</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCars.map((car: any) => (
                        <TableRow key={car.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCars.includes(car.id)}
                              onCheckedChange={(checked) =>
                                handleSelectCar(car.id, checked as boolean)
                              }
                              aria-label={`Select ${car.title}`}
                            />
                          </TableCell>
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
                          <TableCell>{formatCurrency(car.price)}</TableCell>
                          <TableCell>{car.category}</TableCell>
                          <TableCell>{getShowroomName(car.showroomId)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`
                                ${car.status === 'available' ? 'bg-green-50 text-green-700' : ''}
                                ${car.status === 'sold' ? 'bg-red-50 text-red-700' : ''}
                                ${car.status === 'pending' ? 'bg-amber-50 text-amber-700' : ''}
                              `}
                            >
                              {car.status ? car.status.charAt(0).toUpperCase() + car.status.slice(1) : 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFeatured(car.id, car.isFeatured)}
                              disabled={toggleFeaturedMutation.isPending}
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  car.isFeatured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                              <span className="sr-only">Toggle featured</span>
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-5 w-5" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/cars/${car.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(car.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <CardFooter className="border-t px-6 py-4 flex justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCars.length)} of {filteredCars.length} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this car listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminListings;
