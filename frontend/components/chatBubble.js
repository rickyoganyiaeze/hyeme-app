export const createChatBubble = (message, isMe) => {
    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${isMe ? 'msg-me' : 'msg-them'}`;

    let statusIcon = '';
    if (isMe) {
        // FIX: Mapped backend status ('grey', 'white') to CSS classes
        let eyeClass = 'eye-black'; // Default/sent
        if (message.status === 'grey') eyeClass = 'eye-grey'; // Delivered
        if (message.status === 'white') eyeClass = 'eye-white'; // Seen

        const time = message.time || (message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '');

        statusIcon = `
            <div class="msg-status">
                <i class="fas fa-eye ${eyeClass}"></i> ${time}
            </div>
        `;
    }

    bubble.innerHTML = `
        ${message.replyTo ? `<div style="font-size:11px;border-left:2px solid var(--primary);padding-left:6px;margin-bottom:4px;opacity:0.8;">${message.replyTo}</div>` : ''}
        <div>${message.content}</div>
        ${statusIcon}
    `;
    return bubble;
};