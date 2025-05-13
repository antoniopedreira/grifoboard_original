
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from './components/ui/toaster' 

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster toastOptions={{
      duration: 5000,
      className: "bg-[#081C2C] text-white border-none"
    }} />
  </>
);
