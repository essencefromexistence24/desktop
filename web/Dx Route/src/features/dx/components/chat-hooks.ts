import * as React from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const initialValueRef = React.useRef(initialValue);
  const cachedValue = React.useRef<{ key: string | null; value: T | null }>({
    key: null,
    value: null,
  });

  const getSnapshot = React.useCallback((): T => {
    if (typeof window === "undefined") return initialValueRef.current;
    try {
      const item = window.localStorage.getItem(key);
      if (item === cachedValue.current.key && cachedValue.current.value !== null) {
        return cachedValue.current.value as T;
      }

      const parsed = item ? (JSON.parse(item) as T) : initialValueRef.current;
      cachedValue.current = { key: item, value: parsed };
      return parsed;
    } catch {
      return initialValueRef.current;
    }
  }, [key]);

  const getServerSnapshot = React.useCallback((): T => initialValueRef.current, []);

  const store = React.useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    getSnapshot,
    getServerSnapshot,
  );

  const setValue = React.useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(getSnapshot()) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new Event("storage"));
      } catch (error) {
        console.error(error);
      }
    },
    [key, getSnapshot],
  );

  return [store, setValue];
}
