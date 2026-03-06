declare namespace Express {
  export interface Request {
    token?: string | null;
    user?: any; // You can replace "any" later with your User type
  }
}
