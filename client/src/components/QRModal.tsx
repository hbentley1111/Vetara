import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface QRModalProps {
  pet: any;
  onClose: () => void;
}

export default function QRModal({ pet, onClose }: QRModalProps) {
  const { toast } = useToast();
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const generateQRMutation = useMutation({
    mutationFn: async (petId: number) => {
      const response = await apiRequest("POST", `/api/pets/${petId}/qr`);
      return await response.json();
    },
    onSuccess: (data) => {
      setQrCodeData(data.qrCode);
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
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (pet) {
      generateQRMutation.mutate(pet.id);
    }
  }, [pet]);

  const handleDownload = () => {
    if (!qrCodeData) return;

    // Create a download link for the QR code
    const link = document.createElement('a');
    link.href = qrCodeData;
    link.download = `${pet.name}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    });
  };

  const handlePrint = () => {
    if (!qrCodeData) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code for ${pet.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
              }
              .qr-container { 
                max-width: 400px; 
                margin: 0 auto; 
                border: 2px solid #e5e7eb; 
                border-radius: 8px; 
                padding: 20px; 
              }
              .qr-code { 
                max-width: 300px; 
                height: auto; 
                margin: 20px 0; 
              }
              .pet-info { 
                margin-top: 20px; 
                color: #374151; 
              }
              .instructions { 
                margin-top: 15px; 
                font-size: 14px; 
                color: #6b7280; 
                line-height: 1.5; 
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>Pet ID Tag</h2>
              <img src="${qrCodeData}" alt="QR Code for ${pet.name}" class="qr-code" />
              <div class="pet-info">
                <h3>${pet.name}</h3>
                <p>${pet.breed} • ${pet.species}</p>
              </div>
              <div class="instructions">
                <p><strong>Found this pet?</strong></p>
                <p>Scan this QR code with your phone's camera to access the pet's information and contact the owner.</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!pet) return null;

  return (
    <Dialog open={!!pet} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            QR Code for {pet.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-6">
          {/* QR Code Display */}
          <div className="bg-gray-50 p-6 rounded-lg">
            {generateQRMutation.isPending || !qrCodeData ? (
              <div className="w-48 h-48 mx-auto">
                <Skeleton className="w-full h-full" />
              </div>
            ) : (
              <img
                src={qrCodeData}
                alt={`QR Code for ${pet.name}`}
                className="w-48 h-48 mx-auto border-2 border-white rounded-lg shadow-sm"
              />
            )}
          </div>

          {/* Pet Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
            <p className="text-sm text-gray-600">{pet.breed} • {pet.species}</p>
            {pet.microchipId && (
              <p className="text-xs text-gray-500">Microchip: {pet.microchipId}</p>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg text-left">
            <h4 className="font-medium text-pet-blue mb-2">How to use this QR code:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Print and attach to your pet's collar</li>
              <li>• Anyone can scan to view pet information</li>
              <li>• Helps reunite lost pets with owners</li>
              <li>• Works with any smartphone camera</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleDownload}
              disabled={!qrCodeData}
              className="bg-pet-blue text-white hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </Button>
            
            <Button
              onClick={handlePrint}
              disabled={!qrCodeData}
              variant="outline"
              className="border-pet-blue text-pet-blue hover:bg-pet-blue hover:text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-1a2 2 0 00-2-2H9a2 2 0 00-2 2v1a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </Button>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-gray-600"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
