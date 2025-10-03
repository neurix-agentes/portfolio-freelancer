import { Plus, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

interface List {
  id: string;
  name: string;
  color: string;
  icon: string;
  taskCount?: number;
}

interface SidebarProps {
  lists: List[];
  selectedListId: string | null;
  onSelectList: (listId: string | null) => void;
  onCreateList: () => void;
  onEditList: (list: List) => void;
}

export const Sidebar = ({
  lists,
  selectedListId,
  onSelectList,
  onCreateList,
  onEditList,
}: SidebarProps) => {
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || List;
    return Icon;
  };

  return (
    <div className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col h-screen">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Minhas Listas</h2>
        <Button
          onClick={onCreateList}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Nova Lista
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        <div
          onClick={() => onSelectList(null)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-accent mb-1",
            selectedListId === null && "bg-accent"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <List className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-medium">Todas as Tarefas</span>
        </div>

        <div className="mt-4 space-y-1">
          {lists.map((list) => {
            const Icon = getIcon(list.icon);
            return (
              <div
                key={list.id}
                onClick={() => onSelectList(list.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onEditList(list);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-accent group",
                  selectedListId === list.id && "bg-accent"
                )}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: list.color }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium truncate block">{list.name}</span>
                </div>
                {list.taskCount !== undefined && list.taskCount > 0 && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {list.taskCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
