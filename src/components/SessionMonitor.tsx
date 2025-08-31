import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface SessionInfo {
  id: string;
  lastActivity: number;
  isCurrentSession: boolean;
}

const SessionMonitor = () => {
  const { userSession } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [showSessionAlert, setShowSessionAlert] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'active' | 'conflict' | 'expired'>('active');

  useEffect(() => {
    if (!userSession.user) return;

    const checkSessionStatus = () => {
      const currentSessionId = localStorage.getItem('current_session_id');
      const lastActivity = localStorage.getItem('last_activity');
      
      if (currentSessionId && lastActivity) {
        const info: SessionInfo = {
          id: currentSessionId,
          lastActivity: parseInt(lastActivity, 10),
          isCurrentSession: true
        };
        
        setSessionInfo(info);
        
        // Check for session expiry
        const timeSinceActivity = Date.now() - info.lastActivity;
        const thirtyMinutes = 30 * 60 * 1000;
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeSinceActivity > thirtyMinutes) {
          setSessionStatus('expired');
          setShowSessionAlert(true);
        } else if (timeSinceActivity > (thirtyMinutes - fiveMinutes)) {
          // Show warning 5 minutes before expiry
          setSessionStatus('active');
          setShowSessionAlert(true);
        } else {
          setSessionStatus('active');
          setShowSessionAlert(false);
        }
      }
    };

    // Check immediately
    checkSessionStatus();
    
    // Check every minute
    const interval = setInterval(checkSessionStatus, 60000);
    
    // Listen for storage changes (multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'current_session_id' || e.key === 'last_activity') {
        checkSessionStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userSession.user]);

  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'agora mesmo';
    if (minutes === 1) return '1 minuto atrás';
    return `${minutes} minutos atrás`;
  };

  const getSessionStatusIcon = () => {
    switch (sessionStatus) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'conflict':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSessionStatusText = () => {
    switch (sessionStatus) {
      case 'active':
        return 'Sessão ativa';
      case 'conflict':
        return 'Conflito de sessão detectado';
      case 'expired':
        return 'Sessão expirou';
      default:
        return 'Status da sessão';
    }
  };

  if (!userSession.user || !sessionInfo) return null;

  return (
    <div className="space-y-2">
      {/* Session Status Indicator (always visible for logged users) */}
      <div className="flex items-center text-xs text-gray-500 px-2">
        {getSessionStatusIcon()}
        <span className="ml-1">{getSessionStatusText()}</span>
        {sessionInfo.lastActivity && (
          <span className="ml-2">• {formatTimeAgo(sessionInfo.lastActivity)}</span>
        )}
      </div>

      {/* Session Alerts */}
      {showSessionAlert && sessionStatus === 'expired' && (
        <Alert variant="destructive" className="mb-4">
          <Clock className="h-4 w-4" />
          <AlertTitle>Sessão Expirada</AlertTitle>
          <AlertDescription>
            Sua sessão expirou devido à inatividade. Faça login novamente para continuar.
          </AlertDescription>
        </Alert>
      )}

      {showSessionAlert && sessionStatus === 'active' && (
        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Aviso de Sessão</AlertTitle>
          <AlertDescription className="text-orange-700">
            Sua sessão expirará em breve devido à inatividade. Clique em qualquer lugar para renovar.
          </AlertDescription>
        </Alert>
      )}

      {showSessionAlert && sessionStatus === 'conflict' && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Múltiplas Sessões Detectadas</AlertTitle>
          <AlertDescription>
            Foi detectado um login em outro dispositivo ou janela. Você será desconectado automaticamente para evitar conflitos de dados.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SessionMonitor;