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
import {Input} from '@/components/ui/input';
import {Switch} from '@/components/ui/switch';
import {Settings} from 'lucide-react';
import {Slider} from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {Separator} from '../ui/separator';

export function SettingsModal() {
  const {
    theme,
    setTheme,
    globalMinWords,
    setGlobalMinWords,
    temperature,
    setTemperature,
    seed,
    setSeed,
    aiProvider,
    setAiProvider,
    ollamaModel,
    setOllamaModel,
    ollamaHost,
    setOllamaHost,
  } = useSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [localMinWords, setLocalMinWords] = useState(globalMinWords);
  const [localTemp, setLocalTemp] = useState(temperature);
  const [localSeed, setLocalSeed] = useState(seed);
  const [localAiProvider, setLocalAiProvider] = useState(aiProvider);
  const [localOllamaModel, setLocalOllamaModel] = useState(ollamaModel);
  const [localOllamaHost, setLocalOllamaHost] = useState(ollamaHost);

  const handleSave = () => {
    setGlobalMinWords(localMinWords);
    setTemperature(localTemp);
    setSeed(localSeed);
    setAiProvider(localAiProvider);
    setOllamaModel(localOllamaModel);
    setOllamaHost(localOllamaHost);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalMinWords(globalMinWords);
      setLocalTemp(temperature);
      setLocalSeed(seed);
      setLocalAiProvider(aiProvider);
      setLocalOllamaModel(ollamaModel);
      setLocalOllamaHost(ollamaHost);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações Gerais</DialogTitle>
        </DialogHeader>
        <div className="py-4 grid gap-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode-switch">Modo Escuro (Dark Mode)</Label>
            <Switch
              id="dark-mode-switch"
              checked={theme === 'dark'}
              onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
            />
          </div>

          <Separator />
          <h3 className="text-lg font-medium">Configurações de IA</h3>

          <div className="space-y-2">
            <Label htmlFor="ai-provider">Provedor de IA</Label>
            <Select
              value={localAiProvider}
              onValueChange={value =>
                setLocalAiProvider(value as 'Google' | 'Ollama')
              }
            >
              <SelectTrigger id="ai-provider">
                <SelectValue placeholder="Selecione o provedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Google">Google (Gemini)</SelectItem>
                <SelectItem value="Ollama">Ollama (Local)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {localAiProvider === 'Ollama' && (
            <div className="grid gap-4 pl-4 border-l-2 ml-1">
              <div className="space-y-2">
                <Label htmlFor="ollama-host">Ollama Host</Label>
                <Input
                  id="ollama-host"
                  placeholder="Ex: http://127.0.0.1:11434"
                  value={localOllamaHost || ''}
                  onChange={e => setLocalOllamaHost(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ollama-model">Modelo Ollama</Label>
                <Input
                  id="ollama-model"
                  placeholder="Ex: llama3"
                  value={localOllamaModel || ''}
                  onChange={e => setLocalOllamaModel(e.target.value)}
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="global-min-words">
              Mínimo de Palavras (Padrão)
            </Label>
            <Input
              id="global-min-words"
              type="number"
              placeholder="Ex: 300"
              value={localMinWords || ''}
              onChange={e =>
                setLocalMinWords(
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
            />
            <p className="text-sm text-muted-foreground">
              Este valor será usado como padrão ao gerar capítulos.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="global-temperature">
              Temperatura (Padrão): {localTemp.toFixed(1)}
            </Label>
            <Slider
              id="global-temperature"
              min={0}
              max={1}
              step={0.1}
              value={[localTemp]}
              onValueChange={value => setLocalTemp(value[0])}
            />
            <p className="text-sm text-muted-foreground">
              Controla a "criatividade" da IA.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="global-seed">Seed (Padrão)</Label>
            <Input
              id="global-seed"
              type="number"
              placeholder="Deixe em branco para aleatório"
              value={localSeed || ''}
              onChange={e =>
                setLocalSeed(
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            />
            <p className="text-sm text-muted-foreground">
              Use a mesma seed para obter resultados consistentes.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
