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
  return <div className="h-screen w-full fixed inset-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Construction grid pattern background - NO SHAPES */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 10c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zm0 20c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zm0 20c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zM10 36c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm20 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm20 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      </div>
      
      {/* Desktop Layout - Side by Side 60/40 */}
      <div className="hidden lg:flex h-full">
        {/* Left Side - Hero Content (60%) */}
        <div className="w-3/5 relative flex items-center">
          <div className="max-w-2xl ml-16 space-y-8">
            {/* Logo */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#C7A347] rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-[#C7A347] text-lg font-semibold">GRIFO ENGENHARIA</span>
            </motion.div>

            {/* Headlines */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="space-y-4">
              <h1 className="text-5xl font-bold text-white leading-tight">GrifoBoard</h1>
              <h3 className="text-2xl text-slate-300 font-medium">
                Gestão Inteligente de Obras
              </h3>
            </motion.div>

            {/* Feature Bullets */}
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }} className="space-y-6">
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
        
        {/* Right Side - Form Card (40%) */}
        <div className="w-2/5 flex items-center justify-center p-8">
          <motion.div initial={{
          opacity: 0,
          x: 50
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.6,
          ease: "easeOut"
        }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8" style={{
          fontFamily: 'Inter, sans-serif'
        }}>
            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="text-3xl font-bold mb-8 text-center" style={{
            color: '#0A1D33'
          }}>
              {title}
            </motion.h1>
            
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3
          }}>
              {children}
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Mobile Layout - Stacked */}
      <div className="lg:hidden h-full flex flex-col">
        {/* Top - Hero Content */}
        <div className="flex-1 relative flex items-center justify-center p-6">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-[#C7A347] rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-[#C7A347] text-lg font-semibold">GRIFO</span>
            </div>

            {/* Headlines */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                Grifo Engenharia
              </h1>
              <h3 className="text-lg text-slate-300">
                Gestão Inteligente de Obras
              </h3>
            </div>

            {/* Compact bullets for mobile */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-center space-x-2 text-slate-300">
                <Calendar className="w-4 h-4 text-[#C7A347]" />
                <span>Planejamento semanal — 100% visual</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-slate-300">
                <BarChart3 className="w-4 h-4 text-[#C7A347]" />
                <span>PCP em tempo real — decisões rápidas</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-slate-300">
                <Users className="w-4 h-4 text-[#C7A347]" />
                <span>Fast Construction — entrega ágil</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom - Form Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div initial={{
          opacity: 0,
          y: 50
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          ease: "easeOut"
        }} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6" style={{
          fontFamily: 'Inter, sans-serif'
        }}>
            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="text-2xl font-bold mb-6 text-center" style={{
            color: '#0A1D33'
          }}>
              {title}
            </motion.h1>
            
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3
          }}>
              {children}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>;
};
export default AuthLayout;