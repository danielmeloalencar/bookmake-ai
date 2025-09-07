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
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Input} from '@/components/ui/input';
import {Settings} from 'lucide-react';

export function SettingsModal() {
  const {
    theme,
    setTheme,
    aiProvider,
    setAiProvider,
    ollamaHost,
    setOllamaHost,
    ollamaModel,
    setOllamaModel,
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
            <legend className="px-2 text-sm font-medium">Aparência</legend>
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
              Provedor de IA
            </legend>
            <RadioGroup
              value={aiProvider}
              onValueChange={(value: 'google' | 'ollama') =>
                setAiProvider(value)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="google" id="google-provider" />
                <Label htmlFor="google-provider">Google AI (Padrão)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ollama" id="ollama-provider" />
                <Label htmlFor="ollama-provider">Ollama (Local)</Label>
              </div>
            </RadioGroup>
            {aiProvider === 'ollama' && (
              <div className="pt-4 mt-4 border-t space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ollama-host">Endereço do Host Ollama</Label>
                  <Input
                    id="ollama-host"
                    value={ollamaHost}
                    onChange={e => setOllamaHost(e.target.value)}
                    placeholder="http://127.0.0.1:11434"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ollama-model">Nome do Modelo Ollama</Label>
                  <Input
                    id="ollama-model"
                    value={ollamaModel}
                    onChange={e => setOllamaModel(e.target.value)}
                    placeholder="ex: gemma, llama3"
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
