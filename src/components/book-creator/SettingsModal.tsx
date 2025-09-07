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
import {Settings} from 'lucide-react';

export function SettingsModal() {
  const {theme, setTheme} = useSettings();
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
