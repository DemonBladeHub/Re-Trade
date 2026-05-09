/**
 * RE:TRADE NEXUS v4.0 - PROFESSIONAL EDITION
 * Lines: 200+ | Features: 2x Multiplier, Counter-Offer System, Multi-Modal UI
 */

// --- GLOBAL CONSTANTS ---
const FRUIT_DATABASE = [
    { name: "Kitsune", img: "Kitsune_Fruit.webp", r: "mythic" },
    { name: "Dragon", img: "Dragon_Fruit.webp", r: "mythic" },
    { name: "Spirit", img: "Spirit_Fruit.webp", r: "mythic" },
    { name: "Control", img: "Control_Fruit.webp", r: "mythic" },
    { name: "Venom", img: "Venom_Fruit.webp", r: "mythic" },
    { name: "Shadow", img: "Shadow_Fruit.webp", r: "mythic" },
    { name: "Dough", img: "Dough_Fruit.webp", r: "mythic" },
    { name: "T-Rex", img: "T-Rex_Fruit.webp", r: "mythic" },
    { name: "Mammoth", img: "Mammoth_Fruit.webp", r: "mythic" },
    { name: "Leopard", img: "Tiger_Fruit.webp", r: "mythic" },
    { name: "Gas", img: "Gas_Fruit.webp", r: "mythic" },
    { name: "Yeti", img: "Yeti_Fruit.webp", r: "mythic" },
    { name: "Gravity", img: "Gravity_Fruit.webp", r: "mythic" },
    { name: "Blizzard", img: "Blizzard_Fruit.webp", r: "legend" },
    { name: "Pain", img: "Pain_Fruit.webp", r: "legend" },
    { name: "Portal", img: "Portal_Fruit.webp", r: "legend" },
    { name: "Phoenix", img: "Phoenix_Fruit.webp", r: "legend" },
    { name: "Sound", img: "Sound_Fruit.webp", r: "legend" },
    { name: "Spider", img: "Spider_Fruit.webp", r: "legend" },
    { name: "Love", img: "Love_Fruit.webp", r: "legend" },
    { name: "Buddha", img: "Buddha_Fruit.webp", r: "legend" },
    { name: "Quake", img: "Quake_Fruit.webp", r: "legend" },
    { name: "Lightning", img: "Lightning_Fruit.webp", r: "legend" },
    { name: "Magma", img: "Magma_Fruit.webp", r: "rare" },
    { name: "Ghost", img: "Ghost_Fruit.webp", r: "rare" },
    { name: "Rubber", img: "Rubber_Fruit.webp", r: "rare" },
    { name: "Light", img: "Light_Fruit.webp", r: "rare" },
    { name: "Diamond", img: "Diamond_Fruit.webp", r: "rare" },
    { name: "Dark", img: "Dark_Fruit.webp", r: "rare" },
    { name: "Sand", img: "Sand_Fruit.webp", r: "rare" },
    { name: "Ice", img: "Ice_Fruit.webp", r: "rare" },
    { name: "Falcon", img: "Eagle_Fruit.webp", r: "rare" },
    { name: "Flame", img: "Flame_Fruit.webp", r: "uncommon" },
    { name: "Spike", img: "Spike_Fruit.webp", r: "uncommon" },
    { name: "Smoke", img: "Smoke_Fruit.webp", r: "common" },
    { name: "Bomb", img: "Bomb_Fruit.webp", r: "common" },
    { name: "Spring", img: "Spring_Fruit.webp", r: "common" },
    { name: "Chop", img: "Blade_Fruit.webp", r: "common" },
    { name: "Spin", img: "Spin_Fruit.webp", r: "common" },
    { name: "Rocket", img: "Rocket_Fruit.webp", r: "common" }
];

// --- APP STATE ---
let STATE = {
    sessionUser: "Guest",
    sessionPfp: "",
    builderCart: [],
    counterCart: [],
    activeTrades: [],
    unreadNotifs: 0,
    currentOfferContext: null
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    bindUIEvents();
});

