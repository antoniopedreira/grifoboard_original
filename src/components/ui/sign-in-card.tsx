
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/AuthContext';

export function SignInCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  
  const { signIn, signUp } = useAuth();
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate('/obras');
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(email, password);
      // Não redirecionamos aqui porque o usuário deve verificar o email
    } catch (error) {
      console.error('Erro no cadastro:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="text-center p-6 border-b border-gray-100">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-primary">G</span>
            </div>
          </div>
          <h1 className="text-xl font-heading font-semibold text-gray-800 mb-1">
            {activeTab === 'login' ? 'Bem-vindo' : 'Cadastre-se'}
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('login')} 
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-all duration-200 relative", 
              activeTab === 'login' 
                ? "text-primary border-b-2 border-primary" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Login
          </button>
          <button 
            onClick={() => setActiveTab('signup')} 
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-all duration-200 relative", 
              activeTab === 'signup' 
                ? "text-primary border-b-2 border-primary" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Cadastro
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form 
                key="login-form" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignIn} 
                className="space-y-5"
              >
                <div className="space-y-4">
                  {/* Email input */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        onFocus={() => setFocusedInput("email")} 
                        onBlur={() => setFocusedInput(null)} 
                        className={cn(
                          "pl-10", 
                          focusedInput === "email" && "border-primary ring-1 ring-primary/20"
                        )} 
                      />
                    </div>
                  </div>

                  {/* Password input */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-gray-700">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="********" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        onFocus={() => setFocusedInput("password")} 
                        onBlur={() => setFocusedInput(null)} 
                        className={cn(
                          "pl-10 pr-10", 
                          focusedInput === "password" && "border-primary ring-1 ring-primary/20"
                        )} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember-me" 
                      checked={rememberMe} 
                      onCheckedChange={() => setRememberMe(!rememberMe)} 
                    />
                    <Label 
                      htmlFor="remember-me" 
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      Lembrar-me
                    </Label>
                  </div>
                  <a 
                    href="#" 
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Esqueci a senha
                  </a>
                </div>

                {/* Login button */}
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full h-10"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="flex items-center justify-center">
                      Entrar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.form 
                key="signup-form" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignUp} 
                className="space-y-5"
              >
                <div className="space-y-4">
                  {/* Email input */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        onFocus={() => setFocusedInput("signup-email")} 
                        onBlur={() => setFocusedInput(null)} 
                        className={cn(
                          "pl-10", 
                          focusedInput === "signup-email" && "border-primary ring-1 ring-primary/20"
                        )} 
                      />
                    </div>
                  </div>

                  {/* Password input */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm text-gray-700">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="signup-password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="********" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        onFocus={() => setFocusedInput("signup-password")} 
                        onBlur={() => setFocusedInput(null)} 
                        className={cn(
                          "pl-10 pr-10", 
                          focusedInput === "signup-password" && "border-primary ring-1 ring-primary/20"
                        )} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-10"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="flex items-center justify-center">
                        Cadastrar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
