// components/dashboard/NodeSidebar.tsx
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";

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
    <div className="flex flex-col h-full border-r border-base-200 bg-white min-w-[280px]">
      {/* Search Bar */}
      <div className="p-3 border-b border-base-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-base-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-9 pr-4 py-2 text-sm",
              "bg-base-50 border border-base-200 rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500",
              "placeholder:text-base-400"
            )}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-3 border-b border-base-200">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "px-3 py-1 text-sm rounded-full transition-colors",
                activeCategory === category.id
                  ? "bg-primary-100 text-primary-700"
                  : "bg-base-100 text-base-600 hover:bg-base-200"
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence>
          {filteredNodes.map((node) => (
            <motion.div
              key={node.id}
              draggable
              onDragStart={(e) => handleDragStart(e, node.id)}
              className={cn(
                "cursor-move rounded-lg border border-base-200",
                "bg-white p-3 hover:border-primary-200",
                "hover:shadow-sm transition-all duration-200"
              )}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{node.icon}</span>
                <div>
                  <h3 className="font-medium text-base-800 text-sm">
                    {node.label}
                  </h3>
                  <p className="text-xs text-base-600 mt-0.5">
                    {node.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}