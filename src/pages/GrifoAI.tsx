import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

const GrifoAI = () => {
  const { userSession } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Carregar histórico
  useEffect(() => {
    const loadHistory = async () => {
      if (!userSession?.user?.id) return;
      try {
        const { data, error } = await supabase
          .from("grifo_chat_messages")
          .select("*")
          .eq("user_id", userSession.user.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setMessages(data as unknown as Message[]);
        } else {
          setMessages([{
            role: "assistant",
            content: `Olá, ${userSession?.user?.user_metadata?.full_name?.split(" ")[0] || "Engenheiro"}! Sou o GrifoAI. Seu assistente conectado à base de conhecimento da Grifo. Como posso ajudar?`
          }]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    };
    loadHistory();
  }, [userSession]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading || !userSession?.user?.id) return;

    const userText = input.trim();
    setInput("");
    setLoading(true);

    // 1. UI Otimista
    setMessages(prev => [...prev, { role: "user", content: userText }]);

    try {
      // 2. Salvar pergunta no banco (histórico visual)
      await supabase.from("grifo_chat_messages").insert({
        user_id: userSession.user.id,
        role: "user",
        content: userText
      });

      // 3. Chamar a IA (via Edge Function -> n8n)
      const { data, error } = await supabase.functions.invoke('grifo-ai', {
        body: { 
          query: userText,
          user_id: userSession.user.id,
          chat_id: userSession.user.id // Usamos user_id como session_id para memória persistente
        }
      });

      if (error) throw error;

      const aiResponse = data?.answer || "Desculpe, não consegui processar a resposta.";

      // 4. Salvar resposta no banco
      await supabase.from("grifo_chat_messages").insert({
        user_id: userSession.user.id,
        role: "assistant",
        content: aiResponse
      });

      // 5. Atualizar UI
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);

    } catch (error) {
      console.error(error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao GrifoAI.",
        variant: "destructive"
      });
      // Remover a mensagem otimista em caso de erro grave (opcional)
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!userSession?.user?.id) return;
    await supabase.from("grifo_chat_messages").delete().eq("user_id", userSession.user.id);
    setMessages([{ role: "assistant", content: "Histórico limpo. O que vamos construir agora?" }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-5xl mx-auto gap-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#112131] rounded-lg">
            <Sparkles className="h-6 w-6 text-[#C7A347]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#112131]">GrifoAI</h1>
            <p className="text-xs text-slate-500">Powered by n8n RAG</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500">
              <Trash2 className="h-4 w-4 mr-2" /> Limpar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apagar histórico?</AlertDialogTitle>
              <AlertDialogDescription>Isso remove o histórico visual.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearHistory} className="bg-red-500 hover:bg-red-600">Apagar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-md bg-slate-50/50">
        <ScrollArea className="flex-1 p-4 sm:p-6">
          {initialLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-[#C7A347]" />
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 border border-slate-200 mt-1">
                      <AvatarFallback className="bg-[#112131] text-[#C7A347]"><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.role === "user" ? "bg-[#112131] text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 justify-start animate-pulse">
                  <Avatar className="h-8 w-8 border border-slate-200 mt-1">
                    <AvatarFallback className="bg-[#112131] text-[#C7A347]"><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-[#C7A347]" />
                    Processando...
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-2 relative">
            <Input 
              placeholder="Digite sua dúvida..." 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()} 
              disabled={loading}
              className="pr-12 py-6 bg-slate-50 border-slate-200 focus-visible:ring-[#112131]"
            />
            <Button size="icon" className="absolute right-1 top-1 h-10 w-10 bg-[#C7A347] hover:bg-[#b08d3b] text-white" onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GrifoAI;
