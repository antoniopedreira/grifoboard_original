import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  FileText, Image, Download, ArrowLeft, ChevronLeft, ChevronRight,
  X, ZoomIn
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
      case "empresa": return <Building2 className="h-6 w-6" />;
      case "profissional": return <User className="h-6 w-6" />;
      case "fornecedor": return <Truck className="h-6 w-6" />;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case "empresa": return "from-blue-500 to-blue-600";
      case "profissional": return "from-emerald-500 to-emerald-600";
      case "fornecedor": return "from-amber-500 to-amber-600";
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl">
        {/* Header with gradient */}
        <div className={`relative bg-gradient-to-r ${getTypeColor()} p-6 pb-20`}>
          {/* Back button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Rating badge */}
          <div className="absolute top-4 right-16 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
            <span className="text-white font-semibold">{avgRating}</span>
            <span className="text-white/70 text-sm">({reviews.length})</span>
          </div>
        </div>

        {/* Profile card overlapping header */}
        <div className="relative -mt-16 mx-6 mb-4">
          <div className="bg-background rounded-2xl shadow-lg p-6 border">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${getTypeColor()} flex items-center justify-center text-white shadow-lg`}>
                {getTypeIcon()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Badge variant="secondary" className="mb-2 text-xs font-medium">
                  {getTypeLabel()}
                </Badge>
                <h2 className="text-2xl font-bold text-foreground truncate">{item.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{item.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="flex-1 flex flex-col px-6">
          <TabsList className="w-full justify-start gap-2 bg-transparent p-0 h-auto mb-4">
            <TabsTrigger 
              value="info" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-5 py-2"
            >
              Informações
            </TabsTrigger>
            <TabsTrigger 
              value="fotos" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-5 py-2"
            >
              Fotos
            </TabsTrigger>
            <TabsTrigger 
              value="docs" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-5 py-2"
            >
              Documentos
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-5 py-2"
            >
              Avaliações ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 -mx-6 px-6 pb-6">
            <TabsContent value="info" className="mt-0 space-y-0">
              <DetailInfo item={item} />
            </TabsContent>

            <TabsContent value="fotos" className="mt-0">
              <PhotosSection item={item} />
            </TabsContent>

            <TabsContent value="docs" className="mt-0">
              <DocumentsSection item={item} />
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              {/* My Review Section */}
              <div className="bg-muted/30 rounded-2xl p-5 mb-6 border">
                <h4 className="font-semibold mb-4">
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
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setMyRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="p-1 transition-transform hover:scale-125"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              star <= (hoveredStar || myRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30 hover:text-muted-foreground/50"
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
                      className="resize-none rounded-xl"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSubmitReview} 
                        disabled={myRating === 0 || isSubmitting}
                        className="rounded-full"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {existingReview ? "Atualizar" : "Enviar Avaliação"}
                      </Button>
                      {isEditing && (
                        <Button variant="ghost" onClick={() => {
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
                <h4 className="font-semibold">Todas as avaliações</h4>
                {reviews.filter(r => r.user_id !== user?.id).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl">
                    <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Nenhuma outra avaliação ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews
                      .filter(r => r.user_id !== user?.id)
                      .map((review) => (
                        <div key={review.id} className="bg-muted/20 rounded-xl p-4">
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
                    }
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Photos Gallery Section
const PhotosSection = ({ item }: { item: MarketplaceItem }) => {
  const { data } = item;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const getBucketName = () => {
    switch (item.type) {
      case "profissional": return "formularios-profissionais";
      case "fornecedor": return "formularios-fornecedores";
      case "empresa": return "formularios-empresas";
    }
  };

  const getImageFields = () => {
    switch (item.type) {
      case "profissional":
        return [
          { key: "fotos_trabalhos_path", label: "Fotos de Trabalhos" },
        ];
      case "fornecedor":
        return [
          { key: "logo_path", label: "Logo" },
          { key: "portfolio_path", label: "Portfólio" },
        ];
      case "empresa":
        return [
          { key: "logo_path", label: "Logo" },
        ];
      default:
        return [];
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

  // Collect all images, handling comma-separated paths
  const images: { label: string; url: string }[] = [];
  
  getImageFields().forEach(field => {
    const pathValue = data[field.key];
    if (pathValue) {
      // Split by comma in case of multiple files
      const paths = pathValue.split(',').map((p: string) => p.trim()).filter(Boolean);
      paths.forEach((path: string) => {
        if (isImageFile(path)) {
          images.push({ label: field.label, url: getPublicUrl(path) });
        }
      });
    }
  });

  if (images.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-2xl">
        <Image className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p className="font-medium">Nenhuma foto disponível</p>
        <p className="text-sm mt-1">Este perfil ainda não adicionou fotos</p>
      </div>
    );
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="space-y-4">
      {/* Main Image Viewer */}
      <div className="relative bg-black/5 rounded-2xl overflow-hidden">
        <div className="aspect-[16/10] flex items-center justify-center relative">
          <img 
            src={images[currentImageIndex].url} 
            alt={images[currentImageIndex].label}
            className="max-w-full max-h-full object-contain cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          
          {/* Zoom indicator */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ZoomIn className="h-5 w-5" />
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                idx === currentImageIndex 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img 
                src={img.url} 
                alt={`Foto ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="h-6 w-6" />
          </button>
          
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <img 
            src={images[currentImageIndex].url} 
            alt={images[currentImageIndex].label}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

