const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔧 Iniciando configuração do banco de dados...');
    console.log('═══════════════════════════════════════════════════\n');

    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('✓ Conectado ao MySQL');

        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        await connection.query(schema);
        console.log('✓ Schema criado com sucesso');

        await connection.query(`USE ${process.env.DB_NAME}`);

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

        console.log('✓ Usuário administrativo criado/atualizado');

        const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
        if (fs.existsSync(seedPath)) {
            const shouldSeed = process.argv.includes('--seed');
            if (shouldSeed) {
                const seed = fs.readFileSync(seedPath, 'utf8');
                await connection.query(seed);
                console.log('✓ Dados de exemplo inseridos');
            }
        }

        console.log('\n═══════════════════════════════════════════════════');
        console.log('✅ Configuração concluída com sucesso!');
        console.log('═══════════════════════════════════════════════════');
        console.log('\nCredenciais de acesso:');
        console.log(`Email: ${process.env.ADMIN_EMAIL || 'admin@restaurante.com'}`);
        console.log(`Senha: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
        console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
        console.log('═══════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n✗ Erro durante a configuração:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();
