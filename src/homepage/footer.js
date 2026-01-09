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
        statusClosedWednesday: 'Cerrado (miércoles)',
        scheduleDaysOpen: 'Lun-Mar, Jue-Dom',
        scheduleTime: '11:30 - 19:00',
        scheduleDayClosed: 'Miércoles',
        scheduleClosedLabel: 'Cerrado',
        whatsappMessage: 'Hola! Me gustaría hacer un pedido:'
    },
    pt: {
        contactTitle: 'Contato',
        hoursTitle: 'Horário',
        locationTitle: 'Localização',
        phone: '+591 72622036',
        location: 'Em frente à rotatória Itacamba, Puerto Quijarro',
        statusOpen: 'Aberto agora',
        statusClosed: 'Fechado agora',
        statusClosedWednesday: 'Fechado (quarta-feira)',
        scheduleDaysOpen: 'Seg-Ter, Qui-Dom',
        scheduleTime: '11:30 - 19:00',
        scheduleDayClosed: 'Quarta-feira',
        scheduleClosedLabel: 'Fechado',
        whatsappMessage: 'Olá! Gostaria de fazer um pedido:'
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
    
    // Quarta-feira = fechado
    if (day === 3) {
        statusIndicator.classList.remove('open');
        statusIndicator.classList.add('closed');
        statusDot.classList.remove('open');
        statusDot.classList.add('closed');
        statusLabel.textContent = t.statusClosedWednesday;
        return;
    }
    
    // Verificar horário
    if (currentTime >= openTime && currentTime < closeTime) {
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
    }
    
    // Horários
    const scheduleOpen = document.getElementById('scheduleOpen');
    if (scheduleOpen) {
        const days = scheduleOpen.querySelector('.schedule-days');
        const time = scheduleOpen.querySelector('.schedule-time');
        if (days) days.textContent = t.scheduleDaysOpen;
        if (time) time.textContent = t.scheduleTime;
    }
    
    const scheduleClosed = document.getElementById('scheduleClosed');
    if (scheduleClosed) {
        const days = scheduleClosed.querySelector('.schedule-days');
        const time = scheduleClosed.querySelector('.schedule-time');
        if (days) days.textContent = t.scheduleDayClosed;
        if (time) time.textContent = t.scheduleClosedLabel;
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
