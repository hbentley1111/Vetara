import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { BackToDashboard } from "@/components/BackToDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Star, MapPin, Phone, Globe, Mail, Calendar, MessageSquare } from "lucide-react";

export default function Providers() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCity, setFilterCity] = useState("");
  const [includeGoogle, setIncludeGoogle] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    comment: "",
    petId: "",
    isRecommended: true,
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
    queryKey: ["/api/service-providers", { 
      city: filterCity, 
      userType: filterType !== "all" ? filterType : undefined,
      includeGoogle: includeGoogle ? 'true' : 'false'
    }],
    enabled: isAuthenticated,
    retry: false
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
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredProviders = (providers as any[]).filter(provider => {
    const matchesSearch = searchTerm === "" || 
      provider.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.specialties?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const handleSubmitReview = () => {
    if (!selectedProvider) return;
    
    reviewMutation.mutate({
      ...reviewData,
      providerId: selectedProvider.id,
      petId: reviewData.petId || null,
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-cyan-400 text-cyan-400' : 'text-slate-600'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_50%)]"></div>
      </div>
      
      <div className="relative">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <BackToDashboard />
          <div className="mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">Service Providers</h1>
            <p className="text-slate-300 text-lg">
              Find trusted veterinarians, groomers, and pet care professionals in your area
            </p>
          </div>

          {/* Search and Filter Controls */}
          <Card className="mb-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
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
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Veterinarian">Veterinarians</SelectItem>
                <SelectItem value="Groomer">Groomers</SelectItem>
                <SelectItem value="Pet Store">Pet Stores</SelectItem>
                <SelectItem value="Emergency Vet">Emergency Vets</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by city..."
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full"
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="google-toggle"
                checked={includeGoogle}
                onCheckedChange={setIncludeGoogle}
              />
                <Label htmlFor="google-toggle" className="text-sm font-medium text-slate-300">
                  Include Google Places
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Providers Grid */}
        {providersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="text-center py-8">
              <p className="text-slate-400">No service providers found matching your criteria.</p>
              {!includeGoogle && (
                <p className="text-sm text-slate-500 mt-2">
                  Try enabling "Include Google Places" for more results.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider: any) => (
              <Card key={provider.id} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-700/40 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-slate-200">{provider.businessName}</CardTitle>
                      <div className="flex items-center mt-2 space-x-2">
                        {provider.specialties?.map((specialty: string) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {provider.isGooglePlace && (
                          <Badge variant="outline" className="text-xs">
                            Google Places
                          </Badge>
                        )}
                      </div>
                    </div>
                    {provider.rating && (
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {renderStars(Math.round(parseFloat(provider.rating) || 0))}
                        </div>
                        <span className="text-sm text-slate-400">
                          ({provider.reviewCount || 0})
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {provider.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {provider.description}
                      </p>
                    )}
                    
                    {provider.address && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{provider.address}</span>
                      </div>
                    )}
                    
                    {provider.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{provider.phone}</span>
                      </div>
                    )}
                    
                    {provider.website && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={provider.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedProvider(provider)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{provider.businessName}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              {provider.specialties?.map((specialty: string) => (
                                <Badge key={specialty} variant="secondary">
                                  {specialty}
                                </Badge>
                              ))}
                              {provider.isGooglePlace && (
                                <Badge variant="outline">Google Places</Badge>
                              )}
                            </div>
                            
                            {provider.description && (
                              <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-muted-foreground">{provider.description}</p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {provider.address && (
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{provider.address}</span>
                                </div>
                              )}
                              
                              {provider.phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{provider.phone}</span>
                                </div>
                              )}
                              
                              {provider.website && (
                                <div className="flex items-center space-x-2">
                                  <Globe className="w-4 h-4 text-muted-foreground" />
                                  <a 
                                    href={provider.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                  >
                                    Visit Website
                                  </a>
                                </div>
                              )}
                            </div>
                            
                            {/* Reviews Section */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold">Reviews</h4>
                                {!provider.isGooglePlace && (
                                  <Button
                                    size="sm"
                                    onClick={() => setShowReviewModal(true)}
                                  >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Write Review
                                  </Button>
                                )}
                              </div>
                              
                              {reviewsLoading ? (
                                <div className="space-y-2">
                                  {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                  ))}
                                </div>
                              ) : (reviews as any[]).length === 0 ? (
                                <p className="text-muted-foreground text-sm">No reviews yet.</p>
                              ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                  {(reviews as any[]).map((review: any) => (
                                    <div key={review.id} className="border-b pb-3 last:border-b-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <div className="flex">
                                          {renderStars(review.rating)}
                                        </div>
                                        <span className="font-medium text-sm">
                                          {review.reviewer?.firstName} {review.reviewer?.lastName}
                                        </span>
                                      </div>
                                      {review.title && (
                                        <h5 className="font-medium text-sm mb-1">{review.title}</h5>
                                      )}
                                      {review.comment && (
                                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {!provider.isGooglePlace && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedProvider(provider);
                            setShowReviewModal(true);
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Modal */}
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Review for {selectedProvider?.businessName}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="rating">Rating</Label>
                <div className="flex items-center space-x-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 cursor-pointer ${
                        star <= reviewData.rating ? 'fill-cyan-400 text-cyan-400' : 'text-gray-300'
                      }`}
                      onClick={() => setReviewData({...reviewData, rating: star})}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={reviewData.title}
                  onChange={(e) => setReviewData({...reviewData, title: e.target.value})}
                  placeholder="Brief summary of your experience"
                />
              </div>
              
              <div>
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  placeholder="Share your experience..."
                  rows={4}
                />
              </div>
              
              {(pets as any[]).length > 0 && (
                <div>
                  <Label htmlFor="pet">Pet (Optional)</Label>
                  <Select 
                    value={reviewData.petId} 
                    onValueChange={(value) => setReviewData({...reviewData, petId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific pet</SelectItem>
                      {(pets as any[]).map((pet: any) => (
                        <SelectItem key={pet.id} value={pet.id.toString()}>
                          {pet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="recommended"
                  checked={reviewData.isRecommended}
                  onCheckedChange={(checked) => setReviewData({...reviewData, isRecommended: checked})}
                />
                <Label htmlFor="recommended">Would you recommend this provider?</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReviewModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitReview}
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}