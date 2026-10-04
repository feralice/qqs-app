export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`request failed: ${status}`);
  }
}

// 4xx que repetir não resolve: o servidor recusou o conteúdo, não a conexão.
export function isPermanentRejection(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status >= 400 &&
    error.status < 500 &&
    ![401, 403, 408, 429].includes(error.status)
  );
}
