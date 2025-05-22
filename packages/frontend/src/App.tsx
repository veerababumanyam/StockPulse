import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from 'notistack';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Settings from "./components/Settings";
import { themeClasses } from './lib/theme-constants';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SnackbarProvider maxSnack={3}>
      <ThemeProvider>
        <div className={`min-h-screen ${themeClasses.bg.primary}`}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/markets" element={<Index />} /> {/* Placeholder for Markets page */}
                  <Route path="/portfolio" element={<Index />} /> {/* Placeholder for Portfolio page */}
                  <Route path="/watchlists" element={<Index />} /> {/* Placeholder for Watchlists page */}
                  <Route path="/analytics" element={<Index />} /> {/* Placeholder for Analytics page */}
                  <Route path="/insights" element={<Index />} /> {/* Placeholder for Insights page */}
                  <Route path="/alerts" element={<Index />} /> {/* Placeholder for Alerts page */}
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Index />} /> {/* Placeholder for Help page */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </div>
      </ThemeProvider>
    </SnackbarProvider>
  </QueryClientProvider>
);

export default App;
