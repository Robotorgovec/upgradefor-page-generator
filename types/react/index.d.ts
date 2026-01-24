type ReactText = string | number;
type ReactChild = ReactText | boolean | null | undefined;

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare namespace React {
  type ReactNode = ReactChild | ReactElement | Iterable<ReactNode>;

  interface ReactElement {
    type: any;
    props: any;
    key: string | number | null;
  }

  type ComponentType<P = any> = (props: P) => ReactElement | null;
  type FC<P = any> = ComponentType<P>;
  type FunctionComponent<P = any> = ComponentType<P>;
  type PropsWithChildren<P = any> = P & { children?: ReactNode };

  interface FormEvent<T = Element> {
    target: T;
    preventDefault(): void;
  }

  type SetStateAction<S> = S | ((prevState: S) => S);
  type Dispatch<A> = (value: A) => void;

  function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useMemo<T>(factory: () => T, deps: any[]): T;

  const Suspense: ComponentType<{ fallback?: ReactNode; children?: ReactNode }>;
}

export = React;
export as namespace React;
