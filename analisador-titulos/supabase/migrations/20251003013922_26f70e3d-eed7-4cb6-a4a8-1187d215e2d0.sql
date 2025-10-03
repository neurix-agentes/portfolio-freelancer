-- Criar tabela de listas
CREATE TABLE public.lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lists
CREATE POLICY "Usuários podem ver suas próprias listas"
ON public.lists
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias listas"
ON public.lists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias listas"
ON public.lists
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias listas"
ON public.lists
FOR DELETE
USING (auth.uid() = user_id);

-- Adicionar índices
CREATE INDEX idx_lists_user_id ON public.lists(user_id);

-- Adicionar colunas na tabela tasks
ALTER TABLE public.tasks
ADD COLUMN list_id UUID REFERENCES public.lists(id) ON DELETE SET NULL,
ADD COLUMN priority TEXT,
ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;

-- Criar índice para list_id
CREATE INDEX idx_tasks_list_id ON public.tasks(list_id);