const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createProcedures() {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔧 Criando Stored Procedures de Câmbio');
    console.log('═══════════════════════════════════════════════════\n');

    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log('✓ Conectado ao MySQL');

        // Ler arquivo de procedures
        const proceduresPath = path.join(__dirname, '..', 'database', 'procedures.sql');
        
        if (!fs.existsSync(proceduresPath)) {
            throw new Error(`Arquivo não encontrado: ${proceduresPath}`);
        }

        const proceduresSQL = fs.readFileSync(proceduresPath, 'utf8');
        
        console.log('✓ Arquivo procedures.sql lido');
        console.log('\n🔄 Executando procedures...\n');

        // Executar SQL
        await connection.query(proceduresSQL);

        console.log('✓ Procedures criadas com sucesso!\n');
        console.log('Procedures disponíveis:');
        console.log('  1. atualizar_precos_brl()');
        console.log('  2. atualizar_taxa_cambio(nova_taxa, recalcular_precos)');
        console.log('  3. obter_taxa_cambio()');
        console.log('\n═══════════════════════════════════════════════════');
        console.log('✓ Processo concluído com sucesso!');
        console.log('═══════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n✗ Erro ao criar procedures:', error.message);
        console.error('\nVerifique:');
        console.error('  1. Se o MySQL está rodando');
        console.error('  2. Se as credenciais no .env estão corretas');
        console.error('  3. Se o banco de dados existe');
        console.error('  4. Se o usuário tem permissão para criar procedures');
        console.error('');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createProcedures();
