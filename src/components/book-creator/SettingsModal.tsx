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
    model,
    setModel,
    ollamaHost,
    setOllamaHost,
    ollamaModel,
    setOllamaModel,
  } = useSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [localMinWords, setLocalMinWords] = useState(globalMinWords);
  const [localTemp, setLocalTemp] = useState(temperature);
  const [localSeed, setLocalSeed] = useState(seed);
  const [localModel, setLocalModel] = useState(model);
  const [localOllamaHost, setLocalOllamaHost] = useState(ollamaHost);
  const [localOllamaModel, setLocalOllamaModel] = useState(ollamaModel);

  const handleSave = () => {
    setGlobalMinWords(localMinWords);
    setTemperature(localTemp);
    setSeed(localSeed);
    setModel(localModel);
    setOllamaHost(localOllamaHost);
    setOllamaModel(localOllamaModel);

    // Quick reload to apply new Genkit plugin if host was changed
    if (ollamaHost !== localOllamaHost) {
      window.location.reload();
    }
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalMinWords(globalMinWords);
      setLocalTemp(temperature);
      setLocalSeed(seed);
      setLocalModel(model);
      setLocalOllamaHost(ollamaHost);
      setLocalOllamaModel(ollamaModel);
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

          <div className="space-y-2">
            <Label>Modelo de IA</Label>
            <Select value={localModel} onValueChange={setLocalModel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Gemini (Google AI)</SelectItem>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {localModel === 'ollama' && (
            <div className="p-4 border rounded-md space-y-4 bg-muted/50">
              <h4 className="font-semibold">Configurações do Ollama</h4>
              <div className="space-y-2">
                <Label htmlFor="ollama-host">Host</Label>
                <Input
                  id="ollama-host"
                  placeholder="Ex: http://127.0.0.1:11434"
                  value={localOllamaHost || ''}
                  onChange={e => setLocalOllamaHost(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ollama-model">Nome do Modelo</Label>
                <Input
                  id="ollama-model"
                  placeholder="Ex: llama3"
                  value={localOllamaModel || ''}
                  onChange={e => setLocalOllamaModel(e.target.value)}
                />
                 <p className="text-sm text-muted-foreground">
                    Certifique-se que este modelo está instalado no Ollama.
                 </p>
              </div>
            </div>
          )}

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
