import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";
import api from "~/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 15MB

// Define the validation schema with Zod
const entrySchema = z.object({
  message: z.string().min(1, { message: "Message is required" }),
  activities: z.string().optional(),
  ambition: z.string().optional(),
  memories: z.string().optional(),
  messageToClassmates: z.string().optional(),
});

type EntryFormValues = z.infer<typeof entrySchema>;

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EntryModal({ isOpen, onClose, onSuccess }: EntryModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      message: '',
      activities: '',
      ambition: '',
      memories: '',
      messageToClassmates: '',
    }
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFormError('Image file size should be less than 15MB. Please choose a smaller file or compress the image.');
      setImageFile(null);
      return;
    }

    setImageFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress for UX
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          if (progress >= 95) {
            clearInterval(interval);
          } else {
            setUploadProgress(progress);
          }
        }, 200);
        return interval;
      };
      
      const interval = simulateProgress();
      
      // Store the file for actual submission later
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setIsUploading(false);
        // Create a temporary local URL for preview
        setImageUrl(URL.createObjectURL(file));
      }, 2000);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setFormError(`Failed to prepare image: ${err.message || 'Unknown error'}`);
      setIsUploading(false);
      setImageFile(null);
    }
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onSubmit = async (formData: EntryFormValues) => {
    setFormError('');
    setIsLoading(true);

    if (isUploading) {
      setFormError('Please wait for the image to finish uploading');
      setIsLoading(false);
      return;
    }

    if (!imageFile) {
      setFormError('Please upload an image for your yearbook entry');
      setIsLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('message', formData.message);
      
      // Parse activities as an array
      if (formData.activities) {
        const activitiesArray = formData.activities.split(',').map(activity => activity.trim()).filter(activity => activity);
        data.append('activities', JSON.stringify(activitiesArray));
      }
      
      // Add other fields
      if (formData.ambition) data.append('ambition', formData.ambition);
      if (formData.memories) data.append('memories', formData.memories);
      if (formData.messageToClassmates) data.append('messageToClassmates', formData.messageToClassmates);
      
      data.append('image', imageFile);

      await api.post('/entries', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    reset();
    setImageFile(null);
    setImageUrl('');
    setUploadProgress(0);
    setFormError('');
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-hidden"
    >
      <motion.div 
        className="w-full max-w-2xl h-[90vh] bg-background rounded-lg shadow-xl flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <Card className="border-none shadow-md bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 flex flex-col h-full overflow-hidden">
          <CardHeader className="space-y-1 border-b border-violet-100 dark:border-violet-900/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300">
                Create Your Yearbook Entry
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-muted-foreground dark:text-muted-foreground/90">
              Share your memories and messages for the yearbook
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {formError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mb-4">
                  {formError}
                </div>
              )}
              
              <div className="space-y-2 mb-4">
                <Label htmlFor="message" className="text-foreground">Quote</Label>
                <Textarea 
                  id="message"
                  {...register('message')}
                  placeholder="Share your quote"
                  className="min-h-[80px] border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                  aria-invalid={errors.message ? "true" : "false"}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <Label htmlFor="activities" className="text-foreground">Activities (comma separated)</Label>
                <Input 
                  id="activities"
                  {...register('activities')}
                  placeholder="coding, sports, music, debate"
                  className="border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                />
                {errors.activities && (
                  <p className="text-sm text-destructive">{errors.activities.message}</p>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <Label htmlFor="ambition" className="text-foreground">Ambition</Label>
                <Textarea 
                  id="ambition"
                  {...register('ambition')}
                  placeholder="Share your future goals and ambitions"
                  className="min-h-[80px] border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                />
                {errors.ambition && (
                  <p className="text-sm text-destructive">{errors.ambition.message}</p>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <Label htmlFor="memories" className="text-foreground">Memories</Label>
                <Textarea 
                  id="memories"
                  {...register('memories')}
                  placeholder="Share your favorite college memories"
                  className="min-h-[80px] border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                />
                {errors.memories && (
                  <p className="text-sm text-destructive">{errors.memories.message}</p>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <Label htmlFor="messageToClassmates" className="text-foreground">Message to Classmates</Label>
                <Textarea 
                  id="messageToClassmates"
                  {...register('messageToClassmates')}
                  placeholder="Share a message for your classmates"
                  className="min-h-[80px] border-violet-200 dark:border-violet-900/50 focus:ring-violet-500 dark:focus:ring-violet-400"
                />
                {errors.messageToClassmates && (
                  <p className="text-sm text-destructive">{errors.messageToClassmates.message}</p>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <Label className="text-foreground">Profile Image</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {!imageUrl ? (
                  <div 
                    onClick={handleFileButtonClick}
                    className="border-2 border-dashed border-violet-200 dark:border-violet-900/50 rounded-lg p-8 text-center cursor-pointer hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition"
                  >
                    <p className="text-foreground">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground mt-2">Max size: 10MB</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-auto rounded-md max-h-[200px] object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageUrl('');
                        setImageFile(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                
                {isUploading && (
                  <div className="mt-2">
                    <div className="h-2 bg-violet-100 dark:bg-violet-900/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-500 dark:to-indigo-400 transition-all duration-300 ease-in-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-muted-foreground">Uploading: {uploadProgress}%</p>
                  </div>
                )}
              </div>
            </div>
            
            <CardFooter className="flex justify-between border-t border-violet-100 dark:border-violet-900/50 pt-4 flex-shrink-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-violet-200 dark:border-violet-900/50 hover:bg-violet-50 dark:hover:bg-violet-900/20"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isUploading}
                className="group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300 ease-out group-hover:scale-105"></span>
                <span className="relative z-10 text-white flex items-center justify-center">
                  {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
                  Submit Entry
                </span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}



