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
  } = useSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [localMinWords, setLocalMinWords] = useState(globalMinWords);
  const [localTemp, setLocalTemp] = useState(temperature);
  const [localSeed, setLocalSeed] = useState(seed);

  const handleSave = () => {
    setGlobalMinWords(localMinWords);
    setTemperature(localTemp);
    setSeed(localSeed);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalMinWords(globalMinWords);
      setLocalTemp(temperature);
      setLocalSeed(seed);
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
