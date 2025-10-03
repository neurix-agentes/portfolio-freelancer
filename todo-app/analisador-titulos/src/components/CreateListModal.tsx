import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
interface CreateListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    color: string;
    icon: string;
  }) => void;
  initialData?: {
    name: string;
    color: string;
    icon: string;
  };
}
const COLORS = [{
  name: "Azul",
  value: "#3B82F6"
}, {
  name: "Rosa",
  value: "#EC4899"
}, {
  name: "Roxo",
  value: "#A855F7"
}, {
  name: "Verde",
  value: "#10B981"
}, {
  name: "Amarelo",
  value: "#F59E0B"
}, {
  name: "Vermelho",
  value: "#EF4444"
}, {
  name: "Índigo",
  value: "#6366F1"
}, {
  name: "Turquesa",
  value: "#14B8A6"
}, {
  name: "Laranja",
  value: "#F97316"
}, {
  name: "Lima",
  value: "#84CC16"
}];
const ICONS = [{
  name: "Lista",
  icon: "List"
}, {
  name: "Briefcase",
  icon: "Briefcase"
}, {
  name: "Home",
  icon: "Home"
}, {
  name: "ShoppingCart",
  icon: "ShoppingCart"
}, {
  name: "Heart",
  icon: "Heart"
}, {
  name: "Star",
  icon: "Star"
}, {
  name: "BookOpen",
  icon: "BookOpen"
}, {
  name: "Coffee",
  icon: "Coffee"
}, {
  name: "Dumbbell",
  icon: "Dumbbell"
}, {
  name: "Music",
  icon: "Music"
}, {
  name: "Plane",
  icon: "Plane"
}, {
  name: "Palette",
  icon: "Palette"
}, {
  name: "Code",
  icon: "Code"
}, {
  name: "Camera",
  icon: "Camera"
}, {
  name: "Gamepad2",
  icon: "Gamepad2"
}, {
  name: "Gift",
  icon: "Gift"
}, {
  name: "Target",
  icon: "Target"
}, {
  name: "CheckSquare",
  icon: "CheckSquare"
}, {
  name: "FileText",
  icon: "FileText"
}, {
  name: "Mail",
  icon: "Mail"
}, {
  name: "Bell",
  icon: "Bell"
}, {
  name: "Calendar",
  icon: "Calendar"
}, {
  name: "Clock",
  icon: "Clock"
}, {
  name: "Flag",
  icon: "Flag"
}];
export const CreateListModal = ({
  open,
  onOpenChange,
  onSave,
  initialData
}: CreateListModalProps) => {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectedIcon, setSelectedIcon] = useState("List");
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSelectedColor(initialData.color);
      setSelectedIcon(initialData.icon);
    } else {
      setName("");
      setSelectedColor(COLORS[0].value);
      setSelectedIcon("List");
    }
  }, [initialData, open]);
  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon
      });
      onOpenChange(false);
    }
  };
  const getIcon = (iconName: string) => {
    return (LucideIcons as any)[iconName] || LucideIcons.List;
  };
  const PreviewIcon = getIcon(selectedIcon);
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[100vh] overflow-y-auto -my-5">
        <DialogHeader>
          
        </DialogHeader>

        <div className="space-y-3">
          {/* Preview */}
          <div className="flex items-center gap-4 p-3 bg-accent/50 rounded-lg">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-all" style={{
            backgroundColor: selectedColor
          }}>
              <PreviewIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Preview</p>
              <p className="text-lg font-semibold">
                {name || "Nome da Lista"}
              </p>
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Lista</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Trabalho, Pessoal, Compras..." className="rounded-2xl" />
          </div>

          {/* Cores */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-10 gap-1.5">
              {COLORS.map(color => <button key={color.value} onClick={() => setSelectedColor(color.value)} className={cn("w-full aspect-square rounded-md transition-all hover:scale-105", selectedColor === color.value && "ring-1.5 ring-primary ring-offset-1")} style={{
              backgroundColor: color.value
            }} title={color.name} />)}
            </div>
          </div>

          {/* Ícones */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-8 gap-2">
              {ICONS.map(item => {
              const Icon = getIcon(item.icon);
              return <button key={item.icon} onClick={() => setSelectedIcon(item.icon)} className={cn("aspect-square rounded-lg flex items-center justify-center transition-all hover:bg-accent", selectedIcon === item.icon && "bg-accent ring-2 ring-primary")} title={item.name}>
                    <Icon className="h-5 w-5" />
                  </button>;
            })}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {initialData ? "Salvar" : "Criar Lista"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};