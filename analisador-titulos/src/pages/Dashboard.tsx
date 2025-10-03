import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";
import { TaskCard } from "@/components/TaskCard";
import { Sidebar } from "@/components/Sidebar";
import { CreateListModal } from "@/components/CreateListModal";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  label: string | null;
  is_done: boolean;
  created_at: string;
  priority: string | null;
  due_date: string | null;
  list_id: string | null;
}

interface List {
  id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadTasks(session.user.id);
        loadLists(session.user.id);
      } else {
        navigate("/auth");
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadTasks(session.user.id);
        loadLists(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadTasks = async (userId: string) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar tarefas:", error);
    } else {
      setTasks(data || []);
    }
  };

  const loadLists = async (userId: string) => {
    const { data, error } = await supabase
      .from("lists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar listas:", error);
    } else {
      setLists(data || []);
    }
  };

  const handleCreateList = async (data: {
    name: string;
    color: string;
    icon: string;
  }) => {
    if (!user) return;

    if (editingList) {
      const { error } = await supabase
        .from("lists")
        .update(data)
        .eq("id", editingList.id);

      if (error) {
        toast.error("Erro ao atualizar lista");
      } else {
        toast.success("✏️ Lista atualizada!");
        loadLists(user.id);
        setEditingList(null);
      }
    } else {
      const { error } = await supabase.from("lists").insert({
        user_id: user.id,
        ...data,
      });

      if (error) {
        toast.error("Erro ao criar lista");
      } else {
        toast.success("✅ Lista criada!");
        loadLists(user.id);
      }
    }
  };

  const handleEditList = (list: List) => {
    setEditingList(list);
    setIsCreateModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredTasks = selectedListId
    ? tasks.filter((task) => task.list_id === selectedListId)
    : tasks;

  const pendingTasks = filteredTasks.filter((task) => !task.is_done);
  const completedTasks = filteredTasks.filter((task) => task.is_done);

  const listsWithCounts = lists.map((list) => ({
    ...list,
    taskCount: tasks.filter((task) => task.list_id === list.id && !task.is_done).length,
  }));

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        lists={listsWithCounts}
        selectedListId={selectedListId}
        onSelectList={setSelectedListId}
        onCreateList={() => {
          setEditingList(null);
          setIsCreateModalOpen(true);
        }}
        onEditList={handleEditList}
      />

      <div className="flex-1 flex flex-col">
        <Header userEmail={user.email} />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Olá, <span className="text-primary">{user.email?.split("@")[0]}</span>!
          </h2>
          <p className="text-muted-foreground">
            Você tem{" "}
            <span className="font-semibold text-primary">{pendingTasks.length}</span>{" "}
            {pendingTasks.length === 1 ? "tarefa pendente" : "tarefas pendentes"}
          </p>
        </div>

        <div className="mb-8">
          <TaskForm
            userId={user.id}
            onTaskAdded={() => loadTasks(user.id)}
            lists={lists}
            selectedListId={selectedListId}
          />
        </div>

        <div className="space-y-8">
          {pendingTasks.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Pendentes
              </h3>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={() => loadTasks(user.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                Concluídas
              </h3>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={() => loadTasks(user.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Nenhuma tarefa ainda</h3>
              <p className="text-muted-foreground">
                Comece adicionando sua primeira tarefa acima!
              </p>
            </div>
          )}
        </div>
        </main>
      </div>

      <CreateListModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) setEditingList(null);
        }}
        onSave={handleCreateList}
        initialData={
          editingList
            ? {
                name: editingList.name,
                color: editingList.color,
                icon: editingList.icon,
              }
            : undefined
        }
      />
    </div>
  );
}
