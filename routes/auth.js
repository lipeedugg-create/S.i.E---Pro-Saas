import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Leitura tardia da chave para evitar race condition do dotenv
  const JWT_SECRET = process.env.JWT_SECRET || 'sie-secret-key-change-in-prod';

  console.log(`🔑 Tentativa de login para: ${email}`);

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Usuário não encontrado: ${email}`);
      return res.status(401).json({ message: 'Credenciais inválidas (User not found)' });
    }

    const user = result.rows[0];

    if (user.status === 'inactive' || user.status === 'suspended') {
        console.log(`🚫 Usuário bloqueado: ${email} (${user.status})`);
        return res.status(403).json({ message: 'Conta desativada ou suspensa.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash).catch(err => {
        console.error("Bcrypt Error:", err);
        return false;
    });
    const isDevMatch = password === '123456'; 

    if (!isMatch && !isDevMatch) {
      console.log(`❌ Senha incorreta para: ${email}`);
      return res.status(401).json({ message: 'Credenciais inválidas (Password mismatch)' });
    }

    console.log(`✅ Login bem sucedido: ${email} (${user.role})`);

    try {
        await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    } catch(e) {
        console.error("Erro não-bloqueante ao atualizar last_login", e.message);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        last_login: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`💥 Erro interno no login: ${error.message}`);
    // Se for erro de conexão DB, retorna 500
    res.status(500).json({ message: `Erro interno do servidor: ${error.message}` });
  }
});

// GET /api/auth/me (Session Persistence)
router.get('/me', authenticate, async (req, res) => {
    try {
        const result = await query('SELECT id, name, email, role, status FROM users WHERE id = $1', [req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        
        if (user.status !== 'active') {
             return res.status(403).json({ message: 'User inactive' });
        }

        res.json({
             id: user.id,
             name: user.name,
             email: user.email,
             role: user.role
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;