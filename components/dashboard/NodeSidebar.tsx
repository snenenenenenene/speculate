// components/dashboard/NodeSidebar.tsx
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const nodeTypes = [
  {
    id: 'startNode',
    label: 'Start Node',
    description: 'Begins the flow',
    icon: '▶️',
    category: 'basic'
  },
  {
    id: 'endNode',
    label: 'End Node',
    description: 'Ends the flow',
    icon: '⏹️',
    category: 'basic'
  },
  {
    id: 'yesNo',
    label: 'Yes/No Question',
    description: 'Binary choice question',
    icon: '❓',
    category: 'question'
  },
  {
    id: 'singleChoice',
    label: 'Single Choice',
    description: 'One option from many',
    icon: '☝️',
    category: 'question'
  },
  {
    id: 'multipleChoice',
    label: 'Multiple Choice',
    description: 'Multiple selections allowed',
    icon: '✨',
    category: 'question'
  },
  {
    id: 'weightNode',
    label: 'Weight Node',
    description: 'Adjusts scoring weight',
    icon: '⚖️',
    category: 'logic'
  },
  {
    id: 'functionNode',
    label: 'Function Node',
    description: 'Custom logic and calculations',
    icon: '🔧',
    category: 'logic'
  },
];

const categories = [
  { id: 'all', label: 'All Nodes' },
  { id: 'basic', label: 'Basic' },
  { id: 'question', label: 'Questions' },
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
    <div className="flex flex-col h-full border-r bg-background min-w-[280px]">
      {/* Search Bar */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-3 border-b">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={activeCategory === category.id ? "default" : "secondary"}
              className={cn(
                "cursor-pointer hover:opacity-80",
                activeCategory === category.id && "bg-primary"
              )}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Node List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          <AnimatePresence>
            {filteredNodes.map((node) => (
              <motion.div
                key={node.id}
                draggable
                onDragStart={(e) => handleDragStart(e, node.id)}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card
                  className={cn(
                    "cursor-move hover:border-primary/50",
                    "hover:shadow-sm transition-all duration-200"
                  )}
                >
                  <div className="flex items-center gap-3 p-3">
                    <span className="text-xl">{node.icon}</span>
                    <div>
                      <h3 className="font-medium text-sm">
                        {node.label}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {node.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}