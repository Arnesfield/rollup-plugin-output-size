import { blue, cyan, magenta } from 'colorette';

// NOTE: internal

export const OUTPUT_TYPES = ['entry', 'chunk', 'asset'] as const;

export const TYPES = [...OUTPUT_TYPES, 'total'] as const;

export const COLOR = { asset: magenta, chunk: blue, entry: cyan } as const;
