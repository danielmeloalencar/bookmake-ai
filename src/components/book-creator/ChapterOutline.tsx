
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '../ui/textarea';
import type { Chapter } from '@/lib/types';
import { Switch } from '../ui/switch';
import { useSettings } from '@/context/SettingsContext';


interface ChapterOutlineProps {
  activeChapterId: string | null;
  onSelectChapter: (id: string) => void;
}

function RenameChapterDialog({ chapterId, currentTitle, onRename }: { chapterId: string, currentTitle: string, onRename: (id: string, newTitle: string) => void }) {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (newTitle.trim()) {
      onRename(chapterId, newTitle.trim());
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setNewTitle(currentTitle); setIsOpen(true) }}>
          <FileEdit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Renomear Capítulo</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="chapter-title" className="sr-only">
            Título do Capítulo
          </Label>
          <Input
            id="chapter-title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function GenerateChapterDialog({ chapter, trigger }: { chapter: Chapter; trigger: React.ReactNode }) {
  const { generateSingleChapter, isGenerating } = useProject();
  const { globalMinWords } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [extraPrompt, setExtraPrompt] = useState('');
  const [minWords, setMinWords] = useState<number | undefined>(undefined);
  const [refineContent, setRefineContent] = useState(true);
  
  const hasContent = chapter.content && chapter.content.trim().length > 0;

  const handleGenerate = () => {
    generateSingleChapter(chapter.id, { 
      extraPrompt, 
      minWords: minWords ?? globalMinWords, 
      refine: hasContent ? refineContent : false 
    });
    setIsOpen(false);
    // Reset local state
    setExtraPrompt('');
    setMinWords(undefined);
    setRefineContent(true);
  }

  const handleOpenChange = (open: boolean) => {
    if(open) {
      // Reset state when opening
      setExtraPrompt('');
      setMinWords(undefined);
      setRefineContent(true);
    }
    setIsOpen(open);
  }

  return (
     <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>{trigger}</DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Gerar conteúdo para: {chapter.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {hasContent && (
             <div className="flex items-center space-x-2">
                <Switch 
                  id="refine-mode" 
                  checked={refineContent} 
                  onCheckedChange={setRefineContent}
                />
                <Label htmlFor="refine-mode">Refinar conteúdo existente</Label>
              </div>
          )}
          <div>
            <Label htmlFor="extra-prompt">
              {hasContent && refineContent ? 'Instruções Adicionais (Opcional)' : 'Prompt (Opcional)'}
            </Label>
            <Textarea 
              id="extra-prompt"
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
              placeholder={hasContent && refineContent
                ? "Ex: Torne o tom mais formal, citando exemplos práticos."
                : "Ex: Comece o capítulo com uma citação sobre exploração espacial."
              }
              rows={4}
            />
          </div>
           <div>
            <Label htmlFor="min-words">Mínimo de Palavras (Opcional)</Label>
            <Input
              id="min-words"
              type="number"
              value={minWords || ''}
              onChange={(e) => setMinWords(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder={`Padrão: ${globalMinWords || 'N/A'}`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
            Gerar Conteúdo
          </Button>
        </DialogFooter>
      </DialogContent>
     </Dialog>
  )
}

export function ChapterOutline({ activeChapterId, onSelectChapter }: ChapterOutlineProps) {
  const { project, addChapter, deleteChapter, updateChapter, isGenerating, reorderChapters } = useProject();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleRenameChapter = (id: string, newTitle: string) => {
    if (newTitle) {
      updateChapter(id, { title: newTitle });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      setDropIndex(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const isAfter = e.clientY > rect.top + rect.height / 2;

    setDropIndex(isAfter ? index + 1 : index);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    if (draggedIndex === null || dropIndex === null) return;
    
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex -1 : dropIndex;

    if (draggedIndex !== adjustedDropIndex) {
      reorderChapters(draggedIndex, adjustedDropIndex);
    }
    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
     if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
        setDropIndex(null);
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
      <ul 
        className="space-y-1"
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
      >
        {project.outline.map((chapter, index) => (
          <li 
            key={chapter.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            className={cn(
              'relative transition-all list-none',
              draggedIndex === index && 'opacity-50',
            )}
          >
            {dropIndex === index && draggedIndex !== null && (
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
                <GenerateChapterDialog 
                  chapter={chapter}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isGenerating && chapter.status === 'generating'}>
                      {chapter.status === 'generating' ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4" />}
                    </Button>
                  }
                />
                <RenameChapterDialog chapterId={chapter.id} currentTitle={chapter.title} onRename={handleRenameChapter} />

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
             {dropIndex === index + 1 && draggedIndex !== null && (
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-primary rounded-full z-10" />
              )}
          </li>
        ))}
      </ul>
    </div>
  );
}
