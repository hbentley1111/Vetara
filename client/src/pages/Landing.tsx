import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleViewDemo = () => {
    // Scroll to features section for demo
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation Header */}
      <nav className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">PetCare Pro</span>
            </div>
            
            {/* Desktop Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
              >
                Health Records
              </button>
              <button 
                onClick={() => document.getElementById('providers-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
              >
                Provider Network
              </button>
              <button 
                onClick={() => document.getElementById('insurance-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
              >
                Insurance
              </button>
              <button 
                onClick={() => document.getElementById('qr-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
              >
                QR Protection
              </button>
              <button 
                onClick={() => document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
              >
                Analytics
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-4 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Button 
                onClick={handleLogin}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-center py-3">
        <p className="text-sm font-medium">
          <button 
            onClick={() => document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="hover:underline"
          >
            Advanced Pet Health Analytics Now Available - Experience the Future
          </button>
        </p>
      </div>

      {/* Hero Section */}
      <div className="relative bg-slate-950 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-slate-800 text-cyan-400 border-slate-700 px-3 py-1">
                  Next-Gen Pet Care Platform
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Advanced Pet Health
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Management</span>
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed">
                  Leverage cutting-edge technology for comprehensive pet health tracking, provider analytics, and intelligent insights that transform veterinary care.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-lg shadow-2xl hover:shadow-cyan-500/25 transition-all transform hover:scale-105"
                >
                  Launch Platform
                </Button>
                <Button 
                  onClick={handleViewDemo}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all"
                >
                  View Demo
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">50K+</div>
                  <div className="text-sm text-slate-400">Pets Protected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">98%</div>
                  <div className="text-sm text-slate-400">Uptime SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">24/7</div>
                  <div className="text-sm text-slate-400">Support</div>
                </div>
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="relative">
              {/* Floating Dashboard */}
              <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 shadow-2xl">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Health Analytics</h3>
                      <p className="text-sm text-slate-400">Real-time insights</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Live</Badge>
                </div>

                {/* Feature Cards */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-slate-200">Medical records encrypted & stored</span>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                        <div className="bg-green-400 h-1.5 rounded-full w-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-slate-200">AI health score: 96/100</span>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                        <div className="bg-blue-400 h-1.5 rounded-full w-[96%]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-slate-200">Smart QR protection active</span>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                        <div className="bg-cyan-400 h-1.5 rounded-full w-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features-section" className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-slate-800 text-cyan-400 border-slate-700 px-4 py-2 mb-4">
              Platform Features
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-6">
              Enterprise-Grade Pet Health Solutions
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Comprehensive toolkit designed for modern veterinary practices and pet owners who demand excellence.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <CardTitle className="text-white">Secure Health Records</CardTitle>
                <CardDescription className="text-slate-300">
                  Military-grade encryption for all medical data with blockchain verification
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature Card 2 */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-white">AI Health Analytics</CardTitle>
                <CardDescription className="text-slate-300">
                  Machine learning algorithms provide predictive health insights
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature Card 3 */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <CardTitle className="text-white">Smart QR Technology</CardTitle>
                <CardDescription className="text-slate-300">
                  Next-gen QR codes with GPS tracking and emergency protocols
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature Card 4 */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle className="text-white">Provider Analytics</CardTitle>
                <CardDescription className="text-slate-300">
                  Advanced metrics and performance insights for veterinary providers
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature Card 5 */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-white">Insurance Integration</CardTitle>
                <CardDescription className="text-slate-300">
                  Seamless integration with major pet insurance providers
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature Card 6 */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <CardTitle className="text-white">24/7 Monitoring</CardTitle>
                <CardDescription className="text-slate-300">
                  Real-time health monitoring and automated alert systems
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

        </div>
      </div>

      {/* Provider Network Section */}
      <div id="providers-section" className="bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-slate-800 text-cyan-400 border-slate-700 px-4 py-2 mb-4">
              Provider Network
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-6">
              Trusted Veterinary Provider Network
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Connect with verified veterinarians, specialists, and pet care providers in your area.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <CardTitle className="text-white">5,000+ Providers</CardTitle>
                <CardDescription className="text-slate-300">
                  Nationwide network of verified veterinary professionals
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <CardTitle className="text-white">Quality Verified</CardTitle>
                <CardDescription className="text-slate-300">
                  All providers undergo rigorous verification and quality assessment
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-white">24/7 Availability</CardTitle>
                <CardDescription className="text-slate-300">
                  Emergency care providers available around the clock
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Insurance Section */}
      <div id="insurance-section" className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-slate-800 text-cyan-400 border-slate-700 px-4 py-2 mb-4">
              Insurance Integration
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-6">
              Smart Insurance Management
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Seamlessly integrate with major pet insurance providers and optimize your coverage.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Health Score Discounts</h3>
                  <p className="text-slate-300">Earn up to 25% insurance discounts based on your pet's health score</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Automated Claims</h3>
                  <p className="text-slate-300">Streamlined claim processing with digital health records</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Coverage Optimization</h3>
                  <p className="text-slate-300">AI-powered recommendations for optimal insurance coverage</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="bg-slate-800/50 border-slate-700 p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Save up to $2,400/year</h3>
                  <p className="text-slate-300 mb-6">Average savings with health score optimization</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Excellent Health (90-100)</span>
                      <span className="text-green-400 font-semibold">25% discount</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Good Health (80-89)</span>
                      <span className="text-blue-400 font-semibold">20% discount</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Fair Health (70-79)</span>
                      <span className="text-yellow-400 font-semibold">15% discount</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* QR Protection Section */}
      <div id="qr-section" className="bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-slate-800 text-cyan-400 border-slate-700 px-4 py-2 mb-4">
              QR Protection Technology
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-6">
              Next-Generation Pet Identification
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Smart QR codes with GPS tracking, emergency protocols, and instant access to critical information.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Card className="bg-slate-800/50 border-slate-700 p-8">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Instant Pet ID</h3>
                  <p className="text-slate-300">Scan to access pet information, medical history, and emergency contacts</p>
                </div>
              </Card>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">GPS Location Tracking</h3>
                  <p className="text-slate-300">Real-time location updates when your pet is found</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Emergency Protocol</h3>
                  <p className="text-slate-300">Automatic alerts to emergency contacts and nearby veterinarians</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Secure & Private</h3>
                  <p className="text-slate-300">End-to-end encryption protects your pet's sensitive information</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div id="analytics-section" className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-slate-800 text-cyan-400 border-slate-700 px-4 py-2 mb-4">
              Advanced Analytics
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-6">
              AI-Powered Health Insights
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Leverage machine learning and predictive analytics to optimize your pet's health outcomes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">96</span>
                </div>
                <CardTitle className="text-white">Health Score</CardTitle>
                <CardDescription className="text-slate-300">
                  AI-calculated overall health rating
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle className="text-white">Trend Analysis</CardTitle>
                <CardDescription className="text-slate-300">
                  Long-term health pattern recognition
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-white">Predictive Alerts</CardTitle>
                <CardDescription className="text-slate-300">
                  Early warning system for health issues
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <CardTitle className="text-white">Provider Ratings</CardTitle>
                <CardDescription className="text-slate-300">
                  Quality metrics for veterinary providers
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">PetCare Pro</span>
              </div>
              <p className="text-slate-400 text-lg mb-6 max-w-md">
                Enterprise-grade pet health management platform for the modern world.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-white">Platform</h3>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <button 
                    onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Health Records
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('qr-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    QR Technology
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('providers-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Provider Network
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Analytics Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleLogin}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    API Access
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-white">Enterprise</h3>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <button 
                    onClick={() => document.getElementById('insurance-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Insurance
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleLogin}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Provider Portal
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleLogin}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('providers-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Directory
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('qr-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Pet Management
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500">&copy; 2025 PetCare Pro. Enterprise-grade pet health solutions.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors text-sm">Privacy</a>
              <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors text-sm">Terms</a>
              <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors text-sm">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
