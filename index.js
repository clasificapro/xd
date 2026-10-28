const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const timestamp = new Date().toISOString();
                
                // Formateamos todo el JSON recibido de forma limpia y ordenada (como pedías)
                const jsonFormatted = JSON.stringify(data, null, 4);
                
                const logEntry = `=== [${timestamp}] NUEVO REGISTRO JSON ===\n${jsonFormatted}\n=========================================\n\n`;
                
                console.log("JSON completo guardado en logs.txt");

                fs.appendFile('logs.txt', logEntry, err => {
                    if (err) console.error("Error al guardar en el archivo:", err);
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "success", message: "JSON guardado" }));
            } catch (e) {
                console.error("Error al procesar JSON:", e);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "error", message: "JSON inválido" }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Ruta no encontrada");
    }
});

const PORT = process.env.PORT || 26237;
server.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
