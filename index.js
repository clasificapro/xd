const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/log') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const timestamp = new Date().toISOString();
                const logEntry = `[${timestamp}] IP: ${data.ip} | User: ${data.username} (ID: ${data.userid}) | HWID: ${data.hwid} | Ubicación: ${data.city}, ${data.country}\n`;
                
                console.log("Nuevo registro recibido:", data);

                fs.appendFile('logs.txt', logEntry, err => {
                    if (err) console.error("Error al guardar:", err);
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "success", message: "Guardado correctamente" }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "error", message: "JSON inválido" }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Ruta no encontrada");
    }
});

// Forzar el puerto exacto que te asignó Bot-Hosting
const PORT = 26237;

server.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
