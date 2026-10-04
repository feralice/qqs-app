export class InvalidClientError extends Error {}

export class ClientNotFoundError extends Error {
  constructor() {
    super("client not found");
  }
}

export class CnpjAlreadyRegisteredError extends Error {
  constructor() {
    super("cnpj already registered");
  }
}

export class DuplicateSystemError extends Error {
  constructor(name: string) {
    super(`system already registered: ${name}`);
  }
}
