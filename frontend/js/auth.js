import router from './router.js';
const API_BASE = 'https://hyeme-app.onrender.com/api';

const countries = [
    { flag: '🇺🇸', name: 'United States', code: '1' },
    { flag: '🇬🇧', name: 'United Kingdom', code: '44' },
    { flag: '🇮🇳', name: 'India', code: '91' },
    { flag: '🇨🇦', name: 'Canada', code: '1' },
    { flag: '🇦🇺', name: 'Australia', code: '61' },
    { flag: '🇩🇪', name: 'Germany', code: '49' },
    { flag: '🇫🇷', name: 'France', code: '33' },
    { flag: '🇮🇹', name: 'Italy', code: '39' },
    { flag: '🇪🇸', name: 'Spain', code: '34' },
    { flag: '🇧🇷', name: 'Brazil', code: '55' },
    { flag: '🇲🇽', name: 'Mexico', code: '52' },
    { flag: '🇦🇷', name: 'Argentina', code: '54' },
    { flag: '🇳🇬', name: 'Nigeria', code: '234' },
    { flag: '🇿🇦', name: 'South Africa', code: '27' },
    { flag: '🇪🇬', name: 'Egypt', code: '20' },
    { flag: '🇰🇪', name: 'Kenya', code: '254' },
    { flag: '🇯🇵', name: 'Japan', code: '81' },
    { flag: '🇰🇷', name: 'South Korea', code: '82' },
    { flag: '🇨🇳', name: 'China', code: '86' },
    { flag: '🇷🇺', name: 'Russia', code: '7' },
    { flag: '🇹🇷', name: 'Turkey', code: '90' },
    { flag: '🇸🇦', name: 'Saudi Arabia', code: '966' },
    { flag: '🇦🇪', name: 'UAE', code: '971' },
    { flag: '🇮🇩', name: 'Indonesia', code: '62' },
    { flag: '🇵🇭', name: 'Philippines', code: '63' },
    { flag: '🇻🇳', name: 'Vietnam', code: '84' },
    { flag: '🇹🇭', name: 'Thailand', code: '66' },
    { flag: '🇲🇾', name: 'Malaysia', code: '60' },
    { flag: '🇸🇬', name: 'Singapore', code: '65' },
    { flag: '🇵🇰', name: 'Pakistan', code: '92' },
    { flag: '🇧🇩', name: 'Bangladesh', code: '880' },
    { flag: '🇳🇱', name: 'Netherlands', code: '31' },
    { flag: '🇧🇪', name: 'Belgium', code: '32' },
    { flag: '🇨🇭', name: 'Switzerland', code: '41' },
    { flag: '🇦🇹', name: 'Austria', code: '43' },
    { flag: '🇸🇪', name: 'Sweden', code: '46' },
    { flag: '🇳🇴', name: 'Norway', code: '47' },
    { flag: '🇩🇰', name: 'Denmark', code: '45' },
    { flag: '🇫🇮', name: 'Finland', code: '358' },
    { flag: '🇵🇱', name: 'Poland', code: '48' },
    { flag: '🇵🇹', name: 'Portugal', code: '351' },
    { flag: '🇬🇷', name: 'Greece', code: '30' },
    { flag: '🇮🇪', name: 'Ireland', code: '353' },
    { flag: '🇳🇿', name: 'New Zealand', code: '64' },
    { flag: '🇮🇱', name: 'Israel', code: '972' },
    { flag: '🇨🇱', name: 'Chile', code: '56' },
    { flag: '🇨🇴', name: 'Colombia', code: '57' },
    { flag: '🇵🇪', name: 'Peru', code: '51' },
    { flag: '🇺🇦', name: 'Ukraine', code: '380' },
    { flag: '🇷🇴', name: 'Romania', code: '40' },
    { flag: '🇨🇿', name: 'Czech Republic', code: '420' },
    { flag: '🇭🇺', name: 'Hungary', code: '36' }
];

let selectedCountryCode = '1';
let selectedAvatarFile = null; 
let isUploading = false; 

