
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "./context/AuthProvider";
import { RegistryProvider } from "./context/RegistryContext";
import { SidebarProvider } from "./components/ui/sidebar";
import "./App.css";

function App() {
  return (
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
  );
}

export default App;
