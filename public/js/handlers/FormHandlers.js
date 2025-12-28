// Handlers de Formulários
import authController from '../controllers/AuthController.js';
import userController from '../controllers/UserController.js';
import dishController from '../controllers/DishController.js';
import categoryController from '../controllers/CategoryController.js';

class FormHandlers {
    init() {
        this.setupLoginForm();
        this.setupPasswordForm();
        this.setupDishForm();
        this.setupImageUpload();
        this.setupPhotoInput();
        this.setupCategoryForm();
    }

    setupLoginForm() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const senha = document.getElementById('loginPassword').value;
                const rememberMe = document.getElementById('rememberMe').checked;
                await authController.handleLogin(email, senha, rememberMe);
            });
        }
    }

    setupPasswordForm() {
        const form = document.getElementById('passwordForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const senhaAtual = document.getElementById('senhaAtual').value;
                const novaSenha = document.getElementById('novaSenha').value;
                const confirmarSenha = document.getElementById('confirmarSenha').value;
                await userController.handlePasswordChange(senhaAtual, novaSenha, confirmarSenha);
            });
        }
    }

    setupDishForm() {
        const form = document.getElementById('dishForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData();
                const dishId = document.getElementById('dishId').value;
                
                formData.append('tipo', document.getElementById('dishTipo').value);
                formData.append('nome_pt', document.getElementById('nomePt').value);
                formData.append('nome_es', document.getElementById('nomeEs').value);
                formData.append('descricao_pt', document.getElementById('descricaoPt').value);
                formData.append('descricao_es', document.getElementById('descricaoEs').value);
                
                // Garantir que precoBrl tenha valor (mesmo sendo readonly)
                const precoBrl = document.getElementById('precoBrl').value;
                const precoBob = document.getElementById('precoBob').value;
                formData.append('preco_brl', precoBrl || '0');
                formData.append('preco_bob', precoBob);
                formData.append('ativo', document.getElementById('ativo').checked ? 1 : 0);
                
                const categoriaId = document.getElementById('categoriaId').value;
                if (categoriaId) {
                    formData.append('categoria_id', categoriaId);
                }
                
                if (document.getElementById('dishTipo').value === 'destaque') {
                    formData.append('ordem', document.getElementById('ordem').value);
                }
                
                const imageInput = document.getElementById('imagem');
                if (imageInput && imageInput.files && imageInput.files[0]) {
                    formData.append('imagem', imageInput.files[0]);
                }
                
                // Se marcou para remover imagem
                if (dishController.shouldRemoveImage) {
                    formData.append('remover_imagem', '1');
                }
                
                await dishController.handleDishSubmit(formData, dishId);
            });
        }
    }

    setupImageUpload() {
        const input = document.getElementById('imagem');
        if (input) {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    dishController.handleImagePreview(file);
                }
            });
        }
    }

    setupPhotoInput() {
        const input = document.getElementById('photoInput');
        if (input) {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    userController.previewPhoto(file);
                }
            });
        }
    }

    setupCategoryForm() {
        const form = document.getElementById('categoryForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                categoryController.handleCategorySubmit(e);
            });
        }
    }
}

export default new FormHandlers();
