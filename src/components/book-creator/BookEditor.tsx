
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProject } from '@/context/ProjectContext';
import { ChapterOutline } from '@/components/book-creator/ChapterOutline';
import { ContentEditor } from '@/components/book-creator/ContentEditor';
import { TopBar } from '@/components/book-creator/TopBar';
import type { Chapter } from '@/lib/types';
import { cn } from '@/lib/utils';

export function BookEditor() {
  const { project, updateChapter } = useProject();
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const isResizing = useRef(false);

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
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    // Set bounds for resizing
    if (newWidth > 240 && newWidth < 600) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };


  const activeChapter = project?.outline.find(c => c.id === activeChapterId);

  if (!project) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <aside 
          className="bg-card overflow-y-auto"
          style={{ width: `${sidebarWidth}px` }}
        >
          <ChapterOutline
            activeChapterId={activeChapterId}
            onSelectChapter={setActiveChapterId}
          />
        </aside>

        <div 
          onMouseDown={handleMouseDown}
          className="w-2 cursor-col-resize bg-border/50 hover:bg-primary transition-colors"
        />

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
