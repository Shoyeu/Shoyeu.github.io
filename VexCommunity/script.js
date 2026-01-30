// ========================================
// VexCommunity - Minecraft Combat Rankings
// JavaScript Module
// ========================================

// Tier Badge Assets
const TIER_ICONS = {
    grandmaster: 'https://files.catbox.moe/wt42ry.webp',
    master: 'https://files.catbox.moe/fn7fsh.webp',
    ace: 'https://files.catbox.moe/52livs.webp',
    specialist: 'https://files.catbox.moe/jx50dt.webp',
    cadet: 'https://files.catbox.moe/53gu84.webp',
    novice: 'https://files.catbox.moe/wwpcz6.webp',
    rookie: 'https://files.catbox.moe/xvs503.webp'
};

// Gamemode Icons (for Modal)
const GAMEMODE_ICONS = { // Using the same as tabs for consistency
    dmsmp: 'https://files.catbox.moe/k1wmty.svg',
    nethsmp: 'https://files.catbox.moe/4v1v68.svg',
    nethpot: 'https://files.catbox.moe/dck1k8.svg',
    dmpot: 'https://files.catbox.moe/gyj4mp.svg',
    cpvp: 'https://files.catbox.moe/f8nu9z.svg',
    mace: 'https://files.catbox.moe/j1khcp.svg'
};

// Sample Player Data with Granular Ranks
// Data loaded from players.js or LocalStorage Preview
let players = [];
const localPreview = localStorage.getItem('vex_preview_data');

if (localPreview) {
    try {
        players = JSON.parse(localPreview);
        // Banner removed
    } catch (e) {
        console.error("Preview data invalid", e);
        players = (typeof PLAYERS_DATA !== 'undefined') ? PLAYERS_DATA : [];
    }
} else {
    players = (typeof PLAYERS_DATA !== 'undefined') ? PLAYERS_DATA : [];
}

// Minecraft Avatar API
function getPlayerAvatar(uuid, size = 48) {
    return `https://mc-heads.net/avatar/${uuid}/${size}`;
}

// Gamemode Keys in Order (matching the tabs and tiers array)
const GAMEMODE_KEYS = ['dmsmp', 'nethsmp', 'nethpot', 'dmpot', 'cpvp', 'mace'];

// Render tier badges with mapped icons
// Render tier badges with mapped icons (Fixed to use gamemodes object)
function renderTierBadges(player) {
    // Fallback if gamemodes is missing
    if (!player.gamemodes) return '';

    return GAMEMODE_KEYS.map(key => {
        const tier = player.gamemodes[key];
        // Skip if empty/null
        if (!tier || tier === '-' || tier === '') return '';

        const iconUrl = GAMEMODE_ICONS[key] || '';
        return `
            <div class="tier-badge-container" title="${key.toUpperCase()}: ${tier}">
                <img src="${iconUrl}" class="tier-mode-icon" alt="${key}">
                <div class="tier-badge ${tier.toLowerCase()}">${tier.toUpperCase()}</div>
            </div>
        `;
    }).join('');
}

// ... existing renderPlayerRow ...

// Category Tab Logic
// Category Tab Logic moved to bottom (consolidated)

// Make available globally for inline onclick
window.openPlayerByUuid = function (uuid) {
    const player = players.find(p => p.uuid === uuid);
    if (player) {
        openPlayerModal(player);
    } else {
        console.error("Player not found:", uuid);
    }
};

