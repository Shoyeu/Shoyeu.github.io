const crypto = require('crypto');

function hash(pass) {
    return crypto.createHash('sha256').update(pass).digest('hex');
}

console.log('Admin (VexCommunity):', hash('VexCommunity'));
console.log('Owner (YourGirl1):', hash('YourGirl1'));
