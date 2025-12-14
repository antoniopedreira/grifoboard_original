import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, User, Building2, Truck } from "lucide-react";
import type { MarketplaceItem } from "@/pages/Marketplace";

interface MarketplaceCardProps {
  item: MarketplaceItem;
  onClick: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Profissional":
      return <User className="h-4 w-4" />;
    case "Empresa":
      return <Building2 className="h-4 w-4" />;
    case "Fornecedor":
      return <Truck className="h-4 w-4" />;
    default:
      return null;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Profissional":
      return "bg-blue-100 text-blue-700";
    case "Empresa":
      return "bg-emerald-100 text-emerald-700";
    case "Fornecedor":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

// CORREÇÃO: Exportação nomeada
export function MarketplaceCard({ item, onClick }: MarketplaceCardProps) {
  return (
    <Card
      className="group overflow-hidden cursor-pointer border-border/60 hover:shadow-xl hover:border-secondary/30 transition-all duration-300 h-full flex flex-col bg-white"
      onClick={onClick}
    >
      {/* Header com ícone ou imagem */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400">
            {getCategoryIcon(item.category)}
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className={`${getCategoryColor(item.category)} backdrop-blur-sm shadow-sm font-semibold border-none flex items-center gap-1`}>
            {getCategoryIcon(item.category)}
            {item.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col gap-3">
        {/* Tipo */}
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">{item.type}</span>
        </div>

        <h3 className="font-heading font-bold text-lg text-slate-800 leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {item.title}
        </h3>

        <p className="text-sm text-slate-500 line-clamp-2 mb-2 flex-1">{item.description}</p>

        {/* Localização */}
        <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-auto">
          <MapPin className="h-3.5 w-3.5" />
          <span>{item.location}</span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 mt-auto">
        <Button
          variant="outline"
          className="w-full border-slate-200 text-slate-600 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all"
        >
          Ver Detalhes
          <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </Button>
      </CardFooter>
    </Card>
  );
}
