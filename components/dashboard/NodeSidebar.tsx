// components/dashboard/NodeSidebar.tsx
import { cn } from "@/lib/utils";
import { Search, PlayCircle, Square, HelpCircle, CheckSquare, Scale, Wrench } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NodeType {
  id: string;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  category: string;
}

const nodeTypes: NodeType[] = [
  {
    id: 'startNode',
    label: 'Start Node',
    description: 'Begins the flow',
    icon: PlayCircle,
    category: 'flow'
  },
  {
    id: 'endNode',
    label: 'End Node',
    description: 'Ends the flow',
    icon: Square,
    category: 'flow'
  },
  {
    id: 'yesNo',
    label: 'Yes/No Question',
    description: 'Binary choice question',
    icon: HelpCircle,
    category: 'input'
  },
  {
    id: 'singleChoice',
    label: 'Single Choice',
    description: 'One option from many',
    icon: CheckSquare,
    category: 'input'
  },
  {
    id: 'multipleChoice',
    label: 'Multiple Choice',
    description: 'Multiple selections allowed',
    icon: CheckSquare,
    category: 'input'
  },
  {
    id: 'weightNode',
    label: 'Weight Node',
    description: 'Adjusts scoring weight',
    icon: Scale,
    category: 'logic'
  },
  {
    id: 'functionNode',
    label: 'Function Node',
    description: 'Custom logic and calculations',
    icon: Wrench,
    category: 'logic'
  },
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'flow', label: 'Flow' },
  { id: 'input', label: 'Input' },
  { id: 'logic', label: 'Logic' },
];

interface NodeSidebarProps {
  width: number;
  onWidthChange: (width: number) => void;
}

export function NodeSidebar({ width, onWidthChange }: NodeSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodes = nodeTypes.filter(node =>
    (activeCategory === 'all' || node.category === activeCategory) &&
    (node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full w-[280px] border-r bg-background">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>
        <div className="flex gap-2 px-3">
          {categories.map(category => (
            <Badge
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Badge>
          ))}
        </div>
        <ScrollArea className="flex-1">
          <div className="px-3 space-y-1">
            {filteredNodes.map(node => {
              const Icon = node.icon;
              return (
                <div
                  key={node.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, node.id)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-move hover:bg-muted/50"
                >
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{node.label}</span>
                    <span className="text-xs text-muted-foreground truncate">{node.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}