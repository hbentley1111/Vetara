import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Award, TrendingUp, Shield, Heart, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { BackToDashboard } from "@/components/BackToDashboard";

export default function ProviderGrading() {
  const [searchCity, setSearchCity] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [minRating, setMinRating] = useState("any");

  // Fetch top-rated providers
  const { data: topProviders, isLoading: loadingTop } = useQuery({
    queryKey: ['/api/providers/top-rated'],
  });

  // Fetch providers by quality search
  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ['/api/providers/search-by-quality', searchCity, selectedSpecialty === 'all' ? '' : selectedSpecialty, minRating === 'any' ? '' : minRating],
    enabled: !!(searchCity || (selectedSpecialty && selectedSpecialty !== 'all') || (minRating && minRating !== 'any')),
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-cyan-400 text-cyan-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getQualityGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'bg-green-500', label: 'Exceptional' };
    if (score >= 80) return { grade: 'A', color: 'bg-green-400', label: 'Excellent' };
    if (score >= 70) return { grade: 'B+', color: 'bg-blue-500', label: 'Very Good' };
    if (score >= 60) return { grade: 'B', color: 'bg-blue-400', label: 'Good' };
    return { grade: 'C', color: 'bg-gray-400', label: 'Average' };
  };

  const ProviderCard = ({ provider }: { provider: any }) => {
    const qualityMetrics = provider.qualityMetrics || {};
    const overallRating = parseFloat(qualityMetrics.overallRating || '0');
    const clinicalQuality = getQualityGrade(qualityMetrics.clinicalQualityScore || 0);
    const patientSafety = getQualityGrade(qualityMetrics.patientSafetyScore || 0);
    const patientExperience = getQualityGrade(qualityMetrics.patientExperienceScore || 0);

    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg text-slate-200">
                Dr. {provider.user?.firstName} {provider.user?.lastName}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {provider.businessName} • {provider.city}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">{renderStars(overallRating)}</div>
                <span className="text-sm text-slate-400">
                  {overallRating.toFixed(1)} ({qualityMetrics.totalPatients || 0} patients)
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500">
                A+
              </div>
              <div className="text-xs text-slate-500 mt-1">Overall Grade</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-xs px-2 py-1 rounded text-white bg-gradient-to-r from-blue-500 to-indigo-500">
                A
              </div>
              <div className="text-xs text-slate-500 mt-1">Patient Safety</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="w-5 h-5 text-pink-400" />
              </div>
              <div className="text-xs px-2 py-1 rounded text-white bg-gradient-to-r from-pink-500 to-rose-500">
                A+
              </div>
              <div className="text-xs text-slate-500 mt-1">Patient Experience</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-sm font-medium text-slate-200">
                {qualityMetrics.successRate ? `${parseFloat(qualityMetrics.successRate).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Success Rate</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {provider.specialties?.map((specialty: string, index: number) => (
              <Badge key={index} className="text-xs bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 border-cyan-600/30">
                {specialty}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-slate-300">Communication</div>
              <div className="flex items-center gap-1">
                <div className="flex">{renderStars(parseFloat(qualityMetrics.communicationRating || '0'))}</div>
                <span className="text-xs text-slate-500">
                  {parseFloat(qualityMetrics.communicationRating || '0').toFixed(1)}
                </span>
              </div>
            </div>
            <div>
              <div className="font-medium text-slate-300">Recommendation Rate</div>
              <div className="text-green-400 font-medium">
                {qualityMetrics.recommendationRate ? `${parseFloat(qualityMetrics.recommendationRate).toFixed(1)}%` : 'N/A'}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-600">
            <Button variant="outline" className="w-full bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:text-white">
              View Full Profile & Reviews
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_50%)]"></div>
      </div>
      
      <div className="relative">
        <div className="container mx-auto px-4 py-8">
          <BackToDashboard />
          <div className="mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Find Top-Rated Veterinary Providers
            </h1>
            <p className="text-slate-300 text-lg">
              Quality ratings and patient reviews to help you choose the best care for your pet
            </p>
          </div>

          {/* Search Filters */}
          <Card className="mb-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-200">Search by Quality</CardTitle>
              <CardDescription className="text-slate-400">
                Find providers based on location, specialty, and quality ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="City"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="Emergency">Emergency Medicine</SelectItem>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                    <SelectItem value="Oncology">Oncology</SelectItem>
                    <SelectItem value="Dentistry">Dentistry</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Minimum Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Rating</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4.0">4.0+ Stars</SelectItem>
                    <SelectItem value="3.5">3.5+ Stars</SelectItem>
                    <SelectItem value="3.0">3.0+ Stars</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                  onClick={() => {
                    setSearchCity("");
                    setSelectedSpecialty("all");
                    setMinRating("any");
                  }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quality Metrics Legend */}
          <Card className="mb-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-200">
                <Award className="w-5 h-5 text-cyan-400" />
                Quality Rating System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">Patient Safety</div>
                <div className="text-sm text-gray-600">Complication rates, emergency response</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <div>
                <div className="font-medium">Patient Experience</div>
                <div className="text-sm text-gray-600">Communication, compassion, satisfaction</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">Clinical Quality</div>
                <div className="text-sm text-gray-600">Treatment success, outcomes</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <div className="font-medium">Timeliness</div>
                <div className="text-sm text-gray-600">Appointment availability, wait times</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

          {/* Search Results */}
          {(searchCity || selectedSpecialty || minRating) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-200 mb-4">Search Results</h2>
              {loadingSearch ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Card key={`search-skeleton-${i}`} className="animate-pulse bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                      <CardHeader>
                        <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-slate-600 rounded"></div>
                          <div className="h-3 bg-slate-700 rounded w-4/5"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((provider: any) => (
                    <ProviderCard key={`search-${provider.id}`} provider={provider} />
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="text-center py-8">
                    <p className="text-slate-400">No providers found matching your criteria.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:text-white" 
                      onClick={() => {
                        setSearchCity("");
                        setSelectedSpecialty("all");
                        setMinRating("any");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Top-Rated Providers */}
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-cyan-400" />
              Top-Rated Providers
            </h2>
            {loadingTop ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <Card key={`top-skeleton-${i}`} className="animate-pulse bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                      <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-600 rounded"></div>
                        <div className="h-3 bg-slate-700 rounded w-4/5"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : topProviders && topProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topProviders.map((provider: any) => (
                  <ProviderCard key={`top-${provider.id}`} provider={provider} />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  <p className="text-slate-300 mb-4">
                    No provider ratings available yet. Quality metrics will appear as providers receive reviews and build their track record.
                  </p>
                  <p className="text-sm text-slate-500">
                    The grading system analyzes treatment outcomes, patient satisfaction, and professional metrics to create comprehensive quality scores.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}