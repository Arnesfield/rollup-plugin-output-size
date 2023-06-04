import { add } from './add';

export function total(...values) {
  return values.reduce((total, value) => add(total, value), 0);
}

export { add };
