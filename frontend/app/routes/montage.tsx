import React, { useState, useRef, useEffect } from "react";
import { Camera, Trash2, Maximize, RotateCw, Crop as CropIcon, Type, Download, Plus, X, Image, Menu, Sparkles } from "lucide-react";
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { useAuth } from "../contexts/AuthContext";
import { Separator } from "~/components/ui/separator";
import { HexColorPicker } from "react-colorful";

// Types for our elements
type ElementType = "image" | "text";

interface CollageElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string; // image URL or text content
  fontSize?: number;
  fontColor?: string;
  zIndex: number;
}

// Main component
export default function PhotoCollageMaker() {
  // State for all elements on the canvas
  const [elements, setElements] = useState<CollageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [canvasBackground, setCanvasBackground] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  const [cropConfig, setCropConfig] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [textToAdd, setTextToAdd] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [textSize, setTextSize] = useState(24);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Find the selected element
  const getSelectedElementData = () => elements.find(el => el.id === selectedElement);

  // Handle uploading images
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`File "${file.name}" is not an image.`);
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event.target?.result === 'string') {
            const imageUrl = event.target.result;
            
            // Create a temporary image to get the natural dimensions
            const img = document.createElement('img');
            img.onload = () => {
              // Use the image's natural dimensions
              const naturalWidth = img.naturalWidth;
              const naturalHeight = img.naturalHeight;
              
              // Calculate position to center the image
              const x = (canvasSize.width - naturalWidth) / 2;
              const y = (canvasSize.height - naturalHeight) / 2;
              
              // Create new element with original dimensions
              const newElement: CollageElement = {
                id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: "image",
                x: Math.max(0, x),
                y: Math.max(0, y),
                width: naturalWidth,
                height: naturalHeight,
                rotation: 0,
                content: imageUrl,
                zIndex: elements.length + 1
              };
              
              setElements(prev => [...prev, newElement]);
              setSelectedElement(newElement.id);
            };
            img.src = imageUrl;
          }
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error uploading files");
      setShowError(true);
    }
  };

  // Add text element
  const addTextElement = () => {
    if (!textToAdd.trim()) {
      setErrorMessage("Please enter some text");
      setShowError(true);
      return;
    }
    
    const newElement: CollageElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "text",
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 20,
      width: 200,
      height: 40,
      rotation: 0,
      content: textToAdd,
      fontSize: textSize,
      fontColor: textColor,
      zIndex: elements.length + 1
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    setTextToAdd("");
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent, elementId: string, action: "drag" | "resize" | "rotate") => {
    e.stopPropagation();
    
    // Select the element
    setSelectedElement(elementId);
    
    // Set the dragged element based on action
    setDraggedElement(elementId);
    
    // Get mouse position
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    // Store last position for delta calculations
    setLastPointerPosition({ x: clientX, y: clientY });
    
    // Set action flags
    if (action === "drag") {
      setIsDragging(true);
      
      // Calculate offset from element top-left corner
      const element = elements.find(el => el.id === elementId);
      if (element) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setDragOffset({
          x: clientX - rect.left,
          y: clientY - rect.top
        });
      }
    } else if (action === "resize") {
      setIsResizing(true);
    } else if (action === "rotate") {
      setIsRotating(true);
      
      // For rotation, we need to calculate the initial angle
      const element = elements.find(el => el.id === elementId);
      if (element) {
        // Calculate center of the element
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const centerX = rect.left + element.x + element.width / 2;
          const centerY = rect.top + element.y + element.height / 2;
          
          // Store the initial angle between mouse and center
          const initialAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
          // Store the current rotation to add the delta to it
          const currentRotation = element.rotation;
          
          // Store these values to use during rotation
          setLastPointerPosition({ 
            x: initialAngle, 
            y: currentRotation 
          });
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing && !isRotating) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    if (isDragging && draggedElement) {
      // Update position
      setElements(prev => 
        prev.map(el => 
          el.id === draggedElement 
            ? { 
                ...el, 
                x: Math.max(0, Math.min(el.x + (clientX - lastPointerPosition.x), canvasSize.width - el.width)),
                y: Math.max(0, Math.min(el.y + (clientY - lastPointerPosition.y), canvasSize.height - el.height))
              } 
            : el
        )
      );
      
      // Update last position
      setLastPointerPosition({ x: clientX, y: clientY });
    } else if (isResizing && draggedElement) {
      // Resize element with improved control
      setElements(prev => 
        prev.map(el => {
          if (el.id === draggedElement) {
            // Calculate new dimensions
            const deltaX = clientX - lastPointerPosition.x;
            const deltaY = clientY - lastPointerPosition.y;
            
            // Apply a scaling factor to make resizing more controlled
            const scaleFactor = 1.0; // Adjust this value to control resize sensitivity
            
            let newWidth = Math.max(20, el.width + deltaX * scaleFactor);
            let newHeight;
            
            if (el.type === "image") {
              // Maintain aspect ratio for images
              const aspectRatio = el.height / el.width;
              newHeight = newWidth * aspectRatio;
            } else {
              // Free resize for text
              newHeight = Math.max(20, el.height + deltaY * scaleFactor);
            }
            
            return { 
              ...el, 
              width: newWidth,
              height: newHeight
            };
          }
          return el;
        })
      );
      
      // Update last position
      setLastPointerPosition({ x: clientX, y: clientY });
    } else if (isRotating && draggedElement) {
      // Get the element
      const element = elements.find(el => el.id === draggedElement);
      if (!element) return;
      
      // Get canvas position
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Calculate center of the element
      const centerX = rect.left + element.x + element.width / 2;
      const centerY = rect.top + element.y + element.height / 2;
      
      // Calculate new angle between center and mouse position
      const newAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
      
      // Calculate the angle change (delta)
      const initialAngle = lastPointerPosition.x;
      const angleDelta = newAngle - initialAngle;
      
      // Apply the delta to the initial rotation
      const initialRotation = lastPointerPosition.y;
      let newRotation = initialRotation + angleDelta;
      
      // Normalize rotation to 0-360 range
      newRotation = newRotation % 360;
      if (newRotation < 0) newRotation += 360;
      
      // Update rotation
      setElements(prev => 
        prev.map(el => 
          el.id === draggedElement 
            ? { ...el, rotation: newRotation } 
            : el
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setDraggedElement(null);
  };

  // Canvas click handler to deselect elements
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas, not on an element
    if ((e.target as HTMLElement).id === "collage-canvas") {
      setSelectedElement(null);
    }
  };

  // Delete the selected element
  const deleteSelectedElement = () => {
    if (selectedElement) {
      setElements(prev => prev.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
      setShowDeleteConfirm(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== "string") return "U";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
  };

  const handleLogout = async () => {
    try {
        await logout();
        navigate("/login");
    } catch (error) {
        console.error("Logout failed:", error);
        navigate("/login");
    }
  };

  const applyCrop = () => {
    console.log("Applying crop:", { 
      completedCrop, 
      imgRef: imgRef.current ? "Image loaded" : "No image", 
      canvas: previewCanvasRef.current ? "Canvas ready" : "No canvas",
      selectedElement
    });
    
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current || !selectedElement) {
      console.error("Missing required elements for crop");
      return;
    }
    
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }
    
    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    
    try {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
      
      // Get the cropped image data
      const croppedImageUrl = canvas.toDataURL();
      console.log("Cropped image generated");
      
      // Update the element with the cropped image
      setElements(prev => 
        prev.map(el => 
          el.id === selectedElement 
            ? { 
                ...el, 
                content: croppedImageUrl,
                // Optionally adjust width/height based on crop aspect ratio
                width: el.width,
                height: el.height * (crop.height / crop.width) / (el.height / el.width)
              } 
            : el
        )
      );
      
      setIsCropping(false);
      setShowCropDialog(false);
    } catch (error) {
      console.error("Error applying crop:", error);
    }
  };


  // Download the collage
  const downloadCollage = () => {
    // In a real implementation, this would render the canvas to an image
    // For this demo, we'll just show an alert
    alert("In a full implementation, this would generate and download an image of your collage.");
  };

  // Update text properties
  const updateTextElement = (property: string, value: string | number) => {
    if (!selectedElement) return;
    
    const element = elements.find(el => el.id === selectedElement);
    if (!element || element.type !== "text") return;
    
    setElements(prev => 
      prev.map(el => 
        el.id === selectedElement 
          ? { 
              ...el, 
              [property]: value
            } 
          : el
      )
    );
  };

  // Add a function to handle background image upload
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setBackgroundImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add a function to remove the background
  const removeBackground = () => {
    setBackgroundImage(null);
    setCanvasBackground("transparent");
  };

  const canvasSizePresets = [
    { name: "Instagram Post", width: 1080, height: 1080 },
    { name: "Facebook Cover", width: 851, height: 315 },
    { name: "Twitter Header", width: 1500, height: 500 },
    { name: "A4 Portrait", width: 794, height: 1123 },
    { name: "A4 Landscape", width: 1123, height: 794 },
  ];

  const handleCanvasSizePreset = (width: number, height: number) => {
    setCanvasSize({ width, height });
    
    // Optionally adjust the canvas element size if using a fixed container
    if (canvasRef.current) {
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-violet-200 via-indigo-100 to-background dark:from-violet-950/20 dark:via-background dark:to-background">
      {/* Sidebar - Component */}
      <aside className={`fixed inset-y-0 z-50 flex flex-col w-64 border-r border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-4 h-16 flex items-center justify-between border-b border-violet-100 dark:border-violet-900/50">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-500 dark:text-violet-400" />
            <span className="text-xl font-bold">Reminiss</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* User Profile Section */}
        <div className="p-4 border-b border-violet-100 dark:border-violet-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-800 flex items-center justify-center">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user?.name} className="h-10 w-10 rounded-full" />
              ) : (
                <span className="text-sm font-medium">
                  {getInitials(typeof user?.name === "string" ? user.name : "")}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name || "Student"}</p>
              <p className="text-xs text-muted-foreground">Class of {user?.batch && typeof user.batch === 'object' ? (user.batch as {batchYear?: string}).batchYear : user?.batch || "Unknown"}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2">
                <Image className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/montage" className="flex items-center gap-3 px-3 py-2 bg-accent/50 text-accent-foreground">
                <Camera className="h-4 w-4" />
                <span>Montage</span>
              </Link>
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-3 py-1">Tools</p>
            <Button variant="ghost" className="w-full justify-start" onClick={() => fileInputRef.current?.click()}>
              <Plus className="h-4 w-4 mr-3" />
              <span>Add Image</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={addTextElement}>
              <Type className="h-4 w-4 mr-3" />
              <span>Add Text</span>
            </Button>
          </div>
        </nav>
        
        {/* Bottom Actions */}
        <div className="p-4 border-t border-violet-100 dark:border-violet-900/50">
          <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
            <X className="h-4 w-4 mr-3" />
            <span>Log out</span>
          </Button>
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-violet-100 dark:border-violet-900/50 bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:border-t-0">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 flex items-center gap-4 md:gap-8">
            <h1 className="text-xl font-semibold">Memory Montage</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
          {/* Decorative blurred circles */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-10 right-10 w-72 h-72 bg-purple-400/40 dark:bg-purple-700/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-400/40 dark:bg-indigo-700/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas Area */}
            <div className="lg:col-span-2">
              <div className="border border-violet-100 dark:border-violet-900/50 rounded-lg shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
                <div 
                  id="collage-canvas"
                  ref={canvasRef}
                  className="relative overflow-hidden bg-white dark:bg-gray-900"
                  style={{
                    width: `${canvasSize.width}px`,
                    height: `${canvasSize.height}px`,
                    backgroundColor: canvasBackground,
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    margin: '0 auto', // Center the canvas
                    maxWidth: '100%', // Ensure it doesn't overflow on small screens
                    maxHeight: '80vh', // Limit height on small screens
                  }}
                  onClick={handleCanvasClick}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Render all elements */}
                  {elements.map((element) => (
                    <div
                      id={element.id}
                      key={element.id}
                      className={`absolute cursor-move ${selectedElement === element.id ? 'ring-2 ring-violet-500 dark:ring-violet-400' : ''}`}
                      style={{
                        left: `${element.x}px`,
                        top: `${element.y}px`,
                        width: `${element.width}px`,
                        height: `${element.height}px`,
                        transform: `rotate(${element.rotation}deg)`,
                        zIndex: element.zIndex
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element.id, "drag")}
                    >
                      {element.type === "image" ? (
                        <img 
                          src={element.content} 
                          alt="Collage element" 
                          className="w-full h-full"
                          style={{ objectFit: "fill" }}
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center p-2 overflow-hidden"
                          style={{ 
                            fontSize: `${element.fontSize}px`,
                            color: element.fontColor
                          }}
                        >
                          {element.content}
                        </div>
                      )}
                      
                      {/* Controls when selected */}
                      {selectedElement === element.id && (
                        <>
                          <div 
                            className="absolute -right-3 -bottom-3 w-8 h-8 bg-violet-500 dark:bg-violet-400 rounded-full cursor-se-resize flex items-center justify-center"
                            onMouseDown={(e) => handleMouseDown(e, element.id, "resize")}
                          >
                            <Maximize className="h-4 w-4 text-white" />
                          </div>
                          <div 
                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-violet-500 dark:bg-violet-400 rounded-full cursor-move flex items-center justify-center"
                            onMouseDown={(e) => handleMouseDown(e, element.id, "rotate")}
                          >
                            <RotateCw className="h-4 w-4 text-white" />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Controls Panel */}
            <div className="space-y-6">
              <div className="border border-violet-100 dark:border-violet-900/50 rounded-lg shadow-sm bg-gradient-to-br from-background to-violet-100/70 dark:from-background dark:to-violet-950/20 p-4">
                <h2 className="text-lg font-medium mb-4">Montage Tools</h2>
                
                <Tabs defaultValue="add" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="add">Add</TabsTrigger>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="canvas">Canvas</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="add" className="space-y-4">
                    <div>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Image className="mr-2 h-4 w-4" />
                        Add Image
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*" 
                        multiple
                        onChange={handleFileUpload}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="text-input">Add Text</Label>
                      <Input 
                        id="text-input"
                        value={textToAdd} 
                        onChange={(e) => setTextToAdd(e.target.value)}
                        placeholder="Enter text..."
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="text-color" className="text-xs">Color</Label>
                          <div className="relative">
                            <div 
                              className="h-8 w-full rounded-md border border-input flex items-center cursor-pointer"
                              style={{ backgroundColor: textColor }}
                              onClick={() => setShowColorPicker(!showColorPicker)}
                            >
                              <div className="ml-2 text-xs font-mono">{textColor}</div>
                            </div>
                            {showColorPicker && (
                              <div className="absolute z-50 mt-1">
                                <div 
                                  className="fixed inset-0" 
                                  onClick={() => setShowColorPicker(false)}
                                />
                                <HexColorPicker 
                                  color={textColor} 
                                  onChange={setTextColor} 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="text-size" className="text-xs">Size</Label>
                          <Input 
                            id="text-size"
                            type="number" 
                            value={textSize}
                            onChange={(e) => setTextSize(parseInt(e.target.value))}
                            min="8"
                            max="72"
                            className="h-8"
                          />
                        </div>
                      </div>
                      <Button onClick={addTextElement} className="w-full">
                        <Type className="mr-2 h-4 w-4" />
                        Add Text
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="edit" className="space-y-4">
                    {selectedElement ? (
                      <>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              const element = getSelectedElementData();
                              if (element?.type === "image") {
                                setCropImageSrc(element.content);
                                setShowCropDialog(true);
                                setIsCropping(true);
                                
                                // Reset crop config to default
                                setCropConfig({
                                  unit: '%',
                                  width: 80,
                                  height: 80,
                                  x: 10,
                                  y: 10
                                });
                              }
                            }}
                            disabled={getSelectedElementData()?.type !== "image"}
                          >
                            <CropIcon className="mr-2 h-4 w-4" />
                            Crop
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setShowDeleteConfirm(true)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                        
                        {getSelectedElementData()?.type === "text" && (
                          <div className="space-y-2">
                            <Label htmlFor="text-content" className="text-xs">Text</Label>
                            <Input 
                              id="text-content" 
                              value={getSelectedElementData()?.content || ""} 
                              onChange={(e) => updateTextElement("content", e.target.value)} 
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="text-color" className="text-xs">Text Color</Label>
                          <div className="relative">
                            <div 
                              className="h-8 w-full rounded-md border border-input flex items-center cursor-pointer"
                              style={{ backgroundColor: getSelectedElementData()?.fontColor || "#000000" }}
                              onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                            >
                              <div className="ml-2 text-xs font-mono">{getSelectedElementData()?.fontColor || "#000000"}</div>
                            </div>
                            {showTextColorPicker && (
                              <div className="absolute z-50 mt-1">
                                <div 
                                  className="fixed inset-0" 
                                  onClick={() => setShowTextColorPicker(false)}
                                />
                                <HexColorPicker 
                                  color={getSelectedElementData()?.fontColor || "#000000"} 
                                  onChange={(color) => updateTextElement("fontColor", color)} 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="text-size" className="text-xs">Text Size: {getSelectedElementData()?.fontSize || 24}px</Label>
                          <Slider 
                            id="text-size"
                            min={8} 
                            max={72} 
                            step={1} 
                            value={[getSelectedElementData()?.fontSize || 24]} 
                            onValueChange={(value) => updateTextElement("fontSize", value[0])} 
                          />
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>Select an element to edit its properties</p>
                        <p className="text-sm mt-2">Or add images and text from the tools panel</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="canvas" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Canvas Size</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="canvas-width" className="text-xs">Width</Label>
                          <Input 
                            id="canvas-width" 
                            type="number" 
                            value={canvasSize.width} 
                            onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="canvas-height" className="text-xs">Height</Label>
                          <Input 
                            id="canvas-height" 
                            type="number" 
                            value={canvasSize.height} 
                            onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))} 
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-2">
                        <Label>Presets</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {canvasSizePresets.map((preset) => (
                            <Button 
                              key={preset.name}
                              variant="outline" 
                              size="sm"
                              className="text-xs"
                              onClick={() => handleCanvasSizePreset(preset.width, preset.height)}
                            >
                              {preset.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Canvas Background</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="bg-color" className="text-xs">Color</Label>
                          <Input 
                            id="bg-color" 
                            type="color" 
                            value={canvasBackground} 
                            onChange={(e) => setCanvasBackground(e.target.value)} 
                            className="w-full h-8 p-0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bg-image" className="text-xs">Image</Label>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => document.getElementById('bg-file-input')?.click()}
                          >
                            <Image className="mr-2 h-4 w-4" />
                            Upload
                          </Button>
                          <input 
                            id="bg-file-input"
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleBackgroundUpload} 
                          />
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={removeBackground}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove Background
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Download Collage</Label>
                      <Button 
                        className="w-full" 
                        onClick={downloadCollage}
                        disabled={elements.length === 0}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Collage
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Element</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this element? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSelectedElement}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Error message dialog */}
      <AlertDialog open={showError} onOpenChange={setShowError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowError(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCropDialog(false);
          setIsCropping(false);
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              {cropImageSrc ? (
                <ReactCrop
                  crop={cropConfig}
                  onChange={(c) => setCropConfig(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={undefined}
                >
                  <img
                    ref={imgRef}
                    src={cropImageSrc}
                    alt="Crop preview"
                    className="max-h-[60vh] max-w-full"
                    onLoad={() => {
                      // Ensure the image is loaded before showing the crop UI
                      console.log("Image loaded for cropping");
                    }}
                  />
                </ReactCrop>
              ) : (
                <div className="flex items-center justify-center h-[60vh] bg-muted">
                  <p>No image selected for cropping</p>
                </div>
              )}
              <canvas
                ref={previewCanvasRef}
                className="hidden"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCropDialog(false);
              setIsCropping(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={applyCrop}
              disabled={!cropImageSrc || !completedCrop}
            >
              Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
