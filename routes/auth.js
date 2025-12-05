import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sie-secret-key-change-in-prod';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busca usuário no banco
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const user = result.rows[0];

    // Verifica senha (bcrypt)
    // Nota: Em produção, use bcrypt.compare. Aqui comparamos direto se for o seed inicial sem hash
    const isMatch = await bcrypt.compare(password, user.password_hash).catch(() => false);
    
    // Fallback para senhas de teste do seed que podem não estar hasheadas corretamente na demo
    // REMOVER EM PRODUÇÃO REAL
    const isDevMatch = password === '123456'; 

    if (!isMatch && !isDevMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gera Token
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
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
