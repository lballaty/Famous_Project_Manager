import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider, useAppContext } from "./contexts/AppContext";
import { AuthForm } from "./components/AuthForm";
import { MainApp } from "./components/MainApp";

const queryClient = new QueryClient();

function AppContent() {
  const { user, setUser } = useAppContext();
  
  if (!user) {
    return <AuthForm onLogin={setUser} />;
  }
  
  return <MainApp />;
}

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;