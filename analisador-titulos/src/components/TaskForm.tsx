import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface List {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface TaskFormProps {
  userId: string;
  onTaskAdded: () => void;
  lists: List[];
  selectedListId?: string | null;
}

const PRIORITIES = [
  { value: "urgente", label: "Urgente", color: "#EF4444" },
  { value: "importante", label: "Importante", color: "#F59E0B" },
  { value: "normal", label: "Normal", color: "#10B981" },
];

export const TaskForm = ({ userId, onTaskAdded, lists, selectedListId }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [listId, setListId] = useState<string | undefined>(selectedListId || undefined);
  const [priority, setPriority] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Digite um título para a tarefa");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from("tasks").insert([{
      user_id: userId,
      title: title.trim(),
      label: label.trim() || null,
      list_id: listId === "none" ? null : listId || null,
      priority: priority === "none" ? null : priority || null,
      due_date: dueDate?.toISOString() || null,
      is_done: false,
    }]);

    setIsLoading(false);

    if (error) {
      toast.error("Erro ao adicionar tarefa");
    } else {
      toast.success("✅ Tarefa adicionada!");
      setTitle("");
      setLabel("");
      setPriority("");
      setDueDate(undefined);
      setListId(selectedListId || undefined);
      onTaskAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite uma nova tarefa..."
          className="flex-1 rounded-2xl"
          disabled={isLoading}
        />
        <Button type="submit" size="lg" disabled={isLoading}>
          <Plus className="h-5 w-5" />
          Adicionar
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Etiqueta (opcional)"
          className="rounded-2xl"
          disabled={isLoading}
        />
        
        <Select value={listId} onValueChange={setListId} disabled={isLoading}>
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder="Selecione uma lista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem lista</SelectItem>
            {lists.map((list) => (
              <SelectItem key={list.id} value={list.id}>
                {list.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
          <SelectTrigger className="rounded-2xl">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem prioridade</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "rounded-2xl justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </form>
  );
};
