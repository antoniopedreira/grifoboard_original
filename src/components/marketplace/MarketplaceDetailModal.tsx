import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Phone, CheckCircle2, MessageCircle, Building2, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { MarketplaceItem } from "@/pages/Marketplace";

interface MarketplaceDetailModalProps {
  item: MarketplaceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Profissional":
      return <User className="h-5 w-5" />;
    case "Empresa":
      return <Building2 className="h-5 w-5" />;
    case "Fornecedor":
      return <Truck className="h-5 w-5" />;
    default:
      return <User className="h-5 w-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Profissional":
      return "bg-blue-600";
    case "Empresa":
      return "bg-emerald-600";
    case "Fornecedor":
      return "bg-amber-600";
    default:
      return "bg-slate-600";
  }
};

const getContactInfo = (item: MarketplaceItem) => {
  const raw = item.rawData;
  if (item.category === "Profissional") {
    return {
      name: raw.nome_completo,
      phone: raw.telefone,
      email: raw.email,
    };
  } else if (item.category === "Empresa") {
    return {
      name: raw.nome_contato,
      phone: raw.whatsapp_contato,
      email: raw.email_contato,
    };
  } else {
    return {
      name: raw.nome_responsavel,
      phone: raw.telefone,
      email: raw.email,
    };
  }
};

export function MarketplaceDetailModal({ item, isOpen, onClose }: MarketplaceDetailModalProps) {
  if (!item) return null;

  const contact = getContactInfo(item);
  const whatsappLink = contact.phone ? `https://wa.me/55${contact.phone.replace(/\D/g, "")}` : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white gap-0">
        {/* Header Visual */}
        <div className="relative h-48 w-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
          {item.image ? (
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-20 h-20 rounded-full ${getCategoryColor(item.category)} flex items-center justify-center text-white`}>
              {getCategoryIcon(item.category)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 p-6 w-full text-white">
            <div className="flex gap-2 mb-2">
              <Badge className={`${getCategoryColor(item.category)} text-white border-none`}>
                {item.category}
              </Badge>
              <Badge variant="outline" className="text-white border-white/40 backdrop-blur-md">
                {item.type}
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold font-heading leading-tight mb-1">{item.title}</DialogTitle>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {item.location}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna da Esquerda: Descrição */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase mb-2">Sobre</h4>
                <DialogDescription className="text-base text-slate-600 leading-relaxed">
                  {item.description}
                </DialogDescription>
              </div>

              {item.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 uppercase mb-2">Especialidades / Categorias</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-secondary" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Coluna da Direita: Card de Contato */}
            <div className="md:col-span-1">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full ${getCategoryColor(item.category)} flex items-center justify-center text-white`}>
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">{item.category}</p>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">
                      {contact.name || "Parceiro Grifo"}
                    </p>
                  </div>
                </div>

                {contact.email && (
                  <p className="text-xs text-slate-500 truncate">{contact.email}</p>
                )}

                <Separator />

                <div className="space-y-2">
                  {whatsappLink && (
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 gap-2">
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                  {contact.phone && (
                    <Button asChild variant="outline" className="w-full border-slate-300 gap-2">
                      <a href={`tel:${contact.phone}`}>
                        <Phone className="h-4 w-4" />
                        Ligar
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50 sm:justify-between items-center">
          <span className="text-xs text-slate-400 hidden sm:block">
            ID: {item.id.slice(0, 8)}
          </span>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
