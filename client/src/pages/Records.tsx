import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import UploadRecordModal from "@/components/UploadRecordModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackToDashboard } from "@/components/BackToDashboard";

export default function Records() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedPet, setSelectedPet] = useState("all");

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

  const { data: pets = [], isLoading: petsLoading } = useQuery({
    queryKey: ["/api/pets"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: records = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/medical-records"],
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
        description: "Failed to fetch medical records",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (recordId: number) => {
      await apiRequest("DELETE", `/api/medical-records/${recordId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      toast({
        title: "Success",
        description: "Medical record deleted successfully",
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
        description: "Failed to delete medical record",
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

  // Extract the actual medical records from the nested structure
  const medicalRecords = (records as any[]).map((item: any) => ({
    ...item.medical_records,
    pet: item.pet
  }));

  const filteredRecords = medicalRecords.filter((record: any) => {
    const matchesSearch = 
      record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || record.recordType === filterType;
    const matchesPet = selectedPet === "all" || record.petId?.toString() === selectedPet;

    return matchesSearch && matchesType && matchesPet;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'vaccination':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'checkup':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'surgery':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Records</h1>
              <p className="text-gray-600">Manage and view your pets' medical history</p>
            </div>
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="bg-pet-blue text-white hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Record
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Record Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="checkup">Checkup</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="lab_results">Lab Results</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPet} onValueChange={setSelectedPet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Pet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pets</SelectItem>
                  {pets.map((pet: any) => (
                    <SelectItem key={pet.id} value={pet.id.toString()}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setSelectedPet("all");
                }}
                className="border-pet-blue text-pet-blue hover:bg-pet-blue hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <div className="space-y-4">
          {recordsLoading ? (
            // Loading skeletons
            [...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div>
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-32 mb-2" />
                        <div className="flex space-x-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {searchTerm || filterType !== "all" || selectedPet !== "all" ? "No records found" : "No medical records"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterType !== "all" || selectedPet !== "all" 
                    ? "No records match your current filters. Try adjusting your search criteria."
                    : "Start by uploading your pet's first medical record to keep track of their health history."
                  }
                </p>
                {!searchTerm && filterType === "all" && selectedPet === "all" && (
                  <Button 
                    onClick={() => setShowUploadModal(true)}
                    className="bg-pet-blue text-white hover:bg-blue-700"
                  >
                    Upload First Record
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record: any) => (
              <Card key={record.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getRecordTypeColor(record.recordType)}`}>
                        {getRecordIcon(record.recordType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                          {record.isEmergency && (
                            <Badge className="bg-red-100 text-red-800">Emergency</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {record.pet?.name} • {formatDate(record.visitDate)}
                        </p>
                        {record.description && (
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{record.description}</p>
                        )}
                        <div className="flex items-center space-x-2">
                          <Badge className={getRecordTypeColor(record.recordType)}>
                            {record.recordType?.replace('_', ' ') || 'Medical Record'}
                          </Badge>
                          {record.diagnosis && (
                            <span className="text-xs text-gray-500">
                              Diagnosis: {record.diagnosis}
                            </span>
                          )}
                          {record.cost && (
                            <span className="text-xs text-gray-500">
                              Cost: ${record.cost}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-pet-blue text-pet-blue hover:bg-pet-blue hover:text-white"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-pet-green text-pet-green hover:bg-pet-green hover:text-white"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        Share
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteMutation.mutate(record.id)}
                        disabled={deleteMutation.isPending}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  
                  {record.attachments && record.attachments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {record.attachments.length} attachment{record.attachments.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {!recordsLoading && medicalRecords.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pet-blue mb-2">{medicalRecords.length}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pet-green mb-2">
                  {medicalRecords.filter((r: any) => r.recordType === 'Vaccination').length}
                </div>
                <div className="text-sm text-gray-600">Vaccinations</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pet-purple mb-2">
                  {medicalRecords.filter((r: any) => r.recordType === 'Routine Checkup').length}
                </div>
                <div className="text-sm text-gray-600">Checkups</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pet-amber mb-2">
                  {medicalRecords.filter((r: any) => r.recordType === 'Surgery' || r.isEmergency).length}
                </div>
                <div className="text-sm text-gray-600">Emergency Records</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadRecordModal 
          pets={pets}
          onClose={() => setShowUploadModal(false)} 
        />
      )}
    </div>
  );
}
