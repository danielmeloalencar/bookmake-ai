// src/components/book-creator/SettingsModal.tsx
'use client';

import {useState} from 'react';
import {useSettings} from '@/context/SettingsContext';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Settings, Info} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Input} from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SettingsModal() {
  const {
    theme,
    setTheme,
    aiProvider,
    setAiProvider,
    ollamaModel,
    setOllamaModel,
    ollamaHost,
    setOllamaHost,
  } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>
        <div className="py-4 grid gap-6">
          <fieldset className="border p-4 rounded-md">
            <legend className="px-2 text-sm font-medium">
              Aparência
            </legend>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode-switch">Modo Escuro (Dark Mode)</Label>
              <Switch
                id="dark-mode-switch"
                checked={theme === 'dark'}
                onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </fieldset>

          <fieldset className="border p-4 rounded-md space-y-4">
            <legend className="px-2 text-sm font-medium">
              Inteligência Artificial
            </legend>
            <div className="grid gap-2">
              <Label htmlFor="ai-provider">Provedor de IA</Label>
              <Select
                value={aiProvider}
                onValueChange={value =>
                  setAiProvider(value as 'Google' | 'Ollama')
                }
              >
                <SelectTrigger id="ai-provider">
                  <SelectValue placeholder="Selecione o provedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google">Google (Gemini 1.5 Flash)</SelectItem>
                  <SelectItem value="Ollama">Ollama (Local)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {aiProvider === 'Ollama' && (
              <div className="grid gap-4 pt-2 border-t mt-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="ollama-host">Host do Ollama</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>O endereço da sua API Ollama em execução.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <Input
                    id="ollama-host"
                    value={ollamaHost}
                    onChange={e => setOllamaHost(e.target.value)}
                    placeholder="http://127.0.0.1:11434"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ollama-model">Modelo do Ollama</Label>
                  <Input
                    id="ollama-model"
                    value={ollamaModel}
                    onChange={e => setOllamaModel(e.target.value)}
                    placeholder="ex: llama3"
                  />
                </div>
              </div>
            )}
          </fieldset>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={() => setIsOpen(false)}>Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
