import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/PIRATERIA_TV/', // exactamente el nombre del repositorio, con mayúsculas
});