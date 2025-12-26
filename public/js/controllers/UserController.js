// Controller de Usuário
import authService from '../services/AuthService.js';
import toast from '../utils/toast.js';
import loading from '../utils/loading.js';
import i18n from '../utils/i18n.js';

class UserController {
    constructor() {
        this.currentUser = null;
        this.selectedPhotoFile = null;
    }

    async loadProfile() {
        try {
            this.currentUser = await authService.getUserProfile();
            if (this.currentUser) {
                this.updateUI();
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        }
    }

    updateUI() {
        if (!this.currentUser) return;

        const avatarUrl = this.currentUser.foto_perfil || 
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e0e0e0" width="100" height="100"/%3E%3Ccircle cx="50" cy="35" r="15" fill="%23999"/%3E%3Cpath d="M 30 70 Q 50 55 70 70" fill="%23999"/%3E%3C/svg%3E';
        
        const elements = {
            userAvatar: document.getElementById('userAvatar'),
            userAvatarMenu: document.getElementById('userAvatarMenu'),
            photoPreview: document.getElementById('photoPreview'),
            userEmailDisplay: document.getElementById('userEmailDisplay'),
            userEmailMenu: document.getElementById('userEmailMenu'),
            userNameMenu: document.getElementById('userNameMenu')
        };

        if (elements.userAvatar) elements.userAvatar.src = avatarUrl;
        if (elements.userAvatarMenu) elements.userAvatarMenu.src = avatarUrl;
        if (elements.photoPreview) elements.photoPreview.src = avatarUrl;
        if (elements.userEmailDisplay) elements.userEmailDisplay.textContent = this.currentUser.email;
        if (elements.userEmailMenu) elements.userEmailMenu.textContent = this.currentUser.email;
        if (elements.userNameMenu) elements.userNameMenu.textContent = this.currentUser.nome;
    }

    toggleUserMenu() {
        const menu = document.getElementById('userDropdownMenu');
        const btn = document.getElementById('userProfileBtn');
        if (menu) menu.classList.toggle('active');
        if (btn) btn.classList.toggle('active');
    }

    openPasswordModal() {
        this.toggleUserMenu();
        const modal = document.getElementById('passwordModal');
        if (modal) modal.classList.add('active');
    }

    closePasswordModal() {
        const modal = document.getElementById('passwordModal');
        const form = document.getElementById('passwordForm');
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
    }

    async handlePasswordChange(senhaAtual, novaSenha, confirmarSenha) {
        if (novaSenha !== confirmarSenha) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (novaSenha.length < 6) {
            toast.error('A nova senha deve ter no mínimo 6 caracteres');
            return;
        }

        loading.show();
        try {
            const result = await authService.changePassword(senhaAtual, novaSenha);
            
            if (result.success) {
                toast.success(result.message || 'Senha alterada com sucesso!');
                this.closePasswordModal();
            } else {
                toast.error(result.error || 'Erro ao alterar senha');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('Erro ao alterar senha');
        } finally {
            loading.hide();
        }
    }

    openUploadPhotoModal() {
        this.toggleUserMenu();
        this.selectedPhotoFile = null;
        if (this.currentUser && this.currentUser.foto_perfil) {
            const preview = document.getElementById('photoPreview');
            if (preview) preview.src = this.currentUser.foto_perfil;
        }
        const modal = document.getElementById('uploadPhotoModal');
        if (modal) modal.classList.add('active');
    }

    closeUploadPhotoModal() {
        const modal = document.getElementById('uploadPhotoModal');
        const input = document.getElementById('photoInput');
        if (modal) modal.classList.remove('active');
        if (input) input.value = '';
        this.selectedPhotoFile = null;
    }

    previewPhoto(file) {
        if (file.size > 5 * 1024 * 1024) {
            toast.warning(
                i18n.getCurrentLanguage() === 'pt' 
                    ? 'Arquivo muito grande! Máximo 5MB.' 
                    : '¡Archivo muy grande! Máximo 5MB.'
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photoPreview');
            if (preview) preview.src = e.target.result;
            this.selectedPhotoFile = file;
        };
        reader.readAsDataURL(file);
    }

    async handlePhotoUpload() {
        if (!this.selectedPhotoFile) {
            toast.warning(
                i18n.getCurrentLanguage() === 'pt' 
                    ? 'Selecione uma foto primeiro!' 
                    : '¡Seleccione una foto primero!'
            );
            return;
        }

        loading.show();
        try {
            const result = await authService.uploadPhoto(this.selectedPhotoFile);
            
            if (result.success) {
                this.currentUser.foto_perfil = result.foto_perfil;
                this.updateUI();
                this.closeUploadPhotoModal();
                toast.success(
                    i18n.getCurrentLanguage() === 'pt' 
                        ? 'Foto atualizada com sucesso!' 
                        : '¡Foto actualizada con éxito!'
                );
            } else {
                toast.error(result.error || 'Erro ao fazer upload da foto');
            }
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            toast.error('Erro ao fazer upload da foto');
        } finally {
            loading.hide();
        }
    }
}

export default new UserController();
