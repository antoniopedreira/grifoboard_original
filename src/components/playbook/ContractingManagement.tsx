import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Upload, Eye, Paperclip } from "lucide-react";

interface ContractingItem {
  id: string;
  item_name: string;
  category: string;
  estimated_value: number;
  status: "Pendente" | "Em Cotação" | "Negociada" | "Contratada" | "Cancelada";
  supplier_name?: string;
  contract_url?: string;
}

const ContractingManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newItemName, setNewItemName] = useState("");
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // --- QUERIES & MUTATIONS ---

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["playbook_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playbook_items" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // CORREÇÃO AQUI: Cast duplo para resolver o erro TS2352
      return (data || []) as unknown as ContractingItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!newItemName.trim()) return;
      const { error } = await supabase.from("playbook_items" as any).insert({
        item_name: newItemName,
        status: "Pendente",
        category: "Material",
        estimated_value: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook_items"] });
      setNewItemName("");
      toast({ title: "Item adicionado com sucesso" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: any }) => {
      const { error } = await supabase
        .from("playbook_items" as any)
        .update({ [field]: value })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook_items"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("playbook_items" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook_items"] });
      toast({ title: "Item removido" });
    },
  });

  // --- LÓGICA DE UPLOAD ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(itemId);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${itemId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from("playbook-documents").upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("playbook-documents").getPublicUrl(filePath);

      await updateMutation.mutateAsync({
        id: itemId,
        field: "contract_url",
        value: publicUrl,
      });

      toast({ title: "Contrato anexado com sucesso!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao anexar contrato", variant: "destructive" });
    } finally {
      setIsUploading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Contratada":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Negociada":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Em Cotação":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Cancelada":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-800">Mapa de Compras & Contratações</h2>
          <p className="text-sm text-slate-500">Gerencie o status de aquisições e anexe contratos.</p>
        </div>
      </div>

      <div className="flex gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <Input
          placeholder="Nome do material ou serviço (ex: Cimento, Pintura...)"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="max-w-md"
        />
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="bg-primary text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar Item
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[250px]">Item / Serviço</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Valor Est. (R$)</TableHead>
              <TableHead className="w-[180px]">Status</TableHead>
              <TableHead className="w-[180px] text-center">Contrato</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-slate-500">
                  Nenhum item cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">{item.item_name}</TableCell>

                  <TableCell>
                    <Select
                      defaultValue={item.category || "Material"}
                      onValueChange={(val) => updateMutation.mutate({ id: item.id, field: "category", value: val })}
                    >
                      <SelectTrigger className="h-8 w-[130px] border-none bg-transparent hover:bg-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Material">Material</SelectItem>
                        <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                        <SelectItem value="Equipamento">Equipamento</SelectItem>
                        <SelectItem value="Serviço">Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Input
                      className="h-8 border-none bg-transparent hover:bg-slate-100 focus:bg-white transition-colors"
                      placeholder="-"
                      defaultValue={item.supplier_name || ""}
                      onBlur={(e) =>
                        updateMutation.mutate({ id: item.id, field: "supplier_name", value: e.target.value })
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      className="h-8 w-[100px] border-none bg-transparent hover:bg-slate-100 focus:bg-white transition-colors"
                      placeholder="0.00"
                      defaultValue={item.estimated_value}
                      onBlur={(e) =>
                        updateMutation.mutate({
                          id: item.id,
                          field: "estimated_value",
                          value: parseFloat(e.target.value),
                        })
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Select
                      defaultValue={item.status}
                      onValueChange={(val) => updateMutation.mutate({ id: item.id, field: "status", value: val })}
                    >
                      <SelectTrigger className="h-8 border-none p-0">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(item.status)} hover:opacity-80 transition-opacity`}
                        >
                          {item.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Em Cotação">Em Cotação</SelectItem>
                        <SelectItem value="Negociada">Negociada</SelectItem>
                        <SelectItem value="Contratada">Contratada</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="text-center">
                    {item.status === "Negociada" || item.status === "Contratada" ? (
                      <div className="flex items-center justify-center gap-2">
                        {item.contract_url ? (
                          <>
                            <a
                              href={item.contract_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
                              title="Visualizar Contrato"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <label
                              className="cursor-pointer inline-flex items-center justify-center h-8 w-8 rounded-md bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors border border-slate-200"
                              title="Substituir Arquivo"
                            >
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, item.id)}
                                disabled={isUploading === item.id}
                              />
                              {isUploading === item.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Upload className="h-3 w-3" />
                              )}
                            </label>
                          </>
                        ) : (
                          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 h-8 rounded-md bg-[#C7A347] text-white hover:bg-[#b08d3b] transition-all shadow-sm text-xs font-medium uppercase tracking-wide">
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, item.id)}
                              disabled={isUploading === item.id}
                            />
                            {isUploading === item.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Paperclip className="h-3 w-3" /> Anexar
                              </>
                            )}
                          </label>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs italic">--</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// GARANTINDO A EXPORTAÇÃO DEFAULT
export default ContractingManagement;
