
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// VALIDAR LOS DATOS
function validarProducto(req, res, next) {
    const {
        nombre,
        precio_compra,
        precio_venta,
        stock_actual,
        stock_minimo,
        unidad_medida
    } = req.body;

    if (
        !nombre || !nombre.trim() ||
        precio_compra === undefined ||
        precio_venta === undefined ||
        stock_actual === undefined ||
        stock_minimo === undefined ||
        !unidad_medida || !unidad_medida.trim()
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }

    if (
        !Number.isFinite(Number(precio_compra)) ||
        !Number.isFinite(Number(precio_venta)) ||
        Number(precio_compra) < 0 ||
        Number(precio_venta) < 0
    ) {
        return res.status(400).json({
            mensaje: 'Los precios no pueden ser negativos'
        });
    }

    if (
        !Number.isInteger(Number(stock_actual)) ||
        !Number.isInteger(Number(stock_minimo)) ||
        Number(stock_actual) < 0 ||
        Number(stock_minimo) < 0
    ) {
        return res.status(400).json({
            mensaje: 'El stock debe ser un número entero no negativo'
        });
    }

    next();
}

// LISTAR PRODUCTOS
router.get('/', async (req, res) => {
    try {
        const [productos] = await db.query(
            'SELECT * FROM producto ORDER BY id DESC'
        );

        res.json(productos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al listar productos',
            error: error.message
        });
    }
});

// PRODUCTOS CON STOCK BAJO
router.get('/stock-bajo', async (req, res) => {
    try {
        const [productos] = await db.query(
            `SELECT * FROM producto
             WHERE stock_actual <= stock_minimo
             ORDER BY stock_actual ASC`
        );

        res.json(productos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al consultar stock bajo',
            error: error.message
        });
    }
});

// BUSCAR PRODUCTOS POR NOMBRE
router.get('/buscar/:nombre', async (req, res) => {
    try {
        const nombre = `%${req.params.nombre}%`;

        const [productos] = await db.query(
            'SELECT * FROM producto WHERE nombre LIKE ?',
            [nombre]
        );

        res.json(productos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar productos',
            error: error.message
        });
    }
});

// REGISTRAR PRODUCTO
router.post('/', validarProducto, async (req, res) => {
    try {
        const {
            nombre,
            estado = 'ACTIVO',
            precio_compra,
            precio_venta,
            stock_actual,
            stock_minimo,
            unidad_medida
        } = req.body;

        const [resultado] = await db.query(
            `INSERT INTO producto
            (nombre, estado, precio_compra, precio_venta,
            stock_actual, stock_minimo, unidad_medida)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre.trim(),
                estado,
                precio_compra,
                precio_venta,
                stock_actual,
                stock_minimo,
                unidad_medida.trim()
            ]
        );

        res.status(201).json({
            mensaje: 'Producto registrado correctamente',
            id: resultado.insertId
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al registrar producto',
            error: error.message
        });
    }
});

// ACTUALIZAR PRODUCTO
router.put('/:id', validarProducto, async (req, res) => {
    try {
        const {
            nombre,
            estado = 'ACTIVO',
            precio_compra,
            precio_venta,
            stock_actual,
            stock_minimo,
            unidad_medida
        } = req.body;

        const [resultado] = await db.query(
            `UPDATE producto SET
            nombre = ?,
            estado = ?,
            precio_compra = ?,
            precio_venta = ?,
            stock_actual = ?,
            stock_minimo = ?,
            unidad_medida = ?
            WHERE id = ?`,
            [
                nombre.trim(),
                estado,
                precio_compra,
                precio_venta,
                stock_actual,
                stock_minimo,
                unidad_medida.trim(),
                req.params.id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json({
            mensaje: 'Producto actualizado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar producto',
            error: error.message
        });
    }
});

// ELIMINAR PRODUCTO
router.delete('/:id', async (req, res) => {
    try {
        const [resultado] = await db.query(
            'DELETE FROM producto WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json({
            mensaje: 'Producto eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar producto',
            error: error.message
        });
    }
});

module.exports = router;
