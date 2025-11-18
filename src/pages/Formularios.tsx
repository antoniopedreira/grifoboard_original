import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormularioCard {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
}

const formularios: FormularioCard[] = [
  {
    id: 'gbc',
    titulo: 'Formulário GBC',
    descricao: 'Formulário de captação para o programa GBC',
    url: 'https://grifocrm.com.br/form/gbc'
  },
  {
    id: 'mentoria-fast',
    titulo: 'Formulário Mentoria Fast',
    descricao: 'Formulário de captação para o programa Mentoria Fast',
    url: 'https://grifocrm.com.br/form/fast'
  }
];

const Formularios = () => {
  const { toast } = useToast();

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Formulários</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie e compartilhe links de formulários públicos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formularios.map((formulario) => (
          <Card key={formulario.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{formulario.titulo}</CardTitle>
              <CardDescription>{formulario.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <code className="text-sm text-foreground break-all">
                  {formulario.url}
                </code>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleCopyLink(formulario.url)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar Link
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenLink(formulario.url)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Formularios;
