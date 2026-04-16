import router from './router.js';
import { getSocket } from './socket.js';

const API_BASE = 'http://localhost:5000/api';
let myUserId = null;

// ================= CHAT LIST (The Queue) =================
export const initChatList = async () => {
    const token = localStorage.getItem('hyeme_token');
    const chatListEl = document.getElementById('chat-list');
    const searchInput = document.getElementById('search-chats-input');

    const storedUser = JSON.parse(localStorage.getItem('hyeme_user'));
    if (storedUser) myUserId = storedUser._id;

    if (!chatListEl) {
        console.error("chat-list element not found!");
        return;
    }

    if (!myUserId) {
        console.error("User ID is missing! Cannot load chats.");
        chatListEl.innerHTML = '<p style="padding:20px;text-align:center;color:red;">Error: User not found. Please log in again.</p>';
        setTimeout(() => router.navigate('auth/phone'), 2000);
        return;
    }

    const bottomActionContainer = chatListEl.nextElementSibling;
    if (bottomActionContainer) {
        bottomActionContainer.style.position = 'sticky';
        bottomActionContainer.style.bottom = '0';
        bottomActionContainer.style.zIndex = '999';
        bottomActionContainer.style.background = 'var(--bg-main)';
        bottomActionContainer.style.borderTop = '1px solid var(--border-color)';
    }

    const loadChats = async () => {
        try {
            console.log("Loading chats for user:", myUserId);
            const res = await fetch(`${API_BASE}/chats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to load chats from server");
            }

            const chats = await res.json();
            console.log("✅ Chats loaded:", chats.length);
            renderChats(chats);
        } catch (error) {
            console.error("❌ Error loading chats:", error);
            chatListEl.innerHTML = `<p style="padding:20px;text-align:center;color:red;font-size:13px;">Error: ${error.message}</p>`;
        }
    };

    const renderChats = (chats) => {
        chatListEl.innerHTML = '';

        if (chats.length === 0) {
            chatListEl.innerHTML = '<p style="padding:40px;text-align:center;color:var(--text-secondary);">No active chats</p>';
            return;
        }

        chats.forEach(chat => {
            const otherParticipant = chat.participants.find(p => p._id && p._id.toString() !== myUserId.toString());
            if (!otherParticipant) return;

            const lastMsg = chat.lastMessage?.content || 'No messages yet';
            const lastTime = chat.lastMessage?.time
                ? new Date(chat.lastMessage.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

            const badgeHtml = chat.unreadCount > 0
                ? `<div class="chat-badge-item" style="background:var(--primary);color:white;font-size:10px;font-weight:bold;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;margin-left:auto;">${chat.unreadCount}</div>`
                : '';

            const avatarHtml = otherParticipant.avatar
                ? `<img src="${otherParticipant.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">`
                : otherParticipant.name.charAt(0).toUpperCase();

            const item = document.createElement('div');
            item.className = 'chat-item';
            item.dataset.chatId = chat._id;
            item.dataset.userId = otherParticipant._id;
            item.dataset.userName = otherParticipant.name;

            item.innerHTML = `
                <div class="chat-avatar">${avatarHtml}</div>
                <div class="chat-meta" style="flex:1;overflow:hidden;">
                    <div style="display:flex;justify-content:space-between;">
                        <span class="chat-name">${otherParticipant.name}</span>
                        <span class="chat-time">${lastTime}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div class="chat-last-msg" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${lastMsg}</div>
                        ${badgeHtml}
                    </div>
                </div>
            `;

            item.addEventListener('click', async () => {
                await fetch(`${API_BASE}/chats/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ participantId: otherParticipant._id })
                }).then(res => res.json()).then(chatData => {
                    console.log("Chat ensured in DB:", chatData._id);
                }).catch(err => console.log("Chat ensure error", err));

                localStorage.setItem('current_chat_user', JSON.stringify({
                    id: otherParticipant._id,
                    name: otherParticipant.name,
                    avatar: otherParticipant.avatar,
                    isOnline: otherParticipant.isOnline,
                    lastSeen: otherParticipant.lastSeen
                }));
                router.navigate('main/chatView');
            });

            chatListEl.appendChild(item);
        });
    };

    if (searchInput) {
        const newInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newInput, searchInput);
        newInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const items = chatListEl.querySelectorAll('.chat-item');
            if (!query) items.forEach(item => item.style.display = 'flex');
            else items.forEach(item => {
                const name = item.dataset.userName || '';
                item.style.display = name.toLowerCase().includes(query) ? 'flex' : 'none';
            });
        });
    }

    const exploreBtn = document.getElementById('explore-btn-bottom');
    if (exploreBtn) {
        const newExploreBtn = exploreBtn.cloneNode(true);
        exploreBtn.parentNode.replaceChild(newExploreBtn, exploreBtn);
        newExploreBtn.style.cursor = 'pointer';
        newExploreBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            router.navigate('main/explore');
        });
    }

    const findPeopleBtn = document.getElementById('find-people-btn-bottom');
    if (findPeopleBtn) {
        const newFindBtn = findPeopleBtn.cloneNode(true);
        findPeopleBtn.parentNode.replaceChild(newFindBtn, findPeopleBtn);
        newFindBtn.style.cursor = 'pointer';
        newFindBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            router.navigate('main/findPeople');
        });
    }

    loadChats();
};

