import bcrypt from "bcryptjs";

import type { User } from "../domain/user.js";
import type { UserRepository } from "../application/ports.js";

// Contas de teste do MVP. Trocar a senha real depois que o cadastro de
// funcionários existir; hash gerado uma vez no boot, senha nunca fica em texto puro.
const seedUsers: User[] = [
  {
    id: "admin-1",
    name: "Administrador 1",
    email: "admin1@qqs.app",
    passwordHash: bcrypt.hashSync("Admin123!", 10),
    role: "supervisor",
    active: true,
  },
  {
    id: "admin-2",
    name: "Administrador 2",
    email: "admin2@qqs.app",
    passwordHash: bcrypt.hashSync("Admin123!", 10),
    role: "supervisor",
    active: true,
  },
  {
    id: "employee-001",
    name: "Técnico Teste",
    email: "tecnico@qqs.app",
    passwordHash: bcrypt.hashSync("Tecnico123!", 10),
    role: "employee",
    active: true,
  },
  {
    id: "employee-002",
    name: "Carlos Silva",
    email: "carlos.silva@qqs.app",
    passwordHash: bcrypt.hashSync("Tecnico123!", 10),
    role: "employee",
    active: true,
  },
  {
    id: "employee-003",
    name: "Mariana Souza",
    email: "mariana.souza@qqs.app",
    passwordHash: bcrypt.hashSync("Tecnico123!", 10),
    role: "employee",
    active: true,
  },
];

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map(seedUsers.map((user) => [user.id, user]));

  async findByEmail(email: string): Promise<User | undefined> {
    return [...this.users.values()].find((user) => user.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async list(): Promise<User[]> {
    return [...this.users.values()];
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
}
