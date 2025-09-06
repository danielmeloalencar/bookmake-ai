import { ProjectProvider } from '@/context/ProjectContext';
import HomePage from '@/components/book-creator/HomePage';

export default function Home() {
  return (
    <ProjectProvider>
      <HomePage />
    </ProjectProvider>
  );
}
