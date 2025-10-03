import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Pencil, Trash2, Check, X, Calendar, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  label: string | null;
  is_done: boolean;
  priority: string | null;
  due_date: string | null;
}

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

const labelColors: Record<string, string> = {
  Trabalho: "bg-task-blue text-blue-900",
  Estudo: "bg-task-purple text-purple-900",
  Pessoal: "bg-task-pink text-pink-900",
  Urgente: "bg-task-yellow text-yellow-900",
  Lazer: "bg-task-green text-green-900",
};

const PRIORITIES = {
  urgente: { label: "Urgente", color: "#EF4444", icon: AlertCircle },
  importante: { label: "Importante", color: "#F59E0B", icon: AlertCircle },
  normal: { label: "Normal", color: "#10B981", icon: AlertCircle },
};

const PRIORITIES_OPTIONS = [
  { value: "urgente", label: "Urgente", color: "#EF4444" },
  { value: "importante", label: "Importante", color: "#F59E0B" },
  { value: "normal", label: "Normal", color: "#10B981" },
];

export const TaskCard = ({ task, onUpdate }: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedLabel, setEditedLabel] = useState(task.label || "");
  const [editedPriority, setEditedPriority] = useState(task.priority || "");
  const [editedDueDate, setEditedDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );

  const handleToggleDone = async () => {
    const { error } = await supabase
      .from("tasks")
      .update({ is_done: !task.is_done })
      .eq("id", task.id);

    if (error) {
      toast.error("Erro ao atualizar tarefa");
    } else {
      toast.success(task.is_done ? "Tarefa marcada como pendente" : "🎉 Bom trabalho!");
      onUpdate();
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", task.id);

    if (error) {
      toast.error("Erro ao deletar tarefa");
    } else {
      toast.success("🗑️ Tarefa removida!");
      onUpdate();
    }
  };

  const handleSave = async () => {
    if (!editedTitle.trim()) {
      toast.error("O título não pode estar vazio");
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({
        title: editedTitle.trim(),
        label: editedLabel.trim() || null,
        priority: editedPriority === "none" ? null : editedPriority || null,
        due_date: editedDueDate?.toISOString() || null,
      })
      .eq("id", task.id);

    if (error) {
      toast.error("Erro ao atualizar tarefa");
    } else {
      toast.success("✏️ Tarefa atualizada!");
      setIsEditing(false);
      onUpdate();
    }
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedLabel(task.label || "");
    setEditedPriority(task.priority || "");
    setEditedDueDate(task.due_date ? new Date(task.due_date) : undefined);
    setIsEditing(false);
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-md border border-border hover:shadow-lg transition-all">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.is_done}
          onCheckedChange={handleToggleDone}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="rounded-xl"
                placeholder="Título da tarefa"
              />
              <Input
                value={editedLabel}
                onChange={(e) => setEditedLabel(e.target.value)}
                className="rounded-xl"
                placeholder="Etiqueta (ex: Trabalho, Estudo)"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <Select value={editedPriority} onValueChange={setEditedPriority}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem prioridade</SelectItem>
                    {PRIORITIES_OPTIONS.map((p) => (
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
                        "rounded-xl justify-start text-left font-normal",
                        !editedDueDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {editedDueDate ? format(editedDueDate, "dd/MM/yyyy", { locale: ptBR }) : "Data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={editedDueDate}
                      onSelect={setEditedDueDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={handleSave}>
                  <Check className="h-3 w-3" />
                  Salvar
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-3 w-3" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p
                className={`font-medium ${
                  task.is_done
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {task.title}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {task.label && (
                  <Badge
                    className={
                      labelColors[task.label] || "bg-accent text-accent-foreground"
                    }
                  >
                    {task.label}
                  </Badge>
                )}
                
                {task.priority && PRIORITIES[task.priority as keyof typeof PRIORITIES] && (
                  <Badge
                    style={{
                      backgroundColor: PRIORITIES[task.priority as keyof typeof PRIORITIES].color,
                      color: "white",
                    }}
                    className="gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {PRIORITIES[task.priority as keyof typeof PRIORITIES].label}
                  </Badge>
                )}
                
                {task.due_date && (
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setEditedPriority(task.priority || "");
                setEditedDueDate(task.due_date ? new Date(task.due_date) : undefined);
                setIsEditing(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
