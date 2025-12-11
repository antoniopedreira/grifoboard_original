// Exemplo conceitual do visual (ajuste com seus imports reais)
const AppSidebar = () => {
  return (
    <div className="h-screen w-64 bg-grifo-primary text-grifo-tertiary flex flex-col shadow-2xl relative z-20">
      {/* Logo Area */}
      <div className="p-6 flex items-center justify-center border-b border-white/10">
        <img
          src="/lovable-uploads/grifo-logo-header.png" // Sua logo enviada
          alt="Grifo Engenharia"
          className="h-10 w-auto brightness-0 invert" // Inverte para branco/bege se a logo for escura
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${
                  isActive
                    ? "bg-grifo-secondary text-white shadow-lg shadow-grifo-secondary/30 font-semibold translate-x-1"
                    : "hover:bg-white/5 hover:text-white text-grifo-tertiary/80"
                }
              `}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-grifo-secondary"}`} />
              <span>{item.label}</span>

              {/* Indicador sutil de 'ativo' à direita */}
              {isActive && (
                <motion.div layoutId="activeIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 bg-black/20 backdrop-blur-sm m-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-grifo-secondary">
            <AvatarImage src={userSession?.user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-grifo-secondary text-white">GP</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Eng. Antônio</p>
            <p className="text-xs text-grifo-tertiary/70 truncate">Grifo Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};
