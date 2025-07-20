import pool from '../db/db.js';

export async function getUserById(id) {
  const user = await pool.query(`SELECT * FROM users WHERE id = ${id}`);
  return user.rows[0];
}