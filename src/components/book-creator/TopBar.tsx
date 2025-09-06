
'use client';

import { useProject } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import {
  Book,
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

export function TopBar() {
  const { project, resetProject, generateAllChapters, isGenerating } = useProject();

  if (!project) return null;

  const isGenerationComplete = project.outline.every(c => c.status === 'completed');

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        <Logo className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-semibold font-headline truncate max-w-xs md:max-w-md">
          {project.bookDescription}
        </h1>
      </div>
      <div className="flex items-center gap-2">
         <Button onClick={generateAllChapters} disabled={isGenerating || isGenerationComplete}>
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? 'Gerando...' : 'Gerar Tudo'}
        </Button>
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

        <AlertDialog>
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
              <AlertDialogAction onClick={resetProject}>Criar Novo</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <SettingsModal />
      </div>
    </header>
  );
}
