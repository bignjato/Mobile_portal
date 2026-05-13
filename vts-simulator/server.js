const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4100;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🧪 VTS Simulator pokrenut na http://localhost:${PORT}`);
  console.log(`   (cilja vts-api na http://localhost:4000 — promjenjivo u UI)\n`);
});