function bindUIEvents() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.onclick = handleUserLogin;

    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.onclick = () => switchNavigation(tab));

    const chatSend = document.getElementById('chat-send-btn');
    if (chatSend) chatSend.onclick = dispatchChatMessage;
}

// --- USER AUTHENTICATION ---
async function handleUserLogin() {
    const urlInput = document.getElementById('profile-link');
    const rawUrl = urlInput.value.trim();
    
    // Improved regex for Roblox User IDs
    const userIdMatch = rawUrl.match(/\/users\/(\d+)/);
    const userId = userIdMatch ? userIdMatch[1] : "1701382414";

    STATE.sessionUser = "Trader_" + userId.slice(0, 5);
    STATE.sessionPfp = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png`;

    // Visual Transition
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');

    // UI Updates
    document.getElementById('pfp-img').src = STATE.sessionPfp;
    document.getElementById('pfp-name').innerText = STATE.sessionUser;

    generateFruitGrids();
}

// --- CORE LOGIC: FRUIT SELECTION & 2X SYSTEM ---
function generateFruitGrids() {
    const builderGrid = document.getElementById('fruit-picker-grid');
    const counterGrid = document.getElementById('counter-picker-grid');
    
    const fruitCards = FRUIT_DATABASE.map(fruit => `
        <div class="fruit-item ${fruit.r}" onclick="processSelection('${fruit.name}')">
            <img src="${fruit.img}" onerror="this.src='https://via.placeholder.com/50'">
            <span>${fruit.name}</span>
        </div>
    `).join('');

    builderGrid.innerHTML = fruitCards;
    counterGrid.innerHTML = fruitCards;
}

window.processSelection = (fruitName) => {
    // Determine if we are in the Counter Offer modal or the Main Builder
    const isCounterMode = !document.getElementById('counter-modal').classList.contains('hidden');
    let activeCart = isCounterMode ? STATE.counterCart : STATE.builderCart;
    let displayEl = document.getElementById(isCounterMode ? 'counter-display' : 'give-display');

    const existingIdx = activeCart.findIndex(f => f.name === fruitName);

    if (existingIdx !== -1) {
        // Multiplier Logic: 1x -> 2x -> Remove
        if (activeCart[existingIdx].qty === 1) {
            activeCart[existingIdx].qty = 2;
        } else {
            activeCart.splice(existingIdx, 1);
        }
    } else {
        if (activeCart.length >= 4) return alert("Limit: 4 fruit slots!");
        activeCart.push({ name: fruitName, qty: 1 });
    }

    refreshCartDisplay(activeCart, displayEl);
};

function refreshCartDisplay(cart, element) {
    if (cart.length === 0) {
        element.innerText = "Nothing Selected";
        return;
    }
    element.innerText = cart.map(f => `${f.qty > 1 ? '2x ' : ''}${f.name}`).join(" + ");
}

// --- MARKET BROADCASTING ---
window.broadcastTrade = () => {
    if (STATE.builderCart.length === 0) return;

    const tradeId = Date.now();
    const tradeEntry = {
        id: tradeId,
        owner: STATE.sessionUser,
        ownerPfp: STATE.sessionPfp,
        offering: [...STATE.builderCart]
    };

    STATE.activeTrades.unshift(tradeEntry);
    STATE.builderCart = []; // Clear Cart
    refreshCartDisplay([], document.getElementById('give-display'));
    
    syncMarketUI();
    document.querySelector('[data-tab="market"]').click();
};

function syncMarketUI() {
    const market = document.getElementById('trade-feed-container');
    if (STATE.activeTrades.length === 0) {
        market.innerHTML = `<p class="empty-msg">No active trades in the market.</p>`;
        return;
    }

    market.innerHTML = STATE.activeTrades.map(t => `
        <div class="trade-card">
            <div class="card-header">
                <img src="${t.ownerPfp}">
                <b>${t.owner}</b>
            </div>
            <div class="card-body">
                <label>OFFERING:</label>
                <p>${t.offering.map(i => `${i.qty > 1 ? '2x ' : ''}${i.name}`).join(" + ")}</p>
            </div>
            <button class="offer-btn" onclick="openCounterOfferFlow('${t.owner}', ${t.id})">OFFER</button>
        </div>
    `).join('');
}

// --- COUNTER OFFER FLOW ---
window.openCounterOfferFlow = (targetUser, tradeId) => {
    STATE.currentOfferContext = { targetUser, tradeId };
    STATE.counterCart = [];
    refreshCartDisplay([], document.getElementById('counter-display'));
    document.getElementById('counter-modal').classList.remove('hidden');
};

window.submitCounterOffer = () => {
    if (STATE.counterCart.length === 0) return alert("Choose what you want to offer back!");

    // Update Notification System
    STATE.unreadNotifs++;
    updateNotificationUI();

    const inbox = document.getElementById('inbox-list');
    if (inbox.querySelector('.empty-msg')) inbox.innerHTML = '';

    const counterStr = STATE.counterCart.map(i => `${i.qty > 1 ? '2x ' : ''}${i.name}`).join(" + ");
    
    const inboxItem = document.createElement('div');
    inboxItem.className = 'inbox-card';
    inboxItem.innerHTML = `
        <div class="inbox-header">NEW OFFER FROM <b>${STATE.currentOfferContext.targetUser}</b></div>
        <div class="inbox-body">
            They are offering: <span class="highlight">${counterStr}</span>
        </div>
        <div class="inbox-actions">
            <button class="acc-btn" onclick="acceptInboxTrade('${STATE.currentOfferContext.targetUser}', this)">ACCEPT</button>
            <button class="dec-btn" onclick="declineInboxTrade(this)">DECLINE</button>
        </div>
    `;
    
    inbox.prepend(inboxItem);
    document.getElementById('counter-modal').classList.add('hidden');
};

// --- INBOX LOGIC ---
window.acceptInboxTrade = (user, btn) => {
    btn.parentElement.parentElement.innerHTML = `
        <div style="text-align:center; padding:10px;">
            <p style="color:#00ff88; font-weight:bold; margin:0;">TRADE ACCEPTED</p>
            <span style="font-size:11px; opacity:0.6;">Connecting to encrypted chat...</span>
        </div>
    `;
    
    setTimeout(() => {
        initiateChatSession(user);
    }, 800);
};

window.declineInboxTrade = (btn) => {
    const card = btn.parentElement.parentElement;
    card.style.opacity = '0';
    card.style.transform = 'translateX(20px)';
    setTimeout(() => card.remove(), 300);
};

// --- CHAT & NAVIGATION ---
function initiateChatSession(user) {
    document.getElementById('chat-target').innerText = user;
    const msgBox = document.getElementById('chat-messages');
    msgBox.innerHTML = `<div class="msg them">Hello! I'm interested in the trade. Let's make it happen.</div>`;
    document.getElementById('chat-overlay').classList.remove('hidden');
}

function dispatchChatMessage() {
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;

    const msgBox = document.getElementById('chat-messages');
    msgBox.innerHTML += `<div class="msg me">${text}</div>`;
    input.value = "";
    msgBox.scrollTop = msgBox.scrollHeight;
}

function switchNavigation(activeBtn) {
    const target = activeBtn.dataset.tab;
    
    // Update Active Button
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');

    // Update Panes
    document.querySelectorAll('.pane').forEach(p => p.classList.add('hidden'));
    document.getElementById('view-' + target).classList.remove('hidden');

    if (target === 'inbox') {
        STATE.unreadNotifs = 0;
        updateNotificationUI();
    }
}

function updateNotificationUI() {
    const badge = document.getElementById('notif-badge');
    if (STATE.unreadNotifs > 0) {
        badge.innerText = STATE.unreadNotifs;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Utility Helpers
window.closeChat = () => document.getElementById('chat-overlay').classList.add('hidden');
window.closeCounterModal = () => document.getElementById('counter-modal').classList.add('hidden');
