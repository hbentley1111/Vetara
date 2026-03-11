import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Pets from "@/pages/Pets";
import Records from "@/pages/Records";
import Providers from "@/pages/Providers";
import ProviderPortal from "@/pages/ProviderPortal";
import ProviderGrading from "@/pages/ProviderGrading";
import Insurance from "@/pages/Insurance";
import MedicalSearch from "@/pages/MedicalSearch";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/pets" component={Pets} />
          <Route path="/records" component={Records} />
          <Route path="/providers" component={Providers} />
          <Route path="/provider-grading" component={ProviderGrading} />
          <Route path="/insurance" component={Insurance} />
          <Route path="/medical-search" component={MedicalSearch} />
          <Route path="/provider-portal" component={ProviderPortal} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Enable dark mode by default to match landing page
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

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
