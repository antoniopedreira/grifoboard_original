import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import { motion } from "framer-motion";
import { Building2, Ruler, HardHat } from "lucide-react";
const Auth = () => {
  const {
    userSession
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  useEffect(() => {
    if (userSession?.user) {
      const lastRoute = sessionStorage.getItem("lastRoute");
      const destination = lastRoute && lastRoute !== "/auth" && lastRoute !== "/reset-password" ? lastRoute : "/dashboard";
      navigate(destination, {
        replace: true
      });
    }
  }, [userSession, navigate]);
  const handleMouseMove = (e: React.MouseEvent) => {
    const x = e.clientX / window.innerWidth * 2 - 1;
    const y = e.clientY / window.innerHeight * 2 - 1;
    setMousePosition({
      x,
      y
    });
  };
  if (userSession?.user) return null;
  return (
    // h-screen e overflow-hidden garantem que não haverá barra de rolagem
    <div className="h-screen w-full flex overflow-hidden bg-background" onMouseMove={handleMouseMove}>
      {/* --- PAINEL ESQUERDO: Visual e Marca (Engenharia + Tech) --- */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-primary overflow-hidden flex-col justify-between p-12 text-white z-10">
        {/* Background Animado Híbrido (Construção + Dados) */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <motion.svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" animate={{
            x: mousePosition.x * -15,
            y: mousePosition.y * -15
          }} transition={{
            type: "tween",
            ease: "linear",
            duration: 0.2
          }}>
            <defs>
              {/* Padrão de Grid Técnico (Blueprint) */}
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-secondary/40" />
              </pattern>
              {/* Padrão de Pontos de Dados (Tech) */}
              <pattern id="tech-dots" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="1.5" className="fill-secondary/60" />
                <circle cx="0" cy="0" r="1" className="fill-secondary/40" />
              </pattern>
            </defs>

            {/* Camada 1: Grid Estrutural */}
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            {/* Camada 2: Pontos de Dados Fluindo */}
            <rect width="100%" height="100%" fill="url(#tech-dots)" />

            {/* Camada 3: Linhas de Conexão Animadas (Simulando fluxo de dados em uma viga) */}
            <motion.g stroke="currentColor" strokeWidth="2" className="text-secondary" fill="none" strokeDasharray="4 8" strokeLinecap="round">
              <motion.line x1="-100" y1="600" x2="1500" y2="600" animate={{
                strokeDashoffset: [-200, 0]
              }} transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }} opacity="0.5" />
              <motion.line x1="-100" y1="620" x2="1500" y2="620" animate={{
                strokeDashoffset: [0, -200]
              }} transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }} opacity="0.3" />
            </motion.g>
          </motion.svg>

          {/* Efeito de Luz Dourada (Tech Glow) */}
          <div className="absolute bottom-[-30%] left-[-20%] w-[800px] h-[800px] bg-secondary/20 blur-[150px] rounded-full mix-blend-overlay pointer-events-none" />
        </div>

        {/* Conteúdo Esquerda - Todo texto aqui é branco ou bege claro */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-secondary/20 rounded-lg backdrop-blur-sm border border-secondary/30">
              <HardHat className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="text-2xl font-heading font-bold tracking-wide text-white">Grifo Engenharia</h2>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3,
            duration: 0.6
          }} className="text-5xl font-heading font-bold leading-tight mb-6 text-white">
            A união da precisão da engenharia com a <span className="text-secondary">inteligência dos dados.</span>
          </motion.h1>
          <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.5,
            duration: 0.6
          }} className="text-lg text-primary-foreground/90 font-light leading-relaxed">
            Bem-vindo ao <strong>Grifoboard</strong>. Sua plataforma central para controle de PCP, diário de obra e
            gestão de recursos. Decisões baseadas em dados, do projeto à execução.
          </motion.p>

          <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.8
          }} className="flex items-center gap-6 mt-10 text-sm text-primary-foreground/80 font-medium">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-secondary" /> Gestão de PCP
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-secondary" /> Controle de Campo
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 text-xs text-primary-foreground/60 font-light">
          © {new Date().getFullYear()} Grifo Engenharia. Todos os direitos reservados.
        </div>
      </div>

      {/* --- PAINEL DIREITO: Login --- */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 lg:p-12 relative z-20 bg-accent/30">
        {/* Mobile Header (Só aparece em telas pequenas) */}
        <div className="lg:hidden absolute top-0 left-0 w-full bg-primary p-6 text-center shadow-md">
          {/* Placeholder para LOGO MOBILE */}
          <img src="/path-to-your-logo.png" alt="Grifo Logo" className="grifo-logo-placeholder h-10 mx-auto mb-3 object-contain brightness-0 invert" // Classe para edição no Lovable + Invertido para branco
          />
          <h1 className="text-xl font-heading font-bold text-white">Grifoboard</h1>
        </div>

        <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.4,
          ease: "easeOut"
        }} className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-2xl shadow-primary/10 border border-border/60 mt-20 lg:mt-0 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-secondary rounded-b-full" />

          <div className="text-center space-y-2">
            {/* Placeholder para LOGO DESKTOP */}
            <img alt="Grifo Logo" className="grifo-logo-placeholder h-14 mx-auto mb-6 object-contain" // Classe para edição no Lovable
            style={{
              filter: "brightness(0) saturate(100%) invert(43%) sepia(35%) saturate(1096%) hue-rotate(5deg) brightness(93%) contrast(90%)"
            }} // Filtro Dourado
            src="/lovable-uploads/2d897d66-4b8a-43e8-8632-f790148f2784.png" />
            <h2 className="text-3xl font-heading font-bold text-primary tracking-tight">Acesse sua conta</h2>
            <p className="text-muted-foreground">Entre com suas credenciais para continuar.</p>
          </div>

          <div className="pt-4">
            <AuthForm />
          </div>
        </motion.div>
        <p className="lg:hidden text-xs text-muted-foreground mt-8 text-center">
          © {new Date().getFullYear()} Grifo Engenharia.
        </p>
      </div>
    </div>
  );
};
export default Auth;