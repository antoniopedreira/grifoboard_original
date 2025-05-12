
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getCurrentWeekDates } from "@/utils/pcp";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { start, end } = getCurrentWeekDates();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">GrifoBoard</h1>
          <span className="rounded-md bg-white/20 px-2 py-1 text-sm">
            {formatDate(start)} — {formatDate(end)}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">Sobre</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl">GrifoBoard - Planejamento e Controle de Produção</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <p>
                  O GrifoBoard é uma plataforma SaaS para planejamento e controle da produção (PCP) 
                  em obras de construção civil.
                </p>
                <p>
                  Com esta ferramenta, você pode registrar, monitorar e atualizar as atividades 
                  semanais planejadas por equipe, setor e responsável, promovendo acompanhamento 
                  em tempo real e geração automática do indicador de execução semanal.
                </p>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="bg-white/20 hover:bg-white/30">
            Nova Tarefa
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
