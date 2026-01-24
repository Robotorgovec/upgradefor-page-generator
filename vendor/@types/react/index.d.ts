declare namespace React {
  type ReactNode = any;
  type ReactElement = any;
  type ComponentType<P = any> = any;
  type JSXElementConstructor<P = any> = any;

  function useState<T = any>(initialState: T | (() => T)): [T, (value: T) => void];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useMemo<T = any>(factory: () => T, deps?: any[]): T;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: any[]): T;
  function useRef<T = any>(initialValue: T): { current: T };
}

declare const React: any;

export = React;
export as namespace React;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
