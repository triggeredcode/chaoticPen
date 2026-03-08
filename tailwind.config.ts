import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        panel: 'rgba(15, 15, 18, 0.92)',
      },
    },
  },
  plugins: [],
};
export default config;
