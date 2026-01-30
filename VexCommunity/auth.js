/**
 * Simple Client-Side Authentication
 * Note: For true security, use a backend server.
 */

const AUTH_ROLES = {
    // Admin Password: "VexCommunity"
    'e2aa7325d854144856c5ee305f5f06f0dde91f1ecd33924db866813eb860ff85': 'admin',

    // Owner Password: "YourGirl1"
    '84716060c365b140341227d181077fe8d4c8105f9322ec5cefeb3027eac0153b': 'owner',

    // Fallback/Override Token
    'owner_override': 'owner'
};

const Auth = {
    async login(username, password) {
        // We ignore username for now and just check password hash

        // Hardcoded Fallback for debugging/reliability
        if (password === 'YourGirl1') {
            sessionStorage.setItem('vex_auth_token', 'owner_override');
            sessionStorage.setItem('vex_auth_role', 'owner');
            return true;
        }

        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (AUTH_ROLES[hashHex]) {
            const role = AUTH_ROLES[hashHex];
            sessionStorage.setItem('vex_auth_token', hashHex);
            sessionStorage.setItem('vex_auth_role', role);
            return true;
        }
        return false;
    },

    check() {
        const token = sessionStorage.getItem('vex_auth_token');
        if (token && AUTH_ROLES[token]) {
            return true;
        }
        return false;
    },

    getRole() {
        return sessionStorage.getItem('vex_auth_role') || 'guest';
    },

    logout() {
        sessionStorage.removeItem('vex_auth_token');
        sessionStorage.removeItem('vex_auth_role');
        window.location.href = 'index.html';
    },

    protect() {
        if (!this.check()) {
            window.location.href = 'login.html';
        }
    }
};
