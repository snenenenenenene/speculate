/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/keyboard-shortcuts.ts

import { useStores } from "@/hooks/use-stores";
import { useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useReactFlow } from "reactflow";

export const SHORTCUTS = {
  // Navigation
  PAN: "Space",
  ZOOM_IN: "=",
  ZOOM_OUT: "-",
  FRAME_ALL: "Home",
  FRAME_SELECTED: "NumpadPeriod",

  // Selection
  SELECT_ALL: "a",
  DESELECT_ALL: "Alt+a",
  BOX_SELECT: "b",
  CIRCLE_SELECT: "c",

  // Node Operations
  DELETE_NODE: "x",
  DUPLICATE_NODE: "Shift+d",
  CONNECT_NODES: "f",
  DISCONNECT_NODE: "Alt+d",

  // Transform
  GRAB_NODE: "g",
  SNAP_TO_GRID: "Shift+s",
  ALIGN_NODES: "Alt+g",

  // Editing
  RENAME_NODE: "n",
  QUICK_EDIT: "Tab",
  UNDO: "Ctrl+z",
  REDO: "Ctrl+Shift+z",

  // Flow Management
  SAVE_FLOW: "Ctrl+s",
  NEW_FLOW: "Ctrl+n",
  EXPORT_FLOW: "Ctrl+e",

  // View
  TOGGLE_SIDEBAR: "`",
  TOGGLE_MINIMAP: "m",
  TOGGLE_GRID: "Shift+g",

  // Node Creation
  ADD_START_NODE: "1",
  ADD_END_NODE: "2",
  ADD_CHOICE_NODE: "3",
  ADD_FUNCTION_NODE: "4",
  ADD_WEIGHT_NODE: "5",

  // Modes
  EDIT_MODE: "Tab",
  PREVIEW_MODE: "Shift+Tab",
} as const;

export const MODIFIERS = {
  PRECISE_TRANSFORM: "Shift",
  MULTI_SELECT: "Shift",
  QUICK_DELETE: "Alt+x",
  QUICK_DUPLICATE: "Alt+d",
} as const;

type ShortcutAction = keyof typeof SHORTCUTS;

