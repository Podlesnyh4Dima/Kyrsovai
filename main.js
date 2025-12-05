document.addEventListener('DOMContentLoaded', function () {

    let shoppingCart = JSON.parse(sessionStorage.getItem('shoppingCart')) || [];
    const cartIcon = document.querySelector('.resource-cart'); 
    const cartItemList = document.getElementById('cart-item-list'); 
    const cartValueDisplay = document.getElementById('cart-value-display'); 

    window.addToCart = function(id, name, cost) {
        const numericCost = parseInt(cost);
        const existingItem = shoppingCart.find(item => item.id === id);
        
        if (existingItem) {
            window.showToast(`"${name}" уже в корзине!`);
        } else {
            shoppingCart.push({
                id: id,
                name: name,
                cost: numericCost,
                quantity: 1
            });
            if (cartIcon) animateCartIconStarburst(cartIcon);
            updateCartDisplay();
        }
    };

    window.getCartValue = function() {
        return shoppingCart.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    };

    window.showToast = function(message) {
        let toast = document.querySelector('.custom-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'custom-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 3000);
    };

    function animateCartIconStarburst(element) {
        if (!element) return;
        element.style.transform = "scale(1.2)";
        element.style.color = "#00FF00";
        setTimeout(() => {
            element.style.transform = "scale(1)";
            element.style.color = "";
        }, 300);
        
        const numParticles = 8;
        const duration = 500; 
        const containerRect = element.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;
        const centerY = containerRect.top + containerRect.height / 2 + window.scrollY;

        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('starburst-particle');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = '#00FF00'; 
            particle.style.borderRadius = '50%';
            particle.style.zIndex = '1000';
            particle.style.pointerEvents = 'none';
            document.body.appendChild(particle);

            let startTime = performance.now();
            const angle = (360 / numParticles) * i * (Math.PI / 180); 
            const radius = Math.random() * 50 + 30; 
            
            particle.style.left = `${centerX - 2}px`;
            particle.style.top = `${centerY - 2}px`;

            function move(timestamp) {
                const elapsed = timestamp - startTime;
                let progress = elapsed / duration;
                if (progress < 1) {
                    const currentX = Math.cos(angle) * (radius * progress);
                    const currentY = Math.sin(angle) * (radius * progress);
                    particle.style.opacity = 1 - progress; 
                    particle.style.transform = `translate(${currentX}px, ${currentY}px)`;
                    requestAnimationFrame(move);
                } else {
                    particle.remove();
                }
            }
            requestAnimationFrame(move);
        }
    }

    function updateCartDisplay() {
        if (!cartItemList) return;
        cartItemList.innerHTML = '';
        
        let totalCost = 0;
        let totalItems = 0;

        if (shoppingCart.length === 0) {
            cartItemList.innerHTML = '<p class="empty-cart-message">Корзина пуста.</p>';
            if (cartValueDisplay) cartValueDisplay.textContent = '0 руб.';
            sessionStorage.setItem('shoppingCart', JSON.stringify([]));
            updateCartButtons(false);
            if (cartIcon) cartIcon.setAttribute('aria-label', `Корзина пуста`);
            return;
        } 
        
        shoppingCart.forEach(item => {
            totalCost += item.cost * item.quantity;
            totalItems += item.quantity;

            const listItem = document.createElement('div');
            listItem.className = 'cart-item';
            listItem.style.display = 'flex';
            listItem.style.justifyContent = 'space-between';
            listItem.style.marginBottom = '5px';
            listItem.style.borderBottom = '1px solid #333';
            listItem.style.paddingBottom = '5px';

            listItem.innerHTML = `
                <div class="item-info">
                    <span>${item.name}</span>
                    <span class="item-unit-cost" style="color:#aaa; font-size:0.8em;">(${item.cost} р.)</span>
                </div>
                <div class="item-controls">
                    <button class="remove-item-btn" data-id="${item.id}" style="background:red; color:white; border:none; cursor:pointer;">×</button>
                </div>
            `;
            cartItemList.appendChild(listItem);
        });
            
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromCart(e.target.dataset.id);
            });
        });

        updateCartButtons(true);

        if (cartValueDisplay) cartValueDisplay.textContent = `${totalCost} руб.`;
        sessionStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
        if (cartIcon) cartIcon.setAttribute('aria-label', `В корзине: ${totalItems}. Сумма: ${totalCost}`);
    }

    function removeFromCart(id) {
        shoppingCart = shoppingCart.filter(item => item.id !== id);
        updateCartDisplay();
    }

    function updateCartButtons(hasItems) {
        const tooltip = document.querySelector('.cart-tooltip');
        if (!tooltip) return;

        let actionsDiv = tooltip.querySelector('.cart-actions');
        
        if (!actionsDiv) {
            const oldClear = document.getElementById('clear-cart-btn');
            if (oldClear && !oldClear.closest('.cart-actions')) oldClear.remove();

            actionsDiv = document.createElement('div');
            actionsDiv.className = 'cart-actions';
            actionsDiv.style.cssText = "display: flex; gap: 5px; margin-top: 10px;";
            
            actionsDiv.innerHTML = `
                <button id="checkout-btn" class="btn full-width-btn" style="flex: 1; background: var(--accent-green); color: black; font-weight:bold;">Купить</button>
                <button id="clear-cart-btn" class="btn full-width-btn" style="flex: 1; background: #444; color: white;">Сброс</button>
            `;
            tooltip.appendChild(actionsDiv);

            document.getElementById('clear-cart-btn').addEventListener('click', () => {
                shoppingCart = [];
                updateCartDisplay();
            });

            document.getElementById('checkout-btn').addEventListener('click', () => {
                const userSession = sessionStorage.getItem('rpg_current_user'); 
                
                if (!userSession) {
                    if (confirm("Для покупки необходимо войти в аккаунт. Перейти на страницу входа?")) {
                        window.location.href = 'login.html';
                    }
                    return;
                }

                if (window.updateUserPurchase) {
                    const success = window.updateUserPurchase(shoppingCart);
                    if (success) {
                        alert("Спасибо за покупку! Плагины добавлены в ваш личный кабинет.");
                        shoppingCart = []; 
                        updateCartDisplay();
                        window.location.href = 'profile.html'; 
                    }
                } else {
                    console.error("auth_logic.js не подключен!");
                }
            });
        }

        actionsDiv.style.display = hasItems ? 'flex' : 'none';
    }

    updateCartDisplay();
    if (cartIcon) cartIcon.addEventListener('click', (e) => e.stopPropagation());

    
    const sortSelect = document.getElementById('sort-plugins');
    const gridContainer = document.querySelector('.grid-container');
    const minCostInput = document.getElementById('min-cost-filter');
    const maxCostInput = document.getElementById('max-cost-filter');
    const applyFilterButton = document.getElementById('apply-filter-btn');

    if (sortSelect) sortSelect.addEventListener('change', runPluginViewUpdate); 
    if (applyFilterButton) applyFilterButton.addEventListener('click', runPluginViewUpdate);
    
    function runPluginViewUpdate() {
        if (!gridContainer || !sortSelect || !minCostInput || !maxCostInput) return; 

        const items = Array.from(gridContainer.querySelectorAll('.grid-item'));
        const minCost = parseInt(minCostInput.value) || 0; 
        const maxCost = parseInt(maxCostInput.value) || Infinity; 
        
        items.forEach(item => {
            const btn = item.querySelector('.download-plugin-btn, .buy-button');
            if (btn) {
                const cost = parseInt(btn.dataset.cost);
                item.style.display = (cost >= minCost && cost <= maxCost) ? '' : 'none'; 
            }
        });
        
        const sortBy = sortSelect.value;
        items.sort((a, b) => {
            const btnA = a.querySelector('.download-plugin-btn, .buy-button');
            const btnB = b.querySelector('.download-plugin-btn, .buy-button');
            const costA = btnA ? parseInt(btnA.dataset.cost) : 0;
            const costB = btnB ? parseInt(btnB.dataset.cost) : 0;
            
            let nameA = a.dataset.title ? a.dataset.title.toUpperCase() : '';
            let nameB = b.dataset.title ? b.dataset.title.toUpperCase() : '';

            if (sortBy === 'cost-asc') return costA - costB;
            if (sortBy === 'cost-desc') return costB - costA;
            if (sortBy === 'name-asc') return nameA > nameB ? 1 : -1;
            if (sortBy === 'name-desc') return nameA < nameB ? 1 : -1;
            return 0;
        });

        items.forEach(item => gridContainer.appendChild(item));
    }

    const imageTypeFilter = document.getElementById('image-type-filter');
    const thumbnailGrid = document.querySelector('.thumbnails-container'); 
    const mainGalleryImage = document.getElementById('main-gallery-image');

    function runGalleryFilterUpdate() {
        if (!imageTypeFilter || !thumbnailGrid || !mainGalleryImage) return;

        const selectedType = imageTypeFilter.value;
        const thumbnails = Array.from(thumbnailGrid.querySelectorAll('.thumbnail'));
        let firstVisibleThumbnail = null;
        let isCurrentActiveVisible = false;
        let activeThumbnail = thumbnailGrid.querySelector('.active-thumb');

        thumbnails.forEach(thumb => {
            if (selectedType === 'all' || thumb.dataset.type === selectedType) {
                thumb.style.display = ''; 
                if (!firstVisibleThumbnail) firstVisibleThumbnail = thumb;
                if (activeThumbnail === thumb) isCurrentActiveVisible = true;
            } else {
                thumb.style.display = 'none'; 
                if (thumb.classList.contains('active-thumb')) thumb.classList.remove('active-thumb');
            }
        });
        
        if (!isCurrentActiveVisible && firstVisibleThumbnail) {
             thumbnails.forEach(t => t.classList.remove('active-thumb'));
             mainGalleryImage.src = firstVisibleThumbnail.dataset.fullSrc;
             mainGalleryImage.dataset.type = firstVisibleThumbnail.dataset.type;
             firstVisibleThumbnail.classList.add('active-thumb');
        }
        
        if (!firstVisibleThumbnail) {
            mainGalleryImage.src = '';
            mainGalleryImage.alt = 'Нет изображений';
        }
    }

    if (window.location.pathname.toLowerCase().includes('gallery.html')) {
        if (imageTypeFilter) imageTypeFilter.addEventListener('change', runGalleryFilterUpdate); 
        runGalleryFilterUpdate();
    }

    if (mainGalleryImage && thumbnailGrid) {
        thumbnailGrid.addEventListener('click', function(event) {
            const thumb = event.target.closest('.thumbnail');
            if (!thumb || thumb.style.display === 'none') return;

            mainGalleryImage.classList.remove('zoom-in');
            mainGalleryImage.style.opacity = 0; 

            setTimeout(() => {
                mainGalleryImage.src = thumb.getAttribute('data-full-src');
                mainGalleryImage.dataset.type = thumb.dataset.type;
                
                mainGalleryImage.classList.add('zoom-in');
                mainGalleryImage.style.opacity = 1;

            }, 50);

            thumbnailGrid.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active-thumb'));
            thumb.classList.add('active-thumb');
        });
    }

    const menuIcon = document.querySelector('.menu-icon');
    const mobileNav = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.overlay');

    if (menuIcon && mobileNav && overlay) {
        const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
        function closeMenu() {
            menuIcon.classList.remove('open');
            mobileNav.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        function toggleMenu() {
            const isOpen = menuIcon.classList.toggle('open');
            mobileNav.classList.toggle('open', isOpen);
            overlay.classList.toggle('active', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        }
        menuIcon.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', closeMenu);
        mobileNavLinks.forEach(link => link.addEventListener('click', closeMenu));
    }

    
    const parallaxBg = document.querySelector('.parallax-bg');
    if (parallaxBg) {
        window.addEventListener('scroll', () => {
            parallaxBg.style.transform = `translate3d(0, ${window.scrollY * -0.2}px, 0)`;
        });
    }
    
    const footerContainer = document.querySelector('footer');
    if (footerContainer) {
        footerContainer.addEventListener('click', async function(event) {
            const targetLink = event.target.closest('a');
            if (!targetLink || !targetLink.href.startsWith('http')) return;
            if (targetLink.hostname === window.location.hostname) return;

            event.preventDefault(); 
            const shouldLeave = await showLinkConfirmModal(targetLink.href);
            if (shouldLeave) window.open(targetLink.href, '_blank'); 
        });
    }

});