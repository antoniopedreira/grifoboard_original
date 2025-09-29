import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Building2, Calendar, BarChart3, Users } from 'lucide-react';
interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}
const AuthLayout = ({
  children,
  title
}: AuthLayoutProps) => {
  return (
    <div className="h-screen w-full fixed inset-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Construction grid pattern background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 10c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zm0 20c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zm0 20c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zM10 36c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm20 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm20 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      {/* Main Layout - Side by Side */}
      <div className="flex h-full">
        {/* Left Side - Hero Content */}
        <div className="flex-1 relative flex items-center">
          <div className="max-w-2xl ml-16 space-y-8">
            {/* Logo and Brand */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 bg-[#C7A347] rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-[#C7A347] text-lg font-semibold">GRIFO ENGENHARIA</span>
            </motion.div>

            {/* Title */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-6xl font-bold text-white leading-tight">GrifoBoard</h1>
              <h3 className="text-2xl text-slate-300 font-medium">
                Gestão Inteligente de Obras
              </h3>
            </motion.div>

            {/* Features */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#C7A347]/20 rounded-lg flex items-center justify-center mt-1">
                  <Calendar className="w-5 h-5 text-[#C7A347]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Planejamento semanal</h4>
                  <p className="text-slate-400">100% visual</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#C7A347]/20 rounded-lg flex items-center justify-center mt-1">
                  <BarChart3 className="w-5 h-5 text-[#C7A347]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">PCP em tempo real</h4>
                  <p className="text-slate-400">decisões rápidas</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#C7A347]/20 rounded-lg flex items-center justify-center mt-1">
                  <Users className="w-5 h-5 text-[#C7A347]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Fast Construction</h4>
                  <p className="text-slate-400">entrega ágil, qualidade máxima</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="w-96 flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full bg-white rounded-2xl shadow-2xl p-8"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-8 text-center text-slate-900"
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