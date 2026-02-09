import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  AppStage, 
  Lesson, 
  TeacherProfile 
} from './types';
import { SAMPLE_TOPICS } from './constants';
import { generateLessonDraft, initGemini } from './services/geminiService';
import Wizard from './components/Wizard';
import Editor from './components/Editor';
import Player from './components/Player';
import { Sparkles, Layout, Video, Key } from 'lucide-react';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.API_ENTRY);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  React.useEffect(() => {
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) {
      initGemini(storedKey);
      setApiKey(storedKey);
      setStage(AppStage.ONBOARDING);
    }
  }, []);

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    initGemini(apiKey);
    setStage(AppStage.ONBOARDING);
  };

  const handleProfileComplete = (newProfile: TeacherProfile) => {
    setProfile(newProfile);
    setStage(AppStage.TOPIC_INPUT);
  };

  const handleCreateLesson = async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setIsLoading(true);
    setStage(AppStage.GENERATING_DRAFT);
    
    try {
      const draft = await generateLessonDraft(selectedTopic, profile);
      setLesson(draft);
      setStage(AppStage.EDITOR);
    } catch (error) {
      console.error(error);
      alert('Failed to generate lesson. Please check API Key.');
      setStage(AppStage.TOPIC_INPUT);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLesson = () => {
    setStage(AppStage.GENERATING_FINAL);
    // In a real app, we would trigger batch Veo generation here.
    // For prototype, we simulate a short processing delay.
    setTimeout(() => {
      setStage(AppStage.PLAYER);
    }, 2500);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation / Header */}
      <nav className="bg-white border-b border-nana-yellow shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="bg-nana-purple text-white p-2 rounded-lg">
             <Sparkles size={24} />
           </div>
           <h1 className="text-2xl font-comic font-bold text-nana-purple">NanoClass</h1>
        </div>
        {profile && (
           <div className="text-sm font-bold text-gray-500">
             {profile.grades.join(', ')} • {profile.language}
           </div>
        )}
      </nav>

      <main className="container mx-auto px-4 py-8">
        
        {/* STAGE 0: API ENTRY */}
        {stage === AppStage.API_ENTRY && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-2 border-nana-yellow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-nana-orange text-white p-3 rounded-full">
                  <Key size={32} />
                </div>
                <h2 className="text-2xl font-bold font-comic text-gray-800">Enter Gemini API Key</h2>
                <p className="text-gray-600">
                  To generate magical lessons, we need a Gemini API key. 
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-nana-blue hover:underline ml-1">
                    Get one here
                  </a>.
                </p>
                
                <input 
                  type="password" 
                  placeholder="AIzaSy..."
                  className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-nana-blue outline-none"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()}
                />
                
                <button 
                  onClick={handleApiKeySubmit}
                  disabled={!apiKey}
                  className="w-full bg-nana-green text-white py-3 rounded-xl font-bold hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  Start Creating
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 1: ONBOARDING */}
        {stage === AppStage.ONBOARDING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
             <Wizard onComplete={handleProfileComplete} />
          </div>
        )}

        {/* STAGE 2: TOPIC INPUT */}
        {stage === AppStage.TOPIC_INPUT && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-800">What are we learning today?</h2>
              <p className="text-gray-600">Enter a topic or pick from suggestions</p>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g., Photosynthesis for Kids"
                className="flex-1 p-4 rounded-xl border-2 border-gray-200 focus:border-nana-blue text-lg outline-none shadow-sm"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && topic && handleCreateLesson(topic)}
              />
              <button 
                disabled={!topic}
                onClick={() => handleCreateLesson(topic)}
                className="bg-nana-blue text-white px-8 rounded-xl font-bold hover:bg-blue-400 disabled:opacity-50 transition-colors"
              >
                Go
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-500 uppercase text-sm tracking-wider">Popular Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SAMPLE_TOPICS.map(t => (
                  <button
                    key={t}
                    onClick={() => handleCreateLesson(t)}
                    className="p-4 bg-white border border-gray-200 rounded-xl hover:border-nana-orange hover:shadow-md text-left transition-all font-semibold text-gray-700"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: LOADING DRAFT */}
        {stage === AppStage.GENERATING_DRAFT && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-8 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-nana-purple rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div>
               <h2 className="text-2xl font-bold text-gray-800">Dreaming up a lesson...</h2>
               <p className="text-gray-500 mt-2">Gemini is writing the story and sketching characters.</p>
            </div>
          </div>
        )}

        {/* STAGE 4: EDITOR */}
        {stage === AppStage.EDITOR && lesson && (
          <div className="fixed inset-0 top-[72px] z-10">
             <Editor 
                lesson={lesson} 
                onUpdateLesson={setLesson}
                onConfirm={handleConfirmLesson}
             />
          </div>
        )}

        {/* STAGE 5: GENERATING VIDEO (MOCK) */}
        {stage === AppStage.GENERATING_FINAL && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
             <div className="bg-black text-white p-4 rounded-full animate-pulse">
               <Video size={48} />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-gray-800">Applying Magic...</h2>
               <p className="text-gray-500 mt-2">Generating Veo transitions and interactive elements.</p>
            </div>
          </div>
        )}

        {/* STAGE 6: PLAYER */}
        {stage === AppStage.PLAYER && lesson && (
           <Player 
             lesson={lesson} 
             onClose={() => setStage(AppStage.TOPIC_INPUT)} 
           />
        )}

      </main>
    </div>
  );
};

export default App;
