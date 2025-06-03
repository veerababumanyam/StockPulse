// Global type declarations for StockPulse project

// Node.js timer types
declare namespace NodeJS {
  interface Timeout {
    readonly [Symbol.toPrimitive]: () => number;
  }

  interface Timer extends Timeout {}
}

// Web API types that may not be available in all environments
declare global {
  interface Window {
    // Custom window properties can be added here
  }

  // Intersection Observer API
  interface IntersectionObserverInit {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
  }

  interface IntersectionObserverCallback {
    (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver,
    ): void;
  }

  class IntersectionObserver {
    constructor(
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    );
    observe(target: Element): void;
    unobserve(target: Element): void;
    disconnect(): void;
    takeRecords(): IntersectionObserverEntry[];
  }

  interface IntersectionObserverEntry {
    readonly boundingClientRect: DOMRectReadOnly;
    readonly intersectionRatio: number;
    readonly intersectionRect: DOMRectReadOnly;
    readonly isIntersecting: boolean;
    readonly rootBounds: DOMRectReadOnly | null;
    readonly target: Element;
    readonly time: number;
  }

  // WebSocket types for testing environments
  interface WebSocketEventMap {
    close: CloseEvent;
    error: Event;
    message: MessageEvent;
    open: Event;
  }

  interface WebSocket extends EventTarget {
    binaryType: BinaryType;
    readonly bufferedAmount: number;
    readonly extensions: string;
    readonly protocol: string;
    readonly readyState: number;
    readonly url: string;

    close(code?: number, reason?: string): void;
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;

    readonly CLOSED: number;
    readonly CLOSING: number;
    readonly CONNECTING: number;
    readonly OPEN: number;

    addEventListener<K extends keyof WebSocketEventMap>(
      type: K,
      listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof WebSocketEventMap>(
      type: K,
      listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
      options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void;
  }

  // Binary type for WebSocket
  type BinaryType = "blob" | "arraybuffer";

  // XMLHttpRequest response types
  type ResponseType =
    | ""
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text";

  // Event listener types
  interface EventListenerOptions {
    capture?: boolean;
    passive?: boolean;
    once?: boolean;
  }

  interface AddEventListenerOptions extends EventListenerOptions {
    passive?: boolean;
  }

  type EventListenerOrEventListenerObject = EventListener | EventListenerObject;

  interface EventListener {
    (evt: Event): void;
  }

  interface EventListenerObject {
    handleEvent(object: Event): void;
  }
}

export {};
