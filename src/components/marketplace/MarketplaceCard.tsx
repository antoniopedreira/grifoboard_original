import { MapPin, Star, Building2, User, Truck, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPhoneNumber } from "@/lib/utils/formatPhone";

type TargetType = "empresa" | "profissional" | "fornecedor";

interface MarketplaceItem {
  id: string;
  type: TargetType;
  name: string;
  location: string;
  categories?: string[];
  rating: number;
  reviewCount: number;
  data: any;
}

interface MarketplaceCardProps {
  item: MarketplaceItem;
  onClick: () => void;
}

export const MarketplaceCard = ({ item, onClick }: MarketplaceCardProps) => {
  const getTypeIcon = () => {
    switch (item.type) {
      case "empresa": return <Building2 className="h-5 w-5" />;
      case "profissional": return <User className="h-5 w-5" />;
      case "fornecedor": return <Truck className="h-5 w-5" />;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case "empresa": return "bg-blue-500/10 text-blue-600";
      case "profissional": return "bg-emerald-500/10 text-emerald-600";
      case "fornecedor": return "bg-amber-500/10 text-amber-600";
    }
  };

  const getExtraInfo = () => {
    if (item.type === "profissional") {
      return item.data.funcao_principal || null;
    }
    if (item.type === "fornecedor") {
      return item.data.tempo_atuacao ? `${item.data.tempo_atuacao} no mercado` : null;
    }
    if (item.type === "empresa") {
      return item.data.tamanho_empresa || null;
    }
    return null;
  };

  const getPhone = () => {
    if (item.type === "empresa") {
      return formatPhoneNumber(item.data.whatsapp_contato);
    }
    return formatPhoneNumber(item.data.telefone);
  };

  const extraInfo = getExtraInfo();
  const phone = getPhone();

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border/50"
      onClick={onClick}
    >
      {/* Header with gradient */}
      <div className={`h-24 relative ${
        item.type === "empresa" ? "bg-gradient-to-br from-blue-500/20 to-blue-600/10" :
        item.type === "profissional" ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10" :
        "bg-gradient-to-br from-amber-500/20 to-amber-600/10"
      }`}>
        <div className="absolute top-3 right-3">
          <div className={`p-2 rounded-full ${getTypeColor()}`}>
            {getTypeIcon()}
          </div>
        </div>
        
        {/* Rating badge */}
        {item.reviewCount > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({item.reviewCount})</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Name */}
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {item.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{item.location}</span>
        </div>

        {/* Phone */}
        {phone && (
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{phone}</span>
          </div>
        )}

        {/* Extra info */}
        {extraInfo && (
          <p className="text-xs text-muted-foreground mb-3">{extraInfo}</p>
        )}

        {/* Categories */}
        {item.categories && item.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.categories.slice(0, 3).map((cat, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs font-normal">
                {cat}
              </Badge>
            ))}
            {item.categories.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{item.categories.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* No reviews indicator */}
        {item.reviewCount === 0 && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs mt-2">
            <Star className="h-3 w-3" />
            <span>Sem avaliações</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
