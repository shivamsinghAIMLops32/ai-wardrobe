import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingModal } from './components/LoadingModal';
import { WelcomeModal } from './components/WelcomeModal';
import { Toast } from './components/Toast';
import { generateTryOnImage } from './services/geminiService';
import type { UploadedImage, GeneratedImage, ToastMessage, BackgroundSource } from './types';
import { BackgroundSelector } from './components/BackgroundSelector';

const views = [
  { id: 'front', title: 'Front View' },
  { id: 'side', title: 'Side View' },
  { id: 'back', title: 'Back View' },
  { id: 'walking', title: 'Walking Pose' },
  { id: 'hero', title: 'Hero Pose' },
  { id: 'casual', title: 'Casual Pose' },
];

const App: React.FC = () => {
  const [userImage, setUserImage] = useState<UploadedImage | null>(null);
  const [clothingImage, setClothingImage] = useState<UploadedImage | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [customDirectives, setCustomDirectives] = useState<string>('');
  const [backgroundSource, setBackgroundSource] = useState<BackgroundSource>('auto');
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [regeneratingViews, setRegeneratingViews] = useState<Set<string>>(new Set());

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedAIWardrobe');
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);

  const handleWelcomeClose = () => {
    localStorage.setItem('hasVisitedAIWardrobe', 'true');
    setShowWelcome(false);
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!userImage || !clothingImage) {
      setError("Please upload both a person and a clothing item image.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const imagePromises = views.map(view => 
        generateTryOnImage(userImage, clothingImage, view.id, customDirectives, backgroundSource, false)
      );
      
      const results = await Promise.allSettled(imagePromises);
      
      const successfulResults: GeneratedImage[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          successfulResults.push({
            id: views[index].id,
            src: result.value,
            title: views[index].title,
          });
        } else {
          console.error(`Failed to generate ${views[index].title}:`, result.status === 'rejected' ? result.reason : 'No image returned');
        }
      });

      if (successfulResults.length === 0) {
        throw new Error("The AI couldn't generate any images. Please try different photos or try again later.");
      }

      setGeneratedImages(successfulResults);
      setShowResults(true);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [userImage, clothingImage, customDirectives, backgroundSource, showToast]);
  
  const handleRegenerate = useCallback(async (viewId: string) => {
    if (!userImage || !clothingImage) return;

    setRegeneratingViews(prev => new Set(prev).add(viewId));

    const view = views.find(v => v.id === viewId);
    if (!view) return;

    try {
        const newImageSrc = await generateTryOnImage(userImage, clothingImage, viewId, customDirectives, backgroundSource, true);
        
        const newImage: GeneratedImage = {
            id: view.id,
            src: newImageSrc,
            title: view.title,
        };

        setGeneratedImages(currentImages =>
            currentImages.map(img => (img.id === viewId ? newImage : img))
        );
        showToast(`${view.title} regenerated!`, 'success');
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : `Failed to regenerate ${view.title}.`;
        showToast(errorMessage, 'error');
    } finally {
        setRegeneratingViews(prev => {
            const newSet = new Set(prev);
            newSet.delete(viewId);
            return newSet;
        });
    }
}, [userImage, clothingImage, customDirectives, backgroundSource, showToast]);

  const handleReset = () => {
    setUserImage(null);
    setClothingImage(null);
    setGeneratedImages([]);
    setError(null);
    setShowResults(false);
    setCustomDirectives('');
    setBackgroundSource('auto');
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans relative">
      <div className="shooting-stars-background">
        <div className="stars"></div>
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
      </div>
      {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
      <Header />
      <main className="w-full max-w-6xl flex-grow flex flex-col items-center justify-center">
        {isLoading && <LoadingModal />}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        
        {showResults ? (
          <ResultsDisplay
            images={generatedImages}
            onReset={handleReset}
            showToast={showToast}
            onRegenerate={handleRegenerate}
            regeneratingViews={regeneratingViews}
          />
        ) : (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <p className="text-center text-lg text-text-secondary mb-8 max-w-2xl">
              Upload a full-body photo and a clothing item. Then, tell our AI how you want it to look.
            </p>
            
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <ImageUploader title="Upload Photo of You" onImageUpload={setUserImage} />
              <ImageUploader title="Upload Clothing Item" onImageUpload={setClothingImage} />
            </div>

            <div className="w-full max-w-2xl mb-8 space-y-8">
                <div>
                    <label className="block text-lg font-medium text-text-primary mb-3">Background Source</label>
                    <BackgroundSelector selected={backgroundSource} onSelect={setBackgroundSource} />
                </div>
                <div>
                    <label htmlFor="directives" className="block text-lg font-medium text-text-primary mb-2">Creative Directives (Optional)</label>
                    <input
                        id="directives"
                        type="text"
                        value={customDirectives}
                        onChange={(e) => setCustomDirectives(e.target.value)}
                        placeholder="e.g., 'change shirt to royal blue', 'dramatic lighting', 'Paris street background'"
                        className="w-full bg-base-200 border-2 border-base-300 rounded-lg p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
                    />
                </div>
            </div>

            {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={!userImage || !clothingImage || isLoading}
              className="px-8 py-4 bg-brand-primary text-white font-bold text-lg rounded-lg shadow-lg hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50 transition-all duration-300 disabled:bg-base-300 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105"
            >
              Generate Virtual Try-On
            </button>
          </div>
        )}
      </main>
      <footer className="w-full text-center py-4 mt-8">
          <p className="text-text-secondary text-sm">Made with ❤️ by Shivam Singh</p>
      </footer>
    </div>
  );
};

export default App;