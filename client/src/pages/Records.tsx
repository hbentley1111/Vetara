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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Records() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedPet, setSelectedPet] = useState("all");
  const [viewRecord, setViewRecord] = useState<any>(null);

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
      case 'lab_results': return 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400';
      case 'emergency': return 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400';
      default: return 'bg-slate-700/30 text-slate-400';
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
    <div className="min-h-screen bg-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_50%)]"></div>
      </div>
      
      <div className="relative">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackToDashboard />
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">Medical Records</h1>
                <p className="text-slate-300 text-lg">Manage and view your pets' medical history</p>
              </div>
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Record
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
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
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
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
              <Card key={i} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
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
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-3">
                  {searchTerm || filterType !== "all" || selectedPet !== "all" ? "No records found" : "No medical records"}
                </h3>
                <p className="text-slate-400 mb-6">
                  {searchTerm || filterType !== "all" || selectedPet !== "all" 
                    ? "No records match your current filters. Try adjusting your search criteria."
                    : "Start by uploading your pet's first medical record to keep track of their health history."
                  }
                </p>
                {!searchTerm && filterType === "all" && selectedPet === "all" && (
                  <Button 
                    onClick={() => setShowUploadModal(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25"
                  >
                    Upload First Record
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record: any) => (
              <Card key={record.id} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-700/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getRecordTypeColor(record.recordType)}`}>
                        {getRecordIcon(record.recordType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-200">{record.title}</h3>
                          {record.isEmergency && (
                            <Badge className="bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400">Emergency</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">
                          {record.pet?.name} • {formatDate(record.visitDate)}
                        </p>
                        {record.description && (
                          <p className="text-sm text-slate-500 mb-2 line-clamp-2">{record.description}</p>
                        )}
                        <div className="flex items-center space-x-2">
                          <Badge className={getRecordTypeColor(record.recordType)}>
                            {record.recordType?.replace('_', ' ') || 'Medical Record'}
                          </Badge>
                          {record.diagnosis && (
                            <span className="text-xs text-slate-500">
                              Diagnosis: {record.diagnosis}
                            </span>
                          )}
                          {record.cost && (
                            <span className="text-xs text-slate-500">
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
                        onClick={() => setViewRecord(record)}
                        className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
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
                        className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
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
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  
                  {record.attachments && record.attachments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-sm text-slate-400">
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
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">{medicalRecords.length}</div>
                  <div className="text-sm text-slate-400">Total Records</div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    {medicalRecords.filter((r: any) => r.recordType === 'Vaccination').length}
                  </div>
                  <div className="text-sm text-slate-400">Vaccinations</div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                    {medicalRecords.filter((r: any) => r.recordType === 'Routine Checkup').length}
                  </div>
                  <div className="text-sm text-slate-400">Checkups</div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
                    {medicalRecords.filter((r: any) => r.recordType === 'Surgery' || r.isEmergency).length}
                  </div>
                  <div className="text-sm text-slate-400">Emergency Records</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadRecordModal 
          pets={pets}
          onClose={() => setShowUploadModal(false)} 
        />
      )}

      {/* View Record Modal */}
      <Dialog open={!!viewRecord} onOpenChange={(open) => !open && setViewRecord(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {viewRecord?.title}
            </DialogTitle>
          </DialogHeader>
          
          {viewRecord && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-3">
                <Badge className={getRecordTypeColor(viewRecord.recordType)}>
                  {viewRecord.recordType?.replace('_', ' ') || 'Medical Record'}
                </Badge>
                {viewRecord.isEmergency && (
                  <Badge className="bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400">Emergency</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Pet</p>
                  <p className="text-slate-200 font-medium">{viewRecord.pet?.name || 'Unknown'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Visit Date</p>
                  <p className="text-slate-200 font-medium">{formatDate(viewRecord.visitDate)}</p>
                </div>
              </div>

              {viewRecord.description && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Description</p>
                  <p className="text-slate-200">{viewRecord.description}</p>
                </div>
              )}

              {viewRecord.diagnosis && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Diagnosis</p>
                  <p className="text-slate-200">{viewRecord.diagnosis}</p>
                </div>
              )}

              {viewRecord.treatment && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Treatment</p>
                  <p className="text-slate-200">{viewRecord.treatment}</p>
                </div>
              )}

              {viewRecord.medications && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Medications</p>
                  <p className="text-slate-200">{viewRecord.medications}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {viewRecord.cost && (
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">Cost</p>
                    <p className="text-2xl font-bold text-cyan-400">${viewRecord.cost}</p>
                  </div>
                )}
                {viewRecord.followUpDate && (
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">Follow-up Date</p>
                    <p className="text-slate-200 font-medium">{formatDate(viewRecord.followUpDate)}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => setViewRecord(null)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
