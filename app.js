// Datos de categorías y comisiones aproximadas (Colombia 2025)
let categorias = [];

// Cargar categorías al iniciar
async function cargarCategorias() {
  categorias = [
    // Categorías estándar (13% / 17%)
    { nombre: "Electrónica", clasica: 0.13, premium: 0.17 },
    { nombre: "Hogar y Muebles", clasica: 0.13, premium: 0.17 },
    { nombre: "Juguetes", clasica: 0.13, premium: 0.17 },
    { nombre: "Accesorios para Vehículos", clasica: 0.13, premium: 0.17 },
    { nombre: "Computación", clasica: 0.13, premium: 0.17 },
    { nombre: "Celulares y Teléfonos", clasica: 0.13, premium: 0.17 },
    { nombre: "Herramientas", clasica: 0.13, premium: 0.17 },
    { nombre: "Deportes y Fitness", clasica: 0.13, premium: 0.17 },
    { nombre: "Jardín y Aire Libre", clasica: 0.13, premium: 0.17 },
    { nombre: "Electrodomésticos", clasica: 0.13, premium: 0.17 },
    { nombre: "Salud", clasica: 0.13, premium: 0.17 },
    { nombre: "Libros y Papelería", clasica: 0.13, premium: 0.17 },

    // Categorías especiales con más comisión
    { nombre: "Ropa y Calzado", clasica: 0.14, premium: 0.18 },
    { nombre: "Belleza y Cuidado Personal", clasica: 0.14, premium: 0.18 },
    { nombre: "Antigüedades y Colecciones", clasica: 0.15, premium: 0.19 },
    { nombre: "Servicios", clasica: 0.15, premium: 0.19 },
  ];

  const select = document.getElementById("categoria");
  categorias.forEach((c, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = c.nombre;
    select.appendChild(option);
  });

  // Actualiza detalle de comisiones al cambiar categoría
  select.addEventListener("change", mostrarDetalleCategoria);
}

// Muestra el detalle de la categoría seleccionada
function mostrarDetalleCategoria() {
  const idx = parseInt(document.getElementById("categoria").value);
  const c = categorias[idx];
  document.getElementById("detalleCategoria").innerText =
    `Comisión Clásica: ${(c.clasica * 100).toFixed(1)}% | ` +
    `Comisión Premium: ${(c.premium * 100).toFixed(1)}%`;
}

window.onload = () => {
  cargarCategorias();
};

// Costo unitario
let costoUnitario = 0;

function calcularCostoUnitario() {
  const unidades = parseFloat(document.getElementById("unidades").value);
  const valorCompra = parseFloat(document.getElementById("valorCompra").value);
  const envioInt = parseFloat(document.getElementById("envioInt").value);
  const impuestos = parseFloat(document.getElementById("impuestos").value);

  const total = valorCompra + envioInt + impuestos;
  costoUnitario = total / unidades;
  document.getElementById("resultadoImportacion").innerText =
    `Costo unitario importación: ${costoUnitario.toFixed(2)} COP`;
}

// Simulación
let chart = null;

function simular() {
  const idx = parseInt(document.getElementById("categoria").value);
  const margen = parseFloat(document.getElementById("margen").value) / 100;
  const precioManual = parseFloat(document.getElementById("precioManual").value) || 0;
  const reputacion = document.getElementById("reputacion").value;

  let { clasica, premium } = categorias[idx];

  // Ajustar comisiones según reputación
  if (reputacion === "nuevo") {
    // Los vendedores nuevos tienen 2% adicional
    clasica += 0.02;
    premium += 0.02;
  }

  const iva = 0.19;
  const envioGratis = 60000;

  // Precio sugerido si no hay manual
  const base = costoUnitario;
  const precioSugerido = (base * (1 + margen)) / (1 - clasica * (1 + iva));

  function calcularGanancia(precio, comision) {
    const aplicaEnvioGratis = precio >= envioGratis;
    const costoEnvio = aplicaEnvioGratis ? 5500 : 0;
    const retencion = precio * comision;
    const ivaCom = retencion * iva;
    const totalRet = retencion + ivaCom;
    const neto = precio - totalRet - costoEnvio;
    const ganancia = neto - base;
    const porcentaje = (ganancia / base) * 100;
    return { neto, ganancia, totalRet, costoEnvio, aplicaEnvioGratis, porcentaje };
  }

  const precioFinal = precioManual > 0 ? precioManual : precioSugerido;
  const esSugerido = precioManual <= 0;

  const clasicaRes = calcularGanancia(precioFinal, clasica);
  const premiumRes = calcularGanancia(precioFinal, premium);

  function textoEnvio(r) {
    return r.aplicaEnvioGratis
      ? `Gratis para el comprador (descuento vendedor ${r.costoEnvio} COP)`
      : `No gratis (costo vendedor 0 COP)`;
  }

  const resultados = `
    <h3>Resultados</h3>
    <p><strong>Precio final utilizado:</strong> ${precioFinal.toFixed(2)} COP 
       ${esSugerido ? '(calculado con el margen deseado)' : '(ingresado manualmente)'}
    </p>

    <h4>Clásica</h4>
    <ul>
      <li>Ingreso neto: ${clasicaRes.neto.toFixed(2)} COP</li>
      <li><strong>Ganancia neta: ${clasicaRes.ganancia.toFixed(2)} COP</strong> 
          <span style="color:green;"> (esto es lo que te ganas, ${clasicaRes.porcentaje.toFixed(1)}%)</span></li>
      <li>Comisiones+IVA: ${clasicaRes.totalRet.toFixed(2)} COP</li>
      <li>Envío: ${textoEnvio(clasicaRes)}</li>
    </ul>

    <h4>Premium</h4>
    <ul>
      <li>Ingreso neto: ${premiumRes.neto.toFixed(2)} COP</li>
      <li><strong>Ganancia neta: ${premiumRes.ganancia.toFixed(2)} COP</strong>
          <span style="color:green;"> (esto es lo que te ganas, ${premiumRes.porcentaje.toFixed(1)}%)</span></li>
      <li>Comisiones+IVA: ${premiumRes.totalRet.toFixed(2)} COP</li>
      <li>Envío: ${textoEnvio(premiumRes)}</li>
    </ul>
  `;

  document.getElementById("resultados").innerHTML = resultados;

  // Gráfico
  const ctx = document.getElementById("grafico").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Clásica", "Premium"],
      datasets: [
        {
          label: "Ganancia neta",
          data: [clasicaRes.ganancia, premiumRes.ganancia],
          backgroundColor: ["#4caf50", "#2196f3"]
        }
      ]
    }
  });
}
