export const createMessageInput = (containerId, sendCallback) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="msg-input-area">
            <button><i class="fas fa-face-smile"></i></button>
            <button><i class="fas fa-paperclip"></i></button>
            <input type="text" class="msg-input" placeholder="Message...">
            <button class="send-btn"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;

    const input = container.querySelector('.msg-input');
    const btn = container.querySelector('.send-btn');

    const triggerSend = () => {
        if (input.value.trim()) {
            sendCallback(input.value.trim());
            input.value = '';
        }
    };

    btn.addEventListener('click', triggerSend);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') triggerSend(); });
};