// Documents Section Component
const DocumentsSection = ({ item }: { item: MarketplaceItem }) => {
  const { data } = item;

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
          { key: "curriculo_path", label: "Currículo" },
          { key: "certificacoes_path", label: "Certificações" },
        ];
      case "fornecedor":
        return [
          { key: "portfolio_path", label: "Portfólio" },
          { key: "certificacoes_path", label: "Certificações" },
        ];
      case "empresa":
        return [
          { key: "apresentacao_path", label: "Apresentação Institucional" },
        ];
      default:
        return [];
    }
  };

  const getPublicUrl = (path: string) => {
    const bucket = getBucketName();
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData?.publicUrl || "";
  };

  const isDocumentFile = (path: string) => {
    const ext = path.toLowerCase().split('.').pop();
    return ['pdf', 'doc', 'docx'].includes(ext || '');
  };

  const getFileExtension = (path: string) => {
    return path.split('.').pop()?.toUpperCase() || 'DOC';
  };

  // Collect all documents, handling comma-separated paths
  const documents: { label: string; url: string; ext: string }[] = [];
  
  getDocumentFields().forEach(field => {
    const pathValue = data[field.key];
    if (pathValue) {
      const paths = pathValue.split(',').map((p: string) => p.trim()).filter(Boolean);
      paths.forEach((path: string, index: number) => {
        if (isDocumentFile(path)) {
          documents.push({ 
            label: paths.length > 1 ? `${field.label} ${index + 1}` : field.label, 
            url: getPublicUrl(path), 
            ext: getFileExtension(path) 
          });
        }
      });
    }
  });

  if (documents.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-2xl">
        <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p className="font-medium">Nenhum documento disponível</p>
        <p className="text-sm mt-1">Este perfil ainda não adicionou documentos</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {documents.map((doc, idx) => (
        <a
          key={idx}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 rounded-xl border bg-background hover:bg-muted/50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center font-bold text-xs">
            {doc.ext}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{doc.label}</p>
            <p className="text-sm text-muted-foreground">Clique para visualizar</p>
          </div>
          <Download className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </a>
      ))}
    </div>
  );
};

