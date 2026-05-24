const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const planillaRoutes = require("./routes/planilla.routes");
const swaggerDocs = require("./swagger");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/planillas", planillaRoutes);

swaggerDocs(app);

app.get("/", (req, res) => {
    res.json({
        ok: true,
        mensaje: "API WEB PILA funcionando correctamente 🚀"
    });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});