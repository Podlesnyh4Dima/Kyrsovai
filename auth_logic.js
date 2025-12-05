const USERS_KEY = 'rpg_users_db';
const CURRENT_USER_KEY = 'rpg_current_user';


function getUsers() {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch (e) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveUser(user) {
    const users = getUsers();
    users.push(user);
    saveUsers(users);
}

function updateUser(updatedUser) {
    const users = getUsers();
    const index = users.findIndex(u => u.email === updatedUser.email);
    if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
}

window.getCurrentUser = function() {
    try {
        const user = sessionStorage.getItem(CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
};

function loginUser(user) {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    window.location.href = 'profile.html';
}

function logoutUser() {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'login.html';
}

window.updateUserPurchase = function(cartItems) {
    const user = window.getCurrentUser();
    if (!user) return false;

    if (!user.purchased) user.purchased = [];
    
    let addedCount = 0;
    cartItems.forEach(cartItem => {
        const alreadyOwns = user.purchased.some(p => p.id === cartItem.id);
        if (!alreadyOwns) {
            user.purchased.push({
                id: cartItem.id,
                name: cartItem.name,
                cost: cartItem.cost,
                date: new Date().toLocaleDateString()
            });
            addedCount++;
        }
    });

    if (addedCount > 0) {
        updateUser(user);
        return true;
    } else if (cartItems.length > 0) {
        return true; 
    }
    return false;
};

function updateHeaderAuth() {
    const user = window.getCurrentUser();
    
    const desktopContainer = document.getElementById('desktop-auth-container');
    const mobileContainer = document.getElementById('mobile-auth-container');

    let desktopHTML = '';
    let mobileHTML = '';

    if (user) {
        desktopHTML = `
            <a href="profile.html" class="profile-link" style="color: var(--accent-green); border-bottom: 1px dashed;">👤 ${user.username}</a>
            <a href="#" id="desktop-logout-link">Выйти</a>
        `;

        mobileHTML = `
            <a href="profile.html" style="color: var(--accent-green);">👤 Профиль (${user.username})</a>
            <button id="mobile-logout-btn" class="btn" style="background: #8b0000; margin-top: 10px; width: 100%;">Выйти</button>
        `;

    } else {

        desktopHTML = `
            <a href="login.html">Войти</a>
            <a href="register.html">Зарегистрироваться</a>
        `;

        mobileHTML = `
            <a href="login.html">Войти</a>
            <a href="register.html">Зарегистрироваться</a>
        `;
    }

    if (desktopContainer) desktopContainer.innerHTML = desktopHTML;
    if (mobileContainer) mobileContainer.innerHTML = mobileHTML;

    if (user) {
        const desktopLogout = document.getElementById('desktop-logout-link');
        const mobileLogout = document.getElementById('mobile-logout-btn');

        if (desktopLogout) {
            desktopLogout.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        }

        if (mobileLogout) {
            mobileLogout.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderAuth();

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = document.getElementById('register-message');
            const username = document.getElementById('username-input').value.trim();
            const email = document.getElementById('email-input').value.trim();
            const password = document.getElementById('password-input').value;
            const confirm = document.getElementById('confirm-password-input').value;

            if (password !== confirm) {
                msg.textContent = 'Пароли не совпадают!';
                msg.className = 'message-area error';
                return;
            }

            const users = getUsers();
            if (users.some(u => u.email === email)) {
                msg.textContent = 'Email уже занят.';
                msg.className = 'message-area error';
                return;
            }

            saveUser({ username, email, password, purchased: [] });
            msg.textContent = 'Успешно! Переходим на вход...';
            msg.className = 'message-area success';
            setTimeout(() => window.location.href = 'login.html', 1500);
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = document.getElementById('login-message');
            const loginInput = document.getElementById('login-input').value.trim();
            const password = document.getElementById('password-input').value;
            const users = getUsers();
            
            const user = users.find(u => (u.email === loginInput || u.username === loginInput) && u.password === password);

            if (user) {
                msg.textContent = 'Вход выполнен!';
                msg.className = 'message-area success';
                setTimeout(() => loginUser(user), 1000);
            } else {
                msg.textContent = 'Неверные данные.';
                msg.className = 'message-area error';
            }
        });
    }

    const profileName = document.getElementById('profile-username');
    if (profileName) {
        const user = window.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        profileName.textContent = user.username;
        document.getElementById('profile-email').textContent = user.email;

        const listContainer = document.getElementById('purchased-items-container');
        if (user.purchased && user.purchased.length > 0) {
            listContainer.innerHTML = user.purchased.map(item => `
                <div class="purchased-item">
                    <h4 style="color: #00FF00; margin-bottom: 5px;">${item.name}</h4>
                    <p style="font-size: 0.9em; color: #ccc;">ID: ${item.id}</p>
                    <p>Куплено за: ${item.cost} руб.</p>
                    <div class="download-link">Скачать файлы</div>
                </div>
            `).join('');
        } else {
            listContainer.innerHTML = '<p>Вы пока ничего не купили.</p>';
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.onclick = logoutUser;
    }
});