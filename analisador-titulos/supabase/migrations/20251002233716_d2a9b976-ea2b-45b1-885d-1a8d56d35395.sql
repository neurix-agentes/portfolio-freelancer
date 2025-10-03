-- Criar tabela de tarefas com RLS
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  label text,
  is_done boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: usuários só podem ver suas próprias tarefas
CREATE POLICY "Usuários podem ver suas próprias tarefas"
ON public.tasks
FOR SELECT
USING (auth.uid() = user_id);

-- Políticas RLS: usuários só podem inserir suas próprias tarefas
CREATE POLICY "Usuários podem inserir suas próprias tarefas"
ON public.tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS: usuários só podem atualizar suas próprias tarefas
CREATE POLICY "Usuários podem atualizar suas próprias tarefas"
ON public.tasks
FOR UPDATE
USING (auth.uid() = user_id);

-- Políticas RLS: usuários só podem deletar suas próprias tarefas
CREATE POLICY "Usuários podem deletar suas próprias tarefas"
ON public.tasks
FOR DELETE
USING (auth.uid() = user_id);

-- Índice para melhorar performance de consultas por user_id
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);

-- Índice para consultas ordenadas por data
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);