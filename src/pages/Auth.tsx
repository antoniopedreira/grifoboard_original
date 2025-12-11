import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import { motion } from "framer-motion";
import { Building2, Ruler, HardHat } from "lucide-react";

const Auth = () => {
  const { userSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Redireciona se já estiver logado
  useEffect(() => {
    if (userSession?.user) {
      const lastRoute = sessionStorage.getItem("lastRoute");
      // Evita loop de redirecionamento se a última rota for a própria auth
      const destination =
        lastRoute && lastRoute !== "/auth" && lastRoute !== "/reset-password" ? lastRoute : "/dashboard";

      navigate(destination, { replace: true });
    }
  }, [userSession, navigate]);

  // Efeito sutil de paralaxe no mouse move para o background
  const handleMouseMove = (e: React.MouseEvent) => {
    // Calcula a posição relativa do mouse (-1 a 1)
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    setMousePosition({ x, y });
  };

  // Se estiver logado, não renderiza nada enquanto redireciona
  if (userSession?.user) return null;

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-background" onMouseMove={handleMouseMove}>
      {/* --- PAINEL ESQUERDO: Visual e Marca (Engenharia) --- */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-primary overflow-hidden flex-col justify-between p-12 text-white z-10">
        {/* Camada de Animação de Fundo (Blueprint/Estrutura) */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          {/* SVG Animado simulando uma estrutura de engenharia/treliça */}
          <motion.svg
            className="w-full h-full"
            viewBox="0 0 800 800"
            xmlns="http://www.w3.org/2000/svg"
            animate={{
              // Movimento sutil baseado no mouse
              x: mousePosition.x * -20,
              y: mousePosition.y * -20,
            }}
            transition={{ type: "tween", ease: "linear", duration: 0.2 }}
          >
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-secondary/50"
                />
              </pattern>
            </defs>
            {/* Grid de fundo */}
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Linhas Estruturais Animadas (Treliça) */}
            <motion.g stroke="currentColor" strokeWidth="1.5" className="text-secondary" fill="none">
              {/* Linhas que se desenham */}
              <motion.path
                d="M0,400 Q200,300 400,400 T800,400"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
              <motion.path
                d="M0,600 Q300,500 600,600 T1200,600"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 4, ease: "easeInOut", delay: 0.5 }}
              />

              {/* Conexões Verticais/Diagonais */}
              {[...Array(5)].map((_, i) => (
                <motion.line
                  key={i}
                  x1={100 + i * 150}
                  y1="200"
                  x2={100 + i * 150}
                  y2="800"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 2 + i, ease: "easeOut", delay: i * 0.3 }}
                  strokeDasharray="4 4" // Linha tracejada estilo blueprint
                />
              ))}
              {/* Nós/Conexões brilhantes */}
              {[...Array(4)].map((_, i) => (
                <motion.circle
                  key={`c-${i}`}
                  cx={250 + i * 150}
                  cy={400 + (i % 2 === 0 ? -50 : 50)}
                  r="4"
                  className="fill-secondary"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
            </motion.g>
          </motion.svg>
          {/* Efeito de Glow/Luz Dourada no canto */}
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/30 blur-[120px] rounded-full mix-blend-overlay pointer-events-none" />
        </div>

        {/* Conteúdo de Texto do Painel Esquerdo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            {/* Ícone de Engenharia com a cor Dourada */}
            <div className="p-2 bg-secondary/20 rounded-lg backdrop-blur-sm border border-secondary/30">
              <HardHat className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="text-2xl font-heading font-bold tracking-wide text-white">Grifo Engenharia</h2>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl font-heading font-bold leading-tight mb-6"
          >
            A base sólida para <span className="text-secondary">obras complexas.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg text-primary-foreground/80 font-light leading-relaxed"
          >
            Bem-vindo ao <strong>Grifoboard</strong>. Sua central de inteligência para controle de PCP, diário de obra e
            gestão de recursos. Precisão e controle do projeto à execução.
          </motion.p>

          {/* Ícones de features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-6 mt-10 text-sm text-primary-foreground/70 font-medium"
          >
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-secondary" /> Gestão de PCP
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-secondary" /> Controle de Campo
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 text-xs text-primary-foreground/50 font-light">
          © {new Date().getFullYear()} Grifo Engenharia. Todos os direitos reservados.
        </div>
      </div>

      {/* --- PAINEL DIREITO: Formulário de Login --- */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 lg:p-12 relative z-20">
        {/* Mobile Header Banner (Só aparece em telas pequenas) */}
        <div className="lg:hidden absolute top-0 left-0 w-full bg-primary p-6 text-center">
          <img src="/lovable-uploads/grifo-logo-header.png" alt="Grifo" className="h-10 mx-auto mb-3 object-contain" />
          <h1 className="text-xl font-heading font-bold text-white">Grifoboard</h1>
        </div>

        {/* Container do Formulário */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-2xl shadow-primary/5 border border-border/60 mt-20 lg:mt-0 relative"
        >
          {/* Detalhe visual no topo do card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-secondary rounded-b-full" />

          <div className="text-center space-y-2">
            {/* Logo Grifo Dourada no topo do form */}
            <img
              src="/lovable-uploads/grifo-logo-header.png"
              alt="Grifo"
              // Usando um filtro CSS para forçar a logo a ficar dourada se ela for branca
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(43%) sepia(35%) saturate(1096%) hue-rotate(5deg) brightness(93%) contrast(90%)",
              }} // Aproximação do Dourado #A47428
              className="h-14 mx-auto mb-6 object-contain"
              loading="eager"
            />
            <h2 className="text-3xl font-heading font-bold text-primary tracking-tight">Acesse sua conta</h2>
            <p className="text-muted-foreground">Entre com suas credenciais para continuar.</p>
          </div>

          {/* Componente de Formulário Existente */}
          <div className="pt-4">
            <AuthForm />
          </div>
        </motion.div>
        {/* Footer Mobile */}
        <p className="lg:hidden text-xs text-muted-foreground mt-8 text-center">
          © {new Date().getFullYear()} Grifo Engenharia.
        </p>
      </div>
    </div>
  );
};

export default Auth;
