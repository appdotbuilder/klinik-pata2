
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type UpdateUserInput, type User } from '../schema';
import { eq } from 'drizzle-orm';

export const updateUser = async (input: UpdateUserInput): Promise<User> => {
  try {
    // Check if user exists
    const existingUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (existingUsers.length === 0) {
      throw new Error('User not found');
    }

    // Prepare update values
    const updateValues: any = {
      updated_at: new Date(),
    };

    if (input.username !== undefined) {
      updateValues.username = input.username;
    }
    if (input.email !== undefined) {
      updateValues.email = input.email;
    }
    if (input.password !== undefined) {
      // Simple hash simulation - in production, use proper password hashing
      updateValues.password_hash = `hashed_${input.password}`;
    }
    if (input.full_name !== undefined) {
      updateValues.full_name = input.full_name;
    }
    if (input.role !== undefined) {
      updateValues.role = input.role;
    }
    if (input.is_active !== undefined) {
      updateValues.is_active = input.is_active;
    }

    // Update the user
    const result = await db.update(usersTable)
      .set(updateValues)
      .where(eq(usersTable.id, input.user_id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('User update failed:', error);
    throw error;
  }
};
