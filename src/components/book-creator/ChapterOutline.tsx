
'use client';

import { useState } from 'react';
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
  Sparkles,
  GripVertical,
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

interface ChapterOutlineProps {
  activeChapterId: string | null;
  onSelectChapter: (id: string) => void;
}

export function ChapterOutline({ activeChapterId, onSelectChapter }: ChapterOutlineProps) {
  const { project, addChapter, deleteChapter, updateChapter, generateSingleChapter, isGenerating, reorderChapters } = useProject();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleRenameChapter = (id: string) => {
    const newTitle = prompt("Digite o novo título do capítulo:");
    if (newTitle) {
      updateChapter(id, { title: newTitle });
    }
  };

  const handleGenerateChapter = (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation();
    generateSingleChapter(chapterId);
  }

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null) return;
    setDropIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault(); 
  };

  const handleDrop = () => {
    if (draggedIndex === null || dropIndex === null || draggedIndex === dropIndex) {
        handleDragEnd();
        return;
    };
    
    reorderChapters(draggedIndex, dropIndex);
    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropIndex(null);
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
      <ul 
        className="space-y-1"
        onDragLeave={handleDragEnd}
      >
        {project.outline.map((chapter, index) => (
          <li 
            key={chapter.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
              'relative transition-all',
              draggedIndex === index && 'opacity-50 scale-95',
            )}
          >
            {dropIndex === index && draggedIndex !== null && index < draggedIndex && (
              <div className="absolute -top-1 left-0 right-0 h-1 bg-primary rounded-full z-10" />
            )}
             <div
              onClick={() => onSelectChapter(chapter.id)}
              className={cn(
                'w-full text-left p-2 rounded-md flex items-center justify-between group cursor-pointer bg-card',
                'transition-colors duration-200',
                activeChapterId === chapter.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              )}
            >
              <div className="flex items-center gap-3 truncate">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                {statusIcons[chapter.status]}
                <span className="flex-1 truncate">{chapter.title}</span>
              </div>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {chapter.status !== 'completed' && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isGenerating} onClick={(e) => handleGenerateChapter(e, chapter.id)}>
                    {chapter.status === 'generating' ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4" />}
                  </Button>
                )}
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
             {dropIndex === index && draggedIndex !== null && index > draggedIndex && (
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-primary rounded-full z-10" />
              )}
          </li>
        ))}
      </ul>
    </div>
  );
}
