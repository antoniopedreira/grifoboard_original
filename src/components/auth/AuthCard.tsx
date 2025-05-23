
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const AuthCard = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
          <span className="text-2xl font-semibold text-primary">G</span>
        </div>
        <h1 className="text-3xl font-heading font-semibold text-gray-800 mb-2">
          GrifoBoard
        </h1>
        <p className="text-gray-500">
          Gerencie suas obras e acompanhe o progresso
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Tabs 
          defaultValue="login" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full rounded-t-xl overflow-hidden">
            <TabsTrigger 
              value="login" 
              className="py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Entrar
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Cadastrar
            </TabsTrigger>
          </TabsList>
          
          <div className="p-6">
            <AnimatePresence mode="wait">
              <TabsContent value="login" asChild>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <LoginForm />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="signup" asChild>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <SignupForm />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthCard;
