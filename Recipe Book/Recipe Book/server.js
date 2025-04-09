// server.js
const express = require('express');
const connectDB = require('./DB/connect');

const app = express();
const PORT = 3000;

connectDB();

app.use(express.json());
app.use(express.static(__dirname)); // Serve HTML, CSS, JS

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
