import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { BookProject } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportAsMarkdown(project: BookProject) {
    let markdownContent = `# ${project.bookDescription}\n\n`;
    
    markdownContent += `**Público-alvo:** ${project.targetAudience}\n`;
    markdownContent += `**Nível:** ${project.difficultyLevel}\n\n`;

    project.outline.forEach(chapter => {
        markdownContent += `## ${chapter.title}\n\n`;
        if (chapter.subchapters && chapter.subchapters.length > 0) {
            chapter.subchapters.forEach(sub => {
                markdownContent += `### ${sub}\n\n`;
            });
        }
        markdownContent += `${chapter.content || ''}\n\n---\n\n`;
    });

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const safeTitle = project.bookDescription.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    a.download = `livromagico-${safeTitle}.md`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
