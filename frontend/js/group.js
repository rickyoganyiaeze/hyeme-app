import router from './router.js';

export const initGroups = () => {
    const createBtn = document.querySelector('.btn-primary');
    if (createBtn && createBtn.textContent.includes('Create Group')) {
        createBtn.addEventListener('click', () => alert("Create Group Clicked"));
    }
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => router.navigate('main/chatView'));
    });
};