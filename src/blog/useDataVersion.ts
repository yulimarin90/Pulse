import { useSyncExternalStore } from 'react';
import { getDataVersion, onDataChange } from './dataStore';


export default function useDataVersion(): number {
  return useSyncExternalStore(onDataChange, getDataVersion);
}