import React, { useState, useEffect } from 'react';
import { Lesson, Slide } from '../types';
import { generateSlideImage } from '../services/geminiService';
import { 
  Wand2, Play, Image as ImageIcon, Type, Trash2, 
  RefreshCcw, GripVertical, Plus, CheckCircle
} from 'lucide-react';

interface EditorProps {
  lesson: Lesson;
  onUpdateLesson: (lesson: Lesson) => void;
  onConfirm: () => void;
}

const Editor: React.FC<EditorProps> = ({ lesson, onUpdateLesson, onConfirm }) => {
  const [selectedSlideId, setSelectedSlideId] = useState<string>(lesson.slides[0]?.id);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const activeSlideIndex = lesson.slides.findIndex(s => s.id === selectedSlideId);
  const activeSlide = lesson.slides[activeSlideIndex];

  // Auto-generate images on mount if they are missing
  useEffect(() => {
    const fetchImages = async () => {
      const slidesToUpdate = lesson.slides.map(async (slide, index) => {
        if (!slide.imageUrl && !slide.isLoadingImage) {
           // Mark as loading to prevent double fetch
           return { ...slide, isLoadingImage: true };
        }
        return slide;
      });
      
      // Update state to loading
      const loadingSlides = await Promise.all(slidesToUpdate);
      // We don't want to trigger re-renders loop, so we handle the actual API calls carefully
      // For this prototype, we'll trigger generation for the *active* slide only to save API calls
      // and let user click to generate others, or generate all in background.
      // Let's generate the active slide immediately.
      if (activeSlide && !activeSlide.imageUrl && !activeSlide.isLoadingImage) {
        handleRegenerateImage(activeSlide.id, activeSlide.imagePrompt);
      }
    };
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlideId]);

  const handleUpdateSlide = (id: string, updates: Partial<Slide>) => {
    const newSlides = lesson.slides.map(s => s.id === id ? { ...s, ...updates } : s);
    onUpdateLesson({ ...lesson, slides: newSlides });
  };

  const handleRegenerateImage = async (id: string, prompt: string) => {
    handleUpdateSlide(id, { isLoadingImage: true });
    setIsRegenerating(true);
    const url = await generateSlideImage(prompt);
    handleUpdateSlide(id, { imageUrl: url, isLoadingImage: false });
    setIsRegenerating(false);
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      type: 'content',
      title: 'New Slide',
      content: 'Add your text here',
      imagePrompt: 'A cute educational illustration',
    };
    const newSlides = [...lesson.slides];
    newSlides.splice(activeSlideIndex + 1, 0, newSlide);
    onUpdateLesson({ ...lesson, slides: newSlides });
    setSelectedSlideId(newSlide.id);
  };

  if (!activeSlide) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* LEFT SIDEBAR - Thumbnails */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b bg-nana-yellow/20">
          <h2 className="font-comic font-bold text-nana-purple">Lesson Slides</h2>
          <p className="text-xs text-gray-500">{lesson.slides.length} slides • {lesson.topic}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {lesson.slides.map((slide, index) => (
            <div 
              key={slide.id}
              onClick={() => setSelectedSlideId(slide.id)}
              className={`relative group cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                slide.id === selectedSlideId 
                  ? 'border-nana-blue ring-2 ring-nana-blue/30 shadow-md' 
                  : 'border-transparent hover:border-gray-300 bg-white'
              }`}
            >
              <div className="aspect-video bg-gray-100 relative">
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <ImageIcon size={24} />
                  </div>
                )}
                <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 rounded-full">
                  {index + 1}
                </div>
                {slide.type === 'quiz' && (
                  <div className="absolute top-1 right-1 bg-nana-orange text-white text-xs px-1.5 rounded">Q</div>
                )}
              </div>
            </div>
          ))}
          <button 
            onClick={handleAddSlide}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-nana-blue hover:text-nana-blue transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Slide
          </button>
        </div>
      </div>

      {/* CENTER - Canvas */}
      <div className="flex-1 flex flex-col relative">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-700">Editor</span>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Text">
                <Type size={20} />
              </button>
               <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Image">
                <ImageIcon size={20} />
              </button>
            </div>
          </div>
          
          <button 
            onClick={onConfirm}
            className="bg-nana-green hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95"
          >
            <CheckCircle size={20} />
            Confirm & Generate Video
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-auto">
          <div className="relative bg-white shadow-2xl aspect-video w-full max-w-4xl rounded-xl overflow-hidden group">
            
            {/* Slide Background Image */}
            <div className="absolute inset-0 bg-gray-50">
               {activeSlide.isLoadingImage ? (
                 <div className="w-full h-full flex flex-col items-center justify-center text-nana-blue animate-pulse">
                   <Wand2 className="animate-spin mb-4" size={48} />
                   <p className="font-comic font-bold">Painting cartoon...</p>
                 </div>
               ) : activeSlide.imageUrl ? (
                 <img src={activeSlide.imageUrl} className="w-full h-full object-cover" alt="slide background" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <button 
                      onClick={() => handleRegenerateImage(activeSlide.id, activeSlide.imagePrompt)}
                      className="bg-white px-4 py-2 rounded-lg shadow border border-gray-200 text-gray-500 hover:text-nana-blue"
                    >
                      Generate Image
                    </button>
                 </div>
               )}
            </div>

            {/* Editable Content Layer */}
            <div className="absolute inset-0 p-12 flex flex-col justify-center">
              {/* Draggable/Editable Title */}
              <input
                value={activeSlide.title || ''}
                onChange={(e) => handleUpdateSlide(activeSlide.id, { title: e.target.value })}
                className="bg-transparent border-2 border-transparent hover:border-nana-blue/50 focus:border-nana-blue rounded-lg p-2 text-5xl font-comic font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] outline-none w-full text-center placeholder-white/50"
                placeholder="Slide Title"
              />
              
              {/* Draggable/Editable Body */}
              {activeSlide.content && (
                <textarea
                  value={activeSlide.content}
                  onChange={(e) => handleUpdateSlide(activeSlide.id, { content: e.target.value })}
                  className="mt-4 bg-transparent border-2 border-transparent hover:border-nana-blue/50 focus:border-nana-blue rounded-lg p-2 text-2xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] outline-none w-full text-center resize-none h-32 placeholder-white/50"
                  placeholder="Slide content goes here..."
                />
              )}

              {/* Quiz Overlay Editor */}
              {activeSlide.type === 'quiz' && activeSlide.quiz && (
                 <div className="mt-4 bg-white/90 backdrop-blur rounded-xl p-4 border-2 border-nana-orange shadow-xl max-w-xl mx-auto">
                    <div className="text-xs text-nana-orange font-bold uppercase mb-2">Quiz Editor</div>
                    <input 
                      className="w-full p-2 border rounded mb-2 font-bold text-lg"
                      value={activeSlide.quiz.question}
                      onChange={(e) => handleUpdateSlide(activeSlide.id, { 
                        quiz: { ...activeSlide.quiz!, question: e.target.value } 
                      })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {activeSlide.quiz.options.map((opt, i) => (
                        <div key={i} className={`flex items-center p-2 rounded border ${i === activeSlide.quiz!.correctIndex ? 'bg-green-100 border-green-500' : 'bg-white'}`}>
                          <div className="w-6 h-6 rounded-full border flex items-center justify-center mr-2 text-xs font-bold text-gray-500">{i+1}</div>
                          <input 
                             className="bg-transparent w-full outline-none text-sm"
                             value={opt}
                             onChange={(e) => {
                               const newOptions = [...activeSlide.quiz!.options];
                               newOptions[i] = e.target.value;
                               handleUpdateSlide(activeSlide.id, { 
                                quiz: { ...activeSlide.quiz!, options: newOptions } 
                              });
                             }}
                          />
                        </div>
                      ))}
                    </div>
                 </div>
              )}
            </div>

            {/* Quick Actions overlay */}
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleRegenerateImage(activeSlide.id, activeSlide.imagePrompt)}
                className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg border border-gray-200 text-xs flex items-center gap-1 font-bold"
                disabled={isRegenerating}
              >
                <RefreshCcw size={14} className={isRegenerating ? "animate-spin" : ""} />
                Regenerate Art
              </button>
            </div>

          </div>
        </div>

        {/* Property Inspector (Right Side) - simplified for prototype */}
        <div className="w-72 bg-white border-l p-4 hidden lg:block">
           <h3 className="font-bold text-gray-700 mb-4">Prompt settings</h3>
           <label className="text-xs text-gray-500 font-bold uppercase">Image Prompt</label>
           <textarea 
             className="w-full h-32 p-3 border rounded-lg mt-2 text-sm text-gray-600 focus:ring-2 ring-nana-blue outline-none"
             value={activeSlide.imagePrompt}
             onChange={(e) => handleUpdateSlide(activeSlide.id, { imagePrompt: e.target.value })}
           />
           <button 
              onClick={() => handleRegenerateImage(activeSlide.id, activeSlide.imagePrompt)}
              className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
           >
             <Wand2 size={14} /> Update Image
           </button>
           
           <div className="mt-8 p-4 bg-blue-50 rounded-xl">
             <h4 className="font-bold text-blue-800 text-sm mb-2">Teacher Tip</h4>
             <p className="text-xs text-blue-600">
               Keep text large (40pt+). Use "Regenerate" until the character looks consistent. Children love continuity!
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
