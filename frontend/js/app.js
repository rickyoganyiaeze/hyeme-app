import router from './router.js';
import { initSocket, getSocket } from './socket.js';
import { initAuth, initOnboarding } from './auth.js';
import { initChatList, initChatView, initFindPeople, initUserProfile } from './chat.js';
import { initGroups } from './group.js';
import { initExplore } from './explore.js';
import { initSettings, initThemeSettings } from './settings.js';
import { initNavbar } from '../components/navbar.js';

const API_BASE = 'https://hyeme-app.onrender.com/api';

let cachedRequests = [];
let unreadCount = 0;

export async function initApp() {
    const appContainer = document.getElementById('app');

    try {
        const res = await fetch('./shell.html');
        const shellHtml = await res.text();

        appContainer.innerHTML = shellHtml;
        const screenDiv = document.createElement('div');
        screenDiv.id = 'screen-container';
        screenDiv.style.cssText = 'flex:1;position:relative;overflow:hidden;z-index:10;'; 
        appContainer.appendChild(screenDiv);

        initNavbar();

        const menuBtn = document.getElementById('menu-toggle-btn');
        if (menuBtn) menuBtn.onclick = () => router.navigate('settings/settings');

        const searchBtn = document.getElementById('global-search-btn');
        if (searchBtn) searchBtn.onclick = () => {
            router.navigate('main/chats');
            setTimeout(() => document.getElementById('search-chats-input')?.focus(), 150);
        };

        const threeDots = document.querySelector('.fa-ellipsis-vertical');
        if (threeDots) {
            threeDots.onclick = (e) => {
                e.stopPropagation();
                const oldMenu = document.getElementById('header-popup-menu');
                if (oldMenu) oldMenu.remove();

                const menu = document.createElement('div');
                menu.id = 'header-popup-menu';
                menu.style.cssText = 'position:absolute;top:55px;right:16px;background:var(--bg-main);border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.15);z-index:200;min-width:220px;overflow:hidden;';

                menu.innerHTML = `
                    <div class="popup-item" style="padding:14px 16px;font-size:14px;color:var(--text-main);cursor:pointer;display:flex;align-items:center;gap:12px;" onclick="window.dispatchEvent(new CustomEvent('navChange', { detail: 'findPeople' })); document.getElementById('header-popup-menu').remove()">
                        <i class="fas fa-user-plus" style="color:var(--primary);width:20px;"></i> Find People
                    </div>
                `;
                appContainer.appendChild(menu);
            };
        }

        const bellBtn = document.getElementById('notification-bell-btn');
        if (bellBtn) {
            bellBtn.onclick = (e) => {
                e.stopPropagation();
                showNotificationMenu();
            };
        }

        const showNotificationMenu = () => {
            const oldMenu = document.getElementById('notification-menu');
            if (oldMenu) oldMenu.remove();

            const menu = document.createElement('div');
            menu.id = 'notification-menu';
            menu.style.cssText = 'position:absolute;top:55px;right:70px;background:var(--bg-main);border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.15);z-index:200;min-width:280px;max-height:400px;overflow-y:auto;';

            let requestsHtml = '';
            if (cachedRequests.length > 0) {
                requestsHtml = cachedRequests.map(req => `
                    <div class="request-item" style="padding:12px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border-color);">
                        <div class="chat-avatar" style="width:40px;height:40px;font-size:16px;">
                            ${req.from.avatar ? `<img src="${req.from.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : req.from.name.charAt(0)}
                        </div>
                        <div style="flex:1;overflow:hidden;">
                            <div style="font-size:14px;font-weight:600;">${req.from.name}</div>
                        </div>
                        <button class="bell-accept-btn" data-id="${req.requestId}" data-senderid="${req.from._id}" data-sendername="${req.from.name}" style="background:var(--primary);color:white;border:none;padding:6px 12px;border-radius:20px;font-size:11px;cursor:pointer;margin-right:4px;">Accept</button>
                        <button class="bell-decline-btn" data-id="${req.requestId}" style="background:var(--danger);color:white;border:none;padding:6px 12px;border-radius:20px;font-size:11px;cursor:pointer;">Decline</button>
                    </div>
                `).join('');
            } else {
                requestsHtml = `<div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:13px;">No new notifications</div>`;
            }

            menu.innerHTML = requestsHtml;
            appContainer.appendChild(menu);

            menu.querySelectorAll('.bell-accept-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const requestId = btn.dataset.id;
                    const senderId = btn.dataset.senderid;
                    const senderName = btn.dataset.sendername;
                    const token = localStorage.getItem('hyeme_token');
                    
                    btn.textContent = "...";
                    btn.disabled = true;

                    try {
                        const res = await fetch(`${API_BASE}/users/connect/handle`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ requestId, action: 'accept' })
                        });

                        if (res.ok) {
                            cachedRequests = cachedRequests.filter(r => r.requestId !== requestId);
                            updateBellBadge();
                            menu.remove();
                            
                            localStorage.setItem('current_chat_user', JSON.stringify({ id: senderId, name: senderName }));
                            router.navigate('main/chatView');
                        }
                    } catch (err) {
                        console.error("Error accepting request:", err);
                        btn.textContent = "Error";
                        btn.disabled = false;
                    }
                };
            });

            menu.querySelectorAll('.bell-decline-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const requestId = btn.dataset.id;
                    const token = localStorage.getItem('hyeme_token');

                    btn.textContent = "...";
                    btn.disabled = true;

                    try {
                        const res = await fetch(`${API_BASE}/users/connect/handle`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ requestId, action: 'decline' })
                        });

                        if (res.ok) {
                            cachedRequests = cachedRequests.filter(r => r.requestId !== requestId);
                            updateBellBadge();
                            menu.remove();
                        }
                    } catch (err) {
                        console.error("Error declining request:", err);
                        btn.textContent = "Error";
                    }
                };
            });
        };

        const updateBellBadge = () => {
            const badge = document.getElementById('bell-badge');
            if (!badge) return;
            if (cachedRequests.length > 0) {
                badge.textContent = cachedRequests.length;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        };

        document.addEventListener('click', (e) => {
            const notifMenu = document.getElementById('notification-menu');
            const headerMenu = document.getElementById('header-popup-menu');
            if (notifMenu && !notifMenu.contains(e.target) && e.target !== bellBtn) notifMenu.remove();
            if (headerMenu && !headerMenu.contains(e.target) && e.target !== threeDots) headerMenu.remove();
        });

        window.addEventListener('routeChanged', (e) => {
            const path = e.detail;
            const mainNav = document.getElementById('main-nav');
            const header = document.querySelector('.app-header');

            const isAuth = path.startsWith('auth/') || path.startsWith('onboarding/');
            const isSettings = path.startsWith('settings/');

            if (isAuth) {
                if (header) header.style.display = 'none';
                if (mainNav) mainNav.style.display = 'none';
            } else if (isSettings) {
                if (header) header.style.display = 'none';
                if (mainNav) mainNav.style.display = 'flex';
            } else {
                if (header) header.style.display = 'flex';
                if (mainNav) mainNav.style.display = 'flex';
            }

            const allScreens = document.querySelectorAll('.screen');
            allScreens.forEach(s => s.style.display = 'none');

            if (isAuth) {
                if (path.startsWith('auth/')) initAuth();
                else if (path.startsWith('onboarding/')) initOnboarding();
            } else {
                if (path === 'main/chats') {
                    unreadCount = 0;
                    updateChatBadge();
                    initChatList();
                }
                else if (path === 'main/chatView') initChatView();
                else if (path === 'main/userProfile') initUserProfile();
                else if (path === 'main/findPeople') initFindPeople();
                else if (path === 'main/groups') initGroups();
                else if (path === 'main/explore') initExplore();
                else if (path === 'main/calls') { /* Placeholder */ }
                else if (path === 'settings/settings') initSettings();
                else if (isSettings) initThemeSettings(); 
            }
        });

        window.addEventListener('navChange', (e) => {
            router.navigate(`main/${e.detail}`);
        });

        const token = localStorage.getItem('hyeme_token');
        const storedUser = token ? JSON.parse(localStorage.getItem('hyeme_user')) : null;

        if (!token) {
            router.navigate('auth/phone');
        } else {
            // FIX: STRICT STATE CHECK
            if (!storedUser || !storedUser._id) {
                console.log("Corrupt session found. Clearing...");
                localStorage.clear();
                router.navigate('auth/phone');
                return;
            }

            if (!storedUser.isOnboarded) {
                // Resume onboarding
                if (storedUser.name && storedUser.name !== 'HyeMe User') {
                     router.navigate('onboarding/about');
                } else {
                     router.navigate('onboarding/name');
                }
            } else {
                // USER IS VALID -> CONNECT SOCKET
                const socket = initSocket(token, storedUser._id);

                if (socket) {
                    socket.on('messageSent', (data) => {
                        updateChatListRealTime(data.recipientId, data.recipientName, data.content, true);
                    });

                    socket.on('receiveMessage', (data) => {
                        playNotificationSound();

                        const currentChatUser = JSON.parse(localStorage.getItem('current_chat_user'));
                        const isCurrentlyChatting = currentChatUser && currentChatUser.id === data.senderId && router.currentRoute === 'main/chatView';

                        if (!isCurrentlyChatting) {
                            unreadCount++;
                            updateChatBadge();
                            showToast(`New message from ${data.senderName}`);
                        }
                        
                        updateChatListRealTime(data.senderId, data.senderName, data.content, false);
                    });

                    socket.on('messageStatus', (data) => {
                        if (data.status === 'white') {
                            const myBubbles = document.querySelectorAll('.msg-me .fa-eye');
                            myBubbles.forEach(icon => {
                                icon.classList.remove('eye-black', 'eye-grey');
                                icon.classList.add('eye-white');
                            });
                        }
                    });

                    socket.on('newFriendRequest', (data) => {
                        console.log("Received Friend Request:", data);
                        playNotificationSound();
                        showToast(`🔔 ${data.from.name} sent you a connection request!`);
                        cachedRequests.push(data);
                        updateBellBadge();
                    });

                    socket.on('requestAccepted', (data) => {
                        playNotificationSound();
                        showToast(`✅ ${data.name} accepted your connection request!`);
                        
                        if(router.currentRoute === 'main/chats') {
                            initChatList(); 
                        }
                    });

                    // FIX: HANDLE USER STATUS FOR CHAT LIST REFRESH
                    socket.on('userStatus', (data) => {
                        console.log(`Status update: ${data.userId} is ${data.status}`);
                        
                        // 1. Update Header
                        const currentChatUser = JSON.parse(localStorage.getItem('current_chat_user'));
                        if (currentChatUser && currentChatUser.id === data.userId) {
                            const statusEl = document.querySelector('.chat-view-header .chat-last-msg');
                            if (statusEl) {
                                if (data.status === 'online') {
                                    statusEl.textContent = 'Online'; statusEl.style.color = 'green';
                                } else {
                                    const time = data.lastSeen ? new Date(data.lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                                    statusEl.textContent = `Last seen ${time}`; statusEl.style.color = 'var(--text-secondary)';
                                }
                            }
                        }

                        // 2. Refresh List
                        if (router.currentRoute === 'main/chats') {
                            initChatList();
                        }
                    });
                }

                router.navigate('main/chats');
            }
        }
    } catch (error) {
        console.error("App init error:", error);
    }
}

