'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
} from 'react';
import type {BookProject, Chapter, Settings} from '@/lib/types';
import {
  createOutlineAction,
  generateChapterContentAction,
} from '@/lib/actions';
import {useToast} from '@/hooks/use-toast';
import {nanoid} from 'nanoid';
import {GenerateChapterContentInput} from '@/ai/flows/iteratively-generate-content';
import {useSettings} from './SettingsContext';
import {GenerateInitialOutlineInput} from '@/ai/flows/generate-initial-outline';

type CreateProjectData = {
  bookDescription: string;
  targetAudience: string;
  language: string;
  difficultyLevel: string;
  numberOfChapters: number;
};

type ProjectState = {
  project: BookProject | null;
  isLoading: boolean;
  isCreating: boolean;
  isGenerating: boolean;
};

type Action =
  | {type: 'INITIALIZE_PROJECT'; payload: BookProject | null}
  | {type: 'START_CREATION'}
  | {type: 'CREATE_PROJECT_SUCCESS'; payload: BookProject}
  | {type: 'CREATE_PROJECT_FAILURE'}
  | {type: 'UPDATE_PROJECT'; payload: Partial<BookProject>}
  | {type: 'START_GENERATION'}
  | {type: 'END_GENERATION'}
  | {type: 'RESET_PROJECT'};

const initialState: ProjectState = {
  project: null,
  isLoading: true,
  isCreating: false,
  isGenerating: false,
};

