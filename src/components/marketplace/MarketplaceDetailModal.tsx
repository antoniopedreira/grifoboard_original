import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/lib/utils/formatPhone";
import { 
  MapPin, Star, Building2, User, Truck, Phone, Mail, 
  Globe, Calendar, Briefcase, Award, Send, Edit2, Trash2,
  FileText, Image, Download, ExternalLink, ChevronLeft, ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_email?: string;
}

interface MarketplaceDetailModalProps {
  item: MarketplaceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const MarketplaceDetailModal = ({ 
  item, 
  isOpen, 
  onClose, 
  onReviewSubmitted 
}: MarketplaceDetailModalProps) => {
  const { userSession } = useAuth();
  const user = userSession?.user;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      fetchReviews();
    }
  }, [item, isOpen]);

  const fetchReviews = async () => {
    if (!item) return;
    
    const { data, error } = await supabase
      .from("marketplace_reviews")
      .select("*")
      .eq("target_type", item.type)
      .eq("target_id", item.id)
      .order("created_at", { ascending: false });

    if (data) {
      setReviews(data);
      const myReview = data.find(r => r.user_id === user?.id);
      if (myReview) {
        setExistingReview(myReview);
        setMyRating(myReview.rating);
        setMyComment(myReview.comment || "");
      } else {
        setExistingReview(null);
        setMyRating(0);
        setMyComment("");
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!item || !user || myRating === 0) {
      toast.error("Selecione uma avaliação de 1 a 5 estrelas");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        const { error } = await supabase
          .from("marketplace_reviews")
          .update({
            rating: myRating,
            comment: myComment || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingReview.id);

        if (error) throw error;
        toast.success("Avaliação atualizada!");
      } else {
        const { error } = await supabase
          .from("marketplace_reviews")
          .insert({
            user_id: user.id,
            target_type: item.type,
            target_id: item.id,
            rating: myRating,
            comment: myComment || null
          });

        if (error) throw error;
        toast.success("Avaliação enviada!");
      }

      setIsEditing(false);
      fetchReviews();
      onReviewSubmitted();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error("Erro ao enviar avaliação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview) return;

    try {
      const { error } = await supabase
        .from("marketplace_reviews")
        .delete()
        .eq("id", existingReview.id);

      if (error) throw error;
      
      toast.success("Avaliação removida");
      setExistingReview(null);
      setMyRating(0);
      setMyComment("");
      fetchReviews();
      onReviewSubmitted();
    } catch (error) {
      toast.error("Erro ao remover avaliação");
    }
  };

  if (!item) return null;

  const getTypeLabel = () => {
    switch (item.type) {
      case "empresa": return "Empresa";
      case "profissional": return "Profissional";
      case "fornecedor": return "Fornecedor";
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case "empresa": return <Building2 className="h-5 w-5" />;
      case "profissional": return <User className="h-5 w-5" />;
      case "fornecedor": return <Truck className="h-5 w-5" />;
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              item.type === "empresa" ? "bg-blue-500/10 text-blue-600" :
              item.type === "profissional" ? "bg-emerald-500/10 text-emerald-600" :
              "bg-amber-500/10 text-amber-600"
            }`}>
              {getTypeIcon()}
            </div>
            <div className="flex-1">
              <Badge variant="outline" className="mb-2 text-xs">
                {getTypeLabel()}
              </Badge>
              <DialogTitle className="text-xl font-bold">{item.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4" />
                <span>{item.location}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold">{avgRating}</span>
              </div>
              <p className="text-xs text-muted-foreground">{reviews.length} avaliações</p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="flex-1">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="docs">Arquivos</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações ({reviews.length})</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[55vh]">
            <TabsContent value="info" className="p-6 pt-4 m-0">
              <DetailInfo item={item} />
            </TabsContent>

            <TabsContent value="docs" className="p-6 pt-4 m-0">
              <DocumentsSection item={item} />
            </TabsContent>

            <TabsContent value="reviews" className="p-6 pt-4 m-0">
              {/* My Review Section */}
              <div className="bg-muted/30 rounded-xl p-4 mb-6">
                <h4 className="font-medium mb-3">
                  {existingReview && !isEditing ? "Sua avaliação" : "Deixe sua avaliação"}
                </h4>
                
                {existingReview && !isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= existingReview.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    {existingReview.comment && (
                      <p className="text-sm text-muted-foreground">{existingReview.comment}</p>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleDeleteReview} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setMyRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="p-0.5 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              star <= (hoveredStar || myRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Escreva um comentário (opcional)"
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSubmitReview} 
                        disabled={myRating === 0 || isSubmitting}
                        size="sm"
                      >
                        <Send className="h-3.5 w-3.5 mr-1" />
                        {existingReview ? "Atualizar" : "Enviar"}
                      </Button>
                      {isEditing && (
                        <Button variant="ghost" size="sm" onClick={() => {
                          setIsEditing(false);
                          setMyRating(existingReview?.rating || 0);
                          setMyComment(existingReview?.comment || "");
                        }}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Other Reviews */}
              <div className="space-y-4">
                <h4 className="font-medium">Todas as avaliações</h4>
                {reviews.filter(r => r.user_id !== user?.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma outra avaliação ainda
                  </p>
                ) : (
                  reviews
                    .filter(r => r.user_id !== user?.id)
                    .map((review) => (
                      <div key={review.id} className="border-b border-border/50 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), "dd MMM yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Documents Section Component
const DocumentsSection = ({ item }: { item: MarketplaceItem }) => {
  const { data } = item;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getBucketName = () => {
    switch (item.type) {
      case "profissional": return "formularios-profissionais";
      case "fornecedor": return "formularios-fornecedores";
      case "empresa": return "formularios-empresas";
    }
  };

  const getDocumentFields = () => {
    switch (item.type) {
      case "profissional":
        return [
          { key: "curriculo_path", label: "Currículo", isImage: false },
          { key: "fotos_trabalhos_path", label: "Fotos de Trabalhos", isImage: true },
          { key: "certificacoes_path", label: "Certificações", isImage: false },
        ];
      case "fornecedor":
        return [
          { key: "logo_path", label: "Logo", isImage: true },
          { key: "portfolio_path", label: "Portfólio", isImage: false },
          { key: "certificacoes_path", label: "Certificações", isImage: false },
        ];
      case "empresa":
        return [
          { key: "logo_path", label: "Logo", isImage: true },
          { key: "apresentacao_path", label: "Apresentação Institucional", isImage: false },
        ];
    }
  };

  const getPublicUrl = (path: string) => {
    const bucket = getBucketName();
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData?.publicUrl || "";
  };

  const isImageFile = (path: string) => {
    const ext = path.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  const fields = getDocumentFields();
  
  // Separate images and documents
  const images: { label: string; url: string; path: string }[] = [];
  const documents: { label: string; url: string; path: string }[] = [];

  fields.forEach(field => {
    const path = data[field.key];
    if (path) {
      const url = getPublicUrl(path);
      const fileIsImage = isImageFile(path);
      
      if (fileIsImage || field.isImage) {
        images.push({ label: field.label, url, path });
      } else {
        documents.push({ label: field.label, url, path });
      }
    }
  });

  const hasAnyFile = images.length > 0 || documents.length > 0;

  if (!hasAnyFile) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Nenhum arquivo disponível</p>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-6">
      {/* Photos Gallery Section */}
      {images.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-4 flex items-center gap-2">
            <Image className="h-4 w-4" />
            Fotos ({images.length})
          </h4>
          
          <div className="relative bg-muted/30 rounded-xl overflow-hidden">
            {/* Main Image */}
            <div className="relative aspect-video flex items-center justify-center bg-black/5">
              <img 
                src={images[currentImageIndex].url} 
                alt={images[currentImageIndex].label}
                className="max-w-full max-h-72 object-contain"
              />
              
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-md transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-md transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Image info and actions */}
            <div className="p-4 flex items-center justify-between border-t border-border/50">
              <div>
                <p className="font-medium text-sm">{images[currentImageIndex].label}</p>
                {images.length > 1 && (
                  <p className="text-xs text-muted-foreground">{currentImageIndex + 1} de {images.length}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(images[currentImageIndex].url, '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Abrir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a href={images[currentImageIndex].url} download={images[currentImageIndex].label}>
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? "border-primary" 
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img 
                      src={img.url} 
                      alt={img.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents Section */}
      {documents.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos ({documents.length})
          </h4>
          
          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.path.split('.').pop()?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Visualizar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a href={doc.url} download={doc.label}>
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for detail info
const DetailInfo = ({ item }: { item: MarketplaceItem }) => {
  const { data } = item;

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </div>
    );
  };

  if (item.type === "profissional") {
    return (
      <div className="space-y-1">
        <InfoRow icon={Briefcase} label="Função Principal" value={data.funcao_principal} />
        <InfoRow icon={Calendar} label="Experiência" value={data.tempo_experiencia} />
        <InfoRow icon={Award} label="Disponibilidade" value={data.disponibilidade_atual} />
        <InfoRow icon={Briefcase} label="Modalidade" value={data.modalidade_trabalho} />
        <InfoRow icon={Briefcase} label="Pretensão Salarial" value={data.pretensao_valor} />
        <InfoRow icon={Award} label="Equipamentos Próprios" value={data.equipamentos_proprios} />
        <InfoRow icon={Phone} label="Telefone" value={formatPhoneNumber(data.telefone)} />
        <InfoRow icon={Mail} label="Email" value={data.email} />
        
        {data.regioes_atendidas?.length > 0 && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-2">Regiões Atendidas</p>
            <div className="flex flex-wrap gap-1.5">
              {data.regioes_atendidas.map((reg: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">{reg}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.cidades_frequentes && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-2">Cidades Frequentes</p>
            <p className="text-sm">{data.cidades_frequentes}</p>
          </div>
        )}

        {data.especialidades?.length > 0 && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-2">Especialidades</p>
            <div className="flex flex-wrap gap-1.5">
              {data.especialidades.map((esp: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">{esp}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.diferenciais?.length > 0 && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-2">Diferenciais</p>
            <div className="flex flex-wrap gap-1.5">
              {data.diferenciais.map((dif: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">{dif}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.obras_relevantes && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-2">Obras Relevantes</p>
            <p className="text-sm">{data.obras_relevantes}</p>
          </div>
        )}
      </div>
    );
  }

  if (item.type === "fornecedor") {
    return (
      <div className="space-y-1">
        <InfoRow icon={Calendar} label="Tempo de Atuação" value={data.tempo_atuacao} />
        <InfoRow icon={Briefcase} label="Capacidade de Atendimento" value={data.capacidade_atendimento} />
        <InfoRow icon={Briefcase} label="Ticket Médio" value={data.ticket_medio} />
        <InfoRow icon={User} label="Responsável" value={data.nome_responsavel} />
        <InfoRow icon={Phone} label="Telefone" value={formatPhoneNumber(data.telefone)} />
        <InfoRow icon={Mail} label="Email" value={data.email} />
        <InfoRow icon={Globe} label="Site" value={data.site} />

        {data.regioes_atendidas?.length > 0 && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-2">Regiões Atendidas</p>
            <div className="flex flex-wrap gap-1.5">
              {data.regioes_atendidas.map((reg: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">{reg}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.cidades_frequentes && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-2">Cidades Frequentes</p>
            <p className="text-sm">{data.cidades_frequentes}</p>
          </div>
        )}

        {data.tipos_atuacao?.length > 0 && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-2">Tipos de Atuação</p>
            <div className="flex flex-wrap gap-1.5">
              {data.tipos_atuacao.map((tipo: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">{tipo}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.categorias_atendidas?.length > 0 && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-2">Categorias Atendidas</p>
            <div className="flex flex-wrap gap-1.5">
              {data.categorias_atendidas.map((cat: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">{cat}</Badge>
              ))}
            </div>
          </div>
        )}

        {data.diferenciais?.length > 0 && (
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-2">Diferenciais</p>
            <div className="flex flex-wrap gap-1.5">
              {data.diferenciais.map((dif: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">{dif}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Empresa
  return (
    <div className="space-y-1">
      <InfoRow icon={Building2} label="Tamanho da Empresa" value={data.tamanho_empresa} />
      <InfoRow icon={Calendar} label="Ano de Fundação" value={data.ano_fundacao} />
      <InfoRow icon={Briefcase} label="Obras em Andamento" value={data.obras_andamento} />
      <InfoRow icon={Briefcase} label="Ticket Médio" value={data.ticket_medio} />
      <InfoRow icon={User} label="Contato" value={data.nome_contato} />
      <InfoRow icon={Briefcase} label="Cargo" value={data.cargo_contato} />
      <InfoRow icon={Phone} label="WhatsApp" value={formatPhoneNumber(data.whatsapp_contato)} />
      <InfoRow icon={Mail} label="Email" value={data.email_contato} />
      <InfoRow icon={Globe} label="Site" value={data.site} />
      <InfoRow icon={Briefcase} label="Planejamento" value={data.planejamento_curto_prazo} />
      <InfoRow icon={Briefcase} label="Ferramentas de Gestão" value={data.ferramentas_gestao} />

      {data.tipos_obras?.length > 0 && (
        <div className="pt-4">
          <p className="text-xs text-muted-foreground mb-2">Tipos de Obras</p>
          <div className="flex flex-wrap gap-1.5">
            {data.tipos_obras.map((tipo: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">{tipo}</Badge>
            ))}
          </div>
        </div>
      )}

      {data.principais_desafios?.length > 0 && (
        <div className="pt-4">
          <p className="text-xs text-muted-foreground mb-2">Principais Desafios</p>
          <div className="flex flex-wrap gap-1.5">
            {data.principais_desafios.map((desafio: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">{desafio}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
