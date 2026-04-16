import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

let socket = null;

export const initSocket = (token, userId) => {
    console.log("initSocket called with userId:", userId);
    
    if (!token) {
        console.error("No token provided, cannot connect socket");
        return null;
    }

    if (socket) {
        if(socket.userId !== userId) {
            console.log("User ID changed, disconnecting old socket");
            try { socket.disconnect(); } catch(e) { console.log("Disconnect error:", e); }
            socket = null;
        } else {
            if (socket.connected) return socket;
            else { console.log("Socket was disconnected, reconnecting..."); socket = null; }
        }
    }
    
    console.log("Connecting to Socket.IO server...");
    
    // FIX: Changed from "http://localhost:5000" to "/" so it works on Render/Production
    socket = io("/", {
        auth: { token },
        transports: ['websocket', 'polling'], 
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 20000
    });
    
    socket.userId = userId;

    socket.on("connect", () => {
        console.log("✅ Socket connected successfully!", socket.id);
        if (userId) {
            socket.emit('joinPersonalRoom', userId);
            console.log(`📱 Joined personal room: ${userId}`);
        }
        socket._connected = true;
    });
    
    socket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
        socket._connected = false;
    });
    
    socket.on("disconnect", (reason) => {
        console.log("⚠️ Socket disconnected:", reason);
        socket._connected = false;
        if (reason === "io server disconnect") socket.connect();
    });

    socket.on("reconnect", (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
    });

    socket.on("reconnect_failed", () => {
        console.error("❌ Failed to reconnect after all attempts");
    });
    
    return socket;
};

export const getSocket = () => {
    if (socket && socket.connected) return socket;
    console.warn("⚠️ getSocket() called but no active socket connection");
    return socket;
};

export const isSocketConnected = () => {
    return socket && socket.connected;
};