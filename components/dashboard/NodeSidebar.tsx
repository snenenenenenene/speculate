// components/dashboard/NodeSidebar.tsx
import { cn } from "@/lib/utils";
import { Search, PlayCircle, Square, HelpCircle, CheckSquare, Scale, Wrench, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  projectId: string;
  children?: React.ReactNode;
}

export function NodeSidebar({ isCollapsed, onCollapsedChange, projectId, children }: NodeSidebarProps) {
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
    <aside
      data-collapsed={isCollapsed}
      className={cn(
        "group border-r bg-background h-full",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Back link section */}
        {children}

        {/* Search and categories section */}
        {!isCollapsed && (
          <div className="px-4 py-4 space-y-4">
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
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Badge
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer hover:bg-accent",
                    activeCategory === category.id ? "bg-zinc-950 hover:bg-zinc-900" : "bg-transparent"
                  )}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Nodes list section */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-2">
            <div className="space-y-3">
              {filteredNodes.map(node => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                      "cursor-move hover:bg-muted transition-colors",
                      "group/item",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 shrink-0",
                      "text-muted-foreground group-hover/item:text-foreground"
                    )} />
                    {!isCollapsed && (
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium truncate">{node.label}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {node.description}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}