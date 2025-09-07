
'use client';

import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '../ui/input';

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
    mcp,
    setMcpConfig
  } = useSettings();

  return (
    <Dialog>
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
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </fieldset>

          <fieldset className="border p-4 rounded-md space-y-4">
             <legend className="px-2 text-sm font-medium">Provedor de IA</legend>
             <RadioGroup
                value={aiProvider}
                onValueChange={(value) => setAiProvider(value as 'google' | 'ollama')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="google" id="google-provider" />
                  <Label htmlFor="google-provider">Google AI (Gemini)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ollama" id="ollama-provider" />
                  <Label htmlFor="ollama-provider">Ollama</Label>
                </div>
              </RadioGroup>

              {aiProvider === 'ollama' && (
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="ollama-host">Endereço do Host Ollama</Label>
                      <Input 
                        id="ollama-host"
                        value={ollamaHost}
                        onChange={(e) => setOllamaHost(e.target.value)}
                        placeholder="http://127.0.0.1:11434"
                      />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="ollama-model">Nome do Modelo Ollama</Label>
                      <Input 
                        id="ollama-model"
                        value={ollamaModel}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        placeholder="ex: gemma"
                      />
                    </div>
                </div>
              )}
          </fieldset>

          <fieldset className="border p-4 rounded-md space-y-4">
             <legend className="px-2 text-sm font-medium">Servidores MCP</legend>
             <div className="flex items-center justify-between">
                <Label htmlFor="mcp-fs-switch">
                  Servidor de Arquivos (filesystem)
                  <p className="text-xs text-muted-foreground">Permite que a IA leia arquivos locais.</p>
                </Label>
                <Switch
                    id="mcp-fs-switch"
                    checked={mcp.fs}
                    onCheckedChange={(checked) => setMcpConfig({...mcp, fs: checked})}
                />
             </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="mcp-memory-switch">
                  Servidor de Memória (memory)
                   <p className="text-xs text-muted-foreground">Fornece um contexto volátil para a IA.</p>
                </Label>
                <Switch
                    id="mcp-memory-switch"
                    checked={mcp.memory}
                    onCheckedChange={(checked) => setMcpConfig({...mcp, memory: checked})}
                />
             </div>
          </fieldset>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
