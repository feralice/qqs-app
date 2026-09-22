const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

type Attempts = { count: number; lockedUntil?: number };

// Limita tentativas de login por e-mail, pra dificultar força bruta.
// Em memória: reinicia se o servidor reiniciar, aceitável pro MVP.
export class LoginRateLimiter {
  private readonly attemptsByEmail = new Map<string, Attempts>();

  isLocked(email: string, now = Date.now()): boolean {
    const attempts = this.attemptsByEmail.get(email);
    return Boolean(attempts?.lockedUntil && attempts.lockedUntil > now);
  }

  registerFailure(email: string, now = Date.now()): void {
    const attempts = this.attemptsByEmail.get(email) ?? { count: 0 };
    attempts.count += 1;
    if (attempts.count >= MAX_ATTEMPTS) {
      attempts.lockedUntil = now + LOCKOUT_MS;
      attempts.count = 0;
    }
    this.attemptsByEmail.set(email, attempts);
  }

  registerSuccess(email: string): void {
    this.attemptsByEmail.delete(email);
  }
}
