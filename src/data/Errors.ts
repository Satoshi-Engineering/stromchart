export enum ErrorCode {
}

export class ErrorWithCode {
  error: unknown
  code: ErrorCode

  constructor(error: unknown, code: ErrorCode) {
    this.error = error
    this.code = code
    Object.setPrototypeOf(this, ErrorWithCode.prototype)
  }
}
