import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Register from "@/pages/register";
import Login from "@/pages/login";
import PatientDashboard from "@/pages/patient-dashboard";
import DoctorDashboard from "@/pages/doctor-dashboard";
import PharmacyDashboard from "@/pages/pharmacy-dashboard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
        </>
      ) : (
        <>
          <Route path="/" component={() => {
            switch (user?.role) {
              case 'patient':
                return <PatientDashboard />;
              case 'doctor':
                return <DoctorDashboard />;
              case 'pharmacy':
                return <PharmacyDashboard />;
              default:
                return <Landing />;
            }
          }} />
          <Route path="/dashboard" component={() => {
            switch (user?.role) {
              case 'patient':
                return <PatientDashboard />;
              case 'doctor':
                return <DoctorDashboard />;
              case 'pharmacy':
                return <PharmacyDashboard />;
              default:
                return <Landing />;
            }
          }} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
