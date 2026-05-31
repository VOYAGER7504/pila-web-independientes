import { useState } from "react";
import axios from "axios";
import "./App.css";

const municipiosPorDepartamento = {
  "05": ["MEDELLÍN", "EL BAGRE", "ITAGÜÍ", "ENVIGADO"],
  "08": ["BARRANQUILLA", "SOLEDAD", "MALAMBO"],
  "11": ["BOGOTÁ"],
  "13": ["CARTAGENA"]
};

function App() {
  const [form, setForm] = useState({
    tipoDocumento: "",
    numeroDocumento: "",
    password: "",
    claveSecreta: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: ""
  });

  const [mensaje, setMensaje] = useState("");
  const [logueado, setLogueado] = useState(false);
  const [moduloActivo, setModuloActivo] = useState("inicio");

  const [periodo, setPeriodo] = useState({
    anio: "2026",
    mes: "Abril"
  });

  const [tipoCotizante, setTipoCotizante] = useState("3");
  const [riesgoARL, setRiesgoARL] = useState("");
  const [subtipoCotizante, setSubtipoCotizante] = useState("");
  const [departamento, setDepartamento] = useState("05");
  const [ibcBase, setIbcBase] = useState("");

  const [novedad, setNovedad] = useState("");
  const [listaNovedades, setListaNovedades] = useState([]);
  const [resultadoLiquidacion, setResultadoLiquidacion] = useState(null);
  const [misLiquidaciones, setMisLiquidaciones] = useState([]);

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [dias, setDias] = useState("");
  const [ibcValor, setIbcValor] = useState("");
  const [centroTrabajo, setCentroTrabajo] = useState("");
  const [claseTarifaVCT, setClaseTarifaVCT] = useState("1");
  const [editandoId, setEditandoId] = useState(null);

  const riesgosPorCotizante = {
    "3": [],
    "51": ["1", "2", "3", "4", "5"],
    "57": ["1", "2", "3", "4", "5"],
    "59": ["1", "2", "3"],
    "73": ["3"]
  };

  const tarifasARL = {
    "1": "0.522%",
    "2": "1.044%",
    "3": "2.436%",
    "4": "4.350%",
    "5": "6.960%"
  };

  const mesesNumero = {
    Enero: "01",
    Febrero: "02",
    Marzo: "03",
    Abril: "04",
    Mayo: "05",
    Junio: "06",
    Julio: "07",
    Agosto: "08",
    Septiembre: "09",
    Octubre: "10",
    Noviembre: "11",
    Diciembre: "12"
  };

  const riesgosDisponibles = riesgosPorCotizante[tipoCotizante] || [];
  const municipiosDisponibles = municipiosPorDepartamento[departamento] || [];
  const mesActual = mesesNumero[periodo.mes];
  const fechaMin = `${periodo.anio}-${mesActual}-01`;
  const ultimoDiaMes = new Date(periodo.anio, parseInt(mesActual), 0).getDate();
  const fechaMax = `${periodo.anio}-${mesActual}-${String(ultimoDiaMes).padStart(2, "0")}`;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

const login = async () => {
  if (
    form.tipoDocumento === "CC" &&
    form.numeroDocumento === "123456789" &&
    form.password === "12345" &&
    form.claveSecreta === "12345"
  ) {
    setMensaje("Inicio de sesión exitoso");
    setLogueado(true);
    setModuloActivo("inicio");
  } else {
    setMensaje("Credenciales incorrectas");
  }
};

  function limpiarFormularioNovedad() {
    setNovedad("");
    setFechaInicio("");
    setFechaFin("");
    setDias("");
    setIbcValor("");
    setCentroTrabajo("");
    setClaseTarifaVCT("1");
    setEditandoId(null);
  }

  const limpiarFormularioLiquidacion = () => {
    setResultadoLiquidacion(null);
    setListaNovedades([]);
    limpiarFormularioNovedad();
    setTipoCotizante("3");
    setRiesgoARL("");
    setSubtipoCotizante("");
    setDepartamento("05");
    setIbcBase("");

    setForm((prev) => ({
      ...prev,
      tipoDocumento: "CC",
      numeroDocumento: "",
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: ""
    }));
  };

  const calcularDias = (inicio, fin) => {
    if (!inicio || !fin) return "";

    const fecha1 = new Date(inicio + "T00:00:00");
    const fecha2 = new Date(fin + "T00:00:00");
    const diferencia = fecha2 - fecha1;
    const diasCalculados = Math.floor(diferencia / (1000 * 60 * 60 * 24)) + 1;

    return diasCalculados > 0 ? diasCalculados : "";
  };

  const guardarNovedad = () => {
    if (!novedad) {
      alert("Selecciona una novedad");
      return;
    }

    const diasCalculados =
      ["IGE", "LMA", "IRL", "VCT"].includes(novedad)
        ? calcularDias(fechaInicio, fechaFin)
        : dias;

    const nueva = {
      id: editandoId || Date.now(),
      tipo: novedad,
      fechaInicio,
      fechaFin,
      dias: diasCalculados,
      ibcValor: novedad === "AVP" ? "" : ibcValor,
      nuevoCentroTrabajo: novedad === "VCT" ? centroTrabajo : "",
      tarifa: novedad === "VCT" ? tarifasARL[claseTarifaVCT] : "",
      claseTarifa: novedad === "VCT" ? claseTarifaVCT : "",
      aporteVoluntarioAfiliado: novedad === "AVP" ? ibcValor : "",
      aporteVoluntarioEmpleador: ""
    };

    if (editandoId) {
      setListaNovedades(
        listaNovedades.map((item) =>
          item.id === editandoId ? nueva : item
        )
      );
    } else {
      setListaNovedades([...listaNovedades, nueva]);
    }

    setResultadoLiquidacion(null);
    limpiarFormularioNovedad();
  };

  const editarNovedad = (item) => {
    setEditandoId(item.id);
    setNovedad(item.tipo);
    setFechaInicio(item.fechaInicio || "");
    setFechaFin(item.fechaFin || "");
    setDias(item.dias || "");
    setIbcValor(item.ibcValor || item.aporteVoluntarioAfiliado || "");
    setCentroTrabajo(item.nuevoCentroTrabajo || "");
    setClaseTarifaVCT(item.claseTarifa || "1");
  };

  const eliminarNovedad = (id) => {
    if (window.confirm("¿Estás seguro de eliminar la novedad?")) {
      setListaNovedades(listaNovedades.filter((item) => item.id !== id));
      setResultadoLiquidacion(null);
    }
  };

  const redondearCentenaSuperior = (valor) => {
    return Math.ceil(Number(valor || 0) / 100) * 100;
  };

  const formatearMoneda = (valor) => {
    return `$${Number(valor || 0).toLocaleString("es-CO")}`;
  };

  const obtenerDia = (fechaTexto) => {
    if (!fechaTexto) return null;
    return new Date(fechaTexto + "T00:00:00").getDate();
  };

  const calcularDiasCotizadosPorTramos = () => {
    const ingresos = listaNovedades
      .filter((n) => n.tipo === "ING" && n.fechaInicio)
      .map((n) => obtenerDia(n.fechaInicio))
      .filter(Boolean)
      .sort((a, b) => a - b);

    const retiros = listaNovedades
      .filter((n) => n.tipo === "RET" && n.fechaFin)
      .map((n) => obtenerDia(n.fechaFin))
      .filter(Boolean)
      .sort((a, b) => a - b);

    if (ingresos.length === 0 && retiros.length === 0) {
      return 30;
    }

    if (ingresos.length === 0 && retiros.length > 0) {
      return Math.min(Math.max(...retiros), 30);
    }

    let totalDias = 0;
    const retirosUsados = new Set();

    ingresos.forEach((diaIngreso) => {
      const indiceRetiro = retiros.findIndex(
        (diaRetiro, index) =>
          !retirosUsados.has(index) && diaRetiro >= diaIngreso
      );

      let diaRetiro = 30;

      if (indiceRetiro >= 0) {
        diaRetiro = retiros[indiceRetiro];
        retirosUsados.add(indiceRetiro);
      }

      totalDias += Math.max(diaRetiro - diaIngreso + 1, 0);
    });

    return Math.min(totalDias, 30);
  };

  const validarFormularioLiquidacion = () => {
    if (!form.numeroDocumento.trim()) {
      alert("El número de documento es obligatorio");
      return false;
    }

    if (!form.primerNombre.trim()) {
      alert("El primer nombre es obligatorio");
      return false;
    }

    if (!form.primerApellido.trim()) {
      alert("El primer apellido es obligatorio");
      return false;
    }

    if (!subtipoCotizante) {
      alert("El subtipo de cotizante es obligatorio");
      return false;
    }

    if (!ibcBase || Number(ibcBase) <= 0) {
      alert("Ingresa un IBC válido");
      return false;
    }

    if (tipoCotizante !== "3" && !riesgoARL) {
      alert("Selecciona el riesgo ARL permitido");
      return false;
    }

    return true;
  };

  const calcularLiquidacion = () => {
    if (!validarFormularioLiquidacion()) {
      return;
    }

    const ibcDigitado = Number(ibcBase || 0);
    const diasCotizados = calcularDiasCotizadosPorTramos();
    const ibcProporcional = Math.round((ibcDigitado / 30) * diasCotizados);
    const salud = redondearCentenaSuperior(ibcProporcional * 0.125);

    const pension =
      subtipoCotizante === "0"
        ? redondearCentenaSuperior(ibcProporcional * 0.16)
        : 0;

    let tarifaARL =
      tipoCotizante !== "3" && riesgoARL
        ? parseFloat(tarifasARL[riesgoARL].replace("%", "")) / 100
        : 0;

    let tarifaARLTexto =
      tipoCotizante !== "3" && riesgoARL
        ? tarifasARL[riesgoARL]
        : "0%";

    listaNovedades.forEach((n) => {
      if (n.tipo === "VCT" && n.tarifa) {
        const tarifaDecimal = parseFloat(n.tarifa.replace("%", "")) / 100;

        if (tarifaDecimal > tarifaARL) {
          tarifaARL = tarifaDecimal;
          tarifaARLTexto = n.tarifa;
        }
      }
    });

    const arl =
      tarifaARL > 0
        ? redondearCentenaSuperior(ibcProporcional * tarifaARL)
        : 0;

    const caja = 0;

    const aporteVoluntarioAfiliado = listaNovedades.reduce(
      (total, n) => total + Number(n.aporteVoluntarioAfiliado || 0),
      0
    );

    const aporteVoluntarioEmpleador = listaNovedades.reduce(
      (total, n) => total + Number(n.aporteVoluntarioEmpleador || 0),
      0
    );

    const total =
      salud +
      pension +
      arl +
      caja +
      aporteVoluntarioAfiliado +
      aporteVoluntarioEmpleador;

    const lineasGeneradas =
      1 +
      listaNovedades.filter((n) =>
        ["IGE", "LMA", "IRL"].includes(n.tipo)
      ).length;

    setResultadoLiquidacion({
      diasCotizados,
      ibcProporcional,
      salud,
      pension,
      arl,
      caja,
      aporteVoluntarioAfiliado,
      aporteVoluntarioEmpleador,
      total,
      tarifaARL,
      tarifaARLTexto,
      lineasGeneradas,
      cantidadNovedades: listaNovedades.length,
      tarifaSalud: "12.5%",
      tarifaPension: subtipoCotizante === "0" ? "16%" : "0%"
    });
  };

  const guardarLiquidacion = () => {
    if (!resultadoLiquidacion) {
      alert("Primero debes liquidar la planilla");
      return;
    }

    const nuevaLiquidacion = {
      id: Date.now(),
      periodo: `${periodo.mes} ${periodo.anio}`,
      documento: form.numeroDocumento,
      nombre: `${form.primerNombre} ${form.primerApellido}`.trim(),
      tipoCotizante,
      subtipoCotizante,
      ibc: resultadoLiquidacion.ibcProporcional,
      salud: resultadoLiquidacion.salud,
      pension: resultadoLiquidacion.pension,
      arl: resultadoLiquidacion.arl,
      caja: resultadoLiquidacion.caja,
      aporteVoluntarioAfiliado: resultadoLiquidacion.aporteVoluntarioAfiliado,
      aporteVoluntarioEmpleador: resultadoLiquidacion.aporteVoluntarioEmpleador,
      total: resultadoLiquidacion.total,
      estado: "Liquidada",
      fecha: new Date().toLocaleString()
    };

    setMisLiquidaciones([...misLiquidaciones, nuevaLiquidacion]);
    alert("Liquidación guardada correctamente");

    limpiarFormularioLiquidacion();
    setModuloActivo("misLiquidaciones");
  };

  const eliminarLiquidacion = (id) => {
    if (!window.confirm("¿Deseas eliminar esta liquidación?")) return;

    setMisLiquidaciones(
      misLiquidaciones.filter((item) => item.id !== id)
    );
  };

  const pagarLiquidacion = (id) => {
    if (!window.confirm("¿Estás seguro de pagar esta planilla?")) return;

    setMisLiquidaciones(
      misLiquidaciones.map((item) =>
        item.id === id
          ? { ...item, estado: "Pagada" }
          : item
      )
    );

    alert("Planilla pagada correctamente");
  };

  const exportarExcel = (item) => {
    const contenido =
      "Periodo,Documento,Nombre,IBC,Salud,Pension,ARL,Caja,Aporte voluntario afiliado,Aporte voluntario empleador,Total,Estado\n" +
      `${item.periodo},${item.documento},${item.nombre},${item.ibc},${item.salud},${item.pension},${item.arl},${item.caja},${item.aporteVoluntarioAfiliado},${item.aporteVoluntarioEmpleador},${item.total},${item.estado}\n`;

    const blob = new Blob([contenido], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Liquidacion_${item.periodo}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportarPDF = (item) => {
    const ventana = window.open("", "_blank");

    ventana.document.write(`
      <html>
        <head>
          <title>Liquidación ${item.periodo}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 30px; }
            h1 { color: #b10f3a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>Liquidación de Seguridad Social</h1>
          <table>
            <tr><td><strong>Periodo</strong></td><td>${item.periodo}</td></tr>
            <tr><td><strong>Documento</strong></td><td>${item.documento}</td></tr>
            <tr><td><strong>Nombre</strong></td><td>${item.nombre}</td></tr>
            <tr><td><strong>IBC</strong></td><td>${formatearMoneda(item.ibc)}</td></tr>
            <tr><td><strong>Salud</strong></td><td>${formatearMoneda(item.salud)}</td></tr>
            <tr><td><strong>Pensión</strong></td><td>${formatearMoneda(item.pension)}</td></tr>
            <tr><td><strong>ARL</strong></td><td>${formatearMoneda(item.arl)}</td></tr>
            <tr><td><strong>Caja</strong></td><td>${formatearMoneda(item.caja)}</td></tr>
            <tr><td><strong>Total</strong></td><td>${formatearMoneda(item.total)}</td></tr>
            <tr><td><strong>Estado</strong></td><td>${item.estado}</td></tr>
          </table>
        </body>
      </html>
    `);

    ventana.document.close();
    ventana.print();
  };

  const renderInicio = () => (
    <div className="panel">
      <h2
        style={{
          textAlign: "center",
          marginBottom: "30px",
          color: "#b10f3a"
        }}
      >
        Resumen de mis planillas
      </h2>

      <div className="cards">
        <div className="card-info">
          <h3>Total liquidaciones</h3>
          <strong>{misLiquidaciones.length}</strong>
        </div>

        <div className="card-info">
          <h3>Planillas pagadas</h3>
          <strong>
            {
              misLiquidaciones.filter(
                (item) => item.estado === "Pagada"
              ).length
            }
          </strong>
        </div>

        <div className="card-info">
          <h3>Pendientes de pago</h3>
          <strong>
            {
              misLiquidaciones.filter(
                (item) => item.estado === "Liquidada"
              ).length
            }
          </strong>
        </div>

        <div className="card-info">
          <h3>Total aportes</h3>
          <strong>
            {
              formatearMoneda(
                misLiquidaciones.reduce(
                  (total, item) => total + item.total,
                  0
                )
              )
            }
          </strong>
        </div>
      </div>

      <div className="panel-planilla" style={{ marginTop: "30px" }}>
        <h3>Últimas liquidaciones</h3>

        <table>
          <thead>
            <tr>
              <th>Periodo</th>
              <th>IBC</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {misLiquidaciones.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "25px"
                  }}
                >
                  No tienes liquidaciones registradas
                </td>
              </tr>
            ) : (
              misLiquidaciones
                .slice()
                .reverse()
                .slice(0, 5)
                .map((item) => (
                  <tr key={item.id}>
                    <td>{item.periodo}</td>
                    <td>{formatearMoneda(item.ibc)}</td>
                    <td>{formatearMoneda(item.total)}</td>
                    <td>{item.estado}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMisLiquidaciones = () => (
    <div className="panel">
      <h2>Mis liquidaciones</h2>

      <table>
        <thead>
          <tr>
            <th>Periodo</th>
            <th>Documento</th>
            <th>IBC</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {misLiquidaciones.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                  padding: "25px"
                }}
              >
                No tienes liquidaciones guardadas
              </td>
            </tr>
          ) : (
            misLiquidaciones.map((item) => (
              <tr key={item.id}>
                <td>{item.periodo}</td>
                <td>{item.documento}</td>
                <td>{formatearMoneda(item.ibc)}</td>
                <td>{formatearMoneda(item.total)}</td>
                <td>{item.estado}</td>
                <td
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "center",
                    flexWrap: "wrap"
                  }}
                >
                  <button onClick={() => exportarExcel(item)}>
                    Excel
                  </button>

                  <button onClick={() => exportarPDF(item)}>
                    PDF
                  </button>

                  {item.estado !== "Pagada" && (
                    <button onClick={() => pagarLiquidacion(item.id)}>
                      Pagar
                    </button>
                  )}

                  <button
                    onClick={() => eliminarLiquidacion(item.id)}
                    style={{ background: "#dc3545" }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderAyuda = () => (
    <div className="panel">
      <h2>Ayuda</h2>

      <div className="panel-planilla">
        <h3>¿Cómo liquidar mi planilla?</h3>

        <p>
          1. Selecciona el periodo de cotización.
          <br />
          2. Ingresa tus datos como independiente.
          <br />
          3. Selecciona EPS, AFP y ARL si aplica.
          <br />
          4. Registra novedades si las tienes.
          <br />
          5. Genera la liquidación.
          <br />
          6. Guarda la liquidación y consúltala en Mis liquidaciones.
        </p>
      </div>
    </div>
  );

  const renderLiquidar = () => (
    <div className="panel">
      <h2>Liquidar mi planilla</h2>

      <div className="panel-planilla">
        <h3>Planilla I - Independientes</h3>

        <div className="fila-form">
          <div>
            <label>Año cotización</label>
            <select
              value={periodo.anio}
              onChange={(e) =>
                setPeriodo({
                  ...periodo,
                  anio: e.target.value
                })
              }
            >
              {Array.from({ length: 33 }, (_, i) => 1995 + i).map((anio) => (
                <option key={anio}>{anio}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Mes cotización</label>
            <select
              value={periodo.mes}
              onChange={(e) =>
                setPeriodo({
                  ...periodo,
                  mes: e.target.value
                })
              }
            >
              {Object.keys(mesesNumero).map((mes) => (
                <option key={mes}>{mes}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Año servicio</label>
            <input type="text" value={periodo.anio} disabled />
          </div>

          <div>
            <label>Mes servicio</label>
            <input type="text" value={periodo.mes} disabled />
          </div>

          <div>
            <label>Forma presentación</label>
            <input type="text" value="Único" disabled />
          </div>
        </div>
      </div>

      <div className="panel-planilla">
        <h3>Datos del cotizante</h3>

        <div className="fila-form">
          <div>
            <label>Tipo de cotizante</label>
            <select
              value={tipoCotizante}
              onChange={(e) => {
                setTipoCotizante(e.target.value);
                setRiesgoARL("");
                setResultadoLiquidacion(null);
              }}
            >
              <option value="3">3 - Independiente</option>
              <option value="51">51 - Trabajador tiempo parcial</option>
              <option value="57">57 - Independiente voluntario ARL</option>
              <option value="59">59 - Contratista independiente</option>
              <option value="73">73 - Interno de medicina</option>
            </select>
          </div>

          <div>
            <label>Tipo documento *</label>
            <select
              name="tipoDocumento"
              value={form.tipoDocumento || "CC"}
              onChange={handleChange}
            >
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="TI">TI</option>
              <option value="PA">PA</option>
              <option value="RC">RC</option>
              <option value="PT">PT</option>
            </select>
          </div>

          <div>
            <label>Número documento *</label>
            <input
              type="text"
              name="numeroDocumento"
              placeholder="Número documento"
              value={form.numeroDocumento}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Primer nombre *</label>
            <input
              type="text"
              name="primerNombre"
              placeholder="Primer nombre"
              value={form.primerNombre}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Segundo nombre</label>
            <input
              type="text"
              name="segundoNombre"
              placeholder="Segundo nombre"
              value={form.segundoNombre}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Primer apellido *</label>
            <input
              type="text"
              name="primerApellido"
              placeholder="Primer apellido"
              value={form.primerApellido}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Segundo apellido</label>
            <input
              type="text"
              name="segundoApellido"
              placeholder="Segundo apellido"
              value={form.segundoApellido}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>IBC *</label>
            <input
              type="number"
              placeholder="IBC"
              value={ibcBase}
              onChange={(e) => {
                setIbcBase(e.target.value);
                setResultadoLiquidacion(null);
              }}
            />
          </div>

          <div>
            <label>Subtipo de cotizante *</label>
            <select
              value={subtipoCotizante}
              onChange={(e) => {
                setSubtipoCotizante(e.target.value);
                setResultadoLiquidacion(null);
              }}
            >
              <option value="">Seleccione subtipo</option>
              <option value="0">Sí, no pensionado</option>
              <option value="4">No, ya tengo requisitos cumplidos</option>
              <option value="9">No, mi mesada supera 25 SMLMV</option>
            </select>
          </div>

          <div>
            <label>EPS</label>
            <select>
              <option>EPS SURA</option>
              <option>EPS SANITAS</option>
              <option>NUEVA EPS</option>
              <option>SALUD TOTAL EPS</option>
            </select>
          </div>

          {subtipoCotizante === "0" && (
            <div>
              <label>AFP</label>
              <select>
                <option>PROTECCION</option>
                <option>PORVENIR</option>
                <option>COLFONDOS</option>
                <option>COLPENSIONES</option>
              </select>
            </div>
          )}

          {tipoCotizante !== "3" && (
            <>
              <div>
                <label>ARL</label>
                <select>
                  <option>ARL SURA</option>
                  <option>COLMENA</option>
                  <option>POSITIVA</option>
                  <option>SEGUROS ALFA</option>
                </select>
              </div>

              <div>
                <label>Riesgo ARL permitido *</label>
                <select
                  value={riesgoARL}
                  onChange={(e) => {
                    setRiesgoARL(e.target.value);
                    setResultadoLiquidacion(null);
                  }}
                >
                  <option value="">Seleccione riesgo</option>

                  {riesgosDisponibles.map((riesgo) => (
                    <option key={riesgo} value={riesgo}>
                      Riesgo {riesgo}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {tipoCotizante === "3" && (
          <p className="nota-info">
            Este tipo de cotizante no liquida ARL en este flujo.
          </p>
        )}

        <div className="panel-planilla">
          <h3>Ubicación laboral</h3>

          <div className="fila-form">
            <div>
              <label>Departamento</label>
              <select
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
              >
                <option value="05">ANTIOQUIA</option>
                <option value="08">ATLÁNTICO</option>
                <option value="11">BOGOTÁ D.C.</option>
                <option value="13">BOLÍVAR</option>
              </select>
            </div>

            <div>
              <label>Municipio</label>
              <select>
                {municipiosDisponibles.map((municipio) => (
                  <option key={municipio}>{municipio}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="panel-planilla">
          <h3>Novedades período de cotización</h3>

          <div className="fila-form">
            <div>
              <label>Agregar novedad</label>
              <select
                value={novedad}
                onChange={(e) => setNovedad(e.target.value)}
              >
                <option value="">--Selecciona una novedad--</option>
                <option value="ING">(ING) Ingreso</option>
                <option value="RET">(RET) Retiro</option>
                <option value="VST">(VST) Variación transitoria salario</option>
                <option value="VSP">(VSP) Variación permanente salario</option>
                <option value="IGE">(IGE) Incapacidad enfermedad general</option>
                <option value="LMA">(LMA) Licencia maternidad</option>
                <option value="IRL">(IRL) Incapacidad riesgo laboral</option>
                <option value="VCT">(VCT) Variación centro trabajo</option>
                <option value="AVP">(AVP) Aporte voluntario pensión</option>
              </select>
            </div>

            {["ING", "VSP", "VST", "IGE", "LMA", "IRL", "VCT"].includes(
              novedad
            ) && (
              <div>
                <label>Fecha inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  min={fechaMin}
                  max={fechaMax}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
            )}

            {["RET", "IGE", "LMA", "IRL", "VCT"].includes(novedad) && (
              <div>
                <label>Fecha fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  min={fechaMin}
                  max={fechaMax}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            )}

            {["VSP", "VST", "IGE", "LMA", "IRL"].includes(novedad) && (
              <div>
                <label>IBC / Valor</label>
                <input
                  type="number"
                  placeholder="Valor novedad"
                  value={ibcValor}
                  onChange={(e) => setIbcValor(e.target.value)}
                />
              </div>
            )}

            {novedad === "IGE" && (
              <div>
                <label>Tarifa</label>
                <select>
                  <option value="1">100%</option>
                  <option value="0.66666">66.666%</option>
                  <option value="0.5">50%</option>
                </select>
              </div>
            )}

            {["IGE", "LMA", "IRL", "VCT"].includes(novedad) && (
              <div>
                <label>Días</label>
                <input
                  type="number"
                  value={calcularDias(fechaInicio, fechaFin)}
                  disabled
                />
              </div>
            )}

            {novedad === "VCT" && (
              <>
                <div>
                  <label>Clase tarifa</label>
                  <select
                    value={claseTarifaVCT}
                    onChange={(e) => setClaseTarifaVCT(e.target.value)}
                  >
                    <option value="1">Riesgo 1</option>
                    <option value="2">Riesgo 2</option>
                    <option value="3">Riesgo 3</option>
                    <option value="4">Riesgo 4</option>
                    <option value="5">Riesgo 5</option>
                  </select>
                </div>

                <div>
                  <label>Tarifa</label>
                  <input type="text" value={tarifasARL[claseTarifaVCT]} disabled />
                </div>

                <div>
                  <label>Centro trabajo</label>
                  <input
                    type="text"
                    placeholder="Centro de trabajo"
                    value={centroTrabajo}
                    onChange={(e) => setCentroTrabajo(e.target.value)}
                  />
                </div>
              </>
            )}

            {novedad === "AVP" && (
              <div>
                <label>Aporte voluntario</label>
                <input
                  type="number"
                  placeholder="Valor aporte voluntario"
                  value={ibcValor}
                  onChange={(e) => setIbcValor(e.target.value)}
                />
              </div>
            )}
          </div>

          <button onClick={guardarNovedad}>
            {editandoId ? "Actualizar novedad" : "Guardar novedad"}
          </button>

          <div className="tabla-novedades">
            <h3>Resumen de novedades</h3>

            <table>
              <thead>
                <tr>
                  <th>Novedad</th>
                  <th>Fecha inicio</th>
                  <th>Fecha fin</th>
                  <th>Días</th>
                  <th>IBC / Valor</th>
                  <th>Centro trabajo</th>
                  <th>Tarifa</th>
                  <th>Aporte voluntario afiliado</th>
                  <th>Aporte voluntario empleador</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {listaNovedades.map((item) => (
                  <tr key={item.id}>
                    <td>{item.tipo}</td>
                    <td>{item.fechaInicio}</td>
                    <td>{item.fechaFin}</td>
                    <td>{item.dias}</td>
                    <td>{item.ibcValor}</td>
                    <td>{item.nuevoCentroTrabajo}</td>
                    <td>{item.tarifa}</td>
                    <td>{item.aporteVoluntarioAfiliado}</td>
                    <td>{item.aporteVoluntarioEmpleador}</td>
                    <td>
                      <button onClick={() => editarNovedad(item)}>
                        Editar
                      </button>

                      <button onClick={() => eliminarNovedad(item.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button onClick={calcularLiquidacion}>
          Generar Liquidación
        </button>

        {resultadoLiquidacion && (
          <div
            className="resultado-liquidacion"
            style={{
              marginTop: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "22px"
            }}
          >
            <div
              className="bloque-subsistema"
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                padding: "24px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
              }}
            >
              <h3 style={{ color: "#b10f3a", marginBottom: "18px" }}>
                Resumen de liquidación
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "14px"
                }}
              >
                <div className="card-info">
                  <h3>IBC Total</h3>
                  <strong>
                    {formatearMoneda(resultadoLiquidacion.ibcProporcional)}
                  </strong>
                  <p>Redondeo entero</p>
                </div>

                <div className="card-info">
                  <h3>Días cotizados</h3>
                  <strong>{resultadoLiquidacion.diasCotizados}</strong>
                  <p>Máximo 30 días</p>
                </div>

                <div className="card-info">
                  <h3>Total aportes</h3>
                  <strong>{formatearMoneda(resultadoLiquidacion.total)}</strong>
                  <p>Centena superior</p>
                </div>

                <div className="card-info">
                  <h3>Líneas generadas</h3>
                  <strong>{resultadoLiquidacion.lineasGeneradas}</strong>
                  <p>Principal + novedades</p>
                </div>

                <div className="card-info">
                  <h3>Novedades</h3>
                  <strong>{resultadoLiquidacion.cantidadNovedades}</strong>
                  <p>Registradas</p>
                </div>
              </div>
            </div>

            <div
              className="bloque-subsistema"
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                padding: "24px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "22px"
                }}
              >
                <h2 style={{ margin: 0 }}>Pensión</h2>
                <a href="#detalle-pension">Ver Detalle</a>
              </div>

              <div className="fila-form">
                <div>
                  <label>Administradora Fondo de Pensiones *</label>
                  <input type="text" value="PROTECCION" disabled />
                </div>
              </div>

              <div
                className="fila-form"
                style={{
                  gridTemplateColumns: "repeat(5, 1fr)",
                  alignItems: "end"
                }}
              >
                <div>
                  <label>Tarifa</label>
                  <input
                    type="text"
                    value={resultadoLiquidacion.tarifaPension}
                    disabled
                  />
                </div>

                <div>
                  <label>IBC</label>
                  <input
                    type="text"
                    value={formatearMoneda(resultadoLiquidacion.ibcProporcional)}
                    disabled
                  />
                </div>

                <div>
                  <label>Días cotizados</label>
                  <input
                    type="text"
                    value={resultadoLiquidacion.diasCotizados}
                    disabled
                  />
                </div>

                <div>
                  <label>Cotización obligatoria</label>
                  <input
                    type="text"
                    value={formatearMoneda(resultadoLiquidacion.pension)}
                    disabled
                  />
                </div>

                <div>
                  <label>Total Cotización</label>
                  <input
                    type="text"
                    value={formatearMoneda(resultadoLiquidacion.pension)}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div
              className="bloque-subsistema"
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                padding: "24px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "22px"
                }}
              >
                <h2 style={{ margin: 0 }}>Salud</h2>
                <a href="#detalle-salud">Ver Detalle</a>
              </div>

              <div className="fila-form">
                <div>
                  <label>Entidad prestadora de salud *</label>
                  <input type="text" value="EPS SURA" disabled />
                </div>
              </div>

              <div
                className="fila-form"
                style={{
                  gridTemplateColumns: "repeat(4, 1fr)",
                  alignItems: "end"
                }}
              >
                <div>
                  <label>Tarifa</label>
                  <input type="text" value={resultadoLiquidacion.tarifaSalud} disabled />
                </div>

                <div>
                  <label>IBC</label>
                  <input
                    type="text"
                    value={formatearMoneda(resultadoLiquidacion.ibcProporcional)}
                    disabled
                  />
                </div>

                <div>
                  <label>Días cotizados</label>
                  <input
                    type="text"
                    value={resultadoLiquidacion.diasCotizados}
                    disabled
                  />
                </div>

                <div>
                  <label>Total Cotización</label>
                  <input
                    type="text"
                    value={formatearMoneda(resultadoLiquidacion.salud)}
                    disabled
                  />
                </div>
              </div>
            </div>

            {tipoCotizante !== "3" && (
              <div
                className="bloque-subsistema"
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  padding: "24px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "22px"
                  }}
                >
                  <h2 style={{ margin: 0 }}>Riesgos laborales</h2>
                  <a href="#detalle-riesgos">Ver Detalle</a>
                </div>

                <div className="fila-form">
                  <div>
                    <label>Administradora de Riesgos Laborales</label>
                    <input type="text" value="ARL SURA" disabled />
                  </div>
                </div>

                <div
                  className="fila-form"
                  style={{
                    gridTemplateColumns: "repeat(5, 1fr)",
                    alignItems: "end"
                  }}
                >
                  <div>
                    <label>Tarifa ARL</label>
                    <input
                      type="text"
                      value={resultadoLiquidacion.tarifaARLTexto}
                      disabled
                    />
                  </div>

                  <div>
                    <label>IBC</label>
                    <input
                      type="text"
                      value={formatearMoneda(resultadoLiquidacion.ibcProporcional)}
                      disabled
                    />
                  </div>

                  <div>
                    <label>Días cotizados</label>
                    <input
                      type="text"
                      value={resultadoLiquidacion.diasCotizados}
                      disabled
                    />
                  </div>

                  <div>
                    <label>Total ARL</label>
                    <input
                      type="text"
                      value={formatearMoneda(resultadoLiquidacion.arl)}
                      disabled
                    />
                  </div>

                  <div>
                    <label>Centro trabajo</label>
                    <input type="text" value="000000000" disabled />
                  </div>
                </div>
              </div>
            )}

            <div
              className="bloque-subsistema"
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                padding: "24px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
              }}
            >
              <h2 style={{ marginTop: 0 }}>Totales generales</h2>

              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td>Salud</td>
                    <td>{formatearMoneda(resultadoLiquidacion.salud)}</td>
                  </tr>

                  <tr>
                    <td>Pensión</td>
                    <td>{formatearMoneda(resultadoLiquidacion.pension)}</td>
                  </tr>

                  {tipoCotizante !== "3" && (
                    <tr>
                      <td>ARL</td>
                      <td>{formatearMoneda(resultadoLiquidacion.arl)}</td>
                    </tr>
                  )}

                  <tr>
                    <td>Caja compensación</td>
                    <td>{formatearMoneda(resultadoLiquidacion.caja)}</td>
                  </tr>

                  <tr>
                    <td>Aporte voluntario afiliado</td>
                    <td>
                      {formatearMoneda(
                        resultadoLiquidacion.aporteVoluntarioAfiliado
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td>Aporte voluntario empleador</td>
                    <td>
                      {formatearMoneda(
                        resultadoLiquidacion.aporteVoluntarioEmpleador
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <strong>Total aportes</strong>
                    </td>
                    <td>
                      <strong>{formatearMoneda(resultadoLiquidacion.total)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px"
              }}
            >
              <button
                onClick={guardarLiquidacion}
                style={{
                  padding: "14px 30px",
                  background: "#b10f3a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "15px"
                }}
              >
                Guardar liquidación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (logueado) {
    return (
      <div className="dashboard">
        <aside className="sidebar">
          <h2>PILA WEB</h2>
          <p>Liquidación para independientes</p>

          <button onClick={() => setModuloActivo("inicio")}>
            Inicio
          </button>

          <button onClick={() => setModuloActivo("liquidar")}>
            Liquidar mi planilla
          </button>

          <button onClick={() => setModuloActivo("misLiquidaciones")}>
            Mis liquidaciones
          </button>

          <button onClick={() => setModuloActivo("ayuda")}>
            Ayuda
          </button>

          <button onClick={() => setLogueado(false)}>
            Cerrar Sesión
          </button>
        </aside>

        <main className="main-content">
          <h1>Mi Planilla Independiente</h1>
          <p>Liquida y administra tu seguridad social fácilmente.</p>

          {moduloActivo === "inicio" && renderInicio()}
          {moduloActivo === "liquidar" && renderLiquidar()}
          {moduloActivo === "misLiquidaciones" && renderMisLiquidaciones()}
          {moduloActivo === "ayuda" && renderAyuda()}
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="login-card">
        <h1>Sistema Web PILA</h1>
        <p>Automatización de Seguridad Social</p>

        <select
          name="tipoDocumento"
          value={form.tipoDocumento}
          onChange={handleChange}
        >
          <option value="">Selecciona una opción</option>
          <option value="CC">Cédula de ciudadanía</option>
          <option value="CE">Cédula de extranjería</option>
          <option value="PA">Pasaporte</option>
          <option value="TI">Tarjeta de identidad</option>
          <option value="RC">Registro civil</option>
          <option value="CD">Carné diplomático</option>
          <option value="SC">Salvoconducto de permanencia</option>
          <option value="PE">Permiso especial de permanencia</option>
          <option value="PT">Permiso de Protección Temporal</option>
        </select>

        <input
          type="text"
          name="numeroDocumento"
          placeholder="Número Documento"
          value={form.numeroDocumento}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="claveSecreta"
          placeholder="Clave Secreta"
          value={form.claveSecreta}
          onChange={handleChange}
        />

        <button onClick={login}>
          Iniciar Sesión
        </button>

        <h3>{mensaje}</h3>
      </div>
    </div>
  );
}

export default App;
