// NOTE: internal

export const TYPES = ['entry', 'chunk', 'asset'] as const;

export const KEYS = [...TYPES, 'total'] as const;

// prettier-ignore
export const COLOR = { asset: 'magenta', chunk: 'blue', entry: 'cyan' } as const;
