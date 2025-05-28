
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const AuthCard = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-[90%] max-w-sm mx-auto"
    >
      <div className="text-center mb-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4 shadow-xl"
        >
          <span className="text-2xl font-bold text-white">G</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-heading font-bold text-white mb-2 drop-shadow-lg"
        >
          GrifoBoard
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/90 text-sm drop-shadow"
        >
          Gerencie suas obras e acompanhe o progresso
        </motion.p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20"
      >
        <Tabs 
          defaultValue="login" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full bg-gray-50/80 rounded-t-xl overflow-hidden h-12">
            <TabsTrigger 
              value="login" 
              className="py-3 rounded-none text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
            >
              Entrar
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="py-3 rounded-none text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
            >
              Cadastrar
            </TabsTrigger>
          </TabsList>
          
          <div className="p-6">
            <AnimatePresence mode="wait">
              <TabsContent value="login" asChild>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <LoginForm />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="signup" asChild>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SignupForm />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default AuthCard;
