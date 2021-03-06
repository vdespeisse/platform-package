const rollup = require('rollup')
import yaml from '@rollup/plugin-yaml';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';


export default {
  input: 'src/main.js',
  output: {
    file:  (process.env.MODE === 'dev') ? 'dist/test.js' : 'dist/index.js',
    name: 'platform-package',
    format: (process.env.MODE === 'dev') ? 'cjs' : 'es',
    inlineDynamicImports: true,
  },
  plugins: [
    yaml(),
    dynamicImportVars()
  ],
}