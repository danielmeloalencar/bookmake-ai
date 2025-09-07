
'use client';

import {useState} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Settings,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type {McpServer} from '@/lib/types';
import {cn} from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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

const serverSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  provider: z.enum(['google', 'ollama']),
  model: z.string().min(1, 'O modelo é obrigatório.'),
  host: z.string().optional(),
}).refine(data => data.provider !== 'ollama' || (data.host && data.host.trim() !== ''), {
  message: 'O endereço do host é obrigatório para o provedor Ollama.',
  path: ['host'],
});

function McpServerForm({
  server,
  onSave,
  onCancel,
}: {
  server?: McpServer;
  onSave: (data: z.infer<typeof serverSchema>) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: {errors},
  } = useForm<z.infer<typeof serverSchema>>({
    resolver: zodResolver(serverSchema),
    defaultValues: {
      name: server?.name || '',
      provider: server?.provider || 'google',
      model: server?.model || '',
      host: server?.host || 'http://127.0.0.1:11434',
    },
  });

  const provider = watch('provider');

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="p-4 bg-muted/50 rounded-lg space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Configuração</Label>
        <Input id="name" {...register('name')} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <Controller
        name="provider"
        control={control}
        render={({field}) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="google" id="google-provider" />
              <Label htmlFor="google-provider">Google AI</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ollama" id="ollama-provider" />
              <Label htmlFor="ollama-provider">Ollama</Label>
            </div>
          </RadioGroup>
        )}
      />
      {provider === 'ollama' && (
        <div className="space-y-2">
          <Label htmlFor="host">Endereço do Host Ollama</Label>
          <Input id="host" {...register('host')} />
           {errors.host && (
            <p className="text-sm text-destructive">{errors.host.message}</p>
          )}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="model">Nome do Modelo</Label>
        <Input id="model" {...register('model')} placeholder={provider === 'google' ? "gemini-1.5-flash" : "ex: gemma"}/>
        {errors.model && (
          <p className="text-sm text-destructive">{errors.model.message}</p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}

export function SettingsModal() {
  const {
    theme,
    setTheme,
    mcpServers,
    activeMcpServerId,
    setActiveMcpServerId,
    addMcpServer,
    updateMcpServer,
    removeMcpServer,
  } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = (data: z.infer<typeof serverSchema>) => {
    if (editingServerId) {
      updateMcpServer(editingServerId, data);
    } else {
      addMcpServer(data);
    }
    setEditingServerId(null);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingServerId(null);
    setIsAdding(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
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
              Servidores MCP (Model Configuration Profiles)
            </legend>
            <div className="space-y-2">
              <Label>Servidor Ativo</Label>
              <Select
                value={activeMcpServerId || ''}
                onValueChange={setActiveMcpServerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum servidor selecionado" />
                </SelectTrigger>
                <SelectContent>
                  {mcpServers.map(server => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name} ({server.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              {mcpServers.map(server =>
                editingServerId === server.id ? (
                  <McpServerForm
                    key={server.id}
                    server={server}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                ) : (
                  <div
                    key={server.id}
                    className={cn(
                      'p-3 rounded-md flex justify-between items-center',
                      activeMcpServerId === server.id
                        ? 'bg-accent/50 border border-accent'
                        : 'bg-muted/50'
                    )}
                  >
                    <div>
                      <p className="font-semibold">{server.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {server.provider}: {server.model}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingServerId(server.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover Servidor?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover o servidor "{server.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeMcpServer(server.id)} className="bg-destructive hover:bg-destructive/90">
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </div>
                )
              )}
            </div>
            {isAdding ? (
              <McpServerForm onSave={handleSave} onCancel={handleCancel} />
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(true);
                  setEditingServerId(null);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Novo Servidor
              </Button>
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
