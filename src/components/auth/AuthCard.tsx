
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const AuthCard = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 15 }}
          className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center shadow-xl"
        >
          <span className="text-2xl font-bold text-white">G</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold text-slate-800 mb-3"
        >
          GrifoBoard
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-slate-600 text-lg"
        >
          Gerencie suas obras e acompanhe o progresso
        </motion.p>
      </div>
      
      {/* Auth Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
      >
        <Tabs 
          defaultValue="login" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="p-2 bg-slate-50/50">
            <TabsList className="grid grid-cols-2 w-full bg-white/80 rounded-2xl p-1 shadow-sm">
              <TabsTrigger 
                value="login" 
                className="py-3 px-6 rounded-xl text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-md transition-all duration-300 text-slate-600"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="py-3 px-6 rounded-xl text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-md transition-all duration-300 text-slate-600"
              >
                Cadastrar
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-8">
            <AnimatePresence mode="wait">
              <TabsContent value="login" asChild>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="signup" asChild>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SignupForm />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </motion.div>
      
      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-8 text-slate-500 text-sm"
      >
        © {new Date().getFullYear()} GrifoBoard • Todos os direitos reservados
      </motion.div>
    </motion.div>
  );
};

export default AuthCard;
