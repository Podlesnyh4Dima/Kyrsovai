document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.grid-container');
    const items = document.querySelectorAll('.grid-item');

    let angle = 0;             
    let speed = 0.0035;
    let isInitialized = false;

    function animateCircle() {
        if (window.innerWidth <= 900) {
            if (!isInitialized) {
                items.forEach(item => {
                    item.style.opacity = '1';
                    item.style.transform = 'none'; 
                });
                isInitialized = true;
            }
            return;
        }

        const radius = (container.offsetWidth / 2) - 90;
        const centerX = container.offsetWidth / 2;
        const centerY = container.offsetHeight / 2;

        const count = items.length;
        const step = (2 * Math.PI) / count;

        items.forEach((item, i) => {
            const a = angle + i * step;

            const x = centerX + radius * Math.cos(a);
            const y = centerY + radius * Math.sin(a);

            const rotateOut = a + Math.PI / 2;

            const tilt = Math.sin(a) * 20;

            item.style.left = `${x}px`;
            item.style.top = `${y}px`;

            item.style.transform =
                `translate(-50%, -50%) rotate(${rotateOut}rad) rotateX(${tilt}deg)`;
        });

        if (!isInitialized) {
            items.forEach(item => {
                item.style.opacity = '1';
                item.style.transition = 'none'; 
            });
            isInitialized = true;
            
            setTimeout(() => {
                items.forEach(item => item.style.transition = '');
            }, 50); 
        }

        angle += speed;
        requestAnimationFrame(animateCircle);
    }

    const panel = document.getElementById('central-description-panel');
    const panelTitle = document.getElementById('panel-title');
    const panelDescription = document.getElementById('panel-description');
    const closeBtn = document.getElementById('close-panel-btn');

    items.forEach(item => {
        item.addEventListener('click', e => {
            const originalTransition = item.style.transition;
            item.style.transition = 'none';

            if (e.target.closest('.buy-button')) return;
            panelTitle.textContent = item.dataset.title;
            panelDescription.textContent = item.dataset.description;
            panel.classList.add('active');

            setTimeout(() => {
                item.style.transition = originalTransition;
            }, 50); 
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.classList.remove('active');
        });
    }

    const buyButtons = document.querySelectorAll('.buy-button');

    buyButtons.forEach(button => {
        button.addEventListener('click', e => {
            e.stopPropagation();

            const item = button.closest('.grid-item');
            const pluginId = item.dataset.pluginId;
            const pluginName = item.dataset.title;
            const pluginCost = button.dataset.cost;

            if (typeof window.addToCart === 'function') {
                window.addToCart(pluginId, pluginName, pluginCost);

                if (typeof window.showToast === 'function') {
                    window.showToast(`Плагин "${pluginName}" добавлен в корзину!`);
                }
            } else {
                alert('Ошибка: main.js не загружен.');
            }
        });
    });

    function checkPurchasedStatus() {
        if (typeof window.getCurrentUser !== 'function') return;

        const user = window.getCurrentUser();
        if (!user || !user.purchased) return;

        const bought = user.purchased.map(p => p.id);

        items.forEach(item => {
            if (!bought.includes(item.dataset.pluginId)) return;

            const btn = item.querySelector('.buy-button');
            if (!btn) return;

            btn.textContent = 'Куплено';
            btn.disabled = true;
            btn.style.backgroundColor = '#555';
            btn.style.cursor = 'default';

            const clone = btn.cloneNode(true);
            btn.parentNode.replaceChild(clone, btn);
        });
    }


    checkPurchasedStatus();
    requestAnimationFrame(animateCircle);
});