// NEW: Native SMS Notification Banner
const showNativeSmsNotification = (code) => {
    const existing = document.getElementById('native-sms-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'native-sms-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;transform:translateY(-100%);transition:transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;';

    banner.innerHTML = `
        <div style="max-width:480px;margin:10px auto;background:#fff;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,0.12);overflow:hidden;border:1px solid rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="padding:12px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f0f0f0;">
                <div style="width:36px;height:36px;border-radius:50%;background:#7C3AED;display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-comment-dots" style="color:white;font-size:16px;"></i>
                </div>
                <div style="flex:1;">
                    <div style="font-size:14px;font-weight:600;color:#111827;">HyeMe</div>
                    <div style="font-size:11px;color:#9CA3AF;">SMS Verification</div>
                </div>
                <div style="font-size:11px;color:#9CA3AF;">Now</div>
            </div>
            <!-- Body -->
            <div style="padding:14px 16px;background:#fff;">
                <p style="font-size:13px;color:#374151;margin:0 0 8px 0;line-height:1.4;">
                    <span style="font-weight:600;color:#111827;">HyeMe Code:</span> Your verification code is <strong style="color:#7C3AED;letter-spacing:1px;">${code}</strong>. Do not share this code.
                </p>
                <button id="copy-native-code-btn" style="background:none;border:none;color:#7C3AED;font-size:13px;font-weight:600;cursor:pointer;padding:0;display:flex;align-items:center;gap:4px;">
                    <i class="fas fa-copy" style="font-size:11px;"></i> Copy Code
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(banner);

    // Slide down animation
    setTimeout(() => {
        banner.style.transform = 'translateY(0)';
    }, 50);

    // Auto-dismiss after 15 seconds
    setTimeout(() => {
        banner.style.transform = 'translateY(-100%)';
        setTimeout(() => banner.remove(), 400);
    }, 15000);

    // Copy Logic
    banner.querySelector('#copy-native-code-btn').onclick = () => {
        navigator.clipboard.writeText(code).then(() => {
            const btn = banner.querySelector('#copy-native-code-btn');
            btn.innerHTML = '<i class="fas fa-check" style="font-size:11px;"></i> Copied';
            btn.style.color = '#10B981';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-copy" style="font-size:11px;"></i> Copy Code';
                btn.style.color = '#7C3AED';
            }, 2000);
        });
    };
};

export const initAuth = () => {
    const phoneInput = document.getElementById('phone-number');
    const phoneError = document.getElementById('phone-error');
    const phoneErrorText = document.getElementById('phone-error-text');
    const phoneBtn = document.getElementById('send-otp-btn');
    
    const pickerBtn = document.getElementById('country-picker-btn');
    const dropdown = document.getElementById('country-dropdown');
    const searchInput = document.getElementById('country-search');
    const countryListEl = document.getElementById('country-list');
    const selectedFlag = document.getElementById('selected-flag');
    const selectedCode = document.getElementById('selected-code');

    const renderCountries = (filter = '') => {
        const filtered = countries.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.code.includes(filter));
        countryListEl.innerHTML = filtered.map(c => `
            <div class="country-item" data-code="${c.code}" data-flag="${c.flag}" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-bottom: 1px solid var(--border-color);">
                <span style="font-size: 22px;">${c.flag}</span>
                <span style="flex: 1; font-size: 14px; color: var(--text-main);">${c.name}</span>
                <span style="font-size: 14px; color: var(--text-secondary);">+${c.code}</span>
            </div>
        `).join('');

        document.querySelectorAll('.country-item').forEach(item => {
            item.addEventListener('click', () => {
                selectedCountryCode = item.dataset.code;
                selectedFlag.textContent = item.dataset.flag;
                selectedCode.textContent = `+${item.dataset.code}`;
                dropdown.style.display = 'none';
                phoneInput.focus();
            });
            item.addEventListener('mouseenter', () => item.style.background = 'var(--bg-secondary)')
            item.addEventListener('mouseleave', () => item.style.background = 'transparent')
        });
    };

    if (pickerBtn) {
        pickerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.style.display === 'flex';
            dropdown.style.display = isOpen ? 'none' : 'flex';
            if (!isOpen) { renderCountries(); setTimeout(() => searchInput.focus(), 100); }
        });
    }
    if (searchInput) searchInput.addEventListener('input', (e) => renderCountries(e.target.value));
    document.addEventListener('click', () => { if(dropdown) dropdown.style.display = 'none'; });

    if (phoneInput) setTimeout(() => phoneInput.focus(), 300);

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = value;
            hideError(phoneError, phoneErrorText);
            phoneBtn.disabled = value.length < 7;
        });
        phoneInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !phoneBtn.disabled) phoneBtn.click(); });
    }

    if (phoneBtn) {
        phoneBtn.addEventListener('click', async () => {
            const rawNumber = phoneInput.value.replace(/\D/g, '');
            if (rawNumber.length < 7) return showError(phoneError, phoneErrorText, 'Enter a valid phone number.');

            phoneBtn.disabled = true;
            phoneBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';

            try {
                const cleanCode = selectedCountryCode.replace(/[^0-9]/g, '');
                const fullPhone = `+${cleanCode}${rawNumber}`;

                const res = await fetch(`${API_BASE}/auth/send-otp`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ phone: fullPhone }) 
                });
                
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('hyeme_phone', fullPhone);
                    
                    // 1. Navigate to OTP screen immediately
                    router.navigate('auth/otp');
                    
                    // 2. Show native notification banner with the code
                    const mockCodeForUI = Math.floor(100000 + Math.random() * 900000).toString();
                    setTimeout(() => showNativeSmsNotification(mockCodeForUI), 800);
                    
                } else {
                    showError(phoneError, phoneErrorText, data.message || 'Failed to send code.');
                }
            } catch (error) {
                showError(phoneError, phoneErrorText, 'Network error.');
            } finally {
                phoneBtn.disabled = false;
                phoneBtn.innerHTML = 'Next';
            }
        });
    }

    // --- OTP SCREEN ---
    const otpInputs = document.querySelectorAll('.otp-input');
    const verifyBtn = document.getElementById('verify-otp-btn');
    const otpError = document.getElementById('otp-error');
    const otpErrorText = document.getElementById('otp-error-text');

    const phoneDisplay = document.getElementById('otp-phone-display');
    if (phoneDisplay) phoneDisplay.textContent = localStorage.getItem('hyeme_phone') || 'Not found';

    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); if (e.target.value && index < otpInputs.length - 1) otpInputs[index + 1].focus(); hideError(otpError, otpErrorText); });
        input.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !e.target.value && index > 0) otpInputs[index - 1].focus(); if (e.key === 'Enter') verifyBtn.click(); });
    });

    if (verifyBtn) {
        verifyBtn.addEventListener('click', async () => {
            let otp = ''; otpInputs.forEach(i => otp += i.value);
            if (otp.length !== 6) return showError(otpError, otpErrorText, 'Enter 6-digit code.');

            verifyBtn.disabled = true; verifyBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Verifying...';

            try {
                const savedPhone = localStorage.getItem('hyeme_phone') || '+1234567890';
                const res = await fetch(`${API_BASE}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: savedPhone, otp: otp }) });
                const data = await res.json();
                if (res.ok) { 
                    localStorage.setItem('hyeme_token', data.token); 
                    
                    if (data.user) {
                        localStorage.setItem('hyeme_user', JSON.stringify(data.user));
                    }

                    // Dismiss SMS banner if still open
                    const banner = document.getElementById('native-sms-banner');
                    if(banner) banner.remove();

                    if (data.isNewUser) {
                        router.navigate('onboarding/name'); 
                    } else {
                        router.navigate('main/chats'); 
                    }
                } else {
                    showError(otpError, otpErrorText, 'Invalid code.');
                    otpInputs.forEach(i => i.value = ''); 
                    otpInputs[0].focus(); 
                }
            } catch (error) { 
                showError(otpError, otpErrorText, 'Network error.'); 
            } finally { 
                verifyBtn.disabled = false; 
                verifyBtn.innerHTML = 'Next'; 
            }
        });
    }

    const qrLink = document.getElementById('go-to-qrcode');
    if (qrLink) qrLink.addEventListener('click', () => router.navigate('auth/qrcode'));
    const backBtns = document.querySelectorAll('#back-to-phone');
    backBtns.forEach(btn => btn.addEventListener('click', () => router.navigate('auth/phone')));
};

