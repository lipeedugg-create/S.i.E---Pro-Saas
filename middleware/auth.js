import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/db.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
     return res.status(401).json({ message: 'Token mal formatado' });
  }

  const token = parts[1];

  try {
    // clockTolerance: 30s permite que o token seja aceito mesmo se o relógio do servidor
    // de banco de dados estiver ligeiramente adiantado/atrasado em relação à API.
    const decoded = jwt.verify(token, JWT_SECRET, { clockTolerance: 30 });
    req.user = decoded;
    next();
  } catch (error) {
    // console.error(`⛔ Token Inválido: ${error.message}`);
    return res.status(403).json({ message: 'Sessão expirada ou inválida' });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado: Requer privilégios de Admin' });
  }
  next();
};