function projectReducer(state: ProjectState, action: Action): ProjectState {
  switch (action.type) {
    case 'INITIALIZE_PROJECT':
      return {...state, project: action.payload, isLoading: false};
    case 'START_CREATION':
      return {...state, isCreating: true};
    case 'CREATE_PROJECT_SUCCESS':
      return {...state, project: action.payload, isCreating: false};
    case 'CREATE_PROJECT_FAILURE':
      return {...state, isCreating: false};
    case 'UPDATE_PROJECT':
      if (!state.project) return state;
      const updatedProject = {
        ...state.project,
        ...action.payload,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('bookProject', JSON.stringify(updatedProject));
      return {...state, project: updatedProject};
    case 'START_GENERATION':
      return {...state, isGenerating: true};
    case 'END_GENERATION':
      return {...state, isGenerating: false};
    case 'RESET_PROJECT':
      localStorage.removeItem('bookProject');
      return {...initialState, isLoading: false};
    default:
      return state;
  }
}

type GenerationOptions = {
  extraPrompt?: string;
  minWords?: number;
  refine?: boolean;
  temperature?: number;
  seed?: number;
};

const ProjectContext = createContext<
  ProjectState & {
    createNewProject: (data: CreateProjectData) => void;
    updateChapter: (chapterId: string, data: Partial<Chapter>) => void;
    addChapter: (title: string) => void;
    deleteChapter: (chapterId: string) => void;
    resetProject: () => void;
    generateSingleChapter: (
      chapterId: string,
      options?: GenerationOptions
    ) => void;
    reorderChapters: (startIndex: number, endIndex: number) => void;
  }
>({
  ...initialState,
  createNewProject: () => {},
  updateChapter: () => {},
  addChapter: () => {},
  deleteChapter: () => {},
  resetProject: () => {},
  generateSingleChapter: () => {},
  reorderChapters: () => {},
});

export function ProjectProvider({children}: {children: React.ReactNode}) {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const {toast} = useToast();
  const { aiProvider, ollamaHost, ollamaModel } = useSettings();

  const serializableSettings: Omit<Settings, 'theme'> = {
    aiProvider,
    ollamaHost,
    ollamaModel,
  };


  useEffect(() => {
    try {
      const savedProject = localStorage.getItem('bookProject');
      if (savedProject) {
        dispatch({
          type: 'INITIALIZE_PROJECT',
          payload: JSON.parse(savedProject),
        });
      } else {
        dispatch({type: 'INITIALIZE_PROJECT', payload: null});
      }
    } catch (error) {
      console.error('Failed to load project from local storage', error);
      dispatch({type: 'INITIALIZE_PROJECT', payload: null});
    }
  }, []);

  const createNewProject = useCallback(
    async (data: CreateProjectData) => {
      dispatch({type: 'START_CREATION'});
      
      const modelName = serializableSettings.aiProvider === 'ollama' ? `ollama/${serializableSettings.ollamaModel}` : 'gemini-1.5-flash';
      
      const actionInput: GenerateInitialOutlineInput = {
        ...data,
        modelName,
      };

      try {
        const result = await createOutlineAction(actionInput, serializableSettings);
        const newProject: BookProject = {
          ...data,
          id: nanoid(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'editing',
          outline: result.outline.map(o => ({
            id: nanoid(),
            title: o.chapterTitle,
            subchapters: o.subchapters,
            content: '',
            status: 'pending',
          })),
        };
        dispatch({type: 'CREATE_PROJECT_SUCCESS', payload: newProject});
      } catch (error) {
        dispatch({type: 'CREATE_PROJECT_FAILURE'});
        toast({
          variant: 'destructive',
          title: 'Erro ao criar estrutura',
          description:
            'Não foi possível gerar a estrutura do livro. Tente novamente.',
        });
        console.error(error);
      }
    },
    [toast, serializableSettings]
  );

  const updateProject = (payload: Partial<BookProject>) => {
    dispatch({type: 'UPDATE_PROJECT', payload});
  };

  const updateChapter = useCallback(
    (chapterId: string, data: Partial<Chapter>) => {
      if (!state.project) return;
      const newOutline = state.project.outline.map(c =>
        c.id === chapterId ? {...c, ...data} : c
      );
      updateProject({outline: newOutline});
    },
    [state.project]
  );

  const addChapter = useCallback(
    (title: string) => {
      if (!state.project) return;
      const newChapter: Chapter = {
        id: nanoid(),
        title,
        subchapters: [],
        content: '',
        status: 'pending',
      };
      updateProject({outline: [...state.project.outline, newChapter]});
    },
    [state.project]
  );

  const deleteChapter = useCallback(
    (chapterId: string) => {
      if (!state.project) return;
      const newOutline = state.project.outline.filter(c => c.id !== chapterId);
      updateProject({outline: newOutline});
    },
    [state.project]
  );

  const reorderChapters = useCallback(
    (startIndex: number, endIndex: number) => {
      if (!state.project) return;
      const newOutline = Array.from(state.project.outline);
      const [removed] = newOutline.splice(startIndex, 1);
      newOutline.splice(endIndex, 0, removed);
      updateProject({outline: newOutline});
    },
    [state.project]
  );

  const resetProject = () => dispatch({type: 'RESET_PROJECT'});

  const _generateChapter = useCallback(
    async (
      chapter: Chapter,
      allChapters: Chapter[],
      options: GenerationOptions = {}
    ) => {
      if (!state.project) return;

      const getPreviousChaptersContent = () => {
        const currentIndex = allChapters.findIndex(c => c.id === chapter.id);
        const previousChapters = allChapters.slice(0, currentIndex);
        return previousChapters
          .filter(c => c.status === 'completed' || c.content)
          .map(c => `## ${c.title}\n\n${c.content}`)
          .join('\n\n---\n\n');
      };

      updateChapter(chapter.id, {status: 'generating'});
      
      try {
        const modelName = serializableSettings.aiProvider === 'ollama' ? `ollama/${serializableSettings.ollamaModel}` : 'gemini-1.5-flash';
        
        const input: GenerateChapterContentInput = {
          bookDescription: state.project.bookDescription,
          targetAudience: state.project.targetAudience,
          language: state.project.language,
          difficultyLevel: state.project.difficultyLevel,
          chapterOutline: `Título: ${
            chapter.title
          }\nSubtópicos: ${chapter.subchapters.join(', ')}`,
          previousChaptersContent: getPreviousChaptersContent(),
          currentContent: options.refine ? chapter.content : undefined,
          extraPrompt: options.extraPrompt,
          minWords: options.minWords,
          temperature: options.temperature,
          seed: options.seed,
          modelName: modelName,
        };

        const result = await generateChapterContentAction(input, serializableSettings);

        updateChapter(chapter.id, {
          content: result.chapterContent,
          status: 'completed',
        });
      } catch (error: any) {
        console.error(
          `Failed to generate content for chapter: ${chapter.title}`,
          error
        );
        updateChapter(chapter.id, {status: 'pending'}); // Reset status on failure
        toast({
          variant: 'destructive',
          title: `Erro ao gerar capítulo "${chapter.title}"`,
          description:
            error.message || 'Não foi possível gerar o conteúdo. Tente novamente.',
        });
        throw error;
      }
    },
    [state.project, updateChapter, toast, serializableSettings]
  );

  const generateSingleChapter = useCallback(
    async (chapterId: string, options?: GenerationOptions) => {
      if (!state.project || state.isGenerating) return;

      const chapterToGenerate = state.project.outline.find(
        c => c.id === chapterId
      );
      if (!chapterToGenerate) return;

      const hasContent =
        chapterToGenerate.content && chapterToGenerate.content.trim().length > 0;
      const finalOptions = {refine: hasContent, ...options};

      dispatch({type: 'START_GENERATION'});
      try {
        await _generateChapter(
          chapterToGenerate,
          state.project.outline,
          finalOptions
        );
      } catch (e) {
        // Error is already handled in _generateChapter
      } finally {
        dispatch({type: 'END_GENERATION'});
      }
    },
    [state.project, state.isGenerating, _generateChapter]
  );

  return (
    <ProjectContext.Provider
      value={{
        ...state,
        createNewProject,
        updateChapter,
        addChapter,
        deleteChapter,
        resetProject,
        generateSingleChapter,
        reorderChapters,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => useContext(ProjectContext);
