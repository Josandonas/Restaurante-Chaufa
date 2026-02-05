// ==================== FOOTER LOGIC ====================

// Traduções do footer
export const footerTranslations = {
    es: {
        contactTitle: 'Contacto',
        hoursTitle: 'Horario',
        locationTitle: 'Ubicación',
        phone: '+591 72622036',
        location: 'Frente a la rotonda Itacamba, Puerto Quijarro',
        statusOpen: 'Abierto ahora',
        statusClosed: 'Cerrado ahora',
        scheduleDaysOpen: 'Lunes a Domingo',
        scheduleTime: '11:30 - 19:00',
        scheduleDaysClosed: 'Miércoles',
        scheduleTimeClosed: 'Cerrado',
        whatsappMessage: 'Hola! Me gustaría hacer un pedido:',
        whatsappButtonText: 'Pide Aquí'
    },
    pt: {
        contactTitle: 'Contato',
        hoursTitle: 'Horário',
        locationTitle: 'Localização',
        phone: '+591 72622036',
        location: 'Em frente à rotatória Itacamba, Puerto Quijarro',
        statusOpen: 'Aberto agora',
        statusClosed: 'Fechado agora',
        scheduleDaysOpen: 'Segunda a Domingo',
        scheduleTime: '11:30 - 19:00',
        scheduleDaysClosed: 'Quarta-feira',
        scheduleTimeClosed: 'Fechado',
        whatsappMessage: 'Olá! Gostaria de fazer um pedido:',
        whatsappButtonText: 'Peça Aqui'
    }
};

// Verificar se o restaurante está aberto
export function checkBusinessHours(currentLang) {
    const t = footerTranslations[currentLang];
    
    // Obter hora atual em Bolivia (UTC-4)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/La_Paz',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        weekday: 'short'
    });
    
    const parts = formatter.formatToParts(now);
    const hours = parseInt(parts.find(p => p.type === 'hour').value);
    const minutes = parseInt(parts.find(p => p.type === 'minute').value);
    const weekday = parts.find(p => p.type === 'weekday').value;
    
    const dayMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const day = dayMap[weekday];
    const currentTime = hours + minutes / 60;
    
    const openTime = 11.5; // 11:30
    const closeTime = 19; // 19:00
    
    const statusIndicator = document.getElementById('statusIndicator');
    const statusDot = document.getElementById('statusDot');
    const statusLabel = document.getElementById('statusLabel');
    
    if (!statusIndicator || !statusDot || !statusLabel) return;
    
    // Quarta-feira (dia 3) = FECHADO
    if (day === 3) {
        statusIndicator.classList.remove('open');
        statusIndicator.classList.add('closed');
        statusDot.classList.remove('open');
        statusDot.classList.add('closed');
        statusLabel.textContent = t.statusClosed;
    }
    // Outros dias: verificar horário
    else if (currentTime >= openTime && currentTime < closeTime) {
        statusIndicator.classList.remove('closed');
        statusIndicator.classList.add('open');
        statusDot.classList.remove('closed');
        statusDot.classList.add('open');
        statusLabel.textContent = t.statusOpen;
    } else {
        statusIndicator.classList.remove('open');
        statusIndicator.classList.add('closed');
        statusDot.classList.remove('open');
        statusDot.classList.add('closed');
        statusLabel.textContent = t.statusClosed;
    }
}

// Atualizar textos do footer
export function updateFooterLanguage(currentLang) {
    const t = footerTranslations[currentLang];
    
    // Títulos
    const contactTitle = document.getElementById('footerContactTitle');
    if (contactTitle) contactTitle.textContent = t.contactTitle;
    
    const hoursTitle = document.getElementById('footerHoursTitle');
    if (hoursTitle) hoursTitle.textContent = t.hoursTitle;
    
    const locationTitle = document.getElementById('footerLocationTitle');
    if (locationTitle) locationTitle.textContent = t.locationTitle;
    
    // Telefone
    const footerPhoneText = document.getElementById('footerPhoneText');
    if (footerPhoneText) footerPhoneText.textContent = t.phone;
    
    // WhatsApp links
    const whatsappMsg = encodeURIComponent(t.whatsappMessage);
    const footerPhoneLink = document.getElementById('footerPhone');
    if (footerPhoneLink) {
        footerPhoneLink.href = `https://wa.me/59172622036?text=${whatsappMsg}`;
    }
    
    const whatsappFab = document.getElementById('whatsappFab');
    if (whatsappFab) {
        whatsappFab.href = `https://wa.me/59172622036?text=${whatsappMsg}`;
        
        // Atualizar texto do botão
        const whatsappFabText = whatsappFab.querySelector('.whatsapp-fab-text');
        if (whatsappFabText) {
            whatsappFabText.textContent = t.whatsappButtonText;
        }
    }
    
    // Horários
    const scheduleOpen = document.getElementById('scheduleOpen');
    if (scheduleOpen) {
        const days = scheduleOpen.querySelector('.schedule-days');
        const time = scheduleOpen.querySelector('.schedule-time');
        if (days) days.textContent = t.scheduleDaysOpen;
        if (time) time.textContent = t.scheduleTime;
    }
    
    // Horário fechado (quarta-feira)
    const scheduleClosed = document.getElementById('scheduleClosed');
    if (scheduleClosed) {
        const days = scheduleClosed.querySelector('.schedule-days');
        const time = scheduleClosed.querySelector('.schedule-time');
        if (days) days.textContent = t.scheduleDaysClosed;
        if (time) time.textContent = t.scheduleTimeClosed;
    }
    
    // Localização
    const footerLocationText = document.getElementById('footerLocationText');
    if (footerLocationText) footerLocationText.textContent = t.location;
    
    // Atualizar status
    checkBusinessHours(currentLang);
}

// Inicializar footer
export function initFooter(currentLang) {
    updateFooterLanguage(currentLang);
    
    // Atualizar status a cada minuto
    setInterval(() => checkBusinessHours(currentLang), 60000);
}
