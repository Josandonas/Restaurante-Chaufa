const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function autoSetup() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        const dbName = process.env.DB_NAME;

        const [databases] = await connection.query(
            'SHOW DATABASES LIKE ?',
            [dbName]
        );

        if (databases.length === 0) {
            console.log('🔧 Banco de dados não encontrado. Criando estrutura...');
            
            const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            await connection.query(schema);
            
            await connection.query(`USE ${dbName}`);

            const hashedPassword = await bcrypt.hash(
                process.env.ADMIN_PASSWORD || 'Admin@123',
                10
            );

            await connection.query(
                'INSERT INTO usuarios (email, nome, senha, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE senha = ?, role = ?',
                [
                    process.env.ADMIN_EMAIL || 'admin@restaurante.com',
                    'Administrador',
                    hashedPassword,
                    'admin',
                    hashedPassword,
                    'admin'
                ]
            );

            // Executar seed de dados iniciais
            const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
            if (fs.existsSync(seedPath)) {
                const seedSQL = fs.readFileSync(seedPath, 'utf8');
                await connection.query(seedSQL);
                console.log('✓ Dados iniciais (categorias e pratos) inseridos');
            }

            // Executar procedures
            const proceduresPath = path.join(__dirname, '..', 'database', 'procedures.sql');
            if (fs.existsSync(proceduresPath)) {
                const proceduresSQL = fs.readFileSync(proceduresPath, 'utf8');
                await connection.query(proceduresSQL);
                console.log('✓ Procedures de câmbio criadas');
            }

            console.log('✓ Banco de dados criado com sucesso');
            console.log('✓ Usuário administrativo configurado');
            console.log('');
        } else {
            await connection.query(`USE ${dbName}`);

            const [tables] = await connection.query(
                "SHOW TABLES LIKE 'usuarios'"
            );

            if (tables.length === 0) {
                console.log('🔧 Tabelas não encontradas. Criando estrutura...');
                
                const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
                const schema = fs.readFileSync(schemaPath, 'utf8');
                
                await connection.query(schema);

                const hashedPassword = await bcrypt.hash(
                    process.env.ADMIN_PASSWORD || 'Admin@123',
                    10
                );

                await connection.query(
                    'INSERT INTO usuarios (email, nome, senha, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE senha = ?, role = ?',
                    [
                        process.env.ADMIN_EMAIL || 'admin@restaurante.com',
                        'Administrador',
                        hashedPassword,
                        'admin',
                        hashedPassword,
                        'admin'
                    ]
                );

                // Executar seed de dados iniciais
                const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
                if (fs.existsSync(seedPath)) {
                    const seedSQL = fs.readFileSync(seedPath, 'utf8');
                    await connection.query(seedSQL);
                    console.log('✓ Dados iniciais (categorias e pratos) inseridos');
                }

                console.log('✓ Estrutura do banco criada com sucesso');
            } else {
                console.log('✓ Estrutura do banco de dados já existe');
            }
        }

        const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('✓ Diretório de uploads criado');
        }

    } catch (error) {
        console.error('✗ Erro durante o auto-setup:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

module.exports = autoSetup;
