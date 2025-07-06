import { FlaskConical, Sparkles, Star } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
      <div className="text-center">
        <div className="relative">
          <FlaskConical className="h-20 w-20 text-purple-600 mx-auto mb-4 animate-bounce" />
          <Sparkles className="h-8 w-8 text-yellow-400 absolute top-0 right-0 animate-pulse" />
          <Star className="h-6 w-6 text-pink-400 absolute bottom-0 left-0 animate-spin" />
        </div>
        <p className="mt-4 text-purple-700 font-bold text-xl font-hanuman animate-pulse">កំពុងផ្ទុកទិន្ន័យ...</p>
        <div className="flex justify-center mt-4 space-x-2">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinnerCompact() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="relative">
          <FlaskConical className="h-12 w-12 text-purple-600 mx-auto mb-2 animate-bounce" />
          <Sparkles className="h-4 w-4 text-yellow-400 absolute top-0 right-0 animate-pulse" />
        </div>
        <p className="mt-2 text-purple-700 font-medium text-sm font-hanuman animate-pulse">កំពុងផ្ទុកទិន្ន័យ...</p>
      </div>
    </div>
  );
}