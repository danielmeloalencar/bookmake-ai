// src/components/book-creator/SettingsModal.tsx
'use client';

import { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

export function SettingsModal() {
  const { theme, setTheme, globalMinWords, setGlobalMinWords } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [localMinWords, setLocalMinWords] = useState(globalMinWords);

  const handleSave = () => {
    setGlobalMinWords(localMinWords);
    setIsOpen(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if(open) {
      setLocalMinWords(globalMinWords);
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações Gerais</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode-switch">Modo Escuro (Dark Mode)</Label>
            <Switch
              id="dark-mode-switch"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="global-min-words">Mínimo de Palavras (Global)</Label>
            <Input
              id="global-min-words"
              type="number"
              placeholder="Ex: 300"
              value={localMinWords || ''}
              onChange={(e) => setLocalMinWords(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            />
            <p className="text-sm text-muted-foreground">
              Este valor será usado como padrão ao gerar capítulos.
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