// ================= FIND PEOPLE =================
export const initFindPeople = () => {
    console.log("initFindPeople called");
    const token = localStorage.getItem('hyeme_token');
    const searchInput = document.getElementById('find-people-input');
    const resultsContainer = document.getElementById('find-people-results');
    const backBtn = document.getElementById('back-to-chats-from-find');

    if (!searchInput || !resultsContainer) return;
    if (backBtn) backBtn.onclick = () => router.navigate('main/chats');

    const searchUsers = async (query = '') => {
        if (!query || query.trim() === '') {
            resultsContainer.innerHTML = '<p style="padding:40px;text-align:center;color:var(--text-secondary);">Type a name to search for users</p>';
            return;
        }

        try {
            resultsContainer.innerHTML = `<div style="padding:40px;text-align:center;"><i class="fas fa-circle-notch fa-spin" style="font-size:24px;color:var(--primary);"></i></div>`;
            const res = await fetch(`${API_BASE}/users/search?query=${encodeURIComponent(query)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const users = await res.json();

            resultsContainer.innerHTML = '';
            if (users.length === 0) {
                resultsContainer.innerHTML = '<p style="padding:40px;text-align:center;color:var(--text-secondary);">No users found</p>';
                return;
            }

            users.forEach(user => {
                const avatarHtml = user.avatar
                    ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">`
                    : user.name.charAt(0);

                const itemDiv = document.createElement('div');
                itemDiv.className = 'chat-item';
                itemDiv.innerHTML = `
                    <div class="chat-avatar">${avatarHtml}</div>
                    <div class="chat-meta">
                        <div class="chat-name">${user.name}</div>
                        <div class="chat-last-msg">${user.phone || ''}</div>
                    </div>
                    <div id="action-${user._id}"></div>
                `;
                resultsContainer.appendChild(itemDiv);
                checkRelationship(user, token);
            });
        } catch (error) {
            console.error("Search error:", error);
            resultsContainer.innerHTML = '<p style="padding:20px;text-align:center;color:red;">Error</p>';
        }
    };

    const checkRelationship = async (user, token) => {
        const actionDiv = document.getElementById(`action-${user._id}`);
        if (!actionDiv) return;
        try {
            const relRes = await fetch(`${API_BASE}/users/relationship/${user._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const relData = await relRes.json();
            actionDiv.innerHTML = '';

            if (relData.status === 'friend') {
                const btn = document.createElement('button');
                btn.textContent = 'Message';
                btn.style.cssText = 'background:var(--primary);color:white;border:none;padding:8px 16px;border-radius:20px;font-size:12px;cursor:pointer;';
                btn.onclick = () => {
                    localStorage.setItem('current_chat_user', JSON.stringify({ id: user._id, name: user.name, avatar: user.avatar }));
                    router.navigate('main/chatView');
                };
                actionDiv.appendChild(btn);
            } else if (relData.status === 'sent') {
                actionDiv.innerHTML = `<span style="font-size:12px;color:var(--text-secondary);padding:8px 16px;">Request Sent ✓</span>`;
            } else if (relData.status === 'received') {
                const acceptBtn = document.createElement('button');
                acceptBtn.textContent = 'Accept';
                acceptBtn.style.cssText = 'background:green;color:white;border:none;padding:8px 12px;border-radius:20px;font-size:12px;cursor:pointer;';
                acceptBtn.onclick = async () => {
                    acceptBtn.textContent = '...'; acceptBtn.disabled = true;
                    await fetch(`${API_BASE}/users/connect/handle`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ requestId: relData.requestId, action: 'accept' })
                    });
                    searchUsers(searchInput.value);
                };
                actionDiv.appendChild(acceptBtn);
            } else {
                const btn = document.createElement('button');
                btn.textContent = 'Connect';
                btn.style.cssText = 'background:transparent;color:var(--primary);border:1px solid var(--primary);padding:8px 16px;border-radius:20px;font-size:12px;cursor:pointer;';
                btn.onclick = async () => {
                    btn.textContent = '...'; btn.disabled = true;
                    try {
                        await fetch(`${API_BASE}/users/connect`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ recipientId: user._id })
                        });
                        btn.textContent = 'Sent ✓'; btn.style.background = 'var(--primary)'; btn.style.color = 'white'; btn.style.border = 'none';
                        setTimeout(() => searchUsers(searchInput.value), 1000);
                    } catch (err) {
                        btn.textContent = 'Error'; btn.disabled = false;
                    }
                };
                actionDiv.appendChild(btn);
            }
        } catch (err) { actionDiv.innerHTML = '<span style="color:red;padding:8px;">Error</span>'; }
    };

    const newSearch = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearch, searchInput);
    newSearch.addEventListener('input', (e) => searchUsers(e.target.value));
    newSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); searchUsers(newSearch.value); }
    });
    setTimeout(() => { if (newSearch) newSearch.focus(); }, 100);
};

// ================= USER PROFILE PAGE =================
export const initUserProfile = () => {
    const token = localStorage.getItem('hyeme_token');
    const chatUser = JSON.parse(localStorage.getItem('current_chat_user'));

    if (!chatUser) {
        router.navigate('main/chats');
        return;
    }

    const avatarEl = document.getElementById('profile-page-avatar');
    const nameEl = document.getElementById('profile-page-name');
    const phoneEl = document.getElementById('profile-page-phone');
    const aboutEl = document.getElementById('profile-page-about');
    const backBtn = document.getElementById('back-to-chat-from-profile');
    const messageBtn = document.getElementById('message-from-profile-btn');
    const disconnectBtn = document.getElementById('disconnect-from-profile-btn');
    const shareBtn = document.getElementById('share-from-profile-btn');
    const blockBtn = document.getElementById('block-from-profile-btn');

    if (chatUser.avatar) {
        avatarEl.innerHTML = `<img src="${chatUser.avatar}" style="width:100%;height:100%;object-fit:cover;display:block;">`;
    } else {
        avatarEl.textContent = chatUser.name.charAt(0).toUpperCase();
    }
    nameEl.textContent = chatUser.name;

    fetch(`${API_BASE}/users/${chatUser.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
            if (data.phone) phoneEl.innerHTML = `<i class="fas fa-phone" style="font-size:12px;margin-right:6px;"></i> ${data.phone}`;
            if (data.about) aboutEl.textContent = data.about;
        })
        .catch(() => { });

    if (backBtn) backBtn.onclick = () => router.navigate('main/chatView');
    if (messageBtn) messageBtn.onclick = () => router.navigate('main/chatView');

    // CHECK RELATIONSHIP FOR DISCONNECT/CONNECT BUTTON
    const setupDisconnectButton = async () => {
        try {
            const relRes = await fetch(`${API_BASE}/users/relationship/${chatUser.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const relData = await relRes.json();

            if (relData.status === 'friend') {
                // Currently Friends -> Show Disconnect
                disconnectBtn.innerHTML = '<i class="fas fa-user-xmark"></i>';
                disconnectBtn.style.color = 'var(--danger)';
                disconnectBtn.style.border = '2px solid var(--danger)';
                disconnectBtn.style.background = 'transparent';

                disconnectBtn.onclick = async () => {
                    if (confirm(`Are you sure you want to disconnect from ${chatUser.name}?`)) {
                        await fetch(`${API_BASE}/users/disconnect`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ userId: chatUser.id })
                        });
                        // Refresh button state instantly
                        setupDisconnectButton();
                    }
                };
            } else {
                // Not Friends -> Show Connect
                disconnectBtn.innerHTML = '<i class="fas fa-user-plus"></i>';
                disconnectBtn.style.color = 'white';
                disconnectBtn.style.border = 'none';
                disconnectBtn.style.background = 'var(--primary)';

                disconnectBtn.onclick = async () => {
                    disconnectBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
                    try {
                        const res = await fetch(`${API_BASE}/users/connect`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ recipientId: chatUser.id })
                        });

                        if (res.ok) {
                            // Update UI instantly
                            disconnectBtn.innerHTML = '<i class="fas fa-check"></i>'; // Checkmark
                            disconnectBtn.style.background = 'transparent';
                            disconnectBtn.style.color = 'var(--primary)';
                            disconnectBtn.style.border = '2px solid var(--primary)';
                            disconnectBtn.disabled = true; // Prevent clicking again
                            showToast(`Request sent to ${chatUser.name}!`);
                        } else {
                            const errData = await res.json();
                            showToast(errData.message || 'Error sending request.');
                            setupDisconnectButton();
                        }
                    } catch (err) {
                        alert('Network error sending request.');
                        setupDisconnectButton();
                    }
                };
            }
        } catch (err) {
            console.error("Error checking relationship:", err);
        }
    };

    // Initialize button state
    setupDisconnectButton();

    // SHARE PROFILE LOGIC
    if (shareBtn) {
        shareBtn.onclick = async () => {
            const myUser = JSON.parse(localStorage.getItem('hyeme_user'));
            const socket = getSocket();
            if (!socket || !socket.connected) { alert("Cannot share while offline."); return; }

            const modal = document.createElement('div');
            modal.id = 'share-modal';
            modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:flex-end;justify-content:center;';

            modal.innerHTML = `
                <div style="width:100%;max-width:480px;background:var(--bg-main);border-radius:20px 20px 0 0;max-height:60vh;display:flex;flex-direction:column;padding:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h3 style="color:var(--text-main);font-size:18px;">Share to...</h3>
                        <i class="fas fa-times" id="close-share-modal" style="color:var(--text-secondary);font-size:18px;cursor:pointer;padding:5px;"></i>
                    </div>
                    <div id="share-chat-list" style="overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:8px;"></div>
                </div>
            `;
            document.body.appendChild(modal);

            const listEl = modal.querySelector('#share-chat-list');
            listEl.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px;">Loading chats...</p>';

            try {
                const res = await fetch(`${API_BASE}/chats`, { headers: { 'Authorization': `Bearer ${token}` } });
                const chats = await res.json();
                listEl.innerHTML = '';

                if (chats.length === 0) {
                    listEl.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px;">No chats to share to.</p>';
                    return;
                }

                chats.forEach(chat => {
                    const other = chat.participants.find(p => p._id.toString() !== myUser._id.toString());
                    if (!other) return;

                    const item = document.createElement('div');
                    item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;cursor:pointer;transition:background 0.2s;';
                    item.innerHTML = `
                        <div class="chat-avatar" style="width:40px;height:40px;font-size:16px;">${other.avatar ? `<img src="${other.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : other.name.charAt(0)}</div>
                        <div style="flex:1;"><div style="font-weight:600;color:var(--text-main);">${other.name}</div></div>
                    `;

                    item.onmouseenter = () => item.style.background = 'var(--bg-secondary)';
                    item.onmouseleave = () => item.style.background = 'transparent';

                    item.onclick = async () => {
                        item.innerHTML = '<div style="color:var(--primary);font-weight:600;">Sending...</div>';

                        const profileRes = await fetch(`${API_BASE}/users/${chatUser.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                        const profileData = await profileRes.json();

                        const contactData = {
                            userId: chatUser.id,
                            name: profileData.name || chatUser.name,
                            phone: profileData.phone || 'Hidden',
                            avatar: profileData.avatar || ''
                        };

                        socket.emit('sendMessage', {
                            recipientId: other._id,
                            recipientName: other.name,
                            senderId: myUser._id,
                            senderName: myUser.name,
                            content: JSON.stringify(contactData),
                            type: 'contact'
                        });

                        modal.remove();
                        showToast(`Shared ${chatUser.name}'s profile!`);
                    };
                    listEl.appendChild(item);
                });
            } catch (err) {
                listEl.innerHTML = '<p style="text-align:center;color:red;">Error loading chats.</p>';
            }

            modal.querySelector('#close-share-modal').onclick = () => modal.remove();
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        };
    }

    // IMAGE VIEWER LOGIC
    if (avatarEl && chatUser.avatar) {
        avatarEl.onclick = () => {
            const viewer = document.getElementById('hyeme-image-viewer');
            const viewerImg = document.getElementById('viewer-full-img');
            const wrapper = document.getElementById('viewer-square-wrapper');
            const closeBtn = document.getElementById('close-viewer-btn');

            viewerImg.src = chatUser.avatar;
            viewer.style.display = 'flex';
            setTimeout(() => { viewer.style.opacity = '1'; wrapper.style.transform = 'scale(1)'; }, 10);

            let closeViewer = () => {
                viewer.style.opacity = '0'; wrapper.style.transform = 'scale(0.8)';
                setTimeout(() => { viewer.style.display = 'none'; document.body.style.filter = ''; }, 200);
            };

            closeBtn.onclick = (e) => { e.stopPropagation(); closeViewer(); };
            viewer.onclick = (e) => { if (e.target === viewer || e.target.parentElement === viewer) closeViewer(); };

            const blurScreen = () => { document.body.style.filter = 'blur(30px) brightness(0.5)'; };
            const unblurScreen = () => { document.body.style.filter = ''; };
            window.addEventListener('blur', blurScreen);
            document.addEventListener('visibilitychange', unblurScreen);

            const originalClose = closeViewer;
            closeViewer = () => {
                window.removeEventListener('blur', blurScreen);
                document.removeEventListener('visibilitychange', unblurScreen);
                originalClose();
            };
        };
    }
};

// ================= CHAT VIEW =================
export const initChatView = async () => {
    console.log("initChatView called");
    const socket = getSocket();
    const msgContainer = document.getElementById('messages-container');
    const backBtn = document.getElementById('back-to-chats');
    const sendBtn = document.getElementById('send-msg-btn');
    const msgInput = document.getElementById('msg-input');

    const chatUser = JSON.parse(localStorage.getItem('current_chat_user'));
    const myUser = JSON.parse(localStorage.getItem('hyeme_user'));

    if (!chatUser || !myUser) {
        console.error("Missing user data for chat");
        router.navigate('main/chats');
        return;
    }

    const nameEl = document.getElementById('chat-user-name');
    const avatarEl = document.getElementById('chat-user-avatar');
    const statusEl = document.querySelector('.chat-view-header .chat-last-msg');

    if (nameEl) nameEl.textContent = chatUser.name;

    if (avatarEl) {
        if (chatUser.avatar) {
            avatarEl.innerHTML = `<img src="${chatUser.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">`;
        } else {
            avatarEl.textContent = chatUser.name.charAt(0).toUpperCase();
        }
    }

    const chatHeaderLeft = document.querySelector('.chat-view-header > div:first-child');
    if (chatHeaderLeft) {
        chatHeaderLeft.style.cursor = 'pointer';
        chatHeaderLeft.onclick = () => router.navigate('main/userProfile');
    }

    let isStillFriend = true;
    try {
        const token = localStorage.getItem('hyeme_token');
        const relRes = await fetch(`${API_BASE}/users/relationship/${chatUser.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const relData = await relRes.json();
        if (relData.status !== 'friend') {
            isStillFriend = false;
            if (statusEl) { statusEl.textContent = 'Not available'; statusEl.style.color = 'var(--text-secondary)'; }
            msgInput.disabled = true; sendBtn.disabled = true; msgInput.placeholder = 'You are no longer connected';
        }
    } catch (e) { console.error("Error checking relationship:", e); }

    const updateStatusDisplay = () => {
        if (!isStillFriend) { if (statusEl) { statusEl.textContent = 'Not available'; statusEl.style.color = 'var(--text-secondary)'; } return; }
        if (statusEl) {
            if (chatUser.isOnline) { statusEl.textContent = 'Online'; statusEl.style.color = 'green'; }
            else { const time = chatUser.lastSeen ? new Date(chatUser.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''; statusEl.textContent = `Last seen ${time}`; statusEl.style.color = 'var(--text-secondary)'; }
        }
    };
    updateStatusDisplay();

    if (socket) {
        socket.off('userStatus');
        socket.on('userStatus', (data) => {
            if (!isStillFriend) return;
            if (data.userId.toString() === chatUser.id.toString()) { chatUser.isOnline = (data.status === 'online'); chatUser.lastSeen = data.lastSeen; updateStatusDisplay(); }
        });
    }

    const loadHistory = async () => {
        try {
            const token = localStorage.getItem('hyeme_token');
            const chatRes = await fetch(`${API_BASE}/chats/create`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ participantId: chatUser.id }) });
            if (!chatRes.ok) throw new Error("Failed to create/get chat");
            const chatData = await chatRes.json();

            await fetch(`${API_BASE}/chats/read-status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ chatId: chatData._id }) });
            if (socket && socket.connected) { socket.emit('markMessagesAsRead', { chatId: chatData._id, senderId: chatUser.id.toString() }); }

            const msgRes = await fetch(`${API_BASE}/chats/${chatData._id}/messages`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (msgRes.ok) {
                const messages = await msgRes.json();
                if (msgContainer) {
                    msgContainer.innerHTML = '';
                    if (messages.length === 0) { msgContainer.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px;">No messages yet. Say hello!</p>'; }
                    else { messages.forEach(msg => { const isMe = msg.sender && msg.sender._id.toString() === myUser._id.toString(); appendMessageToUI(msg, isMe); }); const myBubbles = msgContainer.querySelectorAll('.msg-me .fa-eye'); myBubbles.forEach(icon => { icon.classList.remove('eye-black', 'eye-grey'); icon.classList.add('eye-white'); }); }
                    scrollToBottom();
                }
            }
        } catch (err) { console.error("Error loading history:", err); if (msgContainer) msgContainer.innerHTML = `<p style="padding:20px;text-align:center;color:red;">Error loading chat</p>`; }
    };

    const sendMessage = () => {
        const text = msgInput.value.trim();
        if (!text) return;
        if (!socket || !socket.connected) { alert("Message not sent: Chat socket is disconnected."); return; }
        const tempMsg = { content: text, createdAt: new Date(), status: 'grey' };
        appendMessageToUI(tempMsg, true); msgInput.value = ''; scrollToBottom();
        socket.emit('sendMessage', { recipientId: chatUser.id, recipientName: chatUser.name, senderId: myUser._id, senderName: myUser.name, content: text });
    };

    const appendMessageToUI = (msg, isMe) => {
        if (!msgContainer) return;
        const bubble = document.createElement('div');

        // HYEME UNIQUE CONTACT CARD
        if (msg.type === 'contact') {
            try {
                const contactData = JSON.parse(msg.content);
                const senderName = msg.sender ? msg.sender.name : 'Someone';

                bubble.className = 'msg-bubble msg-them'; // Contact cards always render as 'them' style for clarity
                bubble.style.background = 'var(--bg-main)';
                bubble.style.border = '1px solid var(--border-color)';
                bubble.style.padding = '0';
                bubble.style.overflow = 'hidden';
                bubble.style.maxWidth = '85%';
                bubble.style.cursor = 'pointer';

                bubble.innerHTML = `
                    <div style="background:var(--primary);padding:8px 14px;display:flex;align-items:center;gap:6px;">
                        <i class="fas fa-user-circle" style="color:white;font-size:14px;"></i>
                        <span style="color:white;font-size:12px;font-weight:600;">Contact Card</span>
                    </div>
                    <div style="padding:14px;display:flex;align-items:center;gap:12px;">
                        <div class="chat-avatar" style="width:45px;height:45px;font-size:18px;background:var(--primary-light);color:white;font-weight:bold;">
                            ${contactData.avatar ? `<img src="${contactData.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">` : contactData.name.charAt(0)}
                        </div>
                        <div>
                            <div style="font-weight:700;color:var(--text-main);font-size:15px;">${contactData.name}</div>
                            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;"><i class="fas fa-phone" style="font-size:10px;margin-right:4px;"></i>${contactData.phone}</div>
                        </div>
                    </div>
                `;

                bubble.onclick = () => {
                    localStorage.setItem('current_chat_user', JSON.stringify({ id: contactData.userId, name: contactData.name, avatar: contactData.avatar }));
                    router.navigate('main/chatView');
                };
                bubble.onmouseenter = () => bubble.style.opacity = '0.9';
                bubble.onmouseleave = () => bubble.style.opacity = '1';

            } catch (e) {
                bubble.className = 'msg-bubble msg-them'; bubble.innerHTML = `<div>Error loading contact</div>`;
            }
        } else {
            // STANDARD TEXT MESSAGE
            bubble.className = `msg-bubble ${isMe ? 'msg-me' : 'msg-them'}`;
            let eyeClass = 'eye-black';
            if (msg.status === 'grey') eyeClass = 'eye-grey';
            if (msg.status === 'white') eyeClass = 'eye-white';
            const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
            bubble.innerHTML = `<div>${msg.content}</div>${isMe ? `<div class="msg-status"><i class="fas fa-eye ${eyeClass}"></i> ${time}</div>` : ''}`;
        }
        msgContainer.appendChild(bubble);
    };

    const scrollToBottom = () => { if (msgContainer) requestAnimationFrame(() => msgContainer.scrollTop = msgContainer.scrollHeight); };

    if (backBtn) backBtn.onclick = () => router.navigate('main/chats');
    if (sendBtn) { sendBtn.addEventListener('click', (e) => { e.preventDefault(); sendMessage(); }); }
    if (msgInput) { msgInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }); }

    if (socket) {
        socket.off('receiveMessage');
        socket.on('receiveMessage', (data) => {
            if (data.senderId === chatUser.id) {
                appendMessageToUI(data, false); scrollToBottom();
                if (document.visibilityState === 'hidden') playNotificationSound();
                if (document.visibilityState === 'visible' && router.currentRoute === 'main/chatView') { socket.emit('markMessagesAsRead', { chatId: data.chatId, senderId: data.senderId.toString() }); }
            }
        });
                // FIX: Correctly handle Read Receipts (White Eye)
        socket.off('messageStatus');
        socket.on('messageStatus', (data) => {
            if (data.status === 'white' && msgContainer) {
                // Logic: When the other user reads our message, turn our eye icons white
                const myBubbles = msgContainer.querySelectorAll('.msg-me .fa-eye');
                myBubbles.forEach(icon => {
                    icon.classList.remove('eye-black', 'eye-grey');
                    icon.classList.add('eye-white');
                });
            }
        });
    }
    loadHistory();
};

function playNotificationSound() { const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.m4a'); audio.volume = 0.5; audio.play().catch(e => console.log("Audio play failed:", e)); }
function showToast(message) { const toast = document.createElement('div'); toast.textContent = message; toast.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:12px 24px;border-radius:24px;font-size:14px;z-index:1000;animation:fadein 0.5s;white-space:nowrap;`; document.body.appendChild(toast); setTimeout(() => { toast.style.animation = 'fadeout 0.5s'; setTimeout(() => toast.remove(), 500); }, 3000); }
if (!document.getElementById('toast-anims')) { const style = document.createElement('style'); style.id = 'toast-anims'; style.innerHTML = `@keyframes fadein {from{bottom:0;opacity:0;}to{bottom:80px;opacity:1;}} @keyframes fadeout {from{bottom:80px;opacity:1;}to{bottom:0;opacity:0;}}`; document.head.appendChild(style); }