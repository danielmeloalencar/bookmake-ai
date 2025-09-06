
'use client';

import { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import {
  Download,
  FilePlus2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportAsMarkdown } from '@/lib/utils';
import { Logo } from '../icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { SettingsModal } from './SettingsModal';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useSettings } from '@/context/SettingsContext';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';

export function TopBar() {
  const { project, resetProject, generateAllChapters, isGenerating } = useProject();
  const { temperature, seed } = useSettings();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [globalExtraPrompt, setGlobalExtraPrompt] = useState('');
  const [localTemperature, setLocalTemperature] = useState(temperature);
  const [localSeed, setLocalSeed] = useState(seed);

  if (!project) return null;

  const handleOpenGenerateDialog = (open: boolean) => {
    if(open) {
      setGlobalExtraPrompt('');
      setLocalTemperature(temperature);
      setLocalSeed(seed);
    }
    setIsGenerateDialogOpen(open);
  }

  const handleGenerateClick = (mode: 'pending' | 'all') => {
    generateAllChapters(mode, {
      extraPrompt: globalExtraPrompt,
      temperature: localTemperature,
      seed: localSeed,
    });
    setIsGenerateDialogOpen(false);
  };

  const pendingChaptersCount = project.outline.filter(c => c.status !== 'completed').length;

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        <Logo className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-semibold font-headline truncate max-w-xs md:max-w-md">
          {project.bookDescription}
        </h1>
      </div>
      <div className="flex items-center gap-2">
         <AlertDialog open={isGenerateDialogOpen} onOpenChange={handleOpenGenerateDialog}>
          <AlertDialogTrigger asChild>
            <Button disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? 'Gerando...' : 'Gerar Tudo'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Como você gostaria de gerar o conteúdo?</AlertDialogTitle>
              <AlertDialogDescription>
                Você pode gerar conteúdo apenas para os capítulos pendentes ou para todos, substituindo o que já existe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="global-prompt">Prompt Adicional (Opcional)</Label>
                  <Textarea 
                    id="global-prompt"
                    placeholder="Ex: Mantenha um tom bem-humorado e use analogias."
                    value={globalExtraPrompt}
                    onChange={(e) => setGlobalExtraPrompt(e.target.value)}
                    rows={3}
                  />
                   <p className="text-sm text-muted-foreground mt-1">
                    Este prompt será aplicado a todos os capítulos gerados nesta ação.
                  </p>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="global-temp">Temperatura: {localTemperature.toFixed(1)}</Label>
                  <Slider
                    id="global-temp"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[localTemperature]}
                    onValueChange={(value) => setLocalTemperature(value[0])}
                  />
                  <p className="text-sm text-muted-foreground">
                    Valores mais altos geram texto mais criativo, porém com mais chances de inconsistências.
                  </p>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="global-seed">Seed (Opcional)</Label>
                  <Input
                    id="global-seed"
                    type="number"
                    value={localSeed || ''}
                    onChange={(e) => setLocalSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Ex: 42"
                  />
                   <p className="text-sm text-muted-foreground">
                    Use a mesma seed para obter resultados semelhantes em gerações diferentes.
                  </p>
                </div>
            </div>
            <AlertDialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
               <Button onClick={() => handleGenerateClick('pending')} disabled={isGenerating || pendingChaptersCount === 0}>
                 {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Gerar somente capítulos pendentes ({pendingChaptersCount})
              </Button>
              <Button variant="outline" onClick={() => handleGenerateClick('all')} disabled={isGenerating}>
                 {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Gerar para todos os capítulos (sobrescrever)
              </Button>
              <AlertDialogCancel asChild>
                 <Button variant="ghost">Cancelar</Button>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportAsMarkdown(project)}>
              Markdown (.md)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <FilePlus2 className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Começar um novo projeto?</AlertDialogTitle>
              <AlertDialogDescription>
                Isso limpará o projeto atual. Seu progresso será perdido se não for exportado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => { resetProject(); setIsResetDialogOpen(false); }}>Criar Novo</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <SettingsModal />
      </div>
    </header>
  );
}
