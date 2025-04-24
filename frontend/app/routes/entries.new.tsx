import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Spinner } from '../components/ui/spinner';
import api from '../lib/api';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export default function NewEntry() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('Image file size should be less than 15MB. Please choose a smaller file or compress the image.');
      setImageFile(null);
      return;
    }

    setImageFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', file);

      // Image is uploaded when creating the entry, not separately
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
      // But pretend we've uploaded it for progress indication
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setIsUploading(false);
        // Create a temporary local URL for preview
        setImageUrl(URL.createObjectURL(file));
      }, 2000);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Failed to prepare image: ${err.message || 'Unknown error'}`);
      setIsUploading(false);
      setImageFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // If image is still uploading, wait for it to complete
    if (isUploading) {
      setError('Please wait for the image to finish uploading');
      setIsLoading(false);
      return;
    }

    // Validate required fields
    if (!imageFile) {
      setError('Please upload an image for your yearbook entry');
      setIsLoading(false);
      return;
    }

    try {
      // Create FormData for the complete entry
      const formData = new FormData();
      formData.append('message', content);
      formData.append('title', title);
      
      // Add tags as JSON string if present
      if (tags) {
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formData.append('tags', JSON.stringify(tagsArray));
      }
      
      // Append the image file
      formData.append('image', imageFile);

      // Submit the complete entry with image
      await api.post('/entries', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Reminiss</h1>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Yearbook Entry</CardTitle>
              <CardDescription>
                Share a memory or message for your yearbook
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your yearbook entry"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Message</Label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your message or memory for the yearbook..."
                    className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="fun, friendship, memories"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Image</Label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      id="image"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select Image
                    </Button>
                    
                    {imageFile && (
                      <div className="mt-2">
                        <p className="text-sm">{imageFile.name}</p>
                        {isUploading ? (
                          <div className="mt-2">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all" 
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploading: {uploadProgress}%
                            </p>
                          </div>
                        ) : imageUrl ? (
                          <div className="flex items-center mt-1">
                            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                            <p className="text-xs text-green-600">Upload complete</p>
                          </div>
                        ) : null}
                      </div>
                    )}
                    
                    {imageUrl && (
                      <div className="mt-2 max-w-xs">
                        <img 
                          src={imageUrl} 
                          alt="Preview" 
                          className="rounded-md border border-input max-h-40 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || isUploading}>
                  {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
                  {isUploading ? 'Uploading...' : 'Create Entry'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
} 
