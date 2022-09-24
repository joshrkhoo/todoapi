export class BadRequestError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = StatusType.BAD_REQUEST
  }
}

export enum StatusType {
  BAD_REQUEST = "BAD_REQUEST"
}