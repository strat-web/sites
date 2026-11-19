// Mesma configuração da V1 no strat-lps; compilada no build em vez de no navegador (WEB-48).
module.exports = {
    content: ['./src/html/v1.*.html'],
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#effefb',
              100: '#c8fff4',
              200: '#91fee9',
              300: '#52f5db',
              400: '#20e0c8',
              500: '#0ac4af',
              600: '#059e90',
              700: '#097e74',
              800: '#0c645e',
              900: '#0f524e',
              950: '#013331',
            }
          },
          fontFamily: {
            saira: ['Saira', 'sans-serif'],
          }
        }
      }
    };
