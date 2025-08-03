
import { type CreateUserInput, type User } from '../schema';

export const createUser = async (input: CreateUserInput): Promise<User> => {
  // This is a placeholder declaration! Real code should be implemented here.
  // The goal of this handler is creating a new user (resepsionis or dokter) with hashed password
  // and persisting it in the database.
  return Promise.resolve({
    id: 0,
    username: input.username,
    password_hash: 'hashed_password_placeholder',
    full_name: input.full_name,
    role: input.role,
    is_active: true,
    created_at: new Date()
  } as User);
};