function updateChatBadge() {
    const chatNav = document.querySelector('.nav-item[data-target="chats"]');
    if (!chatNav) return;

    let badge = chatNav.querySelector('.chat-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'chat-badge';
        badge.style.cssText = 'position:absolute;top:4px;right:10px;background:var(--danger);color:white;font-size:10px;font-weight:bold;height:16px;min-width:16px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 4px;';
        chatNav.style.position = 'relative';
        chatNav.appendChild(badge);
    }

    if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function updateChatListRealTime(userId, userName, content, isSentByMe) {
    if (router.currentRoute !== 'main/chats') return;

    const chatList = document.getElementById('chat-list');
    if (!chatList) return;

    const items = Array.from(chatList.querySelectorAll('.chat-item'));
    const existingItem = items.find(item => item.dataset.userId === userId);

    if (existingItem) {
        chatList.insertBefore(existingItem, chatList.firstChild);
        const lastMsgEl = existingItem.querySelector('.chat-last-msg');
        if (lastMsgEl) lastMsgEl.textContent = content;

        let badge = existingItem.querySelector('.chat-badge-item');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'chat-badge-item';
            badge.style.cssText = 'background:var(--primary);color:white;font-size:10px;font-weight:bold;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;margin-left:auto;';
            const metaDiv = existingItem.querySelector('.chat-meta div:last-child');
            if (metaDiv) metaDiv.appendChild(badge);
        }

        if (!isSentByMe) {
            let count = parseInt(badge.textContent) || 0;
            badge.textContent = count + 1;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }

    } else {
        const item = document.createElement('div');
        item.className = 'chat-item';
        item.dataset.userId = userId; 
        item.dataset.userName = userName;
        
        let badgeHtml = '';
        if (!isSentByMe) {
            badgeHtml = `<div class="chat-badge-item" style="background:var(--primary);color:white;font-size:10px;font-weight:bold;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;margin-left:auto;">1</div>`;
        }

        item.innerHTML = `
            <div class="chat-avatar">${userName.charAt(0)}</div>
            <div class="chat-meta" style="flex:1;overflow:hidden;">
                <div style="display:flex;justify-content:space-between;">
                    <span class="chat-name">${userName}</span>
                    <span class="chat-time">Just now</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div class="chat-last-msg" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${content}</div>
                    ${badgeHtml}
                </div>
            </div>
        `;
        item.onclick = async () => {
            const token = localStorage.getItem('hyeme_token');
            await fetch(`${API_BASE}/chats/create`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ participantId: userId })
            });

            localStorage.setItem('current_chat_user', JSON.stringify({ id: userId, name: userName }));
            router.navigate('main/chatView');
        };
        chatList.insertBefore(item, chatList.firstChild);
    }
}

function playNotificationSound() {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.m4a');
    audio.play().catch(() => { });
}

function showToast(message) {
    const toast = document.createElement('div');
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