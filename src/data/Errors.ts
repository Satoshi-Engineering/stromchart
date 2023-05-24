export enum ErrorCode {
  UnableToLoadDataFromAwattar = 'UnableToLoadDataFromAwattar',
  UnableToWriteAwattarData = 'UnableToWriteAwattarData',
  UnableToReadAwattarData = 'UnableToReadAwattarData',
  InvalidInput = 'InvalidInput',
  UnknownError = 'UnknownError',
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
