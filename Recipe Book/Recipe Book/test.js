const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const querystring = require('querystring');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/recipebook')
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Failed:', err));

// Define Recipe Schema
const recipeSchema = new mongoose.Schema({
  r_id: Number,
  name: String,
  description: String,
  ingredients: String,
  steps: String,
  uploaded_by: String,
  category: String
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// Create HTTP Server
const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    // Serve HTML form
    fs.readFile(path.join(__dirname, 'test.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Error loading form.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });

  } else if (req.method === 'POST') {
    // Handle form submission
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      const parsedData = querystring.parse(body);
      console.log('Parsed Data:', parsedData);

      const r_id = parsedData.r_id ? parseInt(parsedData.r_id) : Math.floor(Math.random() * 10000);

      const newRecipe = new Recipe({
        r_id: r_id,
        name: parsedData.name,
        description: parsedData.description,
        ingredients: parsedData.ingredients,
        steps: parsedData.steps,
        uploaded_by: parsedData.uploaded_by,
        category: parsedData.category
      });

      try {
        await newRecipe.save();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Recipe saved successfully!');
      } catch (err) {
        console.error('Error saving recipe:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to save recipe.');
      }
    });
  }
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
