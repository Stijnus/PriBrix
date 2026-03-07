import { Platform } from 'react-native';

export function isClientRuntime() {
  return Platform.OS !== 'web' || typeof window !== 'undefined';
}
