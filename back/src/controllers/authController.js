import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_ziv_proptech_2026';

export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1 LIMIT 1', [email]);
    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    // Met à jour last_login
    await pool.query('UPDATE admins SET last_login = now() WHERE id = $1', [admin.id]);

    const token = jwt.sign(
      { id: admin.id, role: admin.role, email: admin.email, name: admin.full_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: admin.id,
        name: admin.full_name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    console.error('Erreur lors de la connexion:', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}