export function useKeyboardShortcuts(
  isSidebarOpen: boolean,
  setIsSidebarOpen: (open: boolean) => void
) {
  const { zoomIn, zoomOut, fitView, getNodes, setNodes, getSelectedNodes } =
    useReactFlow() as any;

  const { chartStore, utilityStore } = useStores() as any;

  const handleShortcut = useCallback(
    (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = getKeyCombo(e);

      // Prevent default browser shortcuts
      if (Object.values(SHORTCUTS).includes(key as any)) {
        e.preventDefault();
      }

      switch (key) {
        // Navigation
        case SHORTCUTS.ZOOM_IN:
          zoomIn();
          break;
        case SHORTCUTS.ZOOM_OUT:
          zoomOut();
          break;
        case SHORTCUTS.FRAME_ALL:
          fitView();
          break;
        case SHORTCUTS.FRAME_SELECTED: {
          const selectedNodes = getSelectedNodes();
          if (selectedNodes.length > 0) {
            fitView({ nodes: selectedNodes, duration: 800 });
          }
          break;
        }

        // Selection
        case SHORTCUTS.SELECT_ALL:
          setNodes(getNodes().map((node) => ({ ...node, selected: true })));
          break;
        case SHORTCUTS.DESELECT_ALL:
          setNodes(getNodes().map((node) => ({ ...node, selected: false })));
          break;

        // Node Operations
        case SHORTCUTS.DELETE_NODE: {
          const selectedNodes = getSelectedNodes();
          if (selectedNodes.length > 0) {
            const currentInstance = chartStore.getCurrentChartInstance();
            if (currentInstance) {
              selectedNodes.forEach((node) => {
                chartStore.removeNode(currentInstance.id, node.id);
              });
              toast.success(
                `Deleted ${selectedNodes.length} node${
                  selectedNodes.length > 1 ? "s" : ""
                }`
              );
            }
          }
          break;
        }

        case SHORTCUTS.DUPLICATE_NODE: {
          const selectedNodes = getSelectedNodes();
          if (selectedNodes.length > 0) {
            const currentInstance = chartStore.getCurrentChartInstance();
            if (currentInstance) {
              selectedNodes.forEach((node) => {
                const newNode = {
                  ...node,
                  id: `${node.id}-copy-${Date.now()}`,
                  position: {
                    x: node.position.x + 50,
                    y: node.position.y + 50,
                  },
                  selected: true,
                };
                chartStore.addNode(currentInstance.id, newNode);
              });
              toast.success(
                `Duplicated ${selectedNodes.length} node${
                  selectedNodes.length > 1 ? "s" : ""
                }`
              );
            }
          }
          break;
        }

        // Flow Management
        case SHORTCUTS.SAVE_FLOW:
          const utilityStore = useUtilityStore.getState();
          const chartStore = useChartStore.getState();
          utilityStore
            .saveToDb(chartStore.flows)
            .then(() => {
              toast.success("Flow saved successfully");
            })
            .catch((error) => {
              console.error("Error saving flow:", error);
              toast.error("Failed to save flow");
            });
          break;

        // View
        case SHORTCUTS.TOGGLE_SIDEBAR:
          setIsSidebarOpen(!isSidebarOpen);
          break;

        // Quick Actions
        case SHORTCUTS.GRAB_NODE: {
          const selectedNodes = getSelectedNodes();
          if (selectedNodes.length > 0) {
            // Enable drag mode
            document.body.style.cursor = "move";
            const handleMouseMove = (e: MouseEvent) => {
              // Implement node dragging
            };
            const handleMouseUp = () => {
              document.body.style.cursor = "default";
              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
            };
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
          }
          break;
        }

        case SHORTCUTS.SNAP_TO_GRID: {
          const selectedNodes = getSelectedNodes();
          if (selectedNodes.length > 0) {
            const gridSize = 20; // Can be made configurable
            setNodes(
              getNodes().map((node) => {
                if (node.selected) {
                  return {
                    ...node,
                    position: {
                      x: Math.round(node.position.x / gridSize) * gridSize,
                      y: Math.round(node.position.y / gridSize) * gridSize,
                    },
                  };
                }
                return node;
              })
            );
            toast.success("Snapped to grid");
          }
          break;
        }
      }
    },
    [
      zoomIn,
      zoomOut,
      fitView,
      getNodes,
      setNodes,
      getSelectedNodes,
      chartStore,
      utilityStore,
      isSidebarOpen,
      setIsSidebarOpen,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleShortcut);
    return () => {
      document.removeEventListener("keydown", handleShortcut);
    };
  }, [handleShortcut]);
}

// Helper function to get standardized key combo string
function getKeyCombo(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");
  if (e.key !== "Control" && e.key !== "Alt" && e.key !== "Shift") {
    parts.push(e.key.toLowerCase());
  }
  return parts.join("+");
}

// Hook to handle keyboard shortcuts for node creation based on number keys
export function useNodeCreationShortcuts() {
  const { project } = useReactFlow();
  const { chartStore } = useStores() as any;

  const handleNodeCreation = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key;
      const currentInstance = chartStore.getCurrentChartInstance();
      if (!currentInstance) return;

      // Get center of viewport
      const center = project({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      switch (key) {
        case "1":
          chartStore.addNode(currentInstance.id, {
            type: "startNode",
            position: center,
            id: `startNode-${Date.now()}`,
            data: { label: "Start" },
          });
          break;
        case "2":
          chartStore.addNode(currentInstance.id, {
            type: "endNode",
            position: center,
            id: `endNode-${Date.now()}`,
            data: { label: "End" },
          });
          break;
        // Add other node types...
      }
    },
    [project, chartStore]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleNodeCreation);
    return () => {
      document.removeEventListener("keydown", handleNodeCreation);
    };
  }, [handleNodeCreation]);
}
