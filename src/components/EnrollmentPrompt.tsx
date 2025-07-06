'use client';

import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Play, 
  Users, 
  Trophy, 
  BookOpen, 
  ChevronRight, 
  UserPlus,
  ArrowRight,
  Heart
} from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface EnrollmentPromptProps {
  simulationTitle?: string;
  onClose?: () => void;
  onRegister?: () => void;
  onLogin?: () => void;
}

export function EnrollmentPrompt({ 
  simulationTitle = 'simulation', 
  onClose, 
  onRegister, 
  onLogin 
}: EnrollmentPromptProps) {
  const router = useRouter();
  const { t, getFontClass } = useLanguage();

  const handleRegister = () => {
    if (onRegister) {
      onRegister();
    } else {
      router.push('/auth/register');
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 shadow-2xl animate-fadeIn">
        <CardHeader className="text-center bg-gradient-to-r from-purple-100 to-pink-100 border-b-2 border-purple-200">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                <Trophy className="h-10 w-10 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-400 animate-ping" />
              </div>
            </div>
          </div>
          <CardTitle className={`text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 ${getFontClass()}`}>
            ល្អណាស់! 🎉
          </CardTitle>
          <p className={`text-xl font-bold text-purple-700 ${getFontClass()}`}>
            អ្នកបានបញ្ចប់ការពិសោធន៍របស់អ្នកដំបូង!
          </p>
        </CardHeader>

        <CardContent className="p-8">
          <div className="text-center mb-8">
            <p className={`text-lg text-purple-700 mb-6 leading-relaxed ${getFontClass()}`}>
              អ្នកទើបតែបានជាប់ពាក់ព័ន្ធជាមួយ <span className="font-bold text-purple-800">{simulationTitle}</span> ។ 
              ចាប់ផ្តើមការធ្វើដំណើរសិក្សាពេញលេញរបស់អ្នកដោយបង្កើតគណនីឥតគិតថ្លៃ!
            </p>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                  <h3 className={`font-bold text-blue-800 ${getFontClass()}`}>ការចូលប្រើគ្មានកំណត់</h3>
                </div>
                <p className={`text-sm text-blue-700 ${getFontClass()}`}>
                  ចូលប្រើការពិសោធន៍ទាំងអស់ដោយគ្មានកំណត់
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <h3 className={`font-bold text-green-800 ${getFontClass()}`}>តាមដានវឌ្ឍនភាព</h3>
                </div>
                <p className={`text-sm text-green-700 ${getFontClass()}`}>
                  រក្សាទុកពិន្ទុ និងសមិទ្ធិផលរបស់អ្នក
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className={`font-bold text-purple-800 ${getFontClass()}`}>សហគមន៍សិក្សា</h3>
                </div>
                <p className={`text-sm text-purple-700 ${getFontClass()}`}>
                  ចូលរួមជាមួយសិស្សផ្សេងទៀតនៅកម្ពុជា
                </p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h3 className={`font-bold text-orange-800 ${getFontClass()}`}>មាតិកាផ្តាច់មុខ</h3>
                </div>
                <p className={`text-sm text-orange-700 ${getFontClass()}`}>
                  គ្រូបង្រៀន និងធនធានកម្ពុជា
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={handleRegister}
              size="lg"
              className={`w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${getFontClass()}`}
            >
              <UserPlus className="h-6 w-6 mr-3" />
              បង្កើតគណនីឥតគិតថ្លៃ
              <ChevronRight className="h-6 w-6 ml-3" />
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className={`text-sm text-gray-500 font-semibold ${getFontClass()}`}>ឬ</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            <Button 
              onClick={handleLogin}
              variant="outline"
              size="lg"
              className={`w-full h-12 text-lg font-bold border-2 border-purple-300 hover:bg-purple-50 text-purple-700 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ${getFontClass()}`}
            >
              <Play className="h-5 w-5 mr-3" />
              ចូលបើកគណនីដែលមានរួចហើយ
            </Button>

            {onClose && (
              <div className="text-center mt-6">
                <button
                  onClick={onClose}
                  className={`text-sm text-gray-500 hover:text-gray-700 font-semibold ${getFontClass()}`}
                >
                  បន្តជាភ្ញៀវ (មិនអាចរក្សាទុកវឌ្ឍនភាព)
                </button>
              </div>
            )}
          </div>

          {/* Footer message */}
          <div className="mt-8 text-center">
            <p className={`text-xs text-gray-500 ${getFontClass()}`}>
              <Heart className="h-4 w-4 inline text-red-400 mr-1" />
              បង្កើតដោយក្រុម Virtual Lab ដើម្បីសិស្សកម្ពុជា
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}