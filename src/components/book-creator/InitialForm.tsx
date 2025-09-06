
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProject } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Logo } from '../icons';

const formSchema = z.object({
  bookDescription: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres.' }),
  targetAudience: z.string().min(3, { message: 'O público-alvo deve ter pelo menos 3 caracteres.' }),
  language: z.string({ required_error: 'Selecione um idioma.' }),
  difficultyLevel: z.string({ required_error: 'Selecione um nível de dificuldade.' }),
  numberOfChapters: z.coerce.number().int().min(1, { message: 'O número de capítulos deve ser no mínimo 1.' }).max(20, { message: 'O número de capítulos não pode exceder 20.' }),
});

export function InitialForm() {
  const { createNewProject, isCreating } = useProject();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookDescription: '',
      targetAudience: '',
      language: 'Português',
      difficultyLevel: 'Iniciante',
      numberOfChapters: 5,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createNewProject(values);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
             <Logo className="h-10 w-10 text-primary" />
             <CardTitle className="text-3xl font-headline">LivroMágico AI</CardTitle>
          </div>
          <CardDescription>
            Descreva sua ideia e deixe a inteligência artificial criar a estrutura do seu próximo livro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bookDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Livro</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Um guia de ficção científica para jovens sobre viagens no tempo."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Público-alvo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Desenvolvedores iniciantes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="numberOfChapters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº de Capítulos</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um idioma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Português">Português</SelectItem>
                          <SelectItem value="Inglês">Inglês</SelectItem>
                          <SelectItem value="Espanhol">Espanhol</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="difficultyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Dificuldade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um nível" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Iniciante">Iniciante</SelectItem>
                          <SelectItem value="Intermediário">Intermediário</SelectItem>
                          <SelectItem value="Avançado">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando estrutura...
                  </>
                ) : (
                  'Criar Estrutura do Livro'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
