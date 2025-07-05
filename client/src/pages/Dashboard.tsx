import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { BackToDashboard } from "@/components/BackToDashboard";
import PetCard from "@/components/PetCard";
import QRModal from "@/components/QRModal";
import AddPetModal from "@/components/AddPetModal";
import UploadRecordModal from "@/components/UploadRecordModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);

  // Demo data mutation
  const demoDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/seed-demo-data", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      toast({
        title: "Success",
        description: "Demo data has been added to your account",
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
        description: "Failed to add demo data",
        variant: "destructive",
      });
    },
  });

  // Redirect to home if not authenticated
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

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: pets = [], isLoading: petsLoading } = useQuery({
    queryKey: ["/api/pets"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: recentRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/medical-records"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ["/api/service-providers/top-rated"],
    enabled: isAuthenticated,
    retry: false,
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

  const handleGenerateQR = (pet: any) => {
    setSelectedPet(pet);
    setShowQRModal(true);
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'No date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination': return 'bg-pet-green bg-opacity-10 text-pet-green';
      case 'checkup': return 'bg-pet-blue bg-opacity-10 text-pet-blue';
      case 'surgery': return 'bg-pet-purple bg-opacity-10 text-pet-purple';
      case 'lab_results': return 'bg-pet-amber bg-opacity-10 text-pet-amber';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Get recent records (last 5)
  const recentMedicalRecords = Array.isArray(recentRecords) ? recentRecords.slice(0, 5) : [];
  
  // Get upcoming appointments
  const upcomingAppointments = Array.isArray(appointments) 
    ? appointments
        .filter(apt => new Date(apt.scheduledDate) > new Date() && apt.status === 'scheduled')
        .slice(0, 3)
    : [];

  // Get top providers
  const topProviders = Array.isArray(providers) 
    ? providers.slice(0, 3)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackToDashboard />
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back!
          </h1>
          <p className="text-muted-foreground">
            Manage your pets' health records and connect with trusted service providers.
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">My Pets</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-8 mt-2" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{stats?.totalPets || 0}</p>
                  )}
                </div>
                <div className="bg-pet-blue bg-opacity-10 p-3 rounded-lg">
                  <svg className="h-6 w-6 text-pet-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Checkups</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-8 mt-2" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{stats?.recentCheckups || 0}</p>
                  )}
                </div>
                <div className="bg-pet-green bg-opacity-10 p-3 rounded-lg">
                  <svg className="h-6 w-6 text-pet-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming Appointments</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-8 mt-2" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{stats?.upcomingAppointments || 0}</p>
                  )}
                </div>
                <div className="bg-pet-amber bg-opacity-10 p-3 rounded-lg">
                  <svg className="h-6 w-6 text-pet-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Vaccinations</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-8 mt-2" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{stats?.dueVaccinations || 0}</p>
                  )}
                </div>
                <div className="bg-pet-purple bg-opacity-10 p-3 rounded-lg">
                  <svg className="h-6 w-6 text-pet-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Pets Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">My Pets</CardTitle>
                  <div className="flex space-x-2">
                    {(pets as any[]).length === 0 && (
                      <Button 
                        onClick={() => demoDataMutation.mutate()}
                        disabled={demoDataMutation.isPending}
                        variant="outline"
                        className="border-pet-purple text-pet-purple hover:bg-pet-purple hover:text-white"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        {demoDataMutation.isPending ? "Adding Demo Data..." : "Add Demo Data"}
                      </Button>
                    )}
                    <Button 
                      onClick={() => setShowAddPetModal(true)}
                      className="bg-pet-blue text-white hover:bg-blue-700"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Pet
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {petsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-32 mb-2" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pets.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pets yet</h3>
                    <p className="text-gray-600 mb-4">Add your first pet to get started with managing their health records.</p>
                    <Button 
                      onClick={() => setShowAddPetModal(true)}
                      className="bg-pet-blue text-white hover:bg-blue-700"
                    >
                      Add Your First Pet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pets.map((pet: any) => (
                      <PetCard 
                        key={pet.id} 
                        pet={pet} 
                        onGenerateQR={handleGenerateQR}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Records Section */}
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">Recent Medical Records</CardTitle>
                  <Button 
                    variant="ghost" 
                    className="text-pet-blue hover:text-blue-700"
                    onClick={() => window.location.href = '/records'}
                  >
                    View All Records
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recordsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24 mb-1" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentMedicalRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records</h3>
                    <p className="text-gray-600 mb-4">Start by uploading your pet's medical records to keep track of their health.</p>
                    <Button 
                      onClick={() => setShowUploadModal(true)}
                      className="bg-pet-blue text-white hover:bg-blue-700"
                    >
                      Upload First Record
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentMedicalRecords.map((record: any) => (
                      <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-pet-green bg-opacity-10 rounded-lg">
                            <svg className="w-5 h-5 text-pet-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{record.title || record.medical_records?.title}</h4>
                            <p className="text-sm text-gray-600">{formatDate(record.visitDate || record.medical_records?.visitDate)}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getRecordTypeColor(record.recordType || record.medical_records?.recordType)}>
                                {(record.recordType || record.medical_records?.recordType)?.replace('_', ' ') || 'Medical Record'}
                              </Badge>
                              {(record.pet || record.pets) && (
                                <span className="text-xs text-gray-500">{record.pet?.name || record.pets?.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-pet-blue hover:text-blue-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setShowUploadModal(true)}
                  className="w-full bg-pet-blue text-white hover:bg-blue-700 justify-start"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Medical Records
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-pet-green text-pet-green hover:bg-pet-green hover:text-white justify-start"
                  onClick={() => window.location.href = '/providers'}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Veterinarians
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-pet-purple text-pet-purple hover:bg-pet-purple hover:text-white justify-start"
                  onClick={() => setShowQRModal(true)}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Generate QR Codes
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-3 border border-gray-200 rounded-lg">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-3 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">No upcoming appointments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment: any) => (
                      <div key={appointment.id} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{appointment.pet?.name}</h4>
                            <p className="text-sm text-gray-600">{appointment.appointmentType}</p>
                            <p className="text-sm text-pet-blue font-medium">
                              {formatDate(appointment.scheduledDate)}
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-pet-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Providers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Recommended Providers</CardTitle>
              </CardHeader>
              <CardContent>
                {providersLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : topProviders.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">No providers found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topProviders.map((provider: any) => (
                      <div key={provider.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{provider.businessName}</h4>
                          <p className="text-sm text-gray-600">{provider.specialties?.[0] || 'General Practice'}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={`star-${provider.id}-${i}`} className={`w-3 h-3 ${i < Math.floor(parseFloat(provider.qualityMetrics?.overallRating || '0')) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {provider.qualityMetrics?.overallRating || '0.0'} ({provider.qualityMetrics?.dataPoints || 0} reviews)
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            B+ Rated
                          </span>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      className="w-full text-pet-blue hover:text-blue-700 text-sm"
                      onClick={() => window.location.href = '/providers'}
                    >
                      View All Providers
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showQRModal && (
        <QRModal 
          pet={selectedPet} 
          onClose={() => setShowQRModal(false)} 
        />
      )}
      
      {showAddPetModal && (
        <AddPetModal 
          onClose={() => setShowAddPetModal(false)} 
        />
      )}
      
      {showUploadModal && (
        <UploadRecordModal 
          pets={pets}
          onClose={() => setShowUploadModal(false)} 
        />
      )}
    </div>
  );
}
