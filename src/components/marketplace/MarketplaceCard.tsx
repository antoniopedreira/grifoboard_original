import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ArrowRight } from "lucide-react";

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
}

interface MarketplaceCardProps {
  item: MarketplaceItem;
  onClick: () => void;
}

// CORREÇÃO: Exportação nomeada
export function MarketplaceCard({ item, onClick }: MarketplaceCardProps) {
  return (
    <Card
      className="group overflow-hidden cursor-pointer border-border/60 hover:shadow-xl hover:border-secondary/30 transition-all duration-300 h-full flex flex-col bg-white"
      onClick={onClick}
    >
      {/* Imagem de Capa */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className="bg-white/90 text-slate-800 hover:bg-white backdrop-blur-sm shadow-sm font-semibold border-none">
            {item.type}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardContent className="p-5 flex-1 flex flex-col gap-3">
        {/* Categoria e Rating */}
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">{item.category}</span>
          <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-700">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span className="text-xs font-bold">{item.rating}</span>
            <span className="text-[10px] text-amber-600/70">({item.reviews})</span>
          </div>
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
