
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import JSZip from 'jszip';
import type { ImgItem, CropBox } from './types';
import { uid, loadImage } from './utils/common';
import { useAutoCropModel } from './hooks/useAutoCropModel';
import Header from './components/Header';
import FileDropzone from './components/FileDropzone';
import ImageGallery from './components/ImageGallery';
import ImageEditor from './components/ImageEditor';
import FocusedEditor from './components/FocusedEditor';
import Footer from './components/Footer';
import FloatingActionButton from './components/FloatingActionButton';
import PWAInstallPrompt from './components/PWAInstallPrompt';

export default function App() {
  const [items, setItems] = useState<ImgItem[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const { isModelReady, predict } = useAutoCropModel();
  
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const updateItemCrop = (item: ImgItem, newCrop: CropBox, dimensions?: { width: number, height: number }) => {
    const history = (item.cropHistory || []).slice(0, (item.cropHistoryIndex ?? 0) + 1);
    history.push(newCrop);
    return {
      ...item,
      ...dimensions,
      crop: newCrop,
      cropHistory: history,
      cropHistoryIndex: history.length - 1
    };
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const newItems: ImgItem[] = fileArray.map(file => ({
      id: uid(),
      file,
      url: URL.createObjectURL(file),
      status: 'loading',
    }));

    if (newItems.length > 0) {
      setItems(prevItems => [...prevItems, ...newItems]);
    }
    
    newItems.forEach(item => {
      loadImage(item.url)
        .then(img => {
          const { naturalWidth: width, naturalHeight: height } = img;
          const initialCrop = { x: 0, y: 0, w: width, h: height };
          setItems(prev => prev.map(i => i.id === item.id 
            ? { ...i, status: 'loaded', width, height, crop: initialCrop, cropHistory: [initialCrop], cropHistoryIndex: 0 } 
            : i
          ));
        })
        .catch(error => {
          console.error("Failed to load image:", item.file.name, error);
          setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error' } : i));
        });
    });
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems(prev => {
        const itemToRemove = prev.find(i => i.id === id);
        if (itemToRemove) {
          URL.revokeObjectURL(itemToRemove.url);
        }
        return prev.filter(x => x.id !== id);
    });
  }, []);

  const handleAutoCrop = useCallback(async (item: ImgItem) => {
    if (item.status !== 'loaded') return;
    const processingStateSetter = focusedItemId ? (val: boolean) => {} : setIsBatchProcessing;
    processingStateSetter(true);
    try {
      const img = await loadImage(item.url);
      const box = await predict(img);
      setItems(prev => prev.map(x => x.id === item.id ? updateItemCrop(x, box, {width: img.naturalWidth, height: img.naturalHeight}) : x));
    } catch (error) {
      console.error("Error during auto-crop:", error);
      alert("Failed to auto-crop image. Please check the console for details.");
    } finally {
      processingStateSetter(false);
    }
  }, [predict, focusedItemId]);

  const handleAutoCropAll = useCallback(async () => {
    const itemsToCrop = items.filter(i => i.status === 'loaded');
    if (itemsToCrop.length === 0) return;

    setIsBatchProcessing(true);
    const updatedItemsPromises = items.map(async (item) => {
      if (item.status !== 'loaded') return item;
      try {
        const img = await loadImage(item.url);
        const box = await predict(img);
        return updateItemCrop(item, box, { width: img.naturalWidth, height: img.naturalHeight });
      } catch (error) {
        console.error(`Error auto-cropping ${item.file.name}:`, error);
        return item;
      }
    });
    const updatedItems = await Promise.all(updatedItemsPromises);
    setItems(updatedItems);
    setIsBatchProcessing(false);
  }, [items, predict]);

  const exportCropped = useCallback(async (item: ImgItem): Promise<Blob | null> => {
    if (!item || item.status !== 'loaded') return null;
    const img = await loadImage(item.url);
    const crop = item.crop ?? { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
    const cnv = document.createElement("canvas");
    cnv.width = crop.w;
    cnv.height = crop.h;
    const ctx = cnv.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    return new Promise(resolve => cnv.toBlob(b => resolve(b), "image/png"));
  }, []);

  const handleExportAll = useCallback(async () => {
    const zip = new JSZip();
    const itemsToExport = items.filter(i => i.status === 'loaded');
    for (const item of itemsToExport) {
      const blob = await exportCropped(item);
      if (blob) {
        const fileName = item.file.name.replace(/\.[^/.]+$/, "");
        zip.file(`TikCrop_${fileName}.png`, blob);
      }
    }
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "TikCrop_batch.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, [items, exportCropped]);

  const handleCropChange = useCallback((id: string, newCrop: CropBox) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, crop: newCrop } : item));
  }, []);
  
  const handleCropChangeEnd = useCallback((id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (!item || !item.crop) return prev;
      return prev.map(i => i.id === id ? updateItemCrop(i, i.crop) : i);
    });
  }, []);

  const handleUndo = useCallback((id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id && item.cropHistory && item.cropHistoryIndex > 0) {
        const newIndex = item.cropHistoryIndex - 1;
        return { ...item, crop: item.cropHistory[newIndex], cropHistoryIndex: newIndex };
      }
      return item;
    }));
  }, []);

  const handleRedo = useCallback((id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id && item.cropHistory && item.cropHistoryIndex < item.cropHistory.length - 1) {
        const newIndex = item.cropHistoryIndex + 1;
        return { ...item, crop: item.cropHistory[newIndex], cropHistoryIndex: newIndex };
      }
      return item;
    }));
  }, []);

  const loadedItems = items.filter(item => item.status === 'loaded');
  const focusedItem = useMemo(() => items.find(item => item.id === focusedItemId), [items, focusedItemId]);
  const hasItems = items.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-800 dark:text-gray-200 font-sans">
      <Header
        onAutoCropAll={handleAutoCropAll}
        onExportAll={handleExportAll}
        isProcessing={isBatchProcessing}
        isModelReady={isModelReady}
        hasItems={hasItems}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
        <FileDropzone onFiles={handleFiles} />
        
        {items.length > 0 && (
          <ImageGallery
            items={items}
            onRemove={handleRemoveItem}
            onAutoCrop={handleAutoCrop}
            isModelReady={isModelReady}
          />
        )}
        
        {loadedItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            {loadedItems.map(item => (
               <ImageEditor
                key={item.id}
                item={item}
                onCropChange={handleCropChange}
                onCropChangeEnd={handleCropChangeEnd}
                onAutoCrop={() => handleAutoCrop(item)}
                onExport={exportCropped}
                onFocus={setFocusedItemId}
                isModelReady={isModelReady}
                onUndo={() => handleUndo(item.id)}
                onRedo={() => handleRedo(item.id)}
                canUndo={(item.cropHistoryIndex ?? 0) > 0}
                canRedo={(item.cropHistoryIndex ?? 0) < ((item.cropHistory?.length ?? 1) - 1)}
              />
            ))}
          </div>
        )}

        {focusedItem && (
          <FocusedEditor
            item={focusedItem}
            onClose={() => setFocusedItemId(null)}
            onCropChange={handleCropChange}
            onCropChangeEnd={handleCropChangeEnd}
            onAutoCrop={() => handleAutoCrop(focusedItem)}
            onExport={exportCropped}
            isModelReady={isModelReady}
            onUndo={() => handleUndo(focusedItem.id)}
            onRedo={() => handleRedo(focusedItem.id)}
            canUndo={(focusedItem.cropHistoryIndex ?? 0) > 0}
            canRedo={(focusedItem.cropHistoryIndex ?? 0) < ((focusedItem.cropHistory?.length ?? 1) - 1)}
          />
        )}
      </main>
      <Footer />
      <FloatingActionButton
        onClick={handleAutoCropAll}
        isVisible={hasItems}
        isProcessing={isBatchProcessing}
        disabled={!hasItems || !isModelReady}
      />
      <PWAInstallPrompt />
    </div>
  );
}
