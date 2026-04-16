export const initNavbar = () => {
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('page-title');

    console.log("Initializing Navbar... Found items:", navItems.length);

    navItems.forEach((item, index) => {
        const target = item.dataset.target;
        console.log(`Setting up button ${index}: Target is '${target}'`);

        // 1. Force remove any old click events by cloning
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);

        // 2. Add the new click listener
        newItem.addEventListener('click', (e) => {
            // We use try/catch to prevent ANY error from stopping the click
            try {
                e.preventDefault();
                e.stopPropagation();
                
                // Double check the target
                const finalTarget = newItem.dataset.target;
                console.log("Button Clicked! Going to:", finalTarget);

                if (!finalTarget) {
                    console.error("Navigation Error: No target found on this button");
                    return;
                }

                // 1. Visual Update
                navItems.forEach(i => i.classList.remove('active'));
                newItem.classList.add('active');

                // 2. Header Update
                if (pageTitle) {
                    const title = finalTarget.charAt(0).toUpperCase() + finalTarget.slice(1);
                    pageTitle.textContent = title;
                }
                
                // 3. FORCE NAVIGATION
                window.dispatchEvent(new CustomEvent('navChange', { detail: finalTarget }));
                
            } catch (err) {
                console.error("Click failed, but forcing navigation anyway:", err);
                // Emergency fallback
                window.dispatchEvent(new CustomEvent('navChange', { detail: newItem.dataset.target }));
            }
        }, { passive: false }); // passive: false allows preventDefault to work
    });
};