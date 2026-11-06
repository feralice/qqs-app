import { NotFoundError, UnprocessableError } from "../../domain/common/errors.js";

export class SystemNotInClientError extends NotFoundError {
  constructor() {
    super("system not found in this client");
  }
}

export class UnknownProductError extends UnprocessableError {
  constructor(id: string) {
    super(`unknown product: ${id}`);
  }
}

export class InactiveProductError extends UnprocessableError {
  constructor(name: string) {
    super(`inactive product cannot be added to a program: ${name}`);
  }
}
