declare module 'jsonwebtoken' {
  export function sign(payload: any, secret: string, options?: any): string
  export function verify(token: string, secret: string): any
}

declare module 'bcryptjs' {
  export function hash(password: string, salt: number): Promise<string>
  export function compare(password: string, hash: string): Promise<boolean>
}

declare module 'cors' {
  import { RequestHandler } from 'express'
  export default function cors(options?: any): RequestHandler
}
