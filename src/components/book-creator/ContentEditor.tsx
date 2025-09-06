
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Chapter } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '../ui/button';
import { Bold, Italic, Code, Link } from 'lucide-react';

interface ContentEditorProps {
  chapter: Chapter;
  onContentChange: (content: string) => void;
}

export function ContentEditor({ chapter, onContentChange }: ContentEditorProps) {
  const [content, setContent] = useState(chapter.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(chapter.content);
  }, [chapter.id, chapter.content]);
  
  const useDebounce = (callback: (value: string) => void, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    return useCallback((value: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(value);
      }, delay);
    }, [callback, delay]);
  };
  
  const debouncedOnContentChange = useDebounce(onContentChange, 500);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    debouncedOnContentChange(e.target.value);
  };

  const applyFormat = (format: 'bold' | 'italic' | 'code' | 'link') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let newText = '';
    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'code':
        newText = `\`\`\`\n${selectedText}\n\`\`\``;
        break;
      case 'link':
        const url = prompt("Enter the URL:");
        if (url) {
          newText = `[${selectedText}](${url})`;
        } else {
          newText = selectedText;
        }
        break;
    }
    
    const updatedContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    setContent(updatedContent);
    onContentChange(updatedContent);
    textarea.focus();
  }

  return (
    <div className="flex-1 flex flex-col p-6 bg-background overflow-hidden">
      <h1 className="text-3xl font-bold font-headline mb-4 pb-4 border-b">
        {chapter.title}
      </h1>
      {chapter.status === 'generating' ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : (
        <Tabs defaultValue="write" className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="write">Escrever</TabsTrigger>
              <TabsTrigger value="preview">Visualizar</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => applyFormat('bold')}><Bold className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => applyFormat('italic')}><Italic className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => applyFormat('code')}><Code className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => applyFormat('link')}><Link className="h-4 w-4" /></Button>
            </div>
          </div>
          <TabsContent value="write" className="flex-1 mt-4 overflow-hidden">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextChange}
              placeholder="Comece a escrever o conteúdo do seu capítulo aqui... O conteúdo é salvo automaticamente."
              className="w-full h-full resize-none text-base leading-relaxed"
            />
          </TabsContent>
          <TabsContent value="preview" className="flex-1 mt-4 overflow-y-auto">
             <div className="prose prose-lg dark:prose-invert max-w-none p-4 border rounded-md min-h-full">
                {content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
