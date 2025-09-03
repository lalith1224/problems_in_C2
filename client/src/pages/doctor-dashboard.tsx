import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Heart, Bell, Home, Calendar, Users, Pill, Bot, BarChart3, Video, FileText, Eye, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import AIAssistantModal from "@/components/ai-assistant-modal";

export default function DoctorDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user, profile } = useAuth();
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
    queryKey: ["/api/doctor/dashboard"],
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
    { icon: Calendar, label: "Schedule", href: "#" },
    { icon: Users, label: "Patients", href: "#" },
    { icon: Pill, label: "Prescriptions", href: "#" },
    { icon: Bot, label: "AI Assistant", href: "#", onClick: () => setShowAIModal(true) },
    { icon: BarChart3, label: "Analytics", href: "#" },
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
              <Badge variant="secondary" className="ml-4 bg-doctor/10 text-doctor border-doctor/20">
                Doctor Portal
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground" data-testid="text-doctor-name">
                    Dr. {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(dashboardData as any)?.doctor?.specialization || "General Medicine"} • ID: D{user?.id?.slice(-5)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-doctor/20 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-doctor" />
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

            {/* AI Assistant Panel */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Bot className="h-4 w-4 text-primary mr-2" />
                  <h3 className="font-semibold text-foreground">AI Assistant</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Get diagnostic support and patient insights</p>
                <Button
                  onClick={() => setShowAIModal(true)}
                  className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                  variant="ghost"
                  size="sm"
                  data-testid="button-ai-consult"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  AI Consult
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-doctor/10 to-primary/10 border-border mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Good morning, <span data-testid="text-welcome-doctor">Dr. {user?.firstName || "Doctor"}</span>!
                </h2>
                <p className="text-muted-foreground">
                  You have {(dashboardData as any)?.stats?.todayPatients || 0} appointments scheduled for today.
                </p>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today's Patients</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-today-patients">
                        {(dashboardData as any)?.stats?.todayPatients || 0}
                      </p>
                    </div>
                    <Users className="h-5 w-5 text-patient" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-pending-reviews">
                        {(dashboardData as any)?.stats?.pendingReviews || 0}
                      </p>
                    </div>
                    <FileText className="h-5 w-5 text-doctor" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Prescriptions</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-prescriptions-count">
                        {(dashboardData as any)?.stats?.totalPrescriptions || 0}
                      </p>
                    </div>
                    <Pill className="h-5 w-5 text-pharmacy" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">AI Insights</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-ai-insights">
                        {(dashboardData as any)?.stats?.aiInsights || 0}
                      </p>
                    </div>
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Schedule & Prescription Management */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(dashboardData as any)?.todayAppointments?.length > 0 ? (
                      (dashboardData as any).todayAppointments.slice(0, 3).map((appointment: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 border-l-4 border-l-patient bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">Patient {index + 1}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(appointment.appointmentDate).toLocaleTimeString()} - {appointment.reason || "Consultation"}
                            </p>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              {appointment.status}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" data-testid="button-start-consultation">
                              <Video className="h-4 w-4 text-doctor" />
                            </Button>
                            <Button variant="ghost" size="sm" data-testid="button-view-patient-history">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No appointments scheduled for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Prescription Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(dashboardData as any)?.prescriptions?.length > 0 ? (
                      (dashboardData as any).prescriptions.slice(0, 2).map((prescription: any, index: number) => (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-foreground">Patient {index + 1}</p>
                              <p className="text-sm text-muted-foreground">Patient ID: P{prescription.patientId?.slice(-5)}</p>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {prescription.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Date:</strong> {new Date(prescription.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <Pill className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p>No recent prescriptions</p>
                      </div>
                    )}
                    <Button
                      className="w-full bg-doctor/10 text-doctor hover:bg-doctor/20"
                      variant="ghost"
                      data-testid="button-create-prescription"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Prescription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Patient Overview */}
            <Card className="mt-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Patient Overview</CardTitle>
                <Button variant="link" className="text-sm" data-testid="button-view-all-patients">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Patient</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Visit</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Condition</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboardData as any)?.appointments?.slice(0, 3).map((appointment: any, index: number) => (
                        <tr key={index} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-patient/10 rounded-full flex items-center justify-center">
                                <Heart className="h-4 w-4 text-patient" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Patient {index + 1}</p>
                                <p className="text-xs text-muted-foreground">ID: P{appointment.patientId?.slice(-5)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{appointment.reason || "General"}</td>
                          <td className="p-4">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {appointment.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" data-testid="button-view-patient-details">
                                <Eye className="h-4 w-4 text-doctor" />
                              </Button>
                              <Button variant="ghost" size="sm" data-testid="button-send-message">
                                <MessageCircle className="h-4 w-4 text-primary" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No patient data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal 
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        userRole="doctor"
      />
    </div>
  );
}
