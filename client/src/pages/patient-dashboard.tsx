import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Heart, Bell, Home, Calendar, FileText, Pill, Bot, Settings, CalendarPlus, Stethoscope, MapPin, FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import AIAssistantModal from "@/components/ai-assistant-modal";
import { useState } from "react";

export default function PatientDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/patient/dashboard"],
    retry: false,
  });

  if (isLoading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navItems = [
    { icon: Home, label: "Dashboard", href: "#", active: true },
    { icon: Calendar, label: "Appointments", href: "#" },
    { icon: FileText, label: "Medical Records", href: "#" },
    { icon: Pill, label: "Prescriptions", href: "#" },
    { icon: Bot, label: "AI Assistant", href: "#", onClick: () => setShowAIModal(true) },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="text-primary h-5 w-5 mr-3" />
              <h1 className="text-lg font-bold text-foreground">MediConnect</h1>
              <Badge variant="secondary" className="ml-4 bg-patient/10 text-patient border-patient/20">
                Patient Portal
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground" data-testid="text-username">
                    {(user as any)?.firstName} {(user as any)?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid="text-patient-id">Patient ID: P{(user as any)?.id?.slice(-5)}</p>
                </div>
                <div className="w-8 h-8 bg-patient/20 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-patient" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Navigation items={navItems} />

            {/* AI Assistant Quick Access */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Bot className="h-4 w-4 text-primary mr-2" />
                  <h3 className="font-semibold text-foreground">AI Assistant</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Ask me about symptoms or health questions</p>
                <Button
                  onClick={() => setShowAIModal(true)}
                  className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                  variant="ghost"
                  size="sm"
                  data-testid="button-start-chat"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-patient/10 to-primary/10 border-border mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Welcome back, <span data-testid="text-welcome-name">{(user as any)?.firstName || "Patient"}</span>!
                </h2>
                <p className="text-muted-foreground">Here's your health overview for today.</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Next Appointment</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-next-appointment">
                        {(dashboardData as any)?.stats?.nextAppointment ? "Dec 15" : "None"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(dashboardData as any)?.stats?.nextAppointment ? "Dr. Smith" : "Schedule one"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-patient/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-patient" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Prescriptions</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-prescriptions-count">
                        {(dashboardData as any)?.stats?.activePrescriptions || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Current medications</p>
                    </div>
                    <div className="w-12 h-12 bg-doctor/10 rounded-lg flex items-center justify-center">
                      <Pill className="h-6 w-6 text-doctor" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-health-score">
                        {(dashboardData as any)?.stats?.healthScore || 85}
                      </p>
                      <p className="text-sm text-green-600">Good</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities & Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(dashboardData as any)?.appointments?.slice(0, 3).length > 0 ? (
                      (dashboardData as any).appointments.slice(0, 3).map((activity: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-doctor/10 rounded-full flex items-center justify-center">
                            <Stethoscope className="h-4 w-4 text-doctor" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Medical Consultation</p>
                            <p className="text-xs text-muted-foreground">{new Date(activity.appointmentDate).toLocaleDateString()}</p>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No recent activities</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center justify-between p-4 h-auto hover:bg-muted/50"
                      data-testid="button-book-appointment"
                    >
                      <div className="flex items-center">
                        <CalendarPlus className="h-4 w-4 text-patient mr-3" />
                        <span className="font-medium">Book Appointment</span>
                      </div>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center justify-between p-4 h-auto hover:bg-muted/50"
                      onClick={() => setShowAIModal(true)}
                      data-testid="button-symptom-checker"
                    >
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 text-primary mr-3" />
                        <span className="font-medium">AI Symptom Checker</span>
                      </div>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center justify-between p-4 h-auto hover:bg-muted/50"
                      data-testid="button-find-pharmacy"
                    >
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-pharmacy mr-3" />
                        <span className="font-medium">Find Nearby Pharmacy</span>
                      </div>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center justify-between p-4 h-auto hover:bg-muted/50"
                      data-testid="button-view-records"
                    >
                      <div className="flex items-center">
                        <FileStack className="h-4 w-4 text-doctor mr-3" />
                        <span className="font-medium">View Medical Records</span>
                      </div>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            <Card className="mt-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Appointments</CardTitle>
                <Button variant="link" className="text-sm" data-testid="button-view-all-appointments">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {(dashboardData as any)?.appointments?.length > 0 ? (
                  <div className="space-y-4">
                    {(dashboardData as any).appointments.slice(0, 2).map((appointment: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-doctor/10 rounded-lg flex items-center justify-center">
                            <Stethoscope className="h-6 w-6 text-doctor" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Medical Consultation</p>
                            <p className="text-sm text-muted-foreground">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">{appointment.appointmentType}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {appointment.status}
                          </Badge>
                          <Button variant="ghost" size="sm" data-testid="button-reschedule">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming appointments</p>
                    <Button className="mt-4" data-testid="button-schedule-appointment">
                      Schedule Your First Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal 
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        userRole="patient"
      />
    </div>
  );
}
