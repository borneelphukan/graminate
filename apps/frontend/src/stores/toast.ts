type ToastType = "success" | "error";

type Subscriber<T> = (value: T) => void;

function writable<T>(initialValue: T) {
  let value = initialValue;
  const subscribers = new Set<Subscriber<T>>();

  return {
    subscribe: (run: Subscriber<T>) => {
      subscribers.add(run);
      run(value);
      return () => {
        subscribers.delete(run);
      };
    },
    set: (newValue: T) => {
      value = newValue;
      subscribers.forEach((subscriber) => subscriber(value));
    },
    update: (updater: (value: T) => T) => {
      value = updater(value);
      subscribers.forEach((subscriber) => subscriber(value));
    }
  };
}

export const toastMessage = writable<{
  message: string;
  type: ToastType;
} | null>(null);
export const showToast = writable<boolean>(false);

export function triggerToast(
  message: string,
  type: ToastType = "success",
  duration = 3000
) {
  toastMessage.set({ message, type });
  showToast.set(true);

  setTimeout(() => {
    showToast.set(false);
    toastMessage.set(null);
  }, duration);
}
