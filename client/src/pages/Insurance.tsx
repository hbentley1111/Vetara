import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { BackToDashboard } from "@/components/BackToDashboard";
import Navigation from "@/components/Navigation";
import { 
  Shield, 
  TrendingUp, 
  Award, 
  DollarSign, 
  Calendar, 
  Heart,
  CheckCircle,
  AlertTriangle,
  Calculator
} from "lucide-react";

export default function Insurance() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  // Fetch insurance partners
  const { data: insurancePartners = [] } = useQuery({
    queryKey: ["/api/insurance/partners"],
    enabled: isAuthenticated,
  });

  // Fetch user's insurance policies
  const { data: insurancePolicies = [] } = useQuery({
    queryKey: ["/api/insurance/policies"],
    enabled: isAuthenticated,
  });

  // Fetch user's pets
  const { data: pets = [] } = useQuery({
    queryKey: ["/api/pets"],
    enabled: isAuthenticated,
  });

  // Calculate health score mutation
  const calculateHealthScoreMutation = useMutation({
    mutationFn: async (petId: number) => {
      return await apiRequest(`/api/insurance/calculate-discount/${petId}`, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Health Score Calculated",
        description: `Your pet's health score is ${data.score}/100 with ${data.discountEarned}% discount eligibility!`,
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
        description: "Failed to calculate health score. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update insurance discounts mutation
  const updateDiscountsMutation = useMutation({
    mutationFn: async (petId: number) => {
      return await apiRequest(`/api/insurance/update-discounts/${petId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Discounts Updated",
        description: "Your insurance discounts have been recalculated based on your pet's health maintenance!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/insurance/policies"] });
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
        description: "Failed to update discounts. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Please log in to access insurance features</h1>
        <Button onClick={() => window.location.href = "/api/login"}>
          Log In
        </Button>
      </div>
    );
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-cyan-600";
    if (score >= 60) return "text-blue-600";
    return "text-red-600";
  };

  const getDiscountBadgeVariant = (discount: number) => {
    if (discount >= 20) return "default";
    if (discount >= 15) return "secondary";
    if (discount >= 10) return "outline";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_50%)]"></div>
      </div>
      
      <div className="relative">
        <Navigation />
        <div className="container mx-auto p-6 space-y-8">
          <BackToDashboard />
          <div className="flex items-center gap-3 mb-12">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pet Insurance Dashboard</h1>
            <p className="text-muted-foreground">Manage your pet insurance and earn discounts through preventive care</p>
          </div>
        </div>

      {/* Insurance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{insurancePolicies.length}</div>
            <p className="text-xs text-slate-400">
              Across {pets.length} pets
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">
              ${insurancePolicies.reduce((sum: number, policy: any) => {
                const originalPremium = parseFloat(policy.pet_insurance_policies?.premiumAmount || "0");
                const discountedPremium = parseFloat(policy.pet_insurance_policies?.discountedPremium || originalPremium.toString());
                return sum + (originalPremium - discountedPremium);
              }, 0).toFixed(0)}
            </div>
            <p className="text-xs text-slate-400">
              Monthly discount earned
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Avg Health Score</CardTitle>
            <Heart className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">
              {insurancePolicies.length > 0 
                ? Math.round(insurancePolicies.reduce((sum: number, policy: any) => 
                    sum + (policy.pet_insurance_policies?.currentHealthScore || 0), 0) / insurancePolicies.length)
                : 0}/100
            </div>
            <p className="text-xs text-slate-400">
              Across all covered pets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Insurance Partners */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Award className="h-5 w-5 text-cyan-400" />
            Insurance Partners
          </CardTitle>
          <CardDescription className="text-slate-400">
            Our trusted insurance partners offering discounts for preventive care
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insurancePartners.map((partner: any) => (
              <Card key={partner.id} className="bg-slate-700/50 border-slate-600 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-200">{partner.companyName}</CardTitle>
                  <CardDescription className="text-slate-400">{partner.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Base Discount:</span>
                    <Badge className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 border-cyan-600/30">{partner.baseDiscountRate}%</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Max Discount:</span>
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">{partner.maxDiscountRate}%</Badge>
                  </div>
                  {partner.websiteUrl && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3 bg-slate-600/50 border-slate-500 text-slate-300 hover:bg-slate-500/50 hover:text-white"
                      onClick={() => window.open(partner.websiteUrl, '_blank')}
                    >
                      Learn More
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pet Health Scores & Discount Calculator */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Calculator className="h-5 w-5 text-green-400" />
            Health Score Calculator
          </CardTitle>
          <CardDescription className="text-slate-400">
            Calculate your pet's health score to see potential insurance discounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet: any) => {
              const policy = insurancePolicies.find((p: any) => p.pet_insurance_policies?.petId === pet.id);
              const healthScore = policy?.pet_insurance_policies?.currentHealthScore || 0;
              const discountPercentage = parseFloat(policy?.pet_insurance_policies?.discountPercentage || "0");
              
              return (
                <Card key={pet.id} className={`bg-slate-700/50 border-slate-600 backdrop-blur-sm ${selectedPetId === pet.id ? 'border-cyan-500 ring-1 ring-cyan-500/50' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between text-slate-200">
                      {pet.name}
                      {policy && <Badge className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 border-green-600/30">Insured</Badge>}
                    </CardTitle>
                    <CardDescription className="text-slate-400">{pet.breed} • {pet.species}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {healthScore > 0 && (
                      <>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300">Health Score</span>
                            <span className="font-semibold text-cyan-400">
                              {healthScore}/100
                            </span>
                          </div>
                          <Progress value={healthScore} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Current Discount:</span>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            {discountPercentage}%
                          </Badge>
                        </div>
                        
                        {policy && (
                          <div className="text-xs text-slate-400 space-y-1">
                            <div className="flex justify-between">
                              <span>Original Premium:</span>
                              <span>${policy.pet_insurance_policies.premiumAmount}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-slate-200">
                              <span>Discounted Premium:</span>
                              <span>${policy.pet_insurance_policies.discountedPremium}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => calculateHealthScoreMutation.mutate(pet.id)}
                        disabled={calculateHealthScoreMutation.isPending}
                        className="flex-1 bg-slate-600/50 border-slate-500 text-slate-300 hover:bg-slate-500/50 hover:text-white"
                      >
                        <Calculator className="h-4 w-4 mr-1" />
                        Calculate
                      </Button>
                      
                      {policy && (
                        <Button
                          size="sm"
                          onClick={() => updateDiscountsMutation.mutate(pet.id)}
                          disabled={updateDiscountsMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <CheckCircle className="h-5 w-5 text-green-400" />
            How Insurance Discounts Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-200">Health Score Factors</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div>
                    <span className="font-medium text-slate-200">Regular Checkups</span>
                    <p className="text-sm text-slate-400">Up to 30 points for 2+ annual visits</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div>
                    <span className="font-medium text-slate-200">Vaccinations</span>
                    <p className="text-sm text-slate-400">Up to 25 points for up-to-date vaccines</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div>
                    <span className="font-medium text-slate-200">Preventive Care</span>
                    <p className="text-sm text-slate-400">Up to 20 points for dental, grooming</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div>
                    <span className="font-medium text-slate-200">Visit Consistency</span>
                    <p className="text-sm text-slate-400">Up to 25 points for regular care</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-200">Discount Tiers</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                  <span className="text-slate-200">90-100 Score</span>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">25% Discount</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                  <span className="text-slate-200">80-89 Score</span>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">20% Discount</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                  <span className="text-slate-200">70-79 Score</span>
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">15% Discount</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                  <span className="text-slate-200">60-69 Score</span>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">10% Discount</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                  <span className="text-slate-200">50-59 Score</span>
                  <Badge className="bg-gradient-to-r from-slate-600/20 to-slate-500/20 text-slate-300 border-slate-500/30">5% Discount</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}