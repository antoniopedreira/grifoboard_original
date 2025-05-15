
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get the saved theme preference or use system preference
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) return savedTheme;
  
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
};

// Add theme class to the root element
document.documentElement.classList.add(getInitialTheme());

// Wrap the app in a container with max-width for better layout
const rootElement = document.getElementById("root");
if (rootElement) {
  const container = document.createElement("div");
  container.className = "app-container max-w-[1200px] mx-auto px-4";
  rootElement.appendChild(container);
  
  createRoot(container).render(<App />);
} else {
  console.error("Root element not found");
}
