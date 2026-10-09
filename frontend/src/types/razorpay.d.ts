export {};

declare global {
  interface Window {
    Razorpay?: new (options: unknown) => { open: () => void; on: (event: string, cb: (...args: unknown[]) => void) => void };
  }
}

