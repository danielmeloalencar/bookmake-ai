
'use client';

import { useProject } from '@/context/ProjectContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Circle,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  FileEdit,
} from 'lucide-react';
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
import { Input } from '../ui/input';

interface ChapterOutlineProps {
  activeChapterId: string | null;
  onSelectChapter: (id: string) => void;
}

export function ChapterOutline({ activeChapterId, onSelectChapter }: ChapterOutlineProps) {
  const { project, addChapter, deleteChapter, updateChapter } = useProject();

  const handleRenameChapter = (id: string) => {
    const newTitle = prompt("Digite o novo título do capítulo:");
    if (newTitle) {
      updateChapter(id, { title: newTitle });
    }
  };

  const statusIcons = {
    pending: <Circle className="h-4 w-4 text-muted-foreground" />,
    generating: <Loader2 className="h-4 w-4 text-primary animate-spin" />,
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  };

  if (!project) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-headline font-semibold">Capítulos</h2>
        <Button variant="ghost" size="sm" onClick={() => addChapter('Novo Capítulo')}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>
      <ul className="space-y-1">
        {project.outline.map((chapter) => (
          <li key={chapter.id}>
            <div
              onClick={() => onSelectChapter(chapter.id)}
              className={cn(
                'w-full text-left p-2 rounded-md flex items-center justify-between group cursor-pointer',
                'transition-colors duration-200',
                activeChapterId === chapter.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              )}
            >
              <div className="flex items-center gap-3">
                {statusIcons[chapter.status]}
                <span className="flex-1 truncate">{chapter.title}</span>
              </div>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleRenameChapter(chapter.id); }}>
                  <FileEdit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o capítulo e seu conteúdo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={(e) => {e.stopPropagation(); deleteChapter(chapter.id)}} className="bg-destructive hover:bg-destructive/90">Deletar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
