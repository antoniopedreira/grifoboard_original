
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "./context/AuthProvider";
import { RegistryProvider } from "./context/RegistryContext";
import { SidebarProvider } from "./components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <RegistryProvider>
            <SidebarProvider>
              <div className="app-container">
                <AppRoutes />
                <Toaster />
              </div>
            </SidebarProvider>
          </RegistryProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
