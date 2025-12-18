import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SignupAfterFormProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: "profissional" | "empresa" | "fornecedor";
  emailDefault: string;
}

export function SignupAfterFormDialog({ isOpen, onClose, entityId, entityType, emailDefault }: SignupAfterFormProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      // 1. Criar Usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailDefault,
        password: password,
        options: {
          data: {
            role: "parceiro",
            entity_type: entityType,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      // 2. Atualizar entrada na tabela usuarios com role 'parceiro'
      // (O trigger handle_new_user já cria o registro, então fazemos update)
      const { error: usuarioError } = await supabase
        .from("usuarios")
        .update({ role: "parceiro" as any })
        .eq("id", authData.user.id);

      if (usuarioError) {
        console.error("Erro ao atualizar role do usuario:", usuarioError);
      }

      // 3. Vincular o registro criado ao novo user_id
      let updateError = null;

      if (entityType === "profissional") {
        const res = await supabase
          .from("formulario_profissionais")
          .update({ user_id: authData.user.id })
          .eq("id", entityId);
        updateError = res.error;
      } else if (entityType === "empresa") {
        const res = await supabase.from("formulario_empresas").update({ user_id: authData.user.id }).eq("id", entityId);
        updateError = res.error;
      } else if (entityType === "fornecedor") {
        const res = await supabase
          .from("formulario_fornecedores")
          .update({ user_id: authData.user.id })
          .eq("id", entityId);
        updateError = res.error;
      }

      if (updateError) throw updateError;

      toast.success("Conta criada com sucesso! Acesso liberado.");
      navigate("/portal-parceiro");
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerencie seu Perfil</DialogTitle>
          <DialogDescription>
            Crie uma senha para acessar seu painel exclusivo. Você poderá editar suas informações e adicionar mais fotos
            ao marketplace a qualquer momento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email cadastrado</Label>
            <Input value={emailDefault} disabled className="bg-slate-100" />
          </div>
          <div className="space-y-2">
            <Label>Crie uma Senha</Label>
            <Input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleSignup} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Acesso e Entrar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
