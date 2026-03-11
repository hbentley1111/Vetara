import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { BackToDashboard } from "@/components/BackToDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Star, MapPin, Phone, Globe, MessageSquare, Search,
  Loader2, Building2, Scissors, ShoppingBag, Navigation2
} from "lucide-react";

export default function Providers() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [zipcode, setZipcode] = useState("");
  const [activeZip, setActiveZip] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, title: "", comment: "", petId: "", isRecommended: true });

  const { data: zipResults, isLoading: zipLoading, error: zipError } = useQuery<{ providers: any[]; location: any }>({
    queryKey: ["/api/service-providers/by-zipcode", activeZip, filterType],
    queryFn: async () => {
      const params = new URLSearchParams({ zipcode: activeZip });
      if (filterType !== "all") params.set("type", filterType);
      const res = await fetch(`/api/service-providers/by-zipcode?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to search");
      return res.json();
    },
    enabled: !!activeZip && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const { data: localProviders = [] } = useQuery<any[]>({
    queryKey: ["/api/service-providers"],
    enabled: isAuthenticated,
  });

  const { data: pets = [] } = useQuery<any[]>({
    queryKey: ["/api/pets"],
    enabled: isAuthenticated,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<any[]>({
    queryKey: ["/api/service-providers", selectedProvider?.id, "reviews"],
    queryFn: async () => {
      const res = await fetch(`/api/service-providers/${selectedProvider.id}/reviews`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedProvider && !selectedProvider.isGooglePlace,
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-providers"] });
      setShowReviewModal(false);
      setReviewData({ rating: 5, title: "", comment: "", petId: "", isRecommended: true });
      toast({ title: "Review submitted!" });
    },
  });

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (zipcode.trim().length >= 4) setActiveZip(zipcode.trim());
  };

  const renderStars = (rating: number, size = "w-4 h-4") => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`${size} ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
      ))}
    </div>
  );

  const getTypeIcon = (serviceType: string) => {
    if (serviceType?.includes("Vet")) return <Building2 className="h-4 w-4 text-cyan-400" />;
    if (serviceType?.includes("Groom")) return <Scissors className="h-4 w-4 text-purple-400" />;
    if (serviceType?.includes("Store")) return <ShoppingBag className="h-4 w-4 text-green-400" />;
    return <Building2 className="h-4 w-4 text-slate-400" />;
  };

  const getTypeBadgeColor = (serviceType: string) => {
    if (serviceType?.includes("Vet")) return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    if (serviceType?.includes("Groom")) return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    if (serviceType?.includes("Store")) return "bg-green-500/20 text-green-300 border-green-500/30";
    return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  };

  const displayProviders = activeZip
    ? (zipResults?.providers || []).filter(p => {
        const term = searchTerm.toLowerCase();
        return !term ||
          p.businessName?.toLowerCase().includes(term) ||
          p.address?.toLowerCase().includes(term);
      })
    : (localProviders as any[]).filter(p => {
        const term = searchTerm.toLowerCase();
        return !term || p.businessName?.toLowerCase().includes(term);
      });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full bg-slate-800" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08),transparent_50%)]"></div>
      </div>

      <div className="relative">
        <Navigation />
        <div className="container mx-auto px-4 py-8 space-y-6">
          <BackToDashboard />

          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Find Pet Care Providers
            </h1>
            <p className="text-slate-400">
              Search real veterinarians, groomers, and pet stores near you using Google
            </p>
          </div>

          {/* Zipcode Search Bar */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-5">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Enter zipcode (e.g. 90210)"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    className="pl-9 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500"
                  />
                </div>
                <Select value={filterType} onValueChange={(v) => { setFilterType(v); if (activeZip) setActiveZip(""); }}>
                  <SelectTrigger className="w-full sm:w-44 bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Veterinarian">Veterinarians</SelectItem>
                    <SelectItem value="Groomer">Groomers</SelectItem>
                    <SelectItem value="Pet Store">Pet Stores</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  disabled={zipcode.trim().length < 4 || zipLoading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6"
                >
                  {zipLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Search
                </Button>
              </form>

              {activeZip && zipResults?.location && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                  <Navigation2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Showing results near <strong className="text-slate-200">{zipResults.location.city}, {zipResults.location.state} {activeZip}</strong></span>
                  <span className="text-slate-600">·</span>
                  <span className="text-cyan-400">{displayProviders.length} results</span>
                  <button onClick={() => { setActiveZip(""); setZipcode(""); }} className="ml-auto text-xs text-slate-500 hover:text-slate-300">Clear</button>
                </div>
              )}

              {activeZip && (
                <div className="mt-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <Input
                      placeholder="Filter results..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 py-1 h-8 text-sm bg-slate-700/30 border-slate-700 text-slate-200 placeholder:text-slate-600"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error */}
          {zipError && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="py-4 text-center text-red-300 text-sm">
                {(zipError as Error).message || "Failed to search. Please try a different zipcode."}
              </CardContent>
            </Card>
          )}

          {/* Loading skeletons */}
          {zipLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-52 w-full bg-slate-800/60" />)}
            </div>
          )}

          {/* No results */}
          {!zipLoading && activeZip && displayProviders.length === 0 && !zipError && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-12 text-center">
                <MapPin className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">No providers found</p>
                <p className="text-slate-500 text-sm mt-1">Try a different zipcode or change the filter type</p>
              </CardContent>
            </Card>
          )}

          {/* Empty state - no search yet */}
          {!activeZip && !zipLoading && displayProviders.length === 0 && (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-7 w-7 text-cyan-400" />
                </div>
                <p className="text-slate-200 font-semibold text-lg">Search by zipcode</p>
                <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Enter a zipcode above to find real vets, groomers, and pet stores near that location using Google</p>
              </CardContent>
            </Card>
          )}

          {/* Results Grid */}
          {!zipLoading && displayProviders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayProviders.map((provider: any) => (
                <Card key={provider.id || provider.googlePlaceId} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/70 transition-all cursor-pointer group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(provider.serviceType)}
                          <Badge className={`text-xs ${getTypeBadgeColor(provider.serviceType)}`}>
                            {provider.serviceType || "Pet Care"}
                          </Badge>
                          {provider.openNow === true && (
                            <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">Open</Badge>
                          )}
                          {provider.openNow === false && (
                            <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">Closed</Badge>
                          )}
                        </div>
                        <CardTitle className="text-base text-slate-100 leading-snug truncate">
                          {provider.businessName}
                        </CardTitle>
                      </div>
                    </div>

                    {provider.rating && parseFloat(provider.rating) > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(parseFloat(provider.rating))}
                        <span className="text-sm font-semibold text-amber-400">{parseFloat(provider.rating).toFixed(1)}</span>
                        {provider.reviewCount && (
                          <span className="text-xs text-slate-500">({provider.reviewCount.toLocaleString()} reviews)</span>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-2 pt-0">
                    {provider.address && (
                      <div className="flex items-start gap-2 text-sm text-slate-400">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-slate-500" />
                        <span className="line-clamp-2">{provider.address}</span>
                      </div>
                    )}
                    {provider.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                        <a href={`tel:${provider.phone}`} className="hover:text-cyan-400 transition-colors">{provider.phone}</a>
                      </div>
                    )}
                    {provider.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                        <a
                          href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors truncate"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-1">
                        {provider.isGooglePlace && (
                          <Badge className="text-xs bg-slate-700/50 text-slate-400 border-slate-600">
                            <img src="https://www.google.com/favicon.ico" className="w-3 h-3 mr-1 inline" alt="" />
                            Google
                          </Badge>
                        )}
                      </div>
                      {provider.isGooglePlace && provider.googlePlaceId && (
                        <a
                          href={`https://www.google.com/maps/place/?q=place_id:${provider.googlePlaceId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="outline" size="sm" className="text-xs bg-slate-700/30 border-slate-600 text-slate-300 hover:text-white h-7">
                            View on Maps
                          </Button>
                        </a>
                      )}
                      {!provider.isGooglePlace && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-slate-700/30 border-slate-600 text-slate-300 hover:text-white h-7"
                          onClick={() => { setSelectedProvider(provider); setShowReviewModal(true); }}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Local providers when no zip search */}
          {!activeZip && !zipLoading && localProviders.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Showing demo providers — enter a zipcode above to search real locations</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(localProviders as any[]).map((provider: any) => (
                  <Card key={provider.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(provider.serviceType)}
                        <Badge className={`text-xs ${getTypeBadgeColor(provider.serviceType)}`}>
                          {provider.serviceType || "Pet Care"}
                        </Badge>
                      </div>
                      <CardTitle className="text-base text-slate-100">{provider.businessName}</CardTitle>
                      {provider.rating && parseFloat(provider.rating) > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(parseFloat(provider.rating))}
                          <span className="text-sm text-amber-400 ml-1">{parseFloat(provider.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      {provider.address && (
                        <div className="flex items-start gap-2 text-sm text-slate-400">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span>{provider.address}</span>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs mt-2 bg-slate-700/30 border-slate-600 text-slate-300"
                        onClick={() => { setSelectedProvider(provider); setShowReviewModal(true); }}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Write Review
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Review {selectedProvider?.businessName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Rating</Label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-7 h-7 cursor-pointer transition-colors ${star <= reviewData.rating ? "fill-amber-400 text-amber-400" : "text-slate-600 hover:text-slate-400"}`}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Title (optional)</Label>
              <Input value={reviewData.title} onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })} placeholder="Brief summary" className="mt-1 bg-slate-800 border-slate-600 text-slate-100" />
            </div>
            <div>
              <Label className="text-slate-300">Comment</Label>
              <Textarea value={reviewData.comment} onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })} placeholder="Share your experience..." rows={3} className="mt-1 bg-slate-800 border-slate-600 text-slate-100" />
            </div>
            {pets.length > 0 && (
              <div>
                <Label className="text-slate-300">Pet (optional)</Label>
                <Select value={reviewData.petId} onValueChange={(v) => setReviewData({ ...reviewData, petId: v })}>
                  <SelectTrigger className="mt-1 bg-slate-800 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select a pet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific pet</SelectItem>
                    {pets.map((pet: any) => <SelectItem key={pet.id} value={pet.id.toString()}>{pet.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch checked={reviewData.isRecommended} onCheckedChange={(v) => setReviewData({ ...reviewData, isRecommended: v })} />
              <Label className="text-slate-300">Would recommend</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowReviewModal(false)} className="border-slate-600 text-slate-300">Cancel</Button>
              <Button onClick={() => reviewMutation.mutate({ ...reviewData, providerId: selectedProvider?.id, petId: reviewData.petId || null })} disabled={reviewMutation.isPending} className="bg-gradient-to-r from-cyan-500 to-blue-500">
                {reviewMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
