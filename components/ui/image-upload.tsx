// components/ui/image-upload.tsx
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ImagePlus, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
defaultImage?: string;
onUpload: (file: File) => void;
onRemove?: () => void;
label?: string;
}

export function ImageUpload({ 
defaultImage, 
onUpload, 
onRemove,
label = "Upload Image" 
}: ImageUploadProps) {
const [preview, setPreview] = useState<string | undefined>(defaultImage);

const onDrop = useCallback((acceptedFiles: File[]) => {
  if (acceptedFiles?.[0]) {
	const file = acceptedFiles[0];
	setPreview(URL.createObjectURL(file));
	onUpload(file);
  }
}, [onUpload]);

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: {
	'image/*': ['.png', '.jpg', '.jpeg', '.gif']
  },
  multiple: false
});

const handleRemove = () => {
  setPreview(undefined);
  onRemove?.();
};

return (
  <div className="space-y-2">
	{label && <Label>{label}</Label>}
	{preview ? (
	  <div className="relative">
		<img
		  src={preview}
		  alt="Preview"
		  className="w-full h-48 object-cover rounded-lg"
		/>
		<Button
		  variant="ghost"
		  size="icon"
		  className="absolute top-2 right-2 bg-white/90 hover:bg-white"
		  onClick={handleRemove}
		>
		  <X className="h-4 w-4" />
		</Button>
	  </div>
	) : (
	  <div
		{...getRootProps()}
		className={cn(
		  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
		  "hover:border-primary/50 hover:bg-muted/50 transition-colors",
		  isDragActive && "border-primary bg-primary/10"
		)}
	  >
		<input {...getInputProps()} />
		<div className="flex flex-col items-center gap-2">
		  <ImagePlus className="h-8 w-8 text-muted-foreground" />
		  {isDragActive ? (
			<p className="text-sm text-muted-foreground">Drop the image here</p>
		  ) : (
			<>
			  <p className="text-sm font-medium">Drop image here or click to upload</p>
			  <p className="text-xs text-muted-foreground">
				PNG, JPG or GIF up to 10MB
			  </p>
			</>
		  )}
		</div>
	  </div>
	)}
  </div>
);
}

// Export a reusable dialog footer component
export function DialogFooter({ 
onClose,
onSave,
isSaving = false 
}: { 
onClose: () => void;
onSave: () => void;
isSaving?: boolean;
}) {
return (
  <div className="flex justify-end gap-2">
	<Button
	  variant="outline"
	  onClick={onClose}
	  disabled={isSaving}
	>
	  Cancel
	</Button>
	<Button
	  onClick={onSave}
	  disabled={isSaving}
	>
	  {isSaving ? (
		<>
		  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
		  Saving...
		</>
	  ) : (
		'Save Changes'
	  )}
	</Button>
  </div>
);
}

// Export a reusable image preview component
export function ImagePreview({
src,
alt,
onRemove,
className
}: {
src: string;
alt: string;
onRemove?: () => void;
className?: string;
}) {
return (
  <div className={cn("relative", className)}>
	<img
	  src={src}
	  alt={alt}
	  className="w-full h-full object-cover rounded-lg"
	/>
	{onRemove && (
	  <Button
		variant="ghost"
		size="icon"
		className="absolute top-2 right-2 bg-white/90 hover:bg-white"
		onClick={onRemove}
	  >
		<X className="h-4 w-4" />
	  </Button>
	)}
  </div>
);
}