// Render player row
function renderPlayerRow(player) {
    const rankClass = player.rank <= 3 ? `rank-${player.rank}` : '';
    const rowClass = player.rank <= 3 ? `special-rank-${player.rank}` : '';
    // Escape single quotes in UUID just in case
    const safeUuid = player.uuid.replace(/'/g, "\\'");

    return `
        <div class="player-row ${rowClass}" onclick="window.openPlayerByUuid('${safeUuid}')" style="cursor: pointer;">
            <div class="player-rank ${rankClass}">${player.rank}.</div>
            <div class="player-info">
                <img class="player-avatar" src="${getPlayerAvatar(player.uuid)}" alt="${player.name}" loading="lazy">
                <div class="player-details">
                    <div class="player-name">${player.name}</div>
                    <div class="player-tier-badge">
                        ${TIER_ICONS[player.tier] ? `<img class="tier-icon" src="${TIER_ICONS[player.tier]}" alt="${player.tierName}">` : ''}
                        <span class="tier-name ${player.tier}">${player.tierName}</span>
                    </div>
                    <div class="player-points">(<span>${player.points} points</span>)</div>
                </div>
            </div>
            <div class="region-badge ${player.region.toLowerCase()}">${player.region}</div>
            <div class="tier-icons">${renderTierBadges(player)}</div>
        </div>
    `;
}

// Render all players
function renderPlayers(playerList) {
    const rankingsBody = document.getElementById('rankingsBody');
    if (rankingsBody) {
        rankingsBody.innerHTML = playerList.map(renderPlayerRow).join('');
        // Inline onclick handles events now, no need for setupRowClickListeners
    }

    const countEl = document.getElementById('totalPlayers');
    if (countEl) countEl.textContent = playerList.length;
}

// Modal Logic
function setupModal() {
    const modal = document.getElementById('playerModal');
    const closeBtn = document.querySelector('.close-modal');

    if (closeBtn) {
        closeBtn.onclick = function () {
            modal.style.display = 'none';
        }
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // New Info Modal Logic
    const infoModal = document.getElementById('infoModal');
    const closeInfoBtn = document.querySelector('.close-info-modal');
    const modalTabs = document.querySelectorAll('.modal-tab');
    const infoBtn = document.getElementById('infoBtn'); // Assuming an info button exists to open this modal

    if (infoBtn && infoModal) {
        infoBtn.addEventListener('click', () => {
            infoModal.style.display = 'block';
        });

        if (closeInfoBtn) {
            closeInfoBtn.addEventListener('click', () => {
                infoModal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                infoModal.style.display = 'none';
            }
        });

        // Tab Switching Logic
        modalTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                modalTabs.forEach(t => t.classList.remove('active'));
                // Add active to clicked tab
                tab.classList.add('active');

                // Hide all contents
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                    content.classList.remove('active');
                });

                // Show target content
                const targetId = `tab-${tab.dataset.tab}`;
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.style.display = 'block';
                    // Small delay to allow display block to take effect before adding active class if we had fade animations, 
                    // but for now simple switching.
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // Rules Modal Logic
    const rulesBtn = document.getElementById('rulesBtn');
    const rulesModal = document.getElementById('rulesModal');
    const closeRulesBtn = document.querySelector('.close-rules-modal');

    if (rulesBtn && rulesModal) {
        rulesBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior
            rulesModal.style.display = 'block';
        });

        if (closeRulesBtn) {
            closeRulesBtn.addEventListener('click', () => {
                rulesModal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === rulesModal) {
                rulesModal.style.display = 'none';
            }
        });
    }
}

