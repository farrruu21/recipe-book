const http = require('http');
const url = require('url');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const fs = require('fs');
const querystring = require('querystring');

const urlMongo = 'mongodb://localhost:27017';
const dbName = 'user-info';
let db;

// Connect to MongoDB
MongoClient.connect(urlMongo, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch(error => console.error('MongoDB connection error:', error));

async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  if (parsedUrl.pathname === '/register' && method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      const { name, email, password } = querystring.parse(body);

      try {
        const existingUser = await db.collection('users').findOne({ email });

        if (existingUser) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          return res.end('Email is already registered.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('users').insertOne({
          name,
          email,
          password: hashedPassword,
          recipes: [],
          fav: [],
          search_history: [null, null, null],
        });

        console.log(`✅ Registered user: ${email}`);
        res.writeHead(302, { Location: '/reg-log.html?form=login' });
        return res.end();
      } catch (err) {
        console.error('Register error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Registration failed.');
      }
    });

  } else if (parsedUrl.pathname === '/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      const { email, password } = querystring.parse(body);

      try {
        const user = await db.collection('users').findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          return res.end('Invalid email or password.');
        }

        console.log(`✅ Logged in: ${email}`);
        res.writeHead(302, { Location: '/home.html' });
        return res.end();
      } catch (err) {
        console.error('Login error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Login failed.');
      }
    });

  } else if (parsedUrl.pathname === '/reg-log.html') {
    fs.readFile(__dirname + '/reg-log.html', 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Error loading reg-log.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(data);
    });

  } else if (parsedUrl.pathname === '/home.html') {
    fs.readFile(__dirname + '/home.html', 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Error loading home.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(data);
    });

  } else {
    // Serve other static files (images, css, etc.)
    const filePath = __dirname + parsedUrl.pathname;
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }

      // Set content-type based on file extension
      let contentType = 'text/plain';
      if (filePath.endsWith('.css')) contentType = 'text/css';
      else if (filePath.endsWith('.js')) contentType = 'application/javascript';
      else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (filePath.endsWith('.png')) contentType = 'image/png';

      res.writeHead(200, { 'Content-Type': contentType });
      return res.end(data);
    });
  }
}

const server = http.createServer(handleRequest);
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
