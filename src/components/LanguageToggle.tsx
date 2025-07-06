'use client';

import React from 'react';
import { useLanguage } from './LanguageProvider';
import { motion } from 'framer-motion';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'km' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative inline-flex items-center h-10 rounded-full w-24 bg-gradient-to-r from-blue-100 to-purple-100 p-1 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      aria-label="Toggle language"
    >
      {/* Background gradient that moves */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-10"
        animate={{
          scale: language === 'km' ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Toggle indicator */}
      <motion.span
        className="relative inline-block h-8 w-11 transform rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-transform"
        animate={{
          x: language === 'km' ? 40 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
      >
        {/* Inner circle with language indicator */}
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
          {language === 'km' ? 'KH' : 'EN'}
        </span>
      </motion.span>
      
      {/* Language labels */}
      <span className="absolute left-3 text-xs font-semibold text-gray-700 pointer-events-none select-none">
        EN
      </span>
      <span className="absolute right-2 text-xs font-semibold text-gray-700 pointer-events-none select-none font-hanuman">
        ខ្មែរ
      </span>
    </button>
  );
}

export function LanguageToggleMinimal() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'km' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Toggle language"
    >
      <motion.span
        className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md"
        animate={{
          x: language === 'km' ? 28 : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
      />
      <span className="sr-only">Toggle language</span>
    </button>
  );
}

export function LanguageToggleWithFlags() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'km' : 'en');
  };

  return (
    <div className="relative">
      <button
        onClick={toggleLanguage}
        className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-white px-4 py-2 shadow-md transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        {/* Background animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"
          initial={{ x: '-100%' }}
          animate={{ x: language === 'km' ? '0%' : '-100%' }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Current language */}
        <motion.div
          className="relative z-10 flex items-center gap-2"
          animate={{ color: language === 'km' ? '#ffffff' : '#1f2937' }}
        >
          <span className={`font-semibold ${language === 'km' ? 'font-hanuman' : ''}`}>
            {language === 'km' ? 'ខ្មែរ' : 'English'}
          </span>
        </motion.div>
        
        {/* Switch icon */}
        <motion.svg
          className="relative z-10 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ 
            rotate: language === 'km' ? 180 : 0,
            color: language === 'km' ? '#ffffff' : '#1f2937'
          }}
          transition={{ duration: 0.3 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </motion.svg>
      </button>
      
      {/* Hover tooltip */}
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 0, y: -5 }}
        whileHover={{ opacity: 1, y: 0 }}
      >
        Switch to {language === 'km' ? 'English' : 'ភាសាខ្មែរ'}
      </motion.div>
    </div>
  );
}

export function LanguageTogglePill() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'km' : 'en');
  };

  return (
    <div className="relative">
      <button
        onClick={toggleLanguage}
        className="group relative inline-flex h-11 w-36 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm p-1 transition-all duration-300 hover:bg-white/90 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-sm group-hover:opacity-30 transition-opacity" />
        
        {/* Inner container */}
        <div className="relative flex h-full w-full items-center justify-between rounded-full bg-white px-1.5">
          {/* Active background with gradient */}
          <motion.div
            className="absolute h-8 w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-md"
            animate={{
              x: language === 'km' ? 66 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </motion.div>
          
          {/* Language options without flags */}
          <div className="relative z-10 flex w-full items-center justify-around px-1">
            <motion.div 
              className="flex items-center justify-center"
              animate={{ scale: language === 'en' ? 1.05 : 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span
                className={`text-sm font-bold transition-all duration-300 ${
                  language === 'en' ? 'text-white' : 'text-gray-600'
                }`}
              >
                English
              </span>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center"
              animate={{ scale: language === 'km' ? 1.05 : 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span
                className={`text-sm font-bold transition-all duration-300 font-hanuman ${
                  language === 'km' ? 'text-white' : 'text-gray-600'
                }`}
              >
                ខ្មែរ
              </span>
            </motion.div>
          </div>
        </div>
        
        {/* Click ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={false}
          whileTap={{
            background: [
              "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(59, 130, 246, 0) 0%, transparent 70%)"
            ]
          }}
          transition={{ duration: 0.5 }}
        />
      </button>
      
      {/* Floating label on hover */}
      <motion.div
        className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg pointer-events-none"
        initial={{ opacity: 0, y: 5 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1 rotate-45 bg-gray-900" />
        {language === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'}
      </motion.div>
    </div>
  );
}