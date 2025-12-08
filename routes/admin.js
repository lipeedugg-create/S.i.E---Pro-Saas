import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer'; // Para upload
import AdmZip from 'adm-zip'; // Para descompactar
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, JWT_SECRET } from '../config/db.js'; 
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLUGINS_DIR = path.join(__dirname, '../plugins');

const router = express.Router();
// Configuração do Multer para uploads temporários
const upload = multer({ 
    dest: 'temp_uploads/',
    limits: { fileSize: 50 * 1024 * 1024 } // Limite de 50MB
});

router.use(authenticate);
router.use(authorizeAdmin);

// --- PLUGIN TEMPLATE DOWNLOAD ---
router.get('/plugins/template', async (req, res) => {
    try {
        const zip = new AdmZip();

        // 1. Manifest.json
        const manifest = {
            id: "meu-primeiro-plugin",
            name: "Meu Plugin Incrível",
            version: "1.0.0",
            description: "Este é um plugin de exemplo gerado pelo S.I.E. PRO.",
            icon: "🚀",
            category: "utility",
            price: 0.00,
            entry_point: "index.html",
            config: {
                systemPrompt: "Você é um assistente útil integrado ao plugin.",
                negativePrompt: "Não invente fatos.",
                useSearch: false
            }
        };
        zip.addFile("manifest.json", Buffer.from(JSON.stringify(manifest, null, 2), "utf8"));

        // 2. Index.html (Hello World)
        const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu Plugin</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white flex flex-col items-center justify-center min-h-screen p-4">
    <div class="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl max-w-md w-full text-center">
        <div class="text-6xl mb-4">🚀</div>
        <h1 class="text-2xl font-bold mb-2">Olá, <span id="username" class="text-blue-400">...</span>!</h1>
        <p class="text-slate-400 mb-6">Este plugin está rodando dentro do S.I.E. PRO.</p>
        
        <div class="bg-slate-900 p-4 rounded-lg text-left text-xs font-mono text-emerald-400 mb-6 border border-slate-700">
            <p>Token Status: <span id="token_status">Aguardando Auth...</span></p>
        </div>

        <button id="askBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
            Testar IA (Gerar Piada)
        </button>
        
        <div id="aiResponse" class="mt-4 text-sm text-slate-300 italic hidden"></div>
    </div>

    <script>
        let authToken = null;

        // 1. Receber Token do Sistema Principal via postMessage
        window.addEventListener('message', (event) => {
            if (event.data.type === 'AUTH_TOKEN') {
                const user = JSON.parse(event.data.user);
                authToken = event.data.token;
                
                document.getElementById('username').innerText = user.name;
                document.getElementById('token_status').innerText = "OK (Autenticado)";
            }
        });

        // 2. Exemplo de uso da Generic AI Gateway
        document.getElementById('askBtn').addEventListener('click', async () => {
            if (!authToken) return alert('Token não recebido ainda.');
            
            const btn = document.getElementById('askBtn');
            const respDiv = document.getElementById('aiResponse');
            
            btn.disabled = true;
            btn.innerText = "Pensando...";
            respDiv.classList.add('hidden');

            try {
                const response = await fetch('/api/client/plugin/ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authToken
                    },
                    body: JSON.stringify({
                        plugin_id: 'meu-primeiro-plugin', // Deve bater com o ID do manifesto instalado
                        user_prompt: 'Conte uma piada curta sobre programadores.'
                    })
                });

                const data = await response.json();
                
                if (data.result) {
                    try {
                        const parsed = JSON.parse(data.result); 
                        respDiv.innerText = JSON.stringify(parsed, null, 2);
                    } catch(e) {
                        respDiv.innerText = data.result;
                    }
                    respDiv.classList.remove('hidden');
                } else {
                    alert('Erro: ' + (data.error || 'Desconhecido'));
                }
            } catch (e) {
                alert('Erro de conexão: ' + e.message);
            } finally {
                btn.disabled = false;
                btn.innerText = "Testar IA (Gerar Piada)";
            }
        });
    </script>
</body>
</html>`;
        zip.addFile("index.html", Buffer.from(htmlContent, "utf8"));

        const buffer = zip.toBuffer();

        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=plugin-template.zip');
        res.set('Content-Length', buffer.length);
        res.send(buffer);

    } catch (err) {
        console.error("Template Error:", err);
        res.status(500).json({ message: "Erro ao gerar template." });
    }
});

// --- PLUGIN UPLOAD & INSTALL ---
router.post('/plugins/upload', upload.single('plugin_file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const zipPath = req.file.path;

    try {
        const zip = new AdmZip(zipPath);
        const zipEntries = zip.getEntries();

        // 1. Validação: Procura manifest.json
        const manifestEntry = zipEntries.find(entry => entry.entryName === 'manifest.json');
        if (!manifestEntry) {
            throw new Error('Arquivo manifest.json não encontrado no ZIP.');
        }

        const manifestContent = manifestEntry.getData().toString('utf8');
        let manifest;
        try {
            manifest = JSON.parse(manifestContent);
        } catch (e) {
            throw new Error('manifest.json inválido (Erro de sintaxe JSON).');
        }

        // Valida campos obrigatórios do manifesto
        if (!manifest.id || !manifest.name || !manifest.version) {
            throw new Error('Manifesto inválido. Campos id, name e version são obrigatórios.');
        }

        // Validação de Segurança do ID (apenas letras, numeros, hifens e underscores)
        if (!/^[a-z0-9-_]+$/.test(manifest.id)) {
            throw new Error('ID do plugin inválido. Use apenas letras minúsculas, números, hifens e underscores.');
        }

        // Verifica se o entry_point existe no zip
        const entryFile = manifest.entry_point || 'index.html';
        const entryExists = zipEntries.some(entry => entry.entryName === entryFile);
        if (!entryExists) {
            throw new Error(`Arquivo de entrada '${entryFile}' não encontrado no ZIP.`);
        }

        // 2. Extração para pasta pública
        const targetDir = path.join(PLUGINS_DIR, manifest.id);
        
        // Remove versão anterior se existir (Update Limpo)
        if (fs.existsSync(targetDir)) {
            fs.rmSync(targetDir, { recursive: true, force: true });
        }
        fs.mkdirSync(targetDir, { recursive: true });
        
        zip.extractAllTo(targetDir, true);

        // 3. Execução de SQL (Auto-Migration)
        const sqlEntry = zipEntries.find(entry => entry.entryName === 'install.sql');
        if (sqlEntry) {
            const sqlContent = sqlEntry.getData().toString('utf8');
            // Executa o script SQL. ATENÇÃO: Risco de segurança. Em prod, validar comandos permitidos.
            try {
                await query('BEGIN');
                await query(sqlContent);
                await query('COMMIT');
                console.log(`[Plugin Manager] SQL executado para: ${manifest.id}`);
            } catch (sqlErr) {
                await query('ROLLBACK');
                console.error(`[Plugin Manager] Falha no SQL do plugin ${manifest.id}:`, sqlErr);
                throw new Error(`Erro ao executar install.sql: ${sqlErr.message}`);
            }
        }

        // 4. Registro no Banco de Dados (Upsert)
        const config = manifest.config || {};
        
        // Sanitiza entry_point para evitar directory traversal
        const safeEntryFile = entryFile.replace(/^(\.\.(\/|\\|$))+/, ''); 
        const entryPointPath = `/plugins/${manifest.id}/${safeEntryFile}`;

        await query(
            `INSERT INTO plugins (id, name, description, version, icon, category, price, status, config, entry_point)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'installed', $8, $9)
             ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                version = EXCLUDED.version,
                icon = EXCLUDED.icon,
                config = COALESCE(EXCLUDED.config, plugins.config), -- Mantém config se não enviado
                entry_point = EXCLUDED.entry_point,
                updated_at = CURRENT_TIMESTAMP`,
            [
                manifest.id, 
                manifest.name, 
                manifest.description || '', 
                manifest.version, 
                manifest.icon || '🧩', 
                manifest.category || 'utility', 
                manifest.price || 0.00,
                JSON.stringify(config),
                entryPointPath
            ]
        );

        // Limpeza do arquivo temp
        fs.unlinkSync(zipPath);

        res.json({ success: true, message: `Plugin ${manifest.name} (v${manifest.version}) instalado com sucesso!` });

    } catch (err) {
        // Limpa arquivo temporário em caso de erro
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        console.error("Plugin Upload Error:", err);
        res.status(500).json({ message: "Erro ao instalar plugin: " + err.message });
    }
});

// --- PLUGINS CRUD ---

// LISTAR (Com agregação de Planos)
router.get('/plugins', async (req, res) => {
  try {
    const queryText = `
        SELECT p.*, 
               COALESCE(json_agg(pp.plan_id) FILTER (WHERE pp.plan_id IS NOT NULL), '[]') as allowed_plans
        FROM plugins p
        LEFT JOIN plan_plugins pp ON p.id = pp.plugin_id
        GROUP BY p.id
        ORDER BY p.name
    `;
    const result = await query(queryText);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETAR (Remove DB + Arquivos)
router.delete('/plugins/:id', async (req, res) => {
    const { id } = req.params;
    
    // Validação de segurança básica do ID para path
    if (!/^[a-z0-9-_]+$/.test(id)) {
        return res.status(400).json({ message: "ID de plugin inválido." });
    }

    try {
        await query('DELETE FROM plugins WHERE id = $1', [id]);
        
        // Remove arquivos do disco
        const targetDir = path.join(PLUGINS_DIR, id);
        if (fs.existsSync(targetDir)) {
            fs.rmSync(targetDir, { recursive: true, force: true });
        }

        res.json({ message: 'Plugin removido com sucesso' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ATUALIZAR STATUS
router.patch('/plugins/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await query('UPDATE plugins SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ATUALIZAR CONFIG (JSON)
router.patch('/plugins/:id/config', async (req, res) => {
    const { id } = req.params;
    const { config } = req.body;
    try {
        await query('UPDATE plugins SET config = $1 WHERE id = $2', [JSON.stringify(config), id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GERENCIAR ASSOCIAÇÃO COM PLANOS (Pivot Table)
router.post('/plugins/:id/toggle-plan', async (req, res) => {
    const { id } = req.params; // Plugin ID
    const { plan_id } = req.body;
    
    if (!plan_id) return res.status(400).json({ message: "Plan ID required" });

    try {
        const check = await query('SELECT * FROM plan_plugins WHERE plan_id = $1 AND plugin_id = $2', [plan_id, id]);
        
        if (check.rows.length > 0) {
            // Se existe, remove (Detach)
            await query('DELETE FROM plan_plugins WHERE plan_id = $1 AND plugin_id = $2', [plan_id, id]);
            res.json({ success: true, active: false });
        } else {
            // Se não existe, cria (Attach)
            await query('INSERT INTO plan_plugins (plan_id, plugin_id) VALUES ($1, $2)', [plan_id, id]);
            res.json({ success: true, active: true });
        }
    } catch(err) { res.status(500).json({ error: err.message }); }
});

// --- USERS ROUTES (Existing) ---
router.get('/users', async (req, res) => {
  try {
    const result = await query(`
        SELECT id, name, email, role, created_at, 
               status, phone, last_login 
        FROM users 
        ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  const { name, email, role, password, phone, status } = req.body;
  
  try {
    const pwd = password || '123456';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pwd, salt);
    
    const result = await query(
        'INSERT INTO users (name, email, role, password_hash, phone, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, email, role, hash, phone, status || 'active']
    );
    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password, phone, status } = req.body;
  
  try {
    const updates = [];
    const values = [];
    let idx = 1;

    updates.push(`name = $${idx++}`); values.push(name);
    updates.push(`email = $${idx++}`); values.push(email);
    updates.push(`role = $${idx++}`); values.push(role);
    updates.push(`phone = $${idx++}`); values.push(phone);
    updates.push(`status = $${idx++}`); values.push(status);

    if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        updates.push(`password_hash = $${idx++}`);
        values.push(hash);
    }
    values.push(id);
    const queryText = `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await query(queryText, values);
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Usuário não encontrado" });
    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/users/:id/subscription', async (req, res) => {
    const { id } = req.params;
    const { plan_id } = req.body;
    if (!plan_id) return res.status(400).json({ message: "Plan ID is required" });
    try {
        const existing = await query('SELECT * FROM subscriptions WHERE user_id = $1', [id]);
        if (existing.rows.length > 0) {
            await query(
                `UPDATE subscriptions 
                 SET plan_id = $1, status = 'active', end_date = GREATEST(end_date, CURRENT_DATE + INTERVAL '30 days')
                 WHERE user_id = $2`,
                [plan_id, id]
            );
        } else {
            await query(
                `INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date) 
                 VALUES ($1, $2, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days')`,
                [id, plan_id]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/users/:id/payments', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query(`
            SELECT p.* FROM payments p JOIN subscriptions s ON p.subscription_id = s.id
            WHERE s.user_id = $1 ORDER BY p.payment_date DESC
        `, [id]);
        res.json(result.rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/users/:id/impersonate', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUBSCRIPTIONS, PLANS, PAYMENTS, LOGS ---
router.get('/subscriptions', async (req, res) => {
  try {
    const result = await query('SELECT * FROM subscriptions');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/subscriptions/:id/date', async (req, res) => {
    const { id } = req.params;
    const { end_date } = req.body;
    try {
        await query('UPDATE subscriptions SET end_date = $1 WHERE id = $2', [end_date, id]);
        res.json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

router.get('/plans', async (req, res) => {
  try {
    const result = await query('SELECT * FROM plans ORDER BY price ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/plans', async (req, res) => {
    const { id, name, price, description, token_limit } = req.body;
    try {
        const result = await query(
            'INSERT INTO plans (id, name, price, description, token_limit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, name, price, description, token_limit || 10000]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/plans/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description, token_limit } = req.body;
    try {
        const result = await query(
            'UPDATE plans SET name = $1, price = $2, description = $3, token_limit = $4 WHERE id = $5 RETURNING *',
            [name, price, description, token_limit, id]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/plans/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const subCheck = await query('SELECT * FROM subscriptions WHERE plan_id = $1 LIMIT 1', [id]);
        if (subCheck.rows.length > 0) return res.status(400).json({ message: 'Existem assinaturas ativas neste plano.' });
        await query('DELETE FROM plans WHERE id = $1', [id]);
        res.json({ message: 'Plano removido com sucesso' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/payments', async (req, res) => {
  try {
    const result = await query('SELECT * FROM payments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/payments', async (req, res) => {
  const { subscription_id, amount, payment_date, reference_id, notes } = req.body;
  // Segurança: Ignora o admin_recorded_by vindo do frontend e usa o token JWT
  const admin_recorded_by = req.user.id;

  try {
    await query('BEGIN'); 
    const payResult = await query(
      `INSERT INTO payments (subscription_id, amount, payment_date, reference_id, notes, admin_recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [subscription_id, amount, payment_date, reference_id, notes, admin_recorded_by]
    );
    await query(
      `UPDATE subscriptions SET status = 'active', end_date = GREATEST(end_date, CURRENT_DATE) + INTERVAL '30 days' WHERE id = $1`,
      [subscription_id]
    );
    await query('COMMIT');
    res.json(payResult.rows[0]);
  } catch (err) {
    await query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const result = await query('SELECT * FROM requests_log ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;