const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const { initDataFile, addMediaMetadata, readData } = require('./handler');

initDataFile();

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile('./public/index.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }

  // Upload file
  else if (req.url === '/upload' && req.method === 'POST') {
    const form = new formidable.IncomingForm({ uploadDir: './media', keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(400);
        return res.end('Upload error');
      }

      const file = files.file;
      const oldPath = file.filepath;
      const filename = file.originalFilename.replace(/\s+/g, '_');
      const newPath = path.join('./media', filename);

      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          res.writeHead(500);
          return res.end('Could not save file');
        }

        addMediaMetadata(filename, fields.title);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'File uploaded', filename }));
      });
    });
  }

  // Download file
  else if (req.url.startsWith('/download/') && req.method === 'GET') {
    const filename = req.url.split('/download/')[1];
    const filePath = path.join(__dirname, 'media', filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(404);
        return res.end('File not found');
      }

      res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${filename}"`
      });

      fs.createReadStream(filePath).pipe(res);
    });
  }

  // Get media metadata
  else if (req.url === '/media' && req.method === 'GET') {
    const mediaData = readData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mediaData));
  }

  // Handle 404
  else {
    res.writeHead(404);
    res.end('Path not found');
  }
});

server.listen(3000, () => console.log('Server running at http://localhost:3000'));