const showError = (container, textEl, msg) => { 
    if(container) { 
        if(textEl) textEl.textContent = msg;
        container.style.display = 'flex'; 
    } 
};
const hideError = (container, textEl) => { if(container) container.style.display = 'none'; };

export const initOnboarding = () => {
    // --- NAME PAGE ---
    const nameNext = document.getElementById('name-next-btn');
    const nameBack = document.getElementById('back-name-btn'); 
    
    if(nameNext) nameNext.addEventListener('click', () => { 
        const nameVal = document.getElementById('user-name').value.trim();
        if(nameVal.length < 2) return alert('Please enter your name'); 
        localStorage.setItem('hyeme_name', nameVal); 
        router.navigate('onboarding/about'); 
    });
    
    if(nameBack) nameBack.addEventListener('click', () => router.navigate('auth/phone'));

    // --- ABOUT PAGE ---
    const aboutNext = document.getElementById('about-next-btn');
    const aboutBack = document.getElementById('back-about-btn');

    if(aboutNext) aboutNext.addEventListener('click', () => { 
        localStorage.setItem('hyeme_about', document.getElementById('user-about').value); 
        router.navigate('onboarding/profile'); 
    });

    if(aboutBack) aboutBack.addEventListener('click', () => router.navigate('onboarding/name'));

    // --- PROFILE PICTURE PAGE ---
    const profileDone = document.getElementById('profile-done-btn');
    const profileBack = document.getElementById('back-profile-btn'); 

    if(profileDone) profileDone.addEventListener('click', () => { 
        router.navigate('onboarding/confirm'); 
    });

    if(profileBack) profileBack.addEventListener('click', () => router.navigate('onboarding/about'));

    // REAL IMAGE UPLOAD LOGIC
    const avatarUpload = document.getElementById('avatar-upload');
    if(avatarUpload) {
        avatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedAvatarFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataUrl = e.target.result;
                    
                    const imgPreview = document.getElementById('avatar-preview-img');
                    const iconPreview = document.getElementById('avatar-preview-icon');
                    
                    if(imgPreview) {
                        imgPreview.src = dataUrl;
                        imgPreview.style.display = 'block';
                    }
                    if(iconPreview) iconPreview.style.display = 'none';

                    localStorage.setItem('hyeme_avatar_temp', dataUrl);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- CONFIRMATION SCREEN ---
    const confirmSubmit = document.getElementById('confirm-submit-btn');
    const confirmEdit = document.getElementById('confirm-edit-btn');
    const confirmBack = document.getElementById('back-to-profile');

    if (confirmSubmit || confirmEdit || confirmBack) {
        const nameEl = document.getElementById('confirm-name');
        const aboutEl = document.getElementById('confirm-about');
        const avatarImgEl = document.getElementById('confirm-avatar-img');
        const avatarIconEl = document.getElementById('confirm-avatar-icon');

        const savedName = localStorage.getItem('hyeme_name');
        const savedAbout = localStorage.getItem('hyeme_about');
        const savedAvatar = localStorage.getItem('hyeme_avatar_temp');

        if(nameEl && savedName) nameEl.textContent = savedName;
        if(aboutEl && savedAbout) aboutEl.textContent = savedAbout;
        
        if (savedAvatar && savedAvatar !== "null" && avatarImgEl) {
            avatarImgEl.src = savedAvatar;
            avatarImgEl.style.display = 'block';
            if(avatarIconEl) avatarIconEl.style.display = 'none';
        } else {
            const oldAvatar = localStorage.getItem('hyeme_avatar');
            if (oldAvatar && oldAvatar !== "null" && avatarImgEl) {
                avatarImgEl.src = oldAvatar;
                avatarImgEl.style.display = 'block';
                if(avatarIconEl) avatarIconEl.style.display = 'none';
            } else {
                if(avatarIconEl) avatarIconEl.style.display = 'block';
                if(avatarImgEl) avatarImgEl.style.display = 'none';
            }
        }

        if(confirmEdit) confirmEdit.addEventListener('click', () => router.navigate('onboarding/profile'));
        if(confirmBack) confirmBack.addEventListener('click', () => router.navigate('onboarding/profile'));

        if(confirmSubmit) {
            confirmSubmit.addEventListener('click', () => {
                router.navigate('onboarding/loading');
            });
        }
    }

    // --- LOADING PAGE (UPLOAD & SAVE) ---
    if (document.querySelector('.fa-circle-notch') && !isUploading) {
        isUploading = true; 
        
        const finishOnboarding = async () => {
            const token = localStorage.getItem('hyeme_token');
            const name = localStorage.getItem('hyeme_name') || 'HyeMe User';
            const about = localStorage.getItem('hyeme_about') || 'Hey there! I am using HyeMe.';
            const tempAvatar = localStorage.getItem('hyeme_avatar_temp');
            
            try {
                const formData = new FormData();
                formData.append('name', name);
                formData.append('about', about);
                
                if (selectedAvatarFile) {
                    formData.append('avatar', selectedAvatarFile);
                }

                console.log("Sending upload request...");

                const res = await fetch(`${API_BASE}/users/onboard`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    
                    if (data.user) {
                        localStorage.setItem('hyeme_user', JSON.stringify(data.user));
                        localStorage.setItem('hyeme_name', data.user.name);
                        localStorage.setItem('hyeme_about', data.user.about);

                        if (data.user.avatar) {
                            localStorage.setItem('hyeme_avatar', data.user.avatar);
                        } else if (tempAvatar) {
                            localStorage.setItem('hyeme_avatar', tempAvatar);
                        }
                    }

                    localStorage.removeItem('hyeme_avatar_temp');
                    selectedAvatarFile = null; 
                    isUploading = false; 

                    router.navigate('main/chats');
                } else {
                    console.error("Upload failed", res.status);
                    alert(`Error: Profile save failed (Status ${res.status}). Please try again.`);
                    isUploading = false;
                    router.navigate('onboarding/profile');
                }
                
            } catch (err) {
                console.error("Onboarding save error", err);
                alert("Network error. Please try again.");
                isUploading = false;
                router.navigate('onboarding/profile');
            }
        };
        
        setTimeout(finishOnboarding, 1500);
    }
};