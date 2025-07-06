// Unified Design System for Teacher Dashboard
// Colors, gradients, and reusable components for a student-friendly interface

export const colors = {
  // Primary colors - vibrant and engaging
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  // Secondary colors - playful purple
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  // Success - encouraging green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  // Warning - friendly orange
  warning: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  // Danger - soft red
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
};

export const gradients = {
  primary: 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500',
  secondary: 'bg-gradient-to-r from-purple-400 to-pink-400',
  success: 'bg-gradient-to-r from-green-400 to-blue-500',
  warning: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  danger: 'bg-gradient-to-r from-red-400 to-pink-500',
  sky: 'bg-gradient-to-br from-blue-100 via-blue-50 to-pink-50',
  sunset: 'bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100',
  ocean: 'bg-gradient-to-br from-blue-200 via-cyan-100 to-teal-50',
  rainbow: 'bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 via-purple-400 to-pink-400',
};

// Responsive breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Animation classes
export const animations = {
  fadeIn: 'animate-in fade-in duration-500',
  slideIn: 'animate-in slide-in-from-bottom duration-300',
  slideInRight: 'animate-in slide-in-from-right duration-300',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  wiggle: 'animate-[wiggle_1s_ease-in-out_infinite]',
};

// Card variants with hover effects
export const cardVariants = {
  default: 'bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100',
  gradient: 'bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100',
  colorful: 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200',
  glass: 'bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-white/20',
};

// Button variants
export const buttonVariants = {
  primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200',
  secondary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200',
  success: 'bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200',
  outline: 'border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200',
};

// Typography styles
export const typography = {
  h1: 'text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
  h2: 'text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800',
  h3: 'text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800',
  h4: 'text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700',
  body: 'text-base sm:text-lg text-gray-600',
  small: 'text-sm sm:text-base text-gray-500',
};

// Icon sizes
export const iconSizes = {
  xs: 'h-3 w-3 sm:h-4 sm:w-4',
  sm: 'h-4 w-4 sm:h-5 sm:w-5',
  md: 'h-5 w-5 sm:h-6 sm:w-6',
  lg: 'h-6 w-6 sm:h-8 sm:w-8',
  xl: 'h-8 w-8 sm:h-10 sm:w-10',
};

// Spacing system
export const spacing = {
  page: 'p-4 sm:p-6 lg:p-8',
  section: 'space-y-6 sm:space-y-8',
  card: 'p-4 sm:p-6',
  compact: 'p-3 sm:p-4',
};

// Grid layouts
export const grids = {
  stats: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
  cards: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6',
  two: 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6',
};