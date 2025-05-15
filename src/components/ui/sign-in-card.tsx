
import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff as EyeClosed, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
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

  // Para efeito 3D do card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

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
    <div className="min-h-screen w-full bg-[#021C2F] relative overflow-hidden flex items-center justify-center">
      {/* Background gradient effect - ocupando toda a tela */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-[#021C2F] w-screen h-screen" />
      
      {/* Subtle noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] mix-blend-soft-light w-screen h-screen" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Top radial glow */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-[120vw] h-[60vh] rounded-b-[50%] bg-purple-400/20 blur-[80px]" />
      <motion.div 
        className="fixed top-0 left-1/2 transform -translate-x-1/2 w-[100vw] h-[60vh] rounded-b-full bg-purple-300/20 blur-[60px]"
        animate={{ 
          opacity: [0.15, 0.3, 0.15],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />
      <motion.div 
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[90vw] h-[90vh] rounded-t-full bg-purple-400/20 blur-[60px]"
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity,
          repeatType: "mirror",
          delay: 1
        }}
      />

      {/* Animated glow spots */}
      <div className="fixed left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
      <div className="fixed right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Card glow effect - reduced intensity */}
            <motion.div 
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
              animate={{
                boxShadow: [
                  "0 0 10px 2px rgba(255,255,255,0.03)",
                  "0 0 15px 5px rgba(255,255,255,0.05)",
                  "0 0 10px 2px rgba(255,255,255,0.03)"
                ],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut", 
                repeatType: "mirror" 
              }}
            />

            {/* Traveling light beam effect - reduced opacity */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
              {/* Top light beam - enhanced glow */}
              <motion.div 
                className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                initial={{ filter: "blur(2px)" }}
                animate={{ 
                  left: ["-50%", "100%"],
                  opacity: [0.3, 0.7, 0.3],
                  filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                }}
                transition={{ 
                  left: {
                    duration: 2.5, 
                    ease: "easeInOut", 
                    repeat: Infinity,
                    repeatDelay: 1
                  },
                  opacity: {
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "mirror"
                  },
                  filter: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "mirror"
                  }
                }}
              />
              
              {/* Right light beam - enhanced glow */}
              <motion.div 
                className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                initial={{ filter: "blur(2px)" }}
                animate={{ 
                  top: ["-50%", "100%"],
                  opacity: [0.3, 0.7, 0.3],
                  filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                }}
                transition={{ 
                  top: {
                    duration: 2.5, 
                    ease: "easeInOut", 
                    repeat: Infinity,
                    repeatDelay: 1,
                    delay: 0.6
                  },
                  opacity: {
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 0.6
                  },
                  filter: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 0.6
                  }
                }}
              />
              
              {/* Bottom light beam - enhanced glow */}
              <motion.div 
                className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                initial={{ filter: "blur(2px)" }}
                animate={{ 
                  right: ["-50%", "100%"],
                  opacity: [0.3, 0.7, 0.3],
                  filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                }}
                transition={{ 
                  right: {
                    duration: 2.5, 
                    ease: "easeInOut", 
                    repeat: Infinity,
                    repeatDelay: 1,
                    delay: 1.2
                  },
                  opacity: {
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 1.2
                  },
                  filter: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 1.2
                  }
                }}
              />
              
              {/* Left light beam - enhanced glow */}
              <motion.div 
                className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                initial={{ filter: "blur(2px)" }}
                animate={{ 
                  bottom: ["-50%", "100%"],
                  opacity: [0.3, 0.7, 0.3],
                  filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                }}
                transition={{ 
                  bottom: {
                    duration: 2.5, 
                    ease: "easeInOut", 
                    repeat: Infinity,
                    repeatDelay: 1,
                    delay: 1.8
                  },
                  opacity: {
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 1.8
                  },
                  filter: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 1.8
                  }
                }}
              />
              
              {/* Subtle corner glow spots - reduced opacity */}
              <motion.div 
                className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]"
                animate={{ 
                  opacity: [0.2, 0.4, 0.2] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "mirror"
                }}
              />
              <motion.div 
                className="absolute top-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]"
                animate={{ 
                  opacity: [0.2, 0.4, 0.2] 
                }}
                transition={{ 
                  duration: 2.4, 
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 0.5
                }}
              />
              <motion.div 
                className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]"
                animate={{ 
                  opacity: [0.2, 0.4, 0.2] 
                }}
                transition={{ 
                  duration: 2.2, 
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1
                }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]"
                animate={{ 
                  opacity: [0.2, 0.4, 0.2] 
                }}
                transition={{ 
                  duration: 2.3, 
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1.5
                }}
              />
            </div>

            {/* Card border glow - reduced opacity */}
            <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/3 via-white/7 to-white/3 opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
            
            {/* Glass card background */}
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
              {/* Subtle card inner patterns */}
              <div className="absolute inset-0 opacity-[0.03]" 
                style={{
                  backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                  backgroundSize: '30px 30px'
                }}
              />

              {/* Logo and header */}
              <div className="text-center space-y-1 mb-5">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="mx-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden"
                >
                  <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">G</span>
                  
                  {/* Inner lighting effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
                >
                  {activeTab === 'login' ? 'Bem-vindo' : 'Cadastre-se'}
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/60 text-xs"
                >
                  {activeTab === 'login' ? 'Entre para continuar no Gerenciador de Obras' : 'Crie sua conta no Gerenciador de Obras'}
                </motion.p>
              </div>

              {/* Tab Navigation */}
              <div className="flex mb-5 border-b border-white/10">
                <button 
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 pb-2 text-sm font-medium transition-all duration-200 relative ${
                    activeTab === 'login' ? 'text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  Login
                  {activeTab === 'login' && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 pb-2 text-sm font-medium transition-all duration-200 relative ${
                    activeTab === 'signup' ? 'text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  Cadastro
                  {activeTab === 'signup' && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              </div>

              {/* Login/Signup Forms */}
              <AnimatePresence mode="wait">
                {activeTab === 'login' ? (
                  <motion.form 
                    key="login-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSignIn} 
                    className="space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Email input */}
                      <motion.div 
                        className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                        whileFocus={{ scale: 1.02 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <div className="relative flex items-center overflow-hidden rounded-lg">
                          <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                            focusedInput === "email" ? 'text-white' : 'text-white/40'
                          }`} />
                          
                          <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedInput("email")}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                          />
                          
                          {/* Input highlight effect */}
                          {focusedInput === "email" && (
                            <motion.div 
                              layoutId="input-highlight"
                              className="absolute inset-0 bg-white/5 -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </div>
                      </motion.div>

                      {/* Password input */}
                      <motion.div 
                        className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                        whileFocus={{ scale: 1.02 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <div className="relative flex items-center overflow-hidden rounded-lg">
                          <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                            focusedInput === "password" ? 'text-white' : 'text-white/40'
                          }`} />
                          
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedInput("password")}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                          />
                          
                          {/* Toggle password visibility */}
                          <div 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 cursor-pointer"
                          >
                            {showPassword ? (
                              <EyeClosed className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                            ) : (
                              <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                            )}
                          </div>
                          
                          {/* Input highlight effect */}
                          {focusedInput === "password" && (
                            <motion.div 
                              layoutId="input-highlight"
                              className="absolute inset-0 bg-white/5 -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </div>
                      </motion.div>
                    </div>

                    {/* Remember me option */}
                    <div className="flex items-center pt-1">
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            className="appearance-none h-4 w-4 rounded border border-white/20 bg-white/5 checked:bg-white checked:border-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-200"
                          />
                          {rememberMe && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center text-black pointer-events-none"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </motion.div>
                          )}
                        </div>
                        <label htmlFor="remember-me" className="text-xs text-white/60 hover:text-white/80 transition-colors duration-200">
                          Lembrar-me
                        </label>
                      </div>
                    </div>

                    {/* Login button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full relative group/button mt-5"
                    >
                      {/* Button glow effect */}
                      <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                      
                      <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                        {/* Button background animation */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -z-10"
                          animate={{ 
                            x: ['-100%', '100%'],
                          }}
                          transition={{ 
                            duration: 1.5, 
                            ease: "easeInOut", 
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                          style={{ 
                            opacity: isLoading ? 1 : 0,
                            transition: 'opacity 0.3s ease'
                          }}
                        />
                        
                        <AnimatePresence mode="wait">
                          {isLoading ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center justify-center"
                            >
                              <div className="w-4 h-4 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                            </motion.div>
                          ) : (
                            <motion.span
                              key="button-text"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center justify-center gap-1 text-sm font-medium"
                            >
                              Entrar
                              <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.form 
                    key="signup-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSignUp} 
                    className="space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Email input */}
                      <motion.div 
                        className={`relative ${focusedInput === "signup-email" ? 'z-10' : ''}`}
                        whileFocus={{ scale: 1.02 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <div className="relative flex items-center overflow-hidden rounded-lg">
                          <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                            focusedInput === "signup-email" ? 'text-white' : 'text-white/40'
                          }`} />
                          
                          <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedInput("signup-email")}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                          />
                          
                          {/* Input highlight effect */}
                          {focusedInput === "signup-email" && (
                            <motion.div 
                              layoutId="input-highlight"
                              className="absolute inset-0 bg-white/5 -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </div>
                      </motion.div>

                      {/* Password input */}
                      <motion.div 
                        className={`relative ${focusedInput === "signup-password" ? 'z-10' : ''}`}
                        whileFocus={{ scale: 1.02 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <div className="relative flex items-center overflow-hidden rounded-lg">
                          <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                            focusedInput === "signup-password" ? 'text-white' : 'text-white/40'
                          }`} />
                          
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedInput("signup-password")}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                          />
                          
                          {/* Toggle password visibility */}
                          <div 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 cursor-pointer"
                          >
                            {showPassword ? (
                              <EyeClosed className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                            ) : (
                              <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                            )}
                          </div>
                          
                          {/* Input highlight effect */}
                          {focusedInput === "signup-password" && (
                            <motion.div 
                              layoutId="input-highlight"
                              className="absolute inset-0 bg-white/5 -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </div>
                      </motion.div>
                    </div>

                    {/* Signup button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full relative group/button mt-5"
                    >
                      <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                      
                      <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -z-10"
                          animate={{ 
                            x: ['-100%', '100%'],
                          }}
                          transition={{ 
                            duration: 1.5, 
                            ease: "easeInOut", 
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                          style={{ 
                            opacity: isLoading ? 1 : 0,
                            transition: 'opacity 0.3s ease'
                          }}
                        />
                        
                        <AnimatePresence mode="wait">
                          {isLoading ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center justify-center"
                            >
                              <div className="w-4 h-4 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                            </motion.div>
                          ) : (
                            <motion.span
                              key="button-text"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center justify-center gap-1 text-sm font-medium"
                            >
                              Cadastrar
                              <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
