import { Link } from "wouter";
import { Heart, Brain, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-doctor/5">
      {/* Navigation Header */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="text-primary h-6 w-6 mr-3" />
              <h1 className="text-xl font-bold text-foreground">MediConnect</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="ghost" data-testid="button-signin">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button data-testid="button-get-started">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            AI-Powered Healthcare
            <span className="text-primary"> Management</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Connect patients, doctors, and pharmacies on one unified platform. Get intelligent recommendations, streamline workflows, and ensure secure communication across all healthcare providers.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-4" data-testid="button-start-journey">
              Start Your Journey
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          {/* Patient Card */}
          <Card className="role-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" data-testid="card-patient">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-patient/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-patient" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Patient</h3>
              <p className="text-muted-foreground mb-4">Manage your health records, book appointments, and get AI-powered health insights.</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-patient mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Personal health records
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-patient mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Appointment booking
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-patient mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI symptom checker
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-patient mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  E-prescriptions
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Doctor Card */}
          <Card className="role-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" data-testid="card-doctor">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-doctor/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-doctor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Doctor</h3>
              <p className="text-muted-foreground mb-4">Manage patient care, appointments, and get AI-assisted diagnostic support.</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-doctor mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Patient management
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-doctor mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Digital prescriptions
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-doctor mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI diagnosis assistance
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-doctor mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Secure communication
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pharmacy Card */}
          <Card className="role-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" data-testid="card-pharmacy">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-pharmacy/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-pharmacy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Pharmacy</h3>
              <p className="text-muted-foreground mb-4">Manage inventory, validate prescriptions, and optimize stock with AI insights.</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-pharmacy mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Inventory management
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-pharmacy mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Prescription validation
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-pharmacy mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI stock optimization
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-pharmacy mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Automated billing
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Powered by AI Intelligence</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Smart Diagnostics</h3>
              <p className="text-sm text-muted-foreground">AI-powered symptom analysis and diagnostic assistance</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-doctor/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-6 w-6 text-doctor" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Secure Platform</h3>
              <p className="text-sm text-muted-foreground">HIPAA-compliant security with encrypted communications</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pharmacy/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-pharmacy" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Smart Analytics</h3>
              <p className="text-sm text-muted-foreground">Predictive insights for better healthcare decisions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/30 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Connected Care</h3>
              <p className="text-sm text-muted-foreground">Seamless communication between all stakeholders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
