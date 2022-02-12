export { };

declare global {
  namespace Express {
    interface Request {
      fields?: any;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    uid?: number
  }
}