// VOTA Global Toast Notification & Audio Feedback Engine
import { sfx } from './soundEffects';

export interface ToastItem {
  id: string;
  type: 'success' | 'delete' | 'warning' | 'info';
  title: string;
  message: string;
  bytesRecovered?: number;
  duration?: number;
  createdAt: number;
}

export interface ToastOptions {
  bytesRecovered?: number;
  duration?: number;
  sound?: boolean;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private maxToasts = 4;

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = [...this.toasts];
    this.listeners.forEach((fn) => fn(copy));
  }

  public show(options: {
    type: 'success' | 'delete' | 'warning' | 'info';
    title: string;
    message: string;
    bytesRecovered?: number;
    duration?: number;
    sound?: boolean;
  }): string {
    const id = 'toast-' + Math.random().toString(36).substring(7);
    const duration = options.duration ?? 4500;
    const playSound = options.sound !== false;

    // Trigger audio SFX corresponding to action
    if (playSound) {
      if (options.type === 'delete') {
        sfx.playDelete();
      } else if (options.type === 'success') {
        sfx.playSuccess();
      } else if (options.type === 'warning') {
        sfx.playWarning();
      } else if (options.type === 'info') {
        sfx.playClick();
      }
    }

    const item: ToastItem = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      bytesRecovered: options.bytesRecovered,
      duration,
      createdAt: Date.now(),
    };

    // Keep within maxToasts
    this.toasts = [item, ...this.toasts].slice(0, this.maxToasts);
    this.notify();

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  public success(title: string, message: string, options?: ToastOptions): string {
    return this.show({
      type: 'success',
      title,
      message,
      bytesRecovered: options?.bytesRecovered,
      duration: options?.duration,
      sound: options?.sound,
    });
  }

  public delete(title: string, message: string, options?: ToastOptions): string {
    return this.show({
      type: 'delete',
      title,
      message,
      bytesRecovered: options?.bytesRecovered,
      duration: options?.duration,
      sound: options?.sound,
    });
  }

  public warning(title: string, message: string, options?: ToastOptions): string {
    return this.show({
      type: 'warning',
      title,
      message,
      duration: options?.duration,
      sound: options?.sound,
    });
  }

  public info(title: string, message: string, options?: ToastOptions): string {
    return this.show({
      type: 'info',
      title,
      message,
      duration: options?.duration,
      sound: options?.sound,
    });
  }

  public dismiss(id: string) {
    const idx = this.toasts.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
      this.notify();
    }
  }

  public clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toast = new ToastManager();
