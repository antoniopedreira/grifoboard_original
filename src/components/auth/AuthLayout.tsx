import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

const AuthLayout = ({ children, title }: AuthLayoutProps) => {
  return (
    <div className="h-screen w-full fixed inset-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Construction grid pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 10c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zm0 20c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zm0 20c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zM10 36c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm20 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm20 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} 
        />
      </div>
      
      {/* Geometric shapes for construction theme */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-slate-700/30 rotate-45 rounded-lg hidden lg:block"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 border border-slate-700/30 rotate-12 hidden lg:block"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-slate-700/10 rounded-full hidden lg:block"></div>
      <div className="absolute bottom-1/3 left-1/3 w-20 h-20 border border-slate-700/20 rotate-45 hidden lg:block"></div>
      
      {/* Desktop Layout - Side by Side */}
      <div className="hidden lg:flex h-full">
        {/* Left Side - Background (60%) */}
        <div className="w-3/5 relative flex items-center justify-center">
          {/* Subtle overlay for contrast if needed */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"></div>
        </div>
        
        {/* Right Side - Form Card (40%) */}
        <div className="w-2/5 flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border p-8"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-foreground mb-8 text-center"
            >
              {title}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Mobile Layout - Stacked */}
      <div className="lg:hidden h-full flex flex-col">
        {/* Top - Background */}
        <div className="flex-1 relative"></div>
        
        {/* Bottom - Form Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border p-6"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-foreground mb-6 text-center"
            >
              {title}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;