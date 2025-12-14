import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, User, Phone, CheckCircle2, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
  contact?: {
    name: string;
    phone: string;
  };
}

interface MarketplaceDetailModalProps {
  item: MarketplaceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

// CORREÇÃO: Exportação nomeada
export function MarketplaceDetailModal({ item, isOpen, onClose }: MarketplaceDetailModalProps) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white gap-0">
        {/* Header Visual com Imagem */}
        <div className="relative h-64 w-full bg-slate-100">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 p-6 w-full text-white">
            <div className="flex gap-2 mb-2">
              <Badge className="bg-secondary text-white border-none hover:bg-secondary">{item.category}</Badge>
              <Badge variant="outline" className="text-white border-white/40 backdrop-blur-md">
                {item.type}
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold font-heading leading-tight mb-1">{item.title}</DialogTitle>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {item.location}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">{item.rating}</span>
                <span className="opacity-70">({item.reviews} avaliações)</span>
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

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 uppercase mb-2">Especialidades</h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-secondary" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna da Direita: Card de Contato */}
            <div className="md:col-span-1">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Fornecedor</p>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">
                      {item.contact?.name || "Parceiro Grifo"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button className="w-full bg-green-600 hover:bg-green-700 gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full border-slate-300 gap-2">
                    <Phone className="h-4 w-4" />
                    Ligar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50 sm:justify-between items-center">
          <span className="text-xs text-slate-400 hidden sm:block">
            ID do Anúncio: #{item.id.toString().padStart(6, "0")}
          </span>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
