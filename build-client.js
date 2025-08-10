import esbuild from 'esbuild';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build client-side React application
async function buildClient() {
  try {
    await esbuild.build({
      entryPoints: [join(__dirname, 'src/client/index.tsx')],
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      sourcemap: true,
      target: 'es2022',
      format: 'iife',
      outfile: join(__dirname, 'dist/public/client.js'),
      jsx: 'automatic',
      jsxImportSource: 'react',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env': JSON.stringify({ NODE_ENV: process.env.NODE_ENV || 'development' }),
        'process': JSON.stringify({ env: { NODE_ENV: process.env.NODE_ENV || 'development' }, browser: true }),
        global: 'globalThis'
      },
      external: [], // Bundle everything for the browser
      alias: {
        util: 'util',
        // Ensure only one copy of React is bundled
        'react': join(__dirname, 'node_modules/react'),
        'react-dom': join(__dirname, 'node_modules/react-dom'),
        'react/jsx-runtime': join(__dirname, 'node_modules/react/jsx-runtime'),
        'react/jsx-dev-runtime': join(__dirname, 'node_modules/react/jsx-dev-runtime')
      },
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts'
      }
    });

    console.log('Client build completed successfully');
  } catch (error) {
    console.error('Client build failed:', error);
    process.exit(1);
  }
}

buildClient();
