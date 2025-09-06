
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/context/ProjectContext';
import { ChapterOutline } from '@/components/book-creator/ChapterOutline';
import { ContentEditor } from '@/components/book-creator/ContentEditor';
import { TopBar } from '@/components/book-creator/TopBar';
import type { Chapter } from '@/lib/types';

export function BookEditor() {
  const { project, updateChapter, generateAllChapters } = useProject();
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  useEffect(() => {
    if (project && project.outline.length > 0 && !activeChapterId) {
      setActiveChapterId(project.outline[0].id);
    }
  }, [project, activeChapterId]);

  const handleContentChange = useCallback((content: string) => {
    if (project && activeChapterId) {
      const chapter = project.outline.find(c => c.id === activeChapterId);
      if(chapter && chapter.content !== content) {
        updateChapter(activeChapterId, { content });
      }
    }
  }, [project, activeChapterId, updateChapter]);

  const activeChapter = project?.outline.find(c => c.id === activeChapterId);

  if (!project) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 min-w-[280px] max-w-[350px] bg-card border-r overflow-y-auto">
          <ChapterOutline
            activeChapterId={activeChapterId}
            onSelectChapter={setActiveChapterId}
          />
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeChapter ? (
            <ContentEditor
              key={activeChapter.id}
              chapter={activeChapter}
              onContentChange={handleContentChange}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Selecione um capítulo para começar a editar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
