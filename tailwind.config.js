/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Couleurs primaires Axian
        primary: '#E4254F', // Rouge cerise principal
        secondary: '#414042', // Gris charbon
        accent: '#F5F5F5', // Blanc cassé pour les arrière-plans
        
        // Couleurs secondaires
        'accent-2': '#C6003F', // Rouge bordeaux
        'accent-3': '#4461C1', // Bleu mauve
        'accent-4': '#15214A', // Bleu marine
        'accent-5': '#4150C1', // Bleu horizon
        'accent-6': '#000000', // Noir
        'accent-7': '#FFFFFF', // Blanc pur
        'accent-8': '#CCCCCC', // Gris clair
        
        // Couleurs tertiaires pour enrichir la palette
        tertiary: {
          parme: '#C7B4E1',
          lavande: '#A7C1E1',
          aubergine: '#3F2A56',
          serenity: '#9FADD6',
          bleuet: '#6B8CC2',
          horizon: '#4150C1',
          'vert-eau': '#9BCDD2',
          turquoise: '#2B27C',
          minerale: '#709C74',
          beige: '#F2E1D7',
          corail: '#F26271',
          grenat: '#4074C'
        },
        
        // Couleurs spécifiques aux émotions (conservées pour la lisibilité)
        emotion: {
          happy: '#22c55e',
          sad: '#ef4444',
          neutral: '#64748b',
          stressed: '#f97316',
          excited: '#8b5cf6',
          tired: '#6b7280'
        },
        
        // Couleurs utilitaires basées sur la charte
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#E4254F',
        info: '#4461C1'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        }
      },
      boxShadow: {
        'axian': '0 4px 14px 0 rgba(228, 37, 79, 0.15)',
        'axian-lg': '0 10px 25px 0 rgba(228, 37, 79, 0.2)',
        'soft': '0 2px 8px 0 rgba(65, 64, 66, 0.1)'
      },
      backgroundImage: {
        'gradient-axian': 'linear-gradient(135deg, #E4254F 0%, #C6003F 100%)',
        'gradient-axian-soft': 'linear-gradient(135deg, #E4254F 0%, #4461C1 100%)',
        'gradient-neutral': 'linear-gradient(135deg, #F5F5F5 0%, #CCCCCC 100%)'
      }
    },
  },
  plugins: [],
};