
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
import { Switch } from '@/components/ui/switch';
import { Settings, Trash2, Edit, PlusCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '../ui/input';
import type { LocalMcpServer } from '@/lib/types';
import { nanoid } from 'nanoid';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from '../ui/scroll-area';

const MAX_ARGS = 5;

function LocalMcpServerForm({
  server,
  onSave,
  onCancel,
}: {
  server?: LocalMcpServer;
  onSave: (server: LocalMcpServer) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(server?.name || '');
  const [command, setCommand] = useState(server?.command || '');
  const [args, setArgs] = useState(() => {
    const initialArgs = server?.args || [];
    // Ensure the array has exactly MAX_ARGS elements for the form
    return Array.from({ length: MAX_ARGS }, (_, i) => initialArgs[i] || '');
  });


  const handleArgChange = (index: number, value: string) => {
    const newArgs = [...args];
    newArgs[index] = value;
    setArgs(newArgs);
  };

  const handleSave = () => {
    if (name && command) {
      onSave({
        id: server?.id || nanoid(),
        name,
        command,
        args: args.filter(arg => arg.trim() !== ''), // Save only non-empty args
      });
    }
  };

  return (
    <ScrollArea className="max-h-[70vh]">
        <div className="grid gap-4 py-4 pr-6">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mcp-name" className="text-right">
                Nome
                </Label>
                <Input
                id="mcp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Um nome único (ex: meu-servidor)"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mcp-command" className="text-right">
                Comando
                </Label>
                <Input
                id="mcp-command"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="col-span-3"
                placeholder="ex: npx"
                />
            </div>

            {args.map((arg, index) => (
                 <div key={index} className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={`mcp-arg-${index}`} className="text-right">
                        Arg. {index + 1}
                    </Label>
                    <Input
                    id={`mcp-arg-${index}`}
                    value={arg}
                    onChange={(e) => handleArgChange(index, e.target.value)}
                    className="col-span-3"
                    placeholder="Argumento opcional"
                    />
                </div>
            ))}
        </div>
        <DialogFooter className="pr-6">
            <Button variant="outline" onClick={onCancel}>
            Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
    </ScrollArea>
  );
}

function ManageLocalMcpServerDialog({
  server,
  children,
}: {
  server?: LocalMcpServer;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { addLocalMcpServer, updateLocalMcpServer } = useSettings();

  const handleSave = (serverData: LocalMcpServer) => {
    if (server) {
      updateLocalMcpServer(serverData);
    } else {
      addLocalMcpServer(serverData);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {server ? 'Editar Servidor MCP' : 'Adicionar Servidor MCP'}
          </DialogTitle>
        </DialogHeader>
        <LocalMcpServerForm
          server={server}
          onSave={handleSave}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

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
    ollamaTimeout,
    setOllamaTimeout,
    mcp,
    setMcpConfig,
    removeLocalMcpServer,
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
              onValueChange={(value) =>
                setAiProvider(value as 'google' | 'ollama')
              }
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
              <div className="space-y-4 pt-4 border-t mt-4">
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
                <div className="space-y-2">
                  <Label htmlFor="ollama-timeout">Timeout (em segundos)</Label>
                  <Input
                    id="ollama-timeout"
                    type="number"
                    value={ollamaTimeout ? ollamaTimeout / 1000 : ''}
                    onChange={(e) => setOllamaTimeout(e.target.value ? parseInt(e.target.value) * 1000 : undefined)}
                    placeholder="Padrão: 600"
                  />
                   <p className="text-xs text-muted-foreground">
                    Tempo de espera pela resposta do modelo. Aumente se estiver recebendo erros de timeout.
                  </p>
                </div>
              </div>
            )}
          </fieldset>

          <fieldset className="border p-4 rounded-md space-y-4">
            <legend className="px-2 text-sm font-medium">Servidores MCP</legend>
            <div className="flex items-center justify-between">
              <Label htmlFor="mcp-fs-switch">
                Servidor de Arquivos (filesystem)
                <p className="text-xs text-muted-foreground">
                  Permite que a IA leia arquivos locais.
                </p>
              </Label>
              <Switch
                id="mcp-fs-switch"
                checked={mcp.fs}
                onCheckedChange={(checked) =>
                  setMcpConfig({ ...mcp, fs: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="mcp-memory-switch">
                Servidor de Memória (memory)
                <p className="text-xs text-muted-foreground">
                  Fornece um contexto volátil para a IA.
                </p>
              </Label>
              <Switch
                id="mcp-memory-switch"
                checked={mcp.memory}
                onCheckedChange={(checked) =>
                  setMcpConfig({ ...mcp, memory: checked })
                }
              />
            </div>
            <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                    <Label>Servidores Locais</Label>
                    <ManageLocalMcpServerDialog>
                        <Button variant="ghost" size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    </ManageLocalMcpServerDialog>
                </div>
                {mcp.localServers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                        Nenhum servidor local configurado.
                    </p>
                ) : (
                    <div className="border rounded-md">
                        {mcp.localServers.map((server, index) => (
                           <div key={server.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                                <div>
                                    <p className="font-medium">{server.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{`${server.command} ${server.args.join(' ')}`}</p>
                                </div>
                                <div className="flex items-center">
                                    <ManageLocalMcpServerDialog server={server}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </ManageLocalMcpServerDialog>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                              <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o servidor MCP local.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => removeLocalMcpServer(server.id)} className="bg-destructive hover:bg-destructive/90">Deletar</AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                </div>
                           </div>
                        ))}
                    </div>
                )}
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
