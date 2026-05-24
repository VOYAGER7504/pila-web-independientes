const express = require("express");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Planillas
 *   description: Gestión de planillas PILA
 */

/**
 * @swagger
 * /api/planillas/liquidar:
 *   post:
 *     summary: Liquidar planilla de independiente
 *     tags: [Planillas]
 */
router.post("/liquidar", async (req, res) => {
    try {

        const {
            nombre,
            tipoDocumento,
            numeroDocumento,
            ibc,
            riesgo
        } = req.body;

        if (!nombre || !tipoDocumento || !numeroDocumento || !ibc || !riesgo) {
            return res.status(400).json({
                ok: false,
                mensaje: "Todos los campos son obligatorios"
            });
        }

        const salud = Math.round(ibc * 0.125);
        const pension = Math.round(ibc * 0.16);

        const riesgos = {
            1: 0.00522,
            2: 0.01044,
            3: 0.02436,
            4: 0.04350,
            5: 0.06960
        };

        const arl = Math.round(ibc * riesgos[riesgo]);

        const total = salud + pension + arl;

        return res.json({
            ok: true,
            mensaje: "Planilla liquidada correctamente",
            data: {
                nombre,
                tipoDocumento,
                numeroDocumento,
                ibc,
                salud,
                pension,
                arl,
                total,
                estado: "LIQUIDADA"
            }
        });

    } catch (error) {

        return res.status(500).json({
            ok: false,
            mensaje: "Error al liquidar planilla",
            error: error.message
        });

    }
});

module.exports = router;