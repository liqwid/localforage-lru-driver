import babel from 'rollup-plugin-babel';
import multiEntry from 'rollup-plugin-multi-entry';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';

export default {
  entry: 'test/index.js',
  plugins: [
    commonJs({ include: 'node_modules/**' }),
    babel({ exclude: 'node_modules/**' }),
    nodeResolve({ jsnext: true })
  ],
  format: 'iife',
  moduleName: 'tests',
  dest: 'build/test-bundle.js',
  sourceMap: true
};
