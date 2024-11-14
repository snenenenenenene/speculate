// eventBus.ts
type Listener = (data: any) => void;
const listeners: { [key: string]: Listener[] } = {};

export const eventBus = {
  emit: (event: string, data: any) => {
    if (listeners[event]) {
      listeners[event].forEach((listener) => listener(data));
    }
  },
  on: (event: string, callback: Listener) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
  },
  off: (event: string, callback: Listener) => {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(
        (listener) => listener !== callback,
      );
    }
  },
};
