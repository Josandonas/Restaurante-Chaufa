const autoSetup = require('./auto-setup');
const { spawn } = require('child_process');
const path = require('path');

async function serve() {
    console.log('═══════════════════════════════════════════════════');
    console.log('🚀 Iniciando La Casa del Chaufa - Cardápio Online');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    try {
        await autoSetup();
        
        console.log('');
        console.log('═══════════════════════════════════════════════════');
        console.log('✓ Verificação concluída! Iniciando servidor...');
        console.log('═══════════════════════════════════════════════════');
        console.log('');

        const serverPath = path.join(__dirname, '..', 'server.js');
        const server = spawn('node', [serverPath], {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });

        server.on('error', (error) => {
            console.error('Erro ao iniciar servidor:', error);
            process.exit(1);
        });

        server.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Servidor encerrado com código ${code}`);
                process.exit(code);
            }
        });

        process.on('SIGINT', () => {
            console.log('\n\nEncerrando servidor...');
            server.kill('SIGINT');
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            server.kill('SIGTERM');
            process.exit(0);
        });

    } catch (error) {
        console.error('\n✗ Erro durante a inicialização:', error.message);
        console.error('\nVerifique:');
        console.error('  1. Se o MySQL está rodando');
        console.error('  2. Se as credenciais no .env estão corretas');
        console.error('  3. Se o usuário do MySQL tem permissões adequadas');
        console.error('');
        process.exit(1);
    }
}

serve();
