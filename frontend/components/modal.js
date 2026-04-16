export const showModal = (title, content) => {
    const existing = document.getElementById('app-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'app-modal';
    modal.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;';
    modal.innerHTML = `
        <div style="background:var(--bg-main);border-radius:12px;padding:24px;width:100%;max-width:320px;">
            <h3 style="margin-bottom:16px;">${title}</h3>
            <div>${content}</div>
            <button class="btn-primary" style="margin-top:16px;" onclick="document.getElementById('app-modal').remove()">Close</button>
        </div>
    `;
    document.getElementById('app').appendChild(modal);
};