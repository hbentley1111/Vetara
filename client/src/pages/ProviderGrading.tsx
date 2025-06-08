import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Award, TrendingUp, Shield, Heart, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";

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
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
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
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                Dr. {provider.user?.firstName} {provider.user?.lastName}
              </CardTitle>
              <CardDescription>
                {provider.businessName} • {provider.city}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">{renderStars(overallRating)}</div>
                <span className="text-sm text-gray-600">
                  {overallRating.toFixed(1)} ({qualityMetrics.totalPatients || 0} patients)
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${clinicalQuality.color}`}>
                {clinicalQuality.grade}
              </div>
              <div className="text-xs text-gray-500 mt-1">Overall Grade</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div className={`text-xs px-2 py-1 rounded text-white ${patientSafety.color}`}>
                {patientSafety.grade}
              </div>
              <div className="text-xs text-gray-500 mt-1">Patient Safety</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <div className={`text-xs px-2 py-1 rounded text-white ${patientExperience.color}`}>
                {patientExperience.grade}
              </div>
              <div className="text-xs text-gray-500 mt-1">Patient Experience</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-sm font-medium">
                {qualityMetrics.successRate ? `${parseFloat(qualityMetrics.successRate).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Success Rate</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {provider.specialties?.map((specialty: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Communication</div>
              <div className="flex items-center gap-1">
                <div className="flex">{renderStars(parseFloat(qualityMetrics.communicationRating || '0'))}</div>
                <span className="text-xs text-gray-500">
                  {parseFloat(qualityMetrics.communicationRating || '0').toFixed(1)}
                </span>
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Recommendation Rate</div>
              <div className="text-green-600 font-medium">
                {qualityMetrics.recommendationRate ? `${parseFloat(qualityMetrics.recommendationRate).toFixed(1)}%` : 'N/A'}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View Full Profile & Reviews
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find Top-Rated Veterinary Providers
        </h1>
        <p className="text-gray-600">
          Quality ratings and patient reviews to help you choose the best care for your pet
        </p>
      </div>

      {/* Search Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Search by Quality</CardTitle>
          <CardDescription>
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
            <Button onClick={() => {
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
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
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
              <Clock className="w-5 h-5 text-orange-500" />
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Search Results</h2>
          {loadingSearch ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((provider: any, index: number) => (
                <ProviderCard key={index} provider={provider} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No providers found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSearchCity("");
                  setSelectedSpecialty("all");
                  setMinRating("any");
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Top-Rated Providers */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-500" />
          Top-Rated Providers
        </h2>
        {loadingTop ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : topProviders && topProviders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProviders.map((provider: any, index: number) => (
              <ProviderCard key={index} provider={provider} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                No provider ratings available yet. Quality metrics will appear as providers receive reviews and build their track record.
              </p>
              <p className="text-sm text-gray-500">
                The grading system analyzes treatment outcomes, patient satisfaction, and professional metrics to create comprehensive quality scores.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}