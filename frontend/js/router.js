class Router {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.currentRoute = null;
    }

    getContainer() {
        if (!this.container) {
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                console.error(`Router: Container #${containerId} not found!`);
                return null;
            }
        }
        return this.container;
    }

    async navigate(path) {
        // Prevent navigating to the same route
        if (this.currentRoute === path) {
            console.log(`Router: Already at ${path}, skipping`);
            return;
        }
        
        this.currentRoute = path;
        console.log(`Router: Navigating to ${path}`);
        
        const container = this.getContainer();
        if (!container) {
            console.error("Router: No container available");
            return;
        }

        try {
            // Show loading state
            container.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--bg-main);">
                    <div style="text-align:center;">
                        <i class="fas fa-circle-notch fa-spin" style="font-size:24px;color:var(--primary);"></i>
                        <p style="color:var(--text-secondary);margin-top:10px;">Loading...</p>
                    </div>
                </div>
            `;

            const response = await fetch(`./pages/${path}.html`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to load ${path}.html`);
            }
            
            const html = await response.text();
            
            if (!html || html.trim() === '') {
                throw new Error(`Empty response for ${path}.html`);
            }

            container.innerHTML = html;
            
            // Dispatch event for app to initialize page
            window.dispatchEvent(new CustomEvent('routeChanged', { 
                detail: path 
            }));
            
            console.log(`Router: Successfully loaded ${path}`);
            
        } catch (error) {
            console.error(`Router Error for ${path}:`, error);
            
            // Show error state
            container.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--bg-main);flex-direction:column;">
                    <i class="fas fa-exclamation-triangle" style="font-size:48px;color:var(--danger);margin-bottom:16px;"></i>
                    <p style="color:var(--text-secondary);padding:20px;text-align:center;">Failed to load page</p>
                    <button onclick="window.location.reload()" style="margin-top:16px;padding:12px 24px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;">Retry</button>
                </div>
            `;
        }
    }

    // Utility method to get current route
    getCurrentRoute() {
        return this.currentRoute;
    }

    // Go back in history
    back() {
        console.log("Router: Going back...");
        // This can be expanded to implement history
        window.history.back();
    }
}

// Export singleton instance
const router = new Router('screen-container');
export default router;