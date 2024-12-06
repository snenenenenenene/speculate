// // app/projects/[projectId]/flows/[flowId]/components/QuickActions.tsx
// "use client";

// import { LoadingSpinner } from "@/components/ui/base";
// import { cn } from "@/lib/utils";
// import { GitCommit, Save, Settings, Upload } from "lucide-react";
// import { useCallback, useEffect, useState } from "react";
// import { toast } from "react-hot-toast";
// import { useReactFlow } from "reactflow";

// interface QuickActionsProps {
//   projectId: string;
//   flowId: string;
//   onOpenSettings?: () => void;
// }

// export function QuickActions({
//   projectId,
//   flowId,
//   onOpenSettings
// }: QuickActionsProps) {
//   const [isSaving, setIsSaving] = useState(false);
//   const { getNodes, getEdges } = useReactFlow();

//   const handleSave = useCallback(async () => {
//     setIsSaving(true);
//     // Show saving toast
//     const savingToast = toast.loading('Saving changes...');

//     try {
//       // Get current flow state
//       const nodes = getNodes();
//       const edges = getEdges();
//       const flowContent = {
//         nodes,
//         edges,
//         viewport: { x: 0, y: 0, zoom: 1 }
//       };

//       // Save to API
//       const response = await fetch(`/api/projects/${projectId}/flows/${flowId}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           content: JSON.stringify(flowContent)
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to save flow');
//       }

//       // Update toast to success
//       toast.success('Changes saved successfully', {
//         id: savingToast,
//       });
//     } catch (error) {
//       console.error('Error saving flow:', error);
//       // Update toast to error
//       toast.error('Failed to save changes', {
//         id: savingToast,
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   }, [projectId, flowId, getNodes, getEdges]);

//   // Add keyboard shortcut for save
//   useEffect(() => {
//     const handleKeyPress = (event: KeyboardEvent) => {
//       if ((event.ctrlKey || event.metaKey) && event.key === 's') {
//         event.preventDefault();
//         handleSave();
//       }
//     };

//     document.addEventListener('keydown', handleKeyPress);
//     return () => {
//       document.removeEventListener('keydown', handleKeyPress);
//     };
//   }, [handleSave]);

//   return (
//     <div className="flex items-center gap-2">
//       <button
//         onClick={handleSave}
//         disabled={isSaving}
//         className={cn(
//           "flex items-center justify-center gap-2 px-3 py-1.5",
//           "text-sm font-medium rounded-lg transition-all",
//           "bg-blue-50 text-blue-600 hover:bg-blue-100",
//           "disabled:opacity-50 disabled:cursor-not-allowed",
//           "min-w-[80px]" // Ensure button doesn't change width when loading
//         )}
//       >
//         {isSaving ? (
//           <>
//             <LoadingSpinner className="h-4 w-4" />
//             <span>Saving</span>
//           </>
//         ) : (
//           <>
//             <Save className="h-4 w-4" />
//             <span>Save</span>
//           </>
//         )}
//       </button>

//       <button
//         onClick={() => {/* Import/Export handler */}}
//         className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
//       >
//         <Upload className="h-4 w-4" />
//         Import/Export
//       </button>

//       <button
//         onClick={() => {/* Commit handler */}}
//         className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
//       >
//         <GitCommit className="h-4 w-4" />
//         Commit
//       </button>

//       <div className="h-6 w-px bg-gray-200" />

//       <button
//         onClick={onOpenSettings}
//         className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
//       >
//         <Settings className="h-4 w-4" />
//         Settingsaa
//       </button>
//     </div>
//   );
// }