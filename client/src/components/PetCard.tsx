import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PetCardProps {
  pet: any;
  onGenerateQR: (pet: any) => void;
  showFullActions?: boolean;
}

export default function PetCard({ pet, onGenerateQR, showFullActions = false }: PetCardProps) {
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (petId: number) => {
      await apiRequest("DELETE", `/api/pets/${petId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Pet removed successfully",
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
        description: "Failed to remove pet",
        variant: "destructive",
      });
    },
  });

  const getVaccinationStatus = () => {
    // This would ideally be calculated based on medical records
    // For now, we'll use a simple random status for demonstration
    const statuses = ["Vaccinated", "Due Soon", "Overdue"];
    return statuses[pet.id % 3];
  };

  const getVaccinationStatusColor = (status: string) => {
    switch (status) {
      case "Vaccinated":
        return "bg-pet-green bg-opacity-10 text-pet-green";
      case "Due Soon":
        return "bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600";
      case "Overdue":
        return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "Unknown age";
    
    const birth = new Date(dateOfBirth);
    const now = new Date();
    const ageInMs = now.getTime() - birth.getTime();
    const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365.25));
    const ageInMonths = Math.floor((ageInMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));

    if (ageInYears > 0) {
      return `${ageInYears} year${ageInYears > 1 ? 's' : ''} old`;
    } else if (ageInMonths > 0) {
      return `${ageInMonths} month${ageInMonths > 1 ? 's' : ''} old`;
    } else {
      return "Less than 1 month old";
    }
  };

  const getDefaultPetImage = (species: string) => {
    switch (species?.toLowerCase()) {
      case 'dog':
        return 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face';
      case 'cat':
        return 'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face';
      case 'bird':
        return 'https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face';
      case 'rabbit':
        return 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face';
      default:
        return 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face';
    }
  };

  const vaccinationStatus = getVaccinationStatus();

  return (
    <Card className="hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                src={imageError ? getDefaultPetImage(pet.species) : (pet.photoUrl || getDefaultPetImage(pet.species))}
                alt={`${pet.name} photo`}
                className="h-16 w-16 rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                {pet.microchipId && (
                  <Badge variant="secondary" className="text-xs">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Microchipped
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">{pet.breed}</span> • {formatAge(pet.dateOfBirth)}
              </p>
              <div className="flex items-center space-x-2">
                <Badge className={getVaccinationStatusColor(vaccinationStatus)}>
                  {vaccinationStatus}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {pet.species}
                </Badge>
                {pet.weight && (
                  <span className="text-xs text-gray-500">{pet.weight} lbs</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGenerateQR(pet)}
              className="text-gray-400 hover:text-pet-blue"
              title="Generate QR Code"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-pet-blue"
              title="View Medical Records"
              onClick={() => window.location.href = `/records?pet=${pet.id}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </Button>

            {showFullActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Pet
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule Appointment
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download QR Code
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove ${pet.name}? This action cannot be undone.`)) {
                        deleteMutation.mutate(pet.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {deleteMutation.isPending ? "Removing..." : "Remove Pet"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {pet.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 line-clamp-2">{pet.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