// Detail Info Component
const DetailInfo = ({ item }: { item: MarketplaceItem }) => {
  const { data } = item;

  const renderProfissionalInfo = () => (
    <div className="grid gap-6">
      {/* Contact Card */}
      <div className="bg-muted/30 rounded-2xl p-5 border">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Contato
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.telefone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="font-medium">{formatPhoneNumber(data.telefone)}</p>
              </div>
            </div>
          )}
          {data.email && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-medium truncate">{data.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Experience Card */}
      <div className="bg-muted/30 rounded-2xl p-5 border">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Experiência
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.funcao_principal && (
            <div>
              <p className="text-xs text-muted-foreground">Função Principal</p>
              <p className="font-medium">{data.funcao_principal}</p>
            </div>
          )}
          {data.tempo_experiencia && (
            <div>
              <p className="text-xs text-muted-foreground">Tempo de Experiência</p>
              <p className="font-medium">{data.tempo_experiencia}</p>
            </div>
          )}
          {data.disponibilidade_atual && (
            <div>
              <p className="text-xs text-muted-foreground">Disponibilidade</p>
              <p className="font-medium">{data.disponibilidade_atual}</p>
            </div>
          )}
          {data.modalidade_trabalho && (
            <div>
              <p className="text-xs text-muted-foreground">Modalidade</p>
              <p className="font-medium">{data.modalidade_trabalho}</p>
            </div>
          )}
        </div>
      </div>

      {/* Specialties */}
      {data.especialidades?.length > 0 && (
        <div className="bg-muted/30 rounded-2xl p-5 border">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Especialidades
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.especialidades.map((esp: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="rounded-full">
                {esp}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Regions */}
      {data.regioes_atendidas?.length > 0 && (
        <div className="bg-muted/30 rounded-2xl p-5 border">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Regiões Atendidas
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.regioes_atendidas.map((reg: string, idx: number) => (
              <Badge key={idx} variant="outline" className="rounded-full">
                {reg}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderFornecedorInfo = () => (
    <div className="grid gap-6">
      {/* Contact Card */}
      <div className="bg-muted/30 rounded-2xl p-5 border">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Contato
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.telefone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="font-medium">{formatPhoneNumber(data.telefone)}</p>
              </div>
            </div>
          )}
          {data.email && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-medium truncate">{data.email}</p>
              </div>
            </div>
          )}
          {data.site && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Site</p>
                <a href={data.site} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline truncate block">
                  {data.site}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-muted/30 rounded-2xl p-5 border">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Informações do Negócio
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.tempo_atuacao && (
            <div>
              <p className="text-xs text-muted-foreground">Tempo de Atuação</p>
              <p className="font-medium">{data.tempo_atuacao}</p>
            </div>
          )}
          {data.capacidade_atendimento && (
            <div>
              <p className="text-xs text-muted-foreground">Capacidade de Atendimento</p>
              <p className="font-medium">{data.capacidade_atendimento}</p>
            </div>
          )}
          {data.ticket_medio && (
            <div>
              <p className="text-xs text-muted-foreground">Ticket Médio</p>
              <p className="font-medium">{data.ticket_medio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      {data.categorias_atendidas?.length > 0 && (
        <div className="bg-muted/30 rounded-2xl p-5 border">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Categorias Atendidas
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.categorias_atendidas.map((cat: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="rounded-full">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Regions */}
      {data.regioes_atendidas?.length > 0 && (
        <div className="bg-muted/30 rounded-2xl p-5 border">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Regiões Atendidas
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.regioes_atendidas.map((reg: string, idx: number) => (
              <Badge key={idx} variant="outline" className="rounded-full">
                {reg}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEmpresaInfo = () => (
    <div className="grid gap-6">
      {/* Contact Card */}
      <div className="bg-muted/30 rounded-2xl p-5 border">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Contato
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.whatsapp_contato && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="font-medium">{formatPhoneNumber(data.whatsapp_contato)}</p>
              </div>
            </div>
          )}
          {data.email_contato && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-medium truncate">{data.email_contato}</p>
              </div>
            </div>
          )}
          {data.site && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Site</p>
                <a href={data.site} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline truncate block">
                  {data.site}
                </a>
              </div>
            </div>
          )}
          {data.nome_contato && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contato Principal</p>
                <p className="font-medium">{data.nome_contato}</p>
                {data.cargo_contato && <p className="text-xs text-muted-foreground">{data.cargo_contato}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-muted/30 rounded-2xl p-5 border">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Informações da Empresa
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.ano_fundacao && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ano de Fundação</p>
                <p className="font-medium">{data.ano_fundacao}</p>
              </div>
            </div>
          )}
          {data.tamanho_empresa && (
            <div>
              <p className="text-xs text-muted-foreground">Tamanho</p>
              <p className="font-medium">{data.tamanho_empresa}</p>
            </div>
          )}
          {data.obras_andamento && (
            <div>
              <p className="text-xs text-muted-foreground">Obras em Andamento</p>
              <p className="font-medium">{data.obras_andamento}</p>
            </div>
          )}
          {data.ticket_medio && (
            <div>
              <p className="text-xs text-muted-foreground">Ticket Médio</p>
              <p className="font-medium">{data.ticket_medio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Types of Works */}
      {data.tipos_obras?.length > 0 && (
        <div className="bg-muted/30 rounded-2xl p-5 border">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Tipos de Obras
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.tipos_obras.map((tipo: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="rounded-full">
                {tipo}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  switch (item.type) {
    case "profissional":
      return renderProfissionalInfo();
    case "fornecedor":
      return renderFornecedorInfo();
    case "empresa":
      return renderEmpresaInfo();
    default:
      return null;
  }
};
