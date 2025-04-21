import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Spinner } from '../components/ui/spinner';
import { 
  Trash2, 
  RotateCw, 
  Download, 
  MoveUp, 
  MoveDown, 
  Type, 
  Image as ImageIcon,
  Layout
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import html2canvas from 'html2canvas-pro';
import api from '../lib/api';
import type { Image as ImageType } from 'react';

// Predefined templates structure
const TEMPLATES = [
  {
    id: 'template-1',
    name: 'Classic Grid',
    placeholders: [
      { x: 50, y: 50, width: 200, height: 200 },
      { x: 270, y: 50, width: 200, height: 200 },
      { x: 50, y: 270, width: 200, height: 200 },
      { x: 270, y: 270, width: 200, height: 200 },
    ]
  },
  {
    id: 'template-2',
    name: 'Cover Page',
    placeholders: [
      { x: 150, y: 50, width: 300, height: 400 },
      { x: 50, y: 150, width: 80, height: 80 },
      { x: 50, y: 250, width: 80, height: 80 },
      { x: 50, y: 350, width: 80, height: 80 },
    ]
  },
  {
    id: 'template-3',
    name: 'Memories',
    placeholders: [
      { x: 50, y: 50, width: 150, height: 150 },
      { x: 220, y: 50, width: 250, height: 150 },
      { x: 50, y: 220, width: 250, height: 150 },
      { x: 320, y: 220, width: 150, height: 150 },
    ]
  }
];

// Predefined background patterns
const BACKGROUNDS = [
  { id: 'solid', name: 'Solid Color', value: '' },
  { id: 'dots', name: 'Dots', value: 'radial-gradient(#0001 1px, transparent 1px) 0 0 / 20px 20px' },
  { id: 'grid', name: 'Grid', value: 'linear-gradient(to right, #0001 1px, transparent 1px) 0 0 / 20px 20px, linear-gradient(to bottom, #0001 1px, transparent 1px) 0 0 / 20px 20px' },
  { id: 'diagonal', name: 'Diagonal', value: 'repeating-linear-gradient(45deg, #0001, #0001 10px, transparent 10px, transparent 20px)' }
];

export default function Montage() {
  const [montages, setMontages] = useState([]);
  const [selectedMontage, setSelectedMontage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  
  // New state for collage functionality
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [canvasPhotos, setCanvasPhotos] = useState<Array<{
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;
    type: 'image' | 'text';
    text?: string;
    fontSize?: number;
    fontColor?: string;
  }>>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');
  const [backgroundPattern, setBackgroundPattern] = useState('');
  const [nextZIndex, setNextZIndex] = useState(1);
  const [newTextContent, setNewTextContent] = useState('');
  const [textFontSize, setTextFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'photos' | 'text' | 'templates'>('photos');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const fetchMontages = async () => {
      try {
        const response = await api.get('/montages');
        setMontages(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedMontage(response.data.data[0]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch montages.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMontages();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    
    const newPhotos = Array.from(event.target.files).map((file) => {
      const objectUrl = URL.createObjectURL(file);
      
      // Create image using document.createElement
      const img = document.createElement('img');
      img.src = objectUrl;
      
      return objectUrl;
    });
    
    setUploadedPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleDragStart = (e: React.DragEvent, src: string) => {
    e.dataTransfer.setData('src', src);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const src = e.dataTransfer.getData('src');
    if (!src) return;
    
    // Get position relative to canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    const newPhoto = {
      id: `photo-${Date.now()}`,
      src,
      x,
      y,
      width: 200,
      height: 150,
      rotation: 0,
      zIndex: nextZIndex,
      type: 'image' as const,
    };
    
    setNextZIndex(nextZIndex + 1);
    setCanvasPhotos((prev) => [...prev, newPhoto]);
  };

  const handlePhotoClick = (id: string) => {
    setSelectedPhoto(selectedPhoto === id ? null : id);
  };

  const handlePhotoMove = (id: string, deltaX: number, deltaY: number) => {
    setCanvasPhotos((prev) => 
      prev.map((photo) => 
        photo.id === id 
          ? { ...photo, x: photo.x + deltaX, y: photo.y + deltaY }
          : photo
      )
    );
  };

  const handlePhotoResize = (id: string, width: number, height: number) => {
    setCanvasPhotos((prev) => 
      prev.map((photo) => 
        photo.id === id ? { ...photo, width, height } : photo
      )
    );
  };

  const handlePhotoRotate = (id: string) => {
    setCanvasPhotos((prev) => 
      prev.map((photo) => 
        photo.id === id 
          ? { ...photo, rotation: (photo.rotation + 15) % 360 }
          : photo
      )
    );
  };

  const handlePhotoDelete = (id: string) => {
    setCanvasPhotos((prev) => prev.filter((photo) => photo.id !== id));
    if (selectedPhoto === id) {
      setSelectedPhoto(null);
    }
  };

  const handleBringForward = (id: string) => {
    // Find the photo and its current zIndex
    const photoIndex = canvasPhotos.findIndex(p => p.id === id);
    if (photoIndex === -1) return;
    
    const newZIndex = nextZIndex;
    setNextZIndex(newZIndex + 1);
    
    setCanvasPhotos(prev => 
      prev.map(photo => 
        photo.id === id ? { ...photo, zIndex: newZIndex } : photo
      )
    );
  };

  const handleSendBackward = (id: string) => {
    // Find the photo and its current zIndex
    const photoIndex = canvasPhotos.findIndex(p => p.id === id);
    if (photoIndex === -1) return;
    
    // Set to a lower z-index than any existing element
    const minZIndex = Math.min(...canvasPhotos.map(p => p.zIndex)) - 1;
    
    setCanvasPhotos(prev => 
      prev.map(photo => 
        photo.id === id ? { ...photo, zIndex: minZIndex } : photo
      )
    );
  };

  const handleAddText = () => {
    if (!newTextContent.trim()) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const centerX = canvasRect.width / 2 - 100;
    const centerY = canvasRect.height / 2 - 25;
    
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text' as const,
      text: newTextContent,
      fontSize: textFontSize,
      fontColor: textColor,
      x: centerX,
      y: centerY,
      width: 200,
      height: 50,
      rotation: 0,
      zIndex: nextZIndex,
      src: '', // Empty for text elements
    };
    
    setNextZIndex(nextZIndex + 1);
    setCanvasPhotos(prev => [...prev, newText]);
    setNewTextContent('');
    setSelectedTab('photos');
  };

  const handleTextEdit = (id: string, content: string) => {
    setCanvasPhotos(prev => 
      prev.map(item => 
        item.id === id && item.type === 'text'
          ? { ...item, text: content }
          : item
      )
    );
  };

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    // Remove all existing photos
    if (canvasPhotos.length > 0) {
      if (!window.confirm('Applying a template will remove all existing items. Continue?')) {
        return;
      }
    }
    
    // Create placeholder rectangles
    const placeholders = template.placeholders.map((placeholder, index) => ({
      id: `placeholder-${Date.now()}-${index}`,
      type: 'image' as const,
      src: '', // Empty placeholder
      ...placeholder,
      rotation: 0,
      zIndex: index + 1,
    }));
    
    setCanvasPhotos(placeholders);
    setNextZIndex(placeholders.length + 1);
    setSelectedTab('photos');
  };

  const exportCollage = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    
    try {
      // Create a promise that resolves when all images are loaded
      const loadAllImages = Promise.all(
        canvasPhotos
          .filter(item => item.type === 'image' && item.src)
          .map(item => {
            return new Promise((resolve) => {
              const img = document.createElement('img');
              img.crossOrigin = "anonymous"; // Try to handle CORS
              img.onload = () => resolve(true);
              img.onerror = () => {
                console.error(`Failed to load image: ${item.src}`);
                resolve(false);
              };
              img.src = item.src;
            });
          })
      );
  
      // Wait for all images to load
      await loadAllImages;
      
      // Small delay to ensure DOM is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: canvasBackground,
        allowTaint: true,
        useCORS: true,
        scale: 2, // Higher quality
        logging: true, // Add logging for debugging
        imageTimeout: 0, // No timeout for loading images
        onclone: (clonedDoc) => {
          // Force all images in the cloned document to be fully loaded
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach(img => {
            img.crossOrigin = "anonymous";
          });
        }
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `reminiss-collage-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
    } catch (err) {
      console.error('Failed to export collage:', err);
      alert('Failed to export collage. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Add collage view option
  const [viewMode, setViewMode] = useState<'montage' | 'collage'>('montage');
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Reminiss</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'montage' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('montage')}
            >
              Montages
            </Button>
            <Button 
              variant={viewMode === 'collage' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('collage')}
            >
              Photo Collage
            </Button>
            <Button asChild size="sm">
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {viewMode === 'montage' ? (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Memory Montage</h2>
              <p className="text-muted-foreground">
                View your batch's memories in a visual format
              </p>
            </div>

            {error ? (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
                <h2 className="mb-2 text-xl font-semibold text-destructive">Error</h2>
                <p className="mb-4">{error}</p>
              </div>
            ) : montages.length === 0 ? (
              <div className="rounded-lg border p-8 text-center">
                <h4 className="mb-2 text-lg font-medium">No montages available</h4>
                <p className="mb-4 text-muted-foreground">
                  Your batch doesn't have any montages yet. Check back later!
                </p>
              </div>
            ) : (
              <div className="grid gap-8">
                <div className="flex flex-wrap gap-4">
                  {montages.map((montage: any) => (
                    <Button
                      key={montage._id}
                      onClick={() => setSelectedMontage(montage)}
                      variant={selectedMontage?._id === montage._id ? "default" : "outline"}
                    >
                      {montage.title}
                    </Button>
                  ))}
                </div>

                {selectedMontage && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedMontage.title}</CardTitle>
                      <CardDescription>
                        Created on{' '}
                        {new Date(selectedMontage.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {selectedMontage.entries.map((entry: any) => (
                          <Link
                            key={entry._id}
                            to={`/entries/${entry._id}`}
                            className="group block overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
                          >
                            <div className="p-4">
                              <h3 className="line-clamp-1 text-lg font-semibold group-hover:text-primary">
                                {entry.title}
                              </h3>
                              <p className="line-clamp-3 mt-2 text-sm text-muted-foreground">
                                {entry.content}
                              </p>
                              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                                <span>{entry.user.name}</span>
                                <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-3xl font-bold tracking-tight">Photo Collage Creator</h2>
              <p className="text-muted-foreground">
                Upload photos and arrange them into a custom collage
              </p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Sidebar with tools */}
              <div className="w-full lg:w-1/4">
                <Card>
                  <CardHeader className="pb-2">
                    <Tabs 
                      value={selectedTab} 
                      onValueChange={(val) => setSelectedTab(val as 'photos' | 'text' | 'templates')}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="photos"><ImageIcon size={16} className="mr-2" />Photos</TabsTrigger>
                        <TabsTrigger value="text"><Type size={16} className="mr-2" />Text</TabsTrigger>
                        <TabsTrigger value="templates"><Layout size={16} className="mr-2" />Templates</TabsTrigger>
                      </TabsList>

                      <TabsContent value="photos">
                        <div className="mb-4 mt-4">
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            ref={fileInputRef}
                          />
                          <Button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                          >
                            Upload Photos
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                          {uploadedPhotos.map((photo, index) => (
                            <div 
                              key={index} 
                              className="aspect-square relative border rounded cursor-move"
                              draggable
                              onDragStart={(e) => handleDragStart(e, photo)}
                            >
                              <img 
                                src={photo} 
                                alt={`Uploaded ${index}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        
                        {uploadedPhotos.length === 0 && (
                          <div className="text-center p-4 text-muted-foreground">
                            No photos uploaded yet
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="text" className="py-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Text Content</label>
                            <Input 
                              value={newTextContent} 
                              onChange={(e) => setNewTextContent(e.target.value)}
                              placeholder="Enter text..." 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Font Size</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="range" 
                                min={10} 
                                max={72} 
                                value={textFontSize}
                                onChange={(e) => setTextFontSize(parseInt(e.target.value))}
                                className="w-full"
                              />
                              <span className="text-sm">{textFontSize}px</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Text Color</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-8 h-8 rounded"
                              />
                              <span className="text-sm">{textColor}</span>
                            </div>
                          </div>
                          
                          <Button onClick={handleAddText} className="w-full" disabled={!newTextContent.trim()}>
                            Add Text to Canvas
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="templates" className="py-4">
                        <div className="space-y-4">
                          <p className="text-muted-foreground text-sm">
                            Choose a template to quickly create a layout
                          </p>
                          
                          {TEMPLATES.map(template => (
                            <Button 
                              key={template.id}
                              onClick={() => applyTemplate(template.id)}
                              variant="outline"
                              className="w-full justify-start"
                            >
                              <Layout size={16} className="mr-2" />
                              {template.name}
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardHeader>
                </Card>
                
                <div className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Canvas Controls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Background Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color" 
                              value={canvasBackground}
                              onChange={(e) => setCanvasBackground(e.target.value)}
                              className="w-8 h-8 rounded"
                            />
                            <span>{canvasBackground}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Background Pattern
                          </label>
                          <Select
                            value={backgroundPattern ? backgroundPattern : 'solid'}
                            onValueChange={(value) => {
                              const pattern = BACKGROUNDS.find(bg => bg.id === value);
                              setBackgroundPattern(pattern?.value || '');
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select pattern" />
                            </SelectTrigger>
                            <SelectContent>
                              {BACKGROUNDS.map(bg => (
                                <SelectItem key={bg.id} value={bg.id}>
                                  {bg.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button 
                          onClick={exportCollage}
                          className="w-full flex items-center gap-2"
                          disabled={isExporting || canvasPhotos.length === 0}
                        >
                          {isExporting ? (
                            <Spinner size="sm" />
                          ) : (
                            <Download size={16} />
                          )}
                          {isExporting ? 'Exporting...' : 'Export Collage'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Canvas area */}
              <div className="w-full lg:w-3/4">
                <div 
                  ref={canvasRef}
                  className="border-2 border-dashed rounded-lg min-h-[600px] relative"
                  style={{ 
                    backgroundColor: canvasBackground,
                    backgroundImage: backgroundPattern,
                  }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {canvasPhotos.map((item) => (
                    <div
                      key={item.id}
                      className={`absolute cursor-move ${selectedPhoto === item.id ? 'ring-2 ring-primary' : ''}`}
                      style={{
                        left: `${item.x}px`,
                        top: `${item.y}px`,
                        width: `${item.width}px`,
                        height: `${item.height}px`,
                        transform: `rotate(${item.rotation}deg)`,
                        zIndex: item.zIndex,
                        padding: item.type === 'text' ? '4px' : '0',
                        backgroundColor: item.type === 'text' ? 'transparent' : undefined,
                        border: item.src === '' && item.type === 'image' ? '2px dashed #ccc' : undefined,
                      }}
                      onClick={() => handlePhotoClick(item.id)}
                      onMouseDown={(e) => {
                        if (selectedPhoto === item.id) {
                          // Only allow moving if selected
                          const startX = e.clientX;
                          const startY = e.clientY;
                          
                          const handleMouseMove = (e: MouseEvent) => {
                            const deltaX = e.clientX - startX;
                            const deltaY = e.clientY - startY;
                            handlePhotoMove(item.id, deltaX, deltaY);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }
                      }}
                    >
                      {item.type === 'image' ? (
                        item.src ? (
                          <img
                            src={item.src}
                            alt="Collage item"
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <p>Drop image here</p>
                          </div>
                        )
                      ) : (
                        <div 
                          className="w-full h-full overflow-hidden flex items-center justify-center"
                          style={{
                            fontSize: `${item.fontSize}px`,
                            color: item.fontColor
                          }}
                        >
                          {selectedPhoto === item.id ? (
                            <Input
                              value={item.text || ''}
                              onChange={(e) => handleTextEdit(item.id, e.target.value)}
                              className="bg-transparent border-none text-center w-full h-full"
                              style={{
                                fontSize: `${item.fontSize}px`,
                                color: item.fontColor
                              }}
                            />
                          ) : (
                            item.text
                          )}
                        </div>
                      )}
                      
                      {selectedPhoto === item.id && (
                        <div className="absolute -top-8 right-0 flex gap-1">
                          <button
                            className="bg-white p-1 rounded-full shadow-sm hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBringForward(item.id);
                            }}
                          >
                            <MoveUp size={16} />
                          </button>
                          <button
                            className="bg-white p-1 rounded-full shadow-sm hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendBackward(item.id);
                            }}
                          >
                            <MoveDown size={16} />
                          </button>
                          <button
                            className="bg-white p-1 rounded-full shadow-sm hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePhotoRotate(item.id);
                            }}
                          >
                            <RotateCw size={16} />
                          </button>
                          <button
                            className="bg-white p-1 rounded-full shadow-sm hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePhotoDelete(item.id);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                      
                      {selectedPhoto === item.id && (
                        <div
                          className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full cursor-se-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const startWidth = item.width;
                            const startHeight = item.height;
                            
                            const handleResizeMove = (e: MouseEvent) => {
                              const deltaX = e.clientX - startX;
                              const deltaY = e.clientY - startY;
                              
                              // Keep aspect ratio for images but not for text
                              if (item.type === 'image') {
                                const aspectRatio = startWidth / startHeight;
                                const newWidth = Math.max(50, startWidth + deltaX);
                                const newHeight = Math.max(50, newWidth / aspectRatio);
                                handlePhotoResize(item.id, newWidth, newHeight);
                              } else {
                                const newWidth = Math.max(50, startWidth + deltaX);
                                const newHeight = Math.max(30, startHeight + deltaY);
                                handlePhotoResize(item.id, newWidth, newHeight);
                              }
                            };
                            
                            const handleResizeUp = () => {
                              document.removeEventListener('mousemove', handleResizeMove);
                              document.removeEventListener('mouseup', handleResizeUp);
                            };
                            
                            document.addEventListener('mousemove', handleResizeMove);
                            document.addEventListener('mouseup', handleResizeUp);
                          }}
                        />
                      )}
                    </div>
                  ))}
                  
                  {canvasPhotos.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      Drag and drop photos here to create your collage or select a template
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
