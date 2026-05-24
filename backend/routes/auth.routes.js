const express = require("express");
const axios = require("axios");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación del sistema
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema PILA
 *     tags: [Auth]
 */
router.post("/login", async (req, res) => {
    try {
        const { tipoDocumento, numeroDocumento, password, claveSecreta } = req.body;

        if (!tipoDocumento || !numeroDocumento || !password || !claveSecreta) {
            return res.status(400).json({
                ok: false,
                mensaje: "Todos los campos son obligatorios"
            });
        }

        const usuario = `${tipoDocumento}${numeroDocumento}`;

        return res.json({
            ok: true,
            mensaje: "Login correcto",
            usuario,
            tokenDemo: "TOKEN_DEMO_WEB_PILA"
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: "Error al iniciar sesión",
            error: error.message
        });
    }
});

module.exports = router;