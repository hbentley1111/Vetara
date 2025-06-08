import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import PetCard from "@/components/PetCard";
import QRModal from "@/components/QRModal";
import AddPetModal from "@/components/AddPetModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BackToDashboard } from "@/components/BackToDashboard";

export default function Pets() {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ["/api/pets"],
    retry: false,
  });

  const handleGenerateQR = (pet: any) => {
    setSelectedPet(pet);
    setShowQRModal(true);
  };

  const filteredPets = pets.filter((pet: any) =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackToDashboard />
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Pets</h1>
              <p className="text-gray-600">Manage your pets and their information</p>
            </div>
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

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search pets by name, breed, or species..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline" className="border-pet-blue text-pet-blue hover:bg-pet-blue hover:text-white">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            [...Array(6)].map((_, i) => (
              <Card key={i} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredPets.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {searchTerm ? "No pets found" : "No pets yet"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? `No pets match your search for "${searchTerm}". Try a different search term.`
                      : "Add your first pet to get started with managing their health records and information."
                    }
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setShowAddPetModal(true)}
                      className="bg-pet-blue text-white hover:bg-blue-700"
                    >
                      Add Your First Pet
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredPets.map((pet: any) => (
              <div key={pet.id}>
                <PetCard 
                  pet={pet} 
                  onGenerateQR={handleGenerateQR}
                  showFullActions={true}
                />
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {!isLoading && pets.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pet-blue mb-2">{pets.length}</div>
                <div className="text-sm text-gray-600">Total Pets</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pet-green mb-2">
                  {pets.filter((pet: any) => pet.species === 'dog').length}
                </div>
                <div className="text-sm text-gray-600">Dogs</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pet-purple mb-2">
                  {pets.filter((pet: any) => pet.species === 'cat').length}
                </div>
                <div className="text-sm text-gray-600">Cats</div>
              </CardContent>
            </Card>
          </div>
        )}
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
    </div>
  );
}
