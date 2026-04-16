export const showLoader = () => {
    document.getElementById('app').insertAdjacentHTML('beforeend', `
        <div id="app-loader" style="position:absolute;inset:0;background:var(--bg-main);display:flex;align-items:center;justify-content:center;z-index:99;">
            <i class="fas fa-circle-notch fa-spin" style="font-size:32px;color:var(--primary);"></i>
        </div>
    `);
};

export const hideLoader = () => {
    const loader = document.getElementById('app-loader');
    if (loader) loader.remove();
};