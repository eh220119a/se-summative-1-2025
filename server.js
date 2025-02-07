const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS for frontend access

const DATA_FOLDER = path.join(__dirname, 'data'); // Directory where CSV files are stored

if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER);
}

app.get('/files', (req, res) => {
    fs.readdir(DATA_FOLDER, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read directory' });
        }
        const csvFiles = files.filter(file => file.endsWith('.csv'));
        res.json(csvFiles);
    });
});

// Serve a CSV file dynamically
app.get('/data/:filename', (req, res) => {
    const filePath = path.join(DATA_FOLDER, req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    res.sendFile(filePath);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
