
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());

// RUTA PRINCIPAL
app.get('/', (req, res) => {
    res.json({
        mensaje: 'API INVENTARIO FUNCIONANDO CORRECTAMENTE'
    });
});

// CONEXIÓN DE PRODUCTOS
app.use('/api/productos', require('./routes/producto.routes'));

// VERIFICAR CONEXIÓN MYSQL Y ENCENDER SERVIDOR
const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        await db.query('SELECT 1');

        console.log('================================');
        console.log(' CONEXIÓN MYSQL EXITOSA');
        console.log(' BASE DE DATOS: bd_inventario');
        console.log('================================');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`SERVIDOR ACTIVO EN PUERTO ${PORT}`);
            console.log(`URL: http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('ERROR DE CONEXIÓN MYSQL:');
        console.error(error.message);
        process.exit(1);
    }
}

iniciarServidor();
