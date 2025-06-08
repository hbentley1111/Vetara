import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Heart, Calendar, FileText, Clock, DollarSign, Users, Shield } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function ProviderPortal() {
  const { toast } = useToast();
  const [selectedPet, setSelectedPet] = useState<any>(null);

  // Fetch authorized pets for this provider
  const { data: authorizedPets, isLoading: petsLoading } = useQuery({
    queryKey: ["/api/provider/pets"],
    enabled: true,
  });

  // Fetch medical records for selected pet
  const { data: petRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/provider/pet", selectedPet?.id, "records"],
    enabled: !!selectedPet,
  });

  // Fetch provider subscription status
  const { data: subscription } = useQuery({
    queryKey: ["/api/provider/subscription"],
  });

  // Create subscription mutation
  const createSubscription = useMutation({
    mutationFn: async (subscriptionData: any) => {
      const response = await fetch('/api/provider/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription activated",
        description: "Your trial subscription has been started. You now have access to pet medical records.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/pets"] });
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
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubscription = (tier: string) => {
    const subscriptionData = {
      subscriptionTier: tier,
      monthlyFee: tier === "basic" ? "29.99" : tier === "pro" ? "49.99" : "99.99",
      petsAccessLimit: tier === "basic" ? 50 : tier === "pro" ? 150 : 500,
    };
    createSubscription.mutate(subscriptionData);
  };

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pet Records Provider Portal
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Access authorized pet medical records with our subscription-based platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">Basic</CardTitle>
                <CardDescription>Perfect for small practices</CardDescription>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  $29.99<span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>Up to 50 pet records</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span>Full medical history access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure HIPAA-compliant platform</span>
                </div>
                <Button 
                  onClick={() => handleCreateSubscription("basic")}
                  disabled={createSubscription.isPending}
                  className="w-full"
                >
                  Start 30-Day Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-800 scale-105">
              <CardHeader className="text-center">
                <Badge className="mb-2 bg-green-100 text-green-800">Most Popular</Badge>
                <CardTitle className="text-2xl text-green-600 dark:text-green-400">Pro</CardTitle>
                <CardDescription>For growing veterinary practices</CardDescription>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  $49.99<span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>Up to 150 pet records</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span>Advanced search & filtering</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span>Appointment scheduling integration</span>
                </div>
                <Button 
                  onClick={() => handleCreateSubscription("pro")}
                  disabled={createSubscription.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Start 30-Day Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-purple-600 dark:text-purple-400">Enterprise</CardTitle>
                <CardDescription>For large veterinary networks</CardDescription>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  $99.99<span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>Up to 500 pet records</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span>Priority customer support</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>Custom billing & reporting</span>
                </div>
                <Button 
                  onClick={() => handleCreateSubscription("enterprise")}
                  disabled={createSubscription.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Start 30-Day Trial
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>All plans include a 30-day free trial. Cancel anytime.</p>
            <p className="mt-2">Streamline your practice with instant access to patient medical histories.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Provider Portal</h1>
            <p className="text-gray-600 dark:text-gray-400">Access authorized pet medical records</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="text-green-600 border-green-200">
              {subscription.status === "trial" ? "Trial Active" : "Subscription Active"}
            </Badge>
            <p className="text-sm text-gray-500 mt-1">
              {subscription.subscriptionTier} Plan • {subscription.currentPetsAccessed || 0}/{subscription.petsAccessLimit} pets accessed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Authorized Pets List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Authorized Pets ({authorizedPets?.length || 0})
                </CardTitle>
                <CardDescription>
                  Pets you have permission to access
                </CardDescription>
              </CardHeader>
              <CardContent>
                {petsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    ))}
                  </div>
                ) : authorizedPets?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No authorized pets yet</p>
                    <p className="text-sm mt-1">Pet owners need to grant you access</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {authorizedPets?.map((pet: any) => (
                      <button
                        key={pet.id}
                        onClick={() => setSelectedPet(pet)}
                        className={`w-full p-3 rounded-lg border text-left transition-colors ${
                          selectedPet?.id === pet.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="font-medium">{pet.name}</div>
                        <div className="text-sm text-gray-500">
                          {pet.breed} • {pet.species}
                        </div>
                        <div className="text-xs text-gray-400">
                          Owner: {pet.owner.firstName} {pet.owner.lastName}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pet Details and Medical Records */}
          <div className="lg:col-span-2">
            {selectedPet ? (
              <div className="space-y-6">
                {/* Pet Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      {selectedPet.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedPet.breed} • {selectedPet.species}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Owner</p>
                        <p>{selectedPet.owner.firstName} {selectedPet.owner.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                        <p>{selectedPet.dateOfBirth ? new Date(selectedPet.dateOfBirth).toLocaleDateString() : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Weight</p>
                        <p>{selectedPet.weight ? `${selectedPet.weight} lbs` : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Color</p>
                        <p>{selectedPet.color || "N/A"}</p>
                      </div>
                    </div>
                    {selectedPet.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">Notes</p>
                        <p className="text-sm">{selectedPet.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Medical Records */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Medical Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recordsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : petRecords?.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No medical records found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {petRecords?.map((record: any) => (
                          <div key={record.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{record.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {record.recordType}
                                </Badge>
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(record.visitDate).toLocaleDateString()}
                                </div>
                                {record.veterinarian && (
                                  <div className="mt-1">Dr. {record.veterinarian}</div>
                                )}
                              </div>
                            </div>
                            
                            {record.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {record.description}
                              </p>
                            )}

                            {record.diagnosis && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Diagnosis:</p>
                                <p className="text-sm">{record.diagnosis}</p>
                              </div>
                            )}

                            {record.treatment && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Treatment:</p>
                                <p className="text-sm">{record.treatment}</p>
                              </div>
                            )}

                            {record.medications && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Medications:</p>
                                <p className="text-sm">{record.medications}</p>
                              </div>
                            )}

                            {record.followUpDate && (
                              <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                                <Clock className="h-3 w-3" />
                                Follow-up: {new Date(record.followUpDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a Pet
                  </h3>
                  <p className="text-gray-500">
                    Choose a pet from the left panel to view their medical records
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