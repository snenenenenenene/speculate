interface Window {
  setSaveFunction?: (fn: () => Promise<void>) => void;
}
