import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Garante que o dotenv seja lido neste módulo também, por segurança
dotenv.config();

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Lemos a chave secreta DENTRO da requisição para garantir que o dotenv já carregou
    const JWT_SECRET = process.env.JWT_SECRET || 'sie-secret-key-change-in-prod';
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido ou expirado' });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }
  next();
};