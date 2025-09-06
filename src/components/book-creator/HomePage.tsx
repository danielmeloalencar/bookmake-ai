
'use client';

import { useProject } from '@/context/ProjectContext';
import { InitialForm } from '@/components/book-creator/InitialForm';
import { BookEditor } from '@/components/book-creator/BookEditor';
import { Loader2 } from 'lucide-react';
import { Logo } from '../icons';

export default function HomePage() {
  const { project, isLoading } = useProject();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Logo className="h-12 w-12 text-primary mb-4" />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando seu projeto...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {project ? <BookEditor /> : <InitialForm />}
    </div>
  );
}
