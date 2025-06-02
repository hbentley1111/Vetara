import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download, MapPin, Phone, Globe } from "lucide-react";

export default function Providers() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCity, setFilterCity] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    comment: "",
    petId: "",
    isRecommended: true,
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLocation, setImportLocation] = useState({
    latitude: "",
    longitude: "",
    radius: "10000"
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ["/api/service-providers", { city: filterCity, userType: filterType !== "all" ? filterType : undefined }],
    enabled: isAuthenticated,
    retry: false,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to fetch service providers",
        variant: "destructive",
      });
    },
  });

  const { data: pets = [] } = useQuery({
    queryKey: ["/api/pets"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/service-providers", selectedProvider?.id, "reviews"],
    enabled: !!selectedProvider,
    retry: false,
  });

  const importMutation = useMutation({
    mutationFn: async (locationData: any) => {
      await apiRequest("POST", "/api/service-providers/import-radar", locationData);
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-providers"] });
      setShowImportModal(false);
      setImportLocation({ latitude: "", longitude: "", radius: "10000" });
      toast({
        title: "Import Successful",
        description: `${result.imported} businesses imported from your area`,
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Import Failed",
        description: "Failed to import businesses. Please check your location data.",
        variant: "destructive",
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-providers", selectedProvider?.id, "reviews"] });
      setShowReviewModal(false);
      setReviewData({
        rating: 5,
        title: "",
        comment: "",
        petId: "",
        isRecommended: true,
      });
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pet-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredProviders = (providers || []).filter((provider: any) => {
    // Ensure provider has the expected structure
    if (!provider || !provider.service_providers) {
      return false;
    }

    const matchesSearch = searchTerm === '' || (
      provider.service_providers?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.service_providers?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.users?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.users?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesType = filterType === 'all' || provider.service_providers?.userType === filterType;
    const matchesCity = filterCity === '' || provider.service_providers?.city?.toLowerCase().includes(filterCity.toLowerCase());

    return matchesSearch && matchesType && matchesCity;
  });

  const getProviderTypeColor = (type: string | undefined) => {
    if (!type) return 'bg-gray-100 text-gray-600';
    switch (type) {
      case 'veterinarian': return 'bg-pet-blue bg-opacity-10 text-pet-blue';
      case 'groomer': return 'bg-pet-green bg-opacity-10 text-pet-green';
      case 'trainer': return 'bg-pet-purple bg-opacity-10 text-pet-purple';
      case 'pet_sitter': return 'bg-pet-amber bg-opacity-10 text-pet-amber';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getProviderIcon = (type: string | undefined) => {
    if (!type) return null;
    switch (type) {
      case 'veterinarian':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'groomer':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'trainer':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const handleSubmitReview = () => {
    if (!reviewData.title || !reviewData.comment) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({
      ...reviewData,
      providerId: selectedProvider.id,
      petId: reviewData.petId ? parseInt(reviewData.petId) : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Providers</h1>
            <p className="text-gray-600">Find trusted veterinarians, groomers, and pet care professionals</p>
          </div>
          <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
            <DialogTrigger asChild>
              <Button className="bg-pet-blue hover:bg-pet-blue/90">
                <Download className="w-4 h-4 mr-2" />
                Import Real Businesses
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import Real Business Data</DialogTitle>
                <div className="text-sm text-gray-600">
                  Import actual veterinarians, groomers, and pet care professionals from your area using location data.
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    placeholder="e.g., 40.7128"
                    value={importLocation.latitude}
                    onChange={(e) => setImportLocation(prev => ({ ...prev, latitude: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    placeholder="e.g., -74.0060"
                    value={importLocation.longitude}
                    onChange={(e) => setImportLocation(prev => ({ ...prev, longitude: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="radius">Search Radius (meters)</Label>
                  <Input
                    id="radius"
                    placeholder="10000"
                    value={importLocation.radius}
                    onChange={(e) => setImportLocation(prev => ({ ...prev, radius: e.target.value }))}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Tip: You can find your coordinates by searching your location on Google Maps and clicking on your location pin.
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowImportModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => importMutation.mutate(importLocation)}
                    disabled={!importLocation.latitude || !importLocation.longitude || importMutation.isPending}
                  >
                    {importMutation.isPending ? "Importing..." : "Import Businesses"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Provider Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="veterinarian">Veterinarians</SelectItem>
                  <SelectItem value="groomer">Groomers</SelectItem>
                  <SelectItem value="trainer">Trainers</SelectItem>
                  <SelectItem value="pet_sitter">Pet Sitters</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="City..."
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full"
              />

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterCity("");
                }}
                className="border-pet-blue text-pet-blue hover:bg-pet-blue hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providersLoading ? (
            // Loading skeletons
            [...Array(6)].map((_, i) => (
              <Card key={i} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredProviders.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No providers found</h3>
                  <p className="text-gray-600 mb-6">
                    No service providers match your current filters. Try adjusting your search criteria.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredProviders.map((provider: any) => (
              <Card key={provider.service_providers?.id || provider.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 rounded-full ${getProviderTypeColor(provider.service_providers?.userType)}`}>
                      {getProviderIcon(provider.service_providers?.userType)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{provider.service_providers?.businessName}</h3>
                      <p className="text-sm text-gray-600">
                        {provider.users?.firstName} {provider.users?.lastName}
                      </p>
                      <Badge className={getProviderTypeColor(provider.service_providers?.userType)}>
                        {provider.service_providers?.userType?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 mb-3">
                    <div className="flex">
                      {renderStars(parseFloat(provider.service_providers?.rating) || 0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {parseFloat(provider.service_providers?.rating || '0').toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({provider.service_providers?.reviewCount || 0} reviews)
                    </span>
                  </div>

                  {provider.service_providers?.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{provider.service_providers.description}</p>
                  )}

                  {provider.service_providers?.specialties && provider.service_providers.specialties.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {provider.service_providers.specialties.slice(0, 2).map((specialty: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {provider.service_providers.specialties.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{provider.service_providers.specialties.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {provider.service_providers?.city && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {provider.service_providers.city}
                        </div>
                      )}
                      {provider.service_providers?.isVerified && (
                        <div className="flex items-center text-pet-green mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Verified
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedProvider(provider)}
                            className="border-pet-blue text-pet-blue hover:bg-pet-blue hover:text-white"
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-3">
                              <div className={`p-3 rounded-full ${getProviderTypeColor(provider.service_providers?.userType)}`}>
                                {getProviderIcon(provider.service_providers?.userType)}
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold">{provider.service_providers?.businessName}</h3>
                                <p className="text-sm text-gray-600">
                                  {provider.users?.firstName} {provider.users?.lastName}
                                </p>
                              </div>
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="flex items-center space-x-1">
                              <div className="flex">
                                {renderStars(parseFloat(provider.service_providers?.rating || '0'))}
                              </div>
                              <span className="text-sm font-medium">
                                {parseFloat(provider.service_providers?.rating || '0').toFixed(1)}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({provider.service_providers?.reviewCount || 0} reviews)
                              </span>
                            </div>

                            {provider.service_providers?.description && (
                              <div>
                                <h4 className="font-medium mb-2">About</h4>
                                <p className="text-sm text-gray-600">{provider.service_providers.description}</p>
                              </div>
                            )}

                            {provider.service_providers?.specialties && provider.service_providers.specialties.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Specialties</h4>
                                <div className="flex flex-wrap gap-2">
                                  {provider.service_providers.specialties.map((specialty: string, index: number) => (
                                    <Badge key={index} variant="secondary">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {provider.service_providers?.phone && (
                                <div>
                                  <h4 className="font-medium mb-1">Phone</h4>
                                  <p className="text-sm text-gray-600">{provider.service_providers.phone}</p>
                                </div>
                              )}
                              
                              {provider.service_providers?.website && (
                                <div>
                                  <h4 className="font-medium mb-1">Website</h4>
                                  <a 
                                    href={provider.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-pet-blue hover:underline"
                                  >
                                    {provider.website}
                                  </a>
                                </div>
                              )}
                              
                              {provider.address && (
                                <div className="md:col-span-2">
                                  <h4 className="font-medium mb-1">Address</h4>
                                  <p className="text-sm text-gray-600">
                                    {provider.address}, {provider.city}, {provider.state} {provider.zipCode}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex space-x-3">
                              <Button 
                                onClick={() => setShowReviewModal(true)}
                                className="bg-pet-blue text-white hover:bg-blue-700"
                              >
                                Write Review
                              </Button>
                              <Button variant="outline">
                                Schedule Appointment
                              </Button>
                            </div>

                            {/* Reviews Section */}
                            <div>
                              <h4 className="font-medium mb-3">Recent Reviews</h4>
                              {reviewsLoading ? (
                                <div className="space-y-3">
                                  {[1, 2, 3].map((i) => (
                                    <div key={i} className="border rounded-lg p-4">
                                      <Skeleton className="h-4 w-32 mb-2" />
                                      <Skeleton className="h-3 w-full mb-2" />
                                      <Skeleton className="h-3 w-3/4" />
                                    </div>
                                  ))}
                                </div>
                              ) : reviews.length === 0 ? (
                                <p className="text-sm text-gray-500">No reviews yet</p>
                              ) : (
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {reviews.slice(0, 5).map((review: any) => (
                                    <div key={review.id} className="border rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                          <div className="flex">
                                            {renderStars(review.rating)}
                                          </div>
                                          <span className="text-sm font-medium">
                                            {review.reviewer?.firstName || 'Anonymous'}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      {review.title && (
                                        <h5 className="font-medium text-sm mb-1">{review.title}</h5>
                                      )}
                                      <p className="text-sm text-gray-600">{review.comment}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {!providersLoading && providers.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pet-blue mb-2">{providers.length}</div>
                <div className="text-sm text-gray-600">Total Providers</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pet-green mb-2">
                  {providers.filter((p: any) => p.service_providers?.userType === 'veterinarian').length}
                </div>
                <div className="text-sm text-gray-600">Veterinarians</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pet-purple mb-2">
                  {providers.filter((p: any) => p.service_providers?.userType === 'groomer').length}
                </div>
                <div className="text-sm text-gray-600">Groomers</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pet-amber mb-2">
                  {providers.filter((p: any) => p.service_providers?.isVerified).length}
                </div>
                <div className="text-sm text-gray-600">Verified</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center space-x-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className={`w-6 h-6 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="text-sm text-gray-600 ml-2">{reviewData.rating} star{reviewData.rating !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Review Title</Label>
              <Input
                id="title"
                value={reviewData.title}
                onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                placeholder="Brief title for your review"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="comment">Review</Label>
              <Textarea
                id="comment"
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                placeholder="Share your experience..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="pet">Pet (Optional)</Label>
              <Select value={reviewData.petId} onValueChange={(value) => setReviewData({ ...reviewData, petId: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select pet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific pet</SelectItem>
                  {pets.map((pet: any) => (
                    <SelectItem key={pet.id} value={pet.id.toString()}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recommended"
                checked={reviewData.isRecommended}
                onChange={(e) => setReviewData({ ...reviewData, isRecommended: e.target.checked })}
                className="rounded border-gray-300 text-pet-blue focus:ring-pet-blue"
              />
              <Label htmlFor="recommended">I recommend this provider</Label>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleSubmitReview}
                disabled={reviewMutation.isPending}
                className="bg-pet-blue text-white hover:bg-blue-700"
              >
                {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
                disabled={reviewMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
