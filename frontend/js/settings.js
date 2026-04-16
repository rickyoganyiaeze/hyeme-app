import router from './router.js';
const API_BASE = 'https://hyeme-app.onrender.com/api';

export const initSettings = () => {
    const token = localStorage.getItem('hyeme_token');
    
    const storedUser = JSON.parse(localStorage.getItem('hyeme_user'));
    const displayName = storedUser?.name || localStorage.getItem('hyeme_name') || 'User';
    const displayAbout = storedUser?.about || localStorage.getItem('hyeme_about') || 'Hey there! I am using HyeMe.';
    const displayAvatar = storedUser?.avatar || localStorage.getItem('hyeme_avatar');

    if (displayName) {
        const nameEl = document.getElementById('settings-user-name');
        if (nameEl) nameEl.textContent = displayName;
        
        const avatarEl = document.getElementById('settings-user-avatar');
        if (avatarEl) {
            if (displayAvatar && displayAvatar !== "null" && displayAvatar.trim() !== "") {
                avatarEl.innerHTML = `<img src="${displayAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">`;
                avatarEl.style.background = 'transparent';
            } else {
                avatarEl.textContent = displayName.charAt(0).toUpperCase();
                avatarEl.style.background = 'var(--primary-light)';
                avatarEl.style.color = 'white';
            }
        }
    }
    
    const aboutEl = document.getElementById('settings-user-about');
    if(aboutEl) aboutEl.textContent = displayAbout;

    const items = document.querySelectorAll('.settings-item[data-page]');
    items.forEach(item => {
        item.addEventListener('click', () => router.navigate(`settings/${item.dataset.page}`));
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    const backBtn = document.getElementById('back-to-chats-from-settings');
    if (backBtn) backBtn.addEventListener('click', () => router.navigate('main/chats'));
};

export const initThemeSettings = () => {
    const darkToggle = document.getElementById('dark-toggle');
    if(darkToggle) {
        if (document.documentElement.getAttribute('data-theme') === 'dark') darkToggle.checked = true;
        darkToggle.addEventListener('change', (e) => {
            document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
        });
    }
    
    // Back Buttons Logic
    const backBtns = document.querySelectorAll('[id^="back-settings"]');
    backBtns.forEach(btn => {
        if(btn.id !== 'save-profile-btn') {
            btn.addEventListener('click', () => router.navigate('settings/settings'));
        }
    });
    
    // --- PROFILE PAGE EDIT LOGIC ---
    const editName = document.getElementById('edit-user-name');
    const editAbout = document.getElementById('edit-user-about');
    if(editName) editName.value = localStorage.getItem('hyeme_name') || '';
    if(editAbout) editAbout.value = localStorage.getItem('hyeme_about') || '';

    // Load Current Avatar
    const editAvatarImg = document.getElementById('edit-avatar-img');
    const editAvatarIcon = document.getElementById('edit-avatar-icon');
    const storedUser = JSON.parse(localStorage.getItem('hyeme_user'));
    const currentAvatarUrl = storedUser?.avatar || localStorage.getItem('hyeme_avatar');
    
    if (currentAvatarUrl && currentAvatarUrl !== "null" && currentAvatarUrl.trim() !== "") {
        if (editAvatarImg) {
            editAvatarImg.src = currentAvatarUrl;
            editAvatarImg.style.display = 'block';
        }
        if (editAvatarIcon) editAvatarIcon.style.display = 'none';
    } else {
        if (editAvatarImg) editAvatarImg.style.display = 'none';
        if (editAvatarIcon) editAvatarIcon.style.display = 'block';
    }

    const saveProfile = document.getElementById('save-profile-btn');
    
    if (saveProfile) {
        saveProfile.type = 'button'; 
        
        saveProfile.addEventListener('click', async function(e) {
            // 1. Prevent Default immediately
            e.preventDefault();
            e.stopPropagation();

            // 2. Show Loading State directly on the button (No Modal)
            const originalText = saveProfile.textContent;
            saveProfile.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Saving...';
            saveProfile.disabled = true;
            saveProfile.style.opacity = '0.7';

            try {
                // 3. GET DATA READY
                const token = localStorage.getItem('hyeme_token');
                const fileInput = document.getElementById('edit-avatar-upload');

                const formData = new FormData();
                formData.append('name', editName.value);
                formData.append('about', editAbout.value);

                if (fileInput && fileInput.files[0]) {
                    formData.append('avatar', fileInput.files[0]);
                }

                // 4. SEND REQUEST
                const res = await fetch(`${API_BASE}/users/onboard`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    
                    // 5. UPDATE LOCAL STORAGE IMMEDIATELY
                    if (data.user) {
                        localStorage.setItem('hyeme_user', JSON.stringify(data.user));
                        localStorage.setItem('hyeme_name', data.user.name);
                        localStorage.setItem('hyeme_about', data.user.about);
                        if(data.user.avatar) localStorage.setItem('hyeme_avatar', data.user.avatar);
                    }

                    // 6. SUCCESS STATE (Show Done briefly)
                    saveProfile.style.background = '#10B981'; // Green
                    saveProfile.innerHTML = '<i class="fas fa-check"></i> Saved';
                    
                    // Wait 1 second so they see "Saved", then navigate back
                    setTimeout(() => {
                        router.navigate('settings/settings');
                    }, 1000);

                } else {
                    throw new Error("Server Error");
                }

            } catch (err) {
                console.error(err);
                // Error State
                saveProfile.innerHTML = 'Error';
                saveProfile.style.background = '#EF4444'; // Red
                
                // Reset after 2 seconds so they can try again
                setTimeout(() => {
                    saveProfile.disabled = false;
                    saveProfile.style.background = ''; 
                    saveProfile.style.opacity = '1';
                    saveProfile.textContent = originalText;
                }, 2000);
            }
        });
    }
    
    // --- AVATAR PREVIEW ---
    const avatarUpload = document.getElementById('edit-avatar-upload');
    if(avatarUpload) {
        avatarUpload.addEventListener('change', (e) => {
            e.preventDefault();
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if(editAvatarImg) editAvatarImg.src = ev.target.result;
                    if(editAvatarImg) editAvatarImg.style.display = 'block';
                    if(editAvatarIcon) editAvatarIcon.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }
};

// Helper function for custom notification
function showToast(message) {
    const existingToast = document.querySelector('.custom-toast');
    if(existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.textContent = message;
    toast.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:12px 24px;border-radius:24px;font-size:14px;z-index:1000;animation:fadein 0.5s;white-space:nowrap;`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeout 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

if (!document.getElementById('toast-anims')) {
    const style = document.createElement('style');
    style.id = 'toast-anims';
    style.innerHTML = `@keyframes fadein {from{bottom:0;opacity:0;}to{bottom:80px;opacity:1;}} @keyframes fadeout {from{bottom:80px;opacity:1;}to{bottom:0;opacity:0;}}`;
    document.head.appendChild(style);
}