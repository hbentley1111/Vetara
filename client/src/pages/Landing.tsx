import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-pet-blue rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">PetCare Pro</span>
            </div>
            <Button 
              onClick={handleLogin}
              className="bg-pet-blue hover:bg-blue-700 text-white font-medium"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Comprehensive Pet Medical Records Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Securely store your pet's medical records, connect with trusted veterinarians, 
            and keep track of your furry friend's health all in one place.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-pet-blue hover:bg-blue-700 text-white font-medium px-8 py-3"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-pet-blue text-pet-blue hover:bg-pet-blue hover:text-white px-8 py-3"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover-lift">
            <CardHeader>
              <div className="p-3 bg-pet-blue bg-opacity-10 rounded-lg w-fit">
                <svg className="w-6 h-6 text-pet-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <CardTitle>Medical Records Management</CardTitle>
              <CardDescription>
                Securely store and organize all your pet's medical history, vaccinations, and health records.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <div className="p-3 bg-pet-green bg-opacity-10 rounded-lg w-fit">
                <svg className="w-6 h-6 text-pet-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <CardTitle>QR Identification Tags</CardTitle>
              <CardDescription>
                Generate QR codes for your pets to help reunite lost pets with their families quickly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <div className="p-3 bg-pet-purple bg-opacity-10 rounded-lg w-fit">
                <svg className="w-6 h-6 text-pet-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <CardTitle>Service Provider Network</CardTitle>
              <CardDescription>
                Connect with trusted veterinarians, groomers, and pet care professionals in your area.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <div className="p-3 bg-pet-amber bg-opacity-10 rounded-lg w-fit">
                <svg className="w-6 h-6 text-pet-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <CardTitle>Appointment Scheduling</CardTitle>
              <CardDescription>
                Schedule and track appointments with veterinarians and other pet care services.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <div className="p-3 bg-pet-pink bg-opacity-10 rounded-lg w-fit">
                <svg className="w-6 h-6 text-pet-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <CardTitle>Secure Sharing</CardTitle>
              <CardDescription>
                Safely share medical records with authorized veterinarians and pet care providers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <div className="p-3 bg-pet-mint bg-opacity-10 rounded-lg w-fit">
                <svg className="w-6 h-6 text-pet-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <CardTitle>Reviews & Ratings</CardTitle>
              <CardDescription>
                Read and write reviews for veterinarians and pet service providers in your community.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-20 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose PetCare Pro?
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of pet owners who trust us with their pet's health information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-pet-blue mb-2">100%</div>
              <div className="text-sm text-gray-600 mb-2">Secure & Private</div>
              <p className="text-sm text-gray-500">
                Your pet's data is encrypted and protected with industry-standard security.
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-pet-green mb-2">24/7</div>
              <div className="text-sm text-gray-600 mb-2">Access Anywhere</div>
              <p className="text-sm text-gray-500">
                Access your pet's records anytime, anywhere from any device.
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-pet-purple mb-2">5★</div>
              <div className="text-sm text-gray-600 mb-2">Trusted Platform</div>
              <p className="text-sm text-gray-500">
                Highly rated by pet owners and veterinary professionals.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-pet-blue to-pet-purple rounded-xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the community of responsible pet owners today.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            variant="secondary"
            className="bg-white text-pet-blue hover:bg-gray-100 font-medium px-8 py-3"
          >
            Create Your Free Account
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-pet-blue rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold">PetCare Pro</span>
              </div>
              <p className="text-gray-400">
                The most trusted platform for pet medical records and veterinary services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Medical Records</li>
                <li>QR Identification</li>
                <li>Service Directory</li>
                <li>Appointment Booking</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Press</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PetCare Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
