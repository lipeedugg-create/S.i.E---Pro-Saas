import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/db.js'; // Importação Centralizada

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // console.log(`⛔ Auth Failed [${req.path}]: Token não fornecido.`);
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
     return res.status(401).json({ message: 'Token erro de formato' });
  }

  const token = parts[1];

  try {
    // Valida usando a MESMA chave exportada pelo db.js
    // CRITICAL FIX: clockTolerance aumentado para 30s. 
    // Isso resolve problemas onde o servidor de DB e o servidor API têm relógios levemente diferentes.
    const decoded = jwt.verify(token, JWT_SECRET, { clockTolerance: 30 });
    req.user = decoded;
    next();
  } catch (error) {
    console.error(`⛔ Auth Failed [${req.path}]: ${error.message}`); 
    return res.status(403).json({ message: 'Token inválido ou expirado' });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }
  next();
};