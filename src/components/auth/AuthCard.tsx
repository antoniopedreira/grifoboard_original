
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
      className="w-[90%] max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/80 mb-6 shadow-2xl ring-4 ring-white/20"
        >
          <span className="text-3xl font-bold text-white">G</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-heading font-bold text-white mb-3 drop-shadow-lg"
        >
          GrifoBoard
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/90 text-base drop-shadow"
        >
          Gerencie suas obras e acompanhe o progresso
        </motion.p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 overflow-hidden"
      >
        <Tabs 
          defaultValue="login" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full bg-gradient-to-r from-gray-50 to-gray-100 h-14 p-1">
            <TabsTrigger 
              value="login" 
              className="py-3 px-6 rounded-xl text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-300"
            >
              Entrar
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="py-3 px-6 rounded-xl text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-300"
            >
              Cadastrar
            </TabsTrigger>
          </TabsList>
          
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
    </motion.div>
  );
};

export default AuthCard;
