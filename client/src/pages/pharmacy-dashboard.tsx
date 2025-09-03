import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Heart, Bell, Home, Pill, Package, Truck, Bot, Receipt, Clock, AlertTriangle, DollarSign, Brain, Plus, CheckCircle, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import AIAssistantModal from "@/components/ai-assistant-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function PharmacyDashboard() {
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
    queryKey: ["/api/pharmacy/dashboard"],
    retry: false,
  });

  const updatePrescriptionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/prescriptions/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/dashboard"] });
      toast({
        title: "Prescription updated",
        description: "Prescription status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
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
    { icon: Pill, label: "Prescriptions", href: "#" },
    { icon: Package, label: "Inventory", href: "#" },
    { icon: Truck, label: "Orders", href: "#" },
    { icon: Bot, label: "AI Assistant", href: "#", onClick: () => setShowAIModal(true) },
    { icon: Receipt, label: "Billing", href: "#" },
  ];

  const handleApprovePrescription = (prescriptionId: string) => {
    updatePrescriptionMutation.mutate({ id: prescriptionId, status: "approved" });
  };

  const handleRequestClarification = (prescriptionId: string) => {
    toast({
      title: "Clarification requested",
      description: "A message has been sent to the prescribing doctor.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="text-primary h-5 w-5 mr-3" />
              <h1 className="text-lg font-bold text-foreground">MediConnect</h1>
              <Badge variant="secondary" className="ml-4 bg-pharmacy/10 text-pharmacy border-pharmacy/20">
                Pharmacy Portal
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground" data-testid="text-pharmacy-name">
                    {(dashboardData as any)?.pharmacy?.pharmacyName || "MedPharm Central"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    License: {(dashboardData as any)?.pharmacy?.licenseNumber?.slice(-6) || "PH67890"}
                  </p>
                </div>
                <div className="w-8 h-8 bg-pharmacy/20 rounded-full flex items-center justify-center">
                  <Pill className="h-4 w-4 text-pharmacy" />
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
                <p className="text-xs text-muted-foreground mb-3">Get inventory optimization and billing support</p>
                <Button
                  onClick={() => setShowAIModal(true)}
                  className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                  variant="ghost"
                  size="sm"
                  data-testid="button-ai-insights"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  AI Insights
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-pharmacy/10 to-primary/10 border-border mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Good morning, <span data-testid="text-welcome-pharmacy">{(dashboardData as any)?.pharmacy?.pharmacyName || "MedPharm Central"}</span>!
                </h2>
                <p className="text-muted-foreground">
                  You have {(dashboardData as any)?.stats?.pendingOrders || 0} new prescriptions to process today.
                </p>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-pending-orders">
                        {(dashboardData as any)?.stats?.pendingOrders || 0}
                      </p>
                    </div>
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-low-stock">
                        {(dashboardData as any)?.stats?.lowStockCount || 0}
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-revenue">
                        ${(dashboardData as any)?.stats?.todayRevenue || 0}
                      </p>
                    </div>
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">AI Recommendations</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-ai-recommendations">
                        {(dashboardData as any)?.stats?.aiRecommendations || 0}
                      </p>
                    </div>
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prescriptions & Inventory */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* New Prescriptions */}
              <Card>
                <CardHeader>
                  <CardTitle>New Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(dashboardData as any)?.newPrescriptions?.length > 0 ? (
                      (dashboardData as any).newPrescriptions.map((prescription: any, index: number) => (
                        <div key={prescription.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-foreground">Patient {index + 1}</p>
                              <p className="text-sm text-muted-foreground">
                                Dr. {prescription.doctorId?.slice(-3)} • {new Date(prescription.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {prescription.status}
                            </Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="text-foreground"><strong>Instructions:</strong> {prescription.instructions || "Follow label directions"}</p>
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <Button
                              size="sm"
                              className="bg-doctor text-white hover:bg-doctor/90"
                              onClick={() => handleApprovePrescription(prescription.id)}
                              disabled={updatePrescriptionMutation.isPending}
                              data-testid="button-approve-prescription"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestClarification(prescription.id)}
                              data-testid="button-request-clarification"
                            >
                              Clarify
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No new prescriptions</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Inventory Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(dashboardData as any)?.lowStockItems?.length > 0 ? (
                      (dashboardData as any).lowStockItems.map((item: any, index: number) => (
                        <div key={item.id} className="border-l-4 border-l-orange-500 bg-orange-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-foreground">{item.medicineName}</p>
                              <p className="text-sm text-muted-foreground">Stock: {item.currentStock} remaining</p>
                              <p className="text-xs text-orange-600 font-medium">Reorder suggested</p>
                            </div>
                            <Button variant="ghost" size="sm" data-testid="button-reorder-medicine">
                              <Plus className="h-4 w-4 text-pharmacy" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <Package className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p>All items in stock</p>
                      </div>
                    )}

                    {(dashboardData as any)?.expiringItems?.length > 0 && (
                      (dashboardData as any).expiringItems.slice(0, 2).map((item: any, index: number) => (
                        <div key={item.id} className="border-l-4 border-l-yellow-500 bg-yellow-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-foreground">{item.medicineName}</p>
                              <p className="text-sm text-muted-foreground">Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>
                              <p className="text-xs text-yellow-600 font-medium">Expiring soon</p>
                            </div>
                            <Button variant="ghost" size="sm" data-testid="button-manage-expiry">
                              <Calendar className="h-4 w-4 text-yellow-600" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}

                    {/* AI Recommendations */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Brain className="h-4 w-4 text-primary mr-2" />
                        <h4 className="font-semibold text-foreground">AI Recommendation</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Based on recent trends, consider stocking up on flu medications for winter season.</p>
                      <Button variant="link" size="sm" className="text-primary p-0 h-auto mt-2" data-testid="button-view-ai-recommendations">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="mt-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button variant="link" className="text-sm" data-testid="button-view-all-transactions">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Patient</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Medication</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Doctor</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboardData as any)?.newPrescriptions?.slice(0, 3).map((prescription: any, index: number) => (
                        <tr key={prescription.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-foreground">Patient {index + 1}</p>
                              <p className="text-xs text-muted-foreground">{"2 hours ago"}</p>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">Medication prescribed</td>
                          <td className="p-4 text-sm text-muted-foreground">Dr. {prescription.doctorId?.slice(-3)}</td>
                          <td className="p-4 text-sm font-medium text-foreground">$45.80</td>
                          <td className="p-4">
                            <Badge variant="secondary" className={
                              prescription.status === 'approved' ? "bg-green-100 text-green-800" :
                              prescription.status === 'dispensed' ? "bg-blue-100 text-blue-800" :
                              "bg-yellow-100 text-yellow-800"
                            }>
                              {prescription.status}
                            </Badge>
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No recent transactions
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
        userRole="pharmacy"
      />
    </div>
  );
}
