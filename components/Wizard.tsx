import React, { useState } from 'react';
import { TeacherProfile } from '../types';
import { ChevronRight, GraduationCap, Globe, Palette } from 'lucide-react';

interface WizardProps {
  onComplete: (profile: TeacherProfile) => void;
}

const Wizard: React.FC<WizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<TeacherProfile>({
    grades: [],
    language: 'English',
    style: 'cartoon'
  });

  const toggleGrade = (grade: string) => {
    setProfile(prev => {
      const newGrades = prev.grades.includes(grade)
        ? prev.grades.filter(g => g !== grade)
        : [...prev.grades, grade];
      return { ...prev, grades: newGrades };
    });
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(profile);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-nana-orange">
      <div className="bg-nana-yellow p-6 text-center">
        <h2 className="text-2xl font-bold text-nana-purple font-comic">Let's set up your profile!</h2>
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 w-8 rounded-full ${step >= i ? 'bg-nana-purple' : 'bg-white/50'}`} />
          ))}
        </div>
      </div>

      <div className="p-8 min-h-[400px] flex flex-col justify-between">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 text-nana-orange mb-2">
              <GraduationCap size={32} />
              <h3 className="text-xl font-bold">Which grades do you teach?</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {['K1', 'K2', 'K3', 'P1', 'P2', 'P3'].map(grade => (
                <button
                  key={grade}
                  onClick={() => toggleGrade(grade)}
                  className={`p-4 rounded-xl text-lg font-bold border-2 transition-all ${
                    profile.grades.includes(grade)
                      ? 'bg-nana-blue text-white border-nana-blue transform scale-105 shadow-md'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-nana-blue'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center gap-3 text-nana-green mb-2">
              <Globe size={32} />
              <h3 className="text-xl font-bold">Primary Language?</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {['English', 'Cantonese', 'Mandarin'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setProfile({ ...profile, language: lang as any })}
                  className={`p-4 rounded-xl text-lg font-bold border-2 text-left px-6 transition-all ${
                    profile.language === lang
                      ? 'bg-nana-green text-white border-nana-green shadow-md'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center gap-3 text-pink-500 mb-2">
              <Palette size={32} />
              <h3 className="text-xl font-bold">Preferred Visual Style?</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'cartoon', label: 'Super Cute Cartoon', desc: 'Big eyes, bright colors, simple shapes' },
                { id: 'realistic', label: 'Semi-Realistic', desc: 'More detailed, softer colors' },
                { id: 'storybook', label: 'Storybook Illustration', desc: 'Hand-drawn feel, watercolor textures' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setProfile({ ...profile, style: style.id as any })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    profile.style === style.id
                      ? 'bg-pink-100 border-pink-500 shadow-md'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className={`font-bold text-lg ${profile.style === style.id ? 'text-pink-600' : 'text-gray-700'}`}>{style.label}</div>
                  <div className="text-sm text-gray-500">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={nextStep}
          className="w-full mt-8 bg-nana-purple text-white py-4 rounded-xl font-bold text-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg active:transform active:scale-95"
        >
          {step === 3 ? 'Finish Profile' : 'Next'} <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Wizard;
