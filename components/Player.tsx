import React, { useState, useEffect } from 'react';
import { Lesson, Slide } from '../types';
import confetti from 'canvas-confetti';
import { Volume2, ChevronRight, ChevronLeft, RefreshCw, X, Star } from 'lucide-react';

interface PlayerProps {
  lesson: Lesson;
  onClose: () => void;
}

const Player: React.FC<PlayerProps> = ({ lesson, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState<boolean | null>(null); // null = unanswered, true = correct, false = wrong

  const currentSlide = lesson.slides[currentSlideIndex];
  const progress = ((currentSlideIndex + 1) / lesson.slides.length) * 100;

  const handleNext = () => {
    if (currentSlideIndex < lesson.slides.length - 1) {
      setIsTransitioning(true);
      // Simulate Veo transition duration
      setTimeout(() => {
        setCurrentSlideIndex(prev => prev + 1);
        setIsTransitioning(false);
        setQuizAnswered(null);
      }, 2000); // 2s transition
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setQuizAnswered(null);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (quizAnswered === true) return;
    
    if (index === currentSlide.quiz?.correctIndex) {
      setQuizAnswered(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFEB3B', '#FF9800', '#4FC3F7', '#8BC34A']
      });
      // Play sound effect here in real app
    } else {
      setQuizAnswered(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      
      {/* Veo Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 z-20 bg-black flex items-center justify-center overflow-hidden">
          {/* Simulate a Veo video playing */}
          <div className="w-full h-full relative animate-pulse">
            <img 
               src={currentSlide.imageUrl} 
               className="absolute inset-0 w-full h-full object-cover blur-md opacity-50 transform scale-110 transition-transform duration-[2000ms]"
               style={{ transform: 'scale(1.5)' }}
            />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white font-comic text-4xl animate-bounce">
                  ✨ Magic Transition... ✨
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-6xl aspect-video bg-white rounded-none md:rounded-2xl overflow-hidden shadow-2xl">
        {/* Background Layer */}
        <div className="absolute inset-0">
          <img 
            src={currentSlide.imageUrl} 
            className="w-full h-full object-cover"
            alt="slide"
          />
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        {/* Content Layer */}
        <div className="absolute inset-0 flex flex-col p-8 md:p-16 justify-between">
          
          {/* Header */}
          <div className="flex justify-between items-start">
             <h1 className="text-4xl md:text-6xl font-comic font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] animate-float">
               {currentSlide.title}
             </h1>
             <button onClick={onClose} className="bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur">
               <X size={24} />
             </button>
          </div>

          {/* Main Content / Quiz */}
          <div className="flex-1 flex flex-col justify-center items-center">
            
            {currentSlide.type === 'content' && currentSlide.content && (
              <p className="text-3xl md:text-4xl font-bold text-white text-center max-w-3xl leading-relaxed drop-shadow-md bg-black/30 p-6 rounded-3xl backdrop-blur-sm border-2 border-white/20">
                {currentSlide.content}
              </p>
            )}

            {currentSlide.type === 'quiz' && currentSlide.quiz && (
              <div className="w-full max-w-4xl">
                 <div className="bg-white/95 p-8 rounded-3xl shadow-xl border-4 border-nana-orange">
                    <h2 className="text-3xl font-bold text-nana-purple text-center mb-8 font-comic">
                      {currentSlide.quiz.question}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {currentSlide.quiz.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(idx)}
                          className={`p-6 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 active:scale-95 ${
                            quizAnswered === true && idx === currentSlide.quiz!.correctIndex
                              ? 'bg-nana-green text-white ring-4 ring-green-300'
                              : quizAnswered === false && idx !== currentSlide.quiz!.correctIndex // simple visual logic
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-nana-blue text-white hover:bg-blue-400'
                          }`}
                        >
                          {option}
                          {quizAnswered === true && idx === currentSlide.quiz!.correctIndex && (
                            <Star className="inline ml-2 fill-yellow-300 text-yellow-300 animate-spin" />
                          )}
                        </button>
                      ))}
                    </div>
                    {quizAnswered === true && (
                      <div className="text-center mt-6 text-2xl font-bold text-nana-green animate-bounce">
                        {currentSlide.quiz.rewardMessage || "Great Job! 🎉"}
                      </div>
                    )}
                 </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-between items-end">
            <button className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/40">
              <Volume2 size={32} />
            </button>
            
            <div className="flex gap-4">
               <button 
                 onClick={handlePrev} 
                 disabled={currentSlideIndex === 0}
                 className="bg-white text-nana-purple p-4 rounded-full font-bold shadow-lg disabled:opacity-50 hover:scale-110 transition-transform"
               >
                 <ChevronLeft size={32} />
               </button>
               <button 
                 onClick={handleNext}
                 disabled={currentSlideIndex === lesson.slides.length - 1}
                 className="bg-nana-orange text-white p-4 rounded-full font-bold shadow-lg disabled:opacity-50 hover:scale-110 transition-transform flex items-center gap-2"
               >
                 {currentSlideIndex === lesson.slides.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={32} />
               </button>
            </div>
          </div>

        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-2 bg-gray-200 w-full">
           <div 
             className="h-full bg-nana-purple transition-all duration-500" 
             style={{ width: `${progress}%`}}
           />
        </div>
      </div>
    </div>
  );
};

export default Player;