// Redesigned Modal Logic
function openPlayerModal(player) {
    const modal = document.getElementById('playerModal');

    // Safety check for tiers/gamemodes
    const gamemodeList = GAMEMODE_KEYS.map(key => {
        const rank = player.gamemodes ? (player.gamemodes[key] || '-') : '-';
        if (rank === '-' || rank === '') return null; // Skip empty
        return { key, rank, icon: GAMEMODE_ICONS[key] };
    }).filter(item => item !== null);

    // Escape UUID logic preserved
    const safeUuid = player.uuid.replace(/'/g, "\\'");

    const modalContent = `
        <div class="profile-modal-content">
            <div class="close-modal-btn" onclick="document.getElementById('playerModal').style.display='none'">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </div>
            
            <div class="profile-decoration"></div>

            <div class="profile-section">
                <div class="profile-avatar-container">
                    <img src="${getPlayerAvatar(player.uuid, 128)}" class="profile-avatar" alt="${player.name}">
                </div>
                <h2 class="profile-name">${player.name}</h2>
                
                <div class="main-rank-badge">
                    <img src="${TIER_ICONS[player.tier] || ''}" class="rank-icon-sm">
                    ${player.tierName}
                </div>
                
                <div class="profile-region">${getFullRegionName(player.region)}</div>
                
                <div class="profile-tagline">VERIFIED</div>
            </div>
            
            <div class="stats-container">
                <div class="section-label">POSITION</div>
                <div class="position-box">
                    <div class="rank-number-box">#${player.rank}</div>
                    <div class="overall-stats">
                        <span class="trophy-icon">🏆</span>
                        OVERALL
                        <span class="points-muted">(${player.points} points)</span>
                    </div>
                </div>
                
                <div class="section-label">TIERS</div>
                <div class="tiers-scroll-container">
                    ${gamemodeList.map(gm => `
                        <div class="tier-item-pill">
                            <img src="${gm.icon}" class="tier-circle-icon" title="${gm.key.toUpperCase()}">
                            <span class="tier-rank-badge-sm ${getTierColorClass(gm.rank)}">${gm.rank}</span>
                        </div>
                    `).join('')}
                    ${gamemodeList.length === 0 ? '<span style="color:#666; font-size:0.8rem;">No ranks yet</span>' : ''}
                </div>
            </div>
        </div>
    `;

    // We replace the entire Inner HTML of the modal container (excluding the wrapper definition if needed, 
    // but here we replace the content inside #playerModal directly by recreating the wrapper or just injecting).
    // The #playerModal in index.html has a .modal-content inside it normally. 
    // Since we want to completely restyle, let's just wipe #playerModal's children and insert our new .modal-content.

    modal.innerHTML = modalContent;
    modal.style.display = 'flex'; // Use flex for centering as per css
}

// Helper for Region Names
function getFullRegionName(code) {
    const maps = { 'NA': 'North America', 'EU': 'Europe', 'AS': 'Asia', 'SA': 'South America' };
    return maps[code] || code;
}

// Helper for Tier Colors (HT/LT)
function getTierColorClass(rank) {
    if (!rank) return '';
    const r = rank.toLowerCase();
    if (r.includes('ht')) return 'ht1'; // Blue/High
    if (r.includes('lt')) return 'lt1'; // Gold/Low
    return '';
}

// Simulated NameMC Wrapper Usage
// NOTE: "namemcwrapper" is a Node.js library. In the browser, we'd use a proxy or API.
// Below is a simulation of how it would behave after "installing" it.
async function fetchSkinHistory(uuid, container) {
    try {
        // Since we can't use the Node package in browser directly without bundler,
        // we simulate the data or fetch from a public skin source.

        /* 
        // Real Usage (if using Node/Bundler):
        import { NameMC } from "namemcwrapper";
        const nameMc = new NameMC();
        const skins = await nameMc.skinHistory({ nickname: nickname });
        */

        // Simulation for UI Demo:
        await new Promise(r => setTimeout(r, 1000)); // Fake network delay

        // Mock data usually returned by such APIs
        const mockSkins = [
            `https://mc-heads.net/body/${uuid}`,
            // Usually history would be hash based URLs, here we just show the current one repeated 
            // or placeholder as we don't have a real history API endpoint handy without CORS.
            // Using different HEAD renders to simulate history for visual effect
            `https://mc-heads.net/head/${uuid}/right`,
            `https://mc-heads.net/head/${uuid}/left`
        ];

        container.innerHTML = mockSkins.map(url => `
            <div class="skin-item">
                <img src="${url}" class="skin-img" alt="Skin">
                <div style="font-size: 0.7rem; color: #888; margin-top: 4px;">Apr 2025</div>
            </div>
        `).join('');

        // Example logging requested by user
        console.log("Mock NameMC Data:", {
            uuid: uuid,
            skins: mockSkins
        });

    } catch (err) {
        container.innerHTML = '<div style="color: red;">Failed to load history</div>';
        console.error(err);
    }
}

function setupRowClickListeners() {
    const rows = document.querySelectorAll('.player-row');
    rows.forEach(row => {
        row.addEventListener('click', () => {
            const uuid = row.dataset.playerId;
            const player = players.find(p => p.uuid === uuid);
            if (player) {
                openPlayerModal(player);
            }
        });

        // Re-apply hover effect logic if needed
        row.addEventListener('mouseenter', () => {
            row.style.background = 'rgba(139, 92, 246, 0.1)';
        });
        row.addEventListener('mouseleave', () => {
            row.style.background = 'transparent';
        });
    });
}

// Copy of search and tab logic
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query === '') {
            renderPlayers(players);
            return;
        }
        const filtered = players.filter(player =>
            player.name.toLowerCase().includes(query)
        );
        renderPlayers(filtered);
    });
}

// Consolidated Category Tab Logic
function setupCategoryTabs() {
    const tabs = document.querySelectorAll('.category-tab');

    // Add "All/Home" behavior: If clicking active tab, reset.
    // But since there isn't a dedicated "All" button, we can make clicking ANY active tab reset to all.

    tabs.forEach(tab => {
        tab.style.cursor = 'pointer';

        tab.addEventListener('click', () => {
            const isActive = tab.classList.contains('active');

            // Reset all tabs
            tabs.forEach(t => t.classList.remove('active'));

            if (isActive) {
                // If clicking already active tab -> Deselect (Show All)
                renderPlayers(players);
                return;
            }

            // Activate new tab
            tab.classList.add('active');
            const category = tab.dataset.category;

            // HANDLE OVERALL (Default View)
            if (category === 'overall') {
                renderPlayers(players);
                return;
            }

            // Safe Filter Logic for specific gamemodes
            const filteredPlayers = players.filter(p => {
                // Safety: check if p.gamemodes exists
                if (!p.gamemodes) return false;

                const val = p.gamemodes[category];
                // Check if value exists and is not a placeholder
                return val && val !== '-' && val !== '';
            });

            renderPlayers(filteredPlayers);
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderPlayers(players);
    setupSearch();
    setupCategoryTabs();
    setupModal();
});
