const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Endpoint to save players
app.post('/api/save-players', (req, res) => {
    try {
        const data = req.body;
        const fileContent = `const PLAYERS_DATA = ${JSON.stringify(data, null, 4)};`;

        fs.writeFileSync(path.join(__dirname, 'players.js'), fileContent, 'utf8');

        console.log(`[${new Date().toISOString()}] Players data updated successfully.`);
        res.json({ success: true, message: 'File saved successfully' });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ success: false, message: 'Failed to save file' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`   - Auto Publish API: Active`);
    console.log(`   - Keep this terminal open to allow auto-saving.`);
});
