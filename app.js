// Datos de comisiones por categoría
const categorias = {
  "Electrónica": 0.16,
  "Hogar": 0.13,
  "Ropa": 0.17,
  "Accesorios": 0.15,
  "Otros": 0.14
};

// Rellena el combo de categorías
window.onload = () => {
  const select = document.getElementById("categoria");
  Object.keys(categorias).forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
  actualizarDetalleCategoria();
};

// Actualiza texto de detalle
document.getElementById("categoria").addEventListener("change", actualizarDetalleCategoria);

function actualizarDetalleCategoria() {
  const cat = document.getElementById("categoria").value;
  const comision = categorias[cat] * 100;
  document.getElementById("detalleCategoria").innerText =
    `Comisión MercadoLibre en esta categoría: ${comision}%`;
}

// Calcula costo unitario de importación
function calcularCostoUnitario() {
  const unidades = parseFloat(document.getElementById("unidades").value);
  const valorCompra = parseFloat(document.getElementById("valorCompra").value);
  const envioInt = parseFloat(document.getElementById("envioInt").value);
  const impuestos = parseFloat(document.getElementById("impuestos").value);

  const total = valorCompra + envioInt + impuestos;
  const unitario = total / unidades;

  document.getElementById("resultadoImportacion").innerText =
    `Costo unitario de importación: ${unitario.toFixed(2)} COP`;
  return unitario;
}

function simular() {
  const costoUnitario = calcularCostoUnitario();
  const categoria = document.getElementById("categoria").value;
  const margen = parseFloat(document.getElementById("margen").value) / 100;
  const precioManual = parseFloat(document.getElementById("precioManual").value) || 0;
  const reputacion = document.getElementById("reputacion").value;

  const comision = categorias[categoria];
  let precioSugerido = precioManual > 0 ? precioManual : costoUnitario * (1 + margen);

  // Determinar envío gratis
  let aplicaEnvioGratis = precioSugerido >= 60000; // simplificación
  let costoEnvio = 0;

  if (aplicaEnvioGratis && reputacion === "verde") {
    costoEnvio = 5500; // costo asumido por el vendedor
  }

  const comisionML = precioSugerido * comision;
  const gananciaNeta = precioSugerido - comisionML - costoEnvio - costoUnitario;
  const gananciaPct = (gananciaNeta / costoUnitario) * 100;

  const resultadosDiv = document.getElementById("resultados");
  resultadosDiv.innerHTML = `
    <p>Precio sugerido: ${precioSugerido.toFixed(0)} COP</p>
    <p>Comisión ML: ${comisionML.toFixed(0)} COP</p>
    <p>${textoEnvio({ aplicaEnvioGratis, costoEnvio })}</p>
    <p><b>Ganancia neta: ${gananciaNeta.toFixed(0)} COP</b> – <b>Esto es lo que te ganas</b></p>
    <p><b>Porcentaje de ganancia: ${gananciaPct.toFixed(1)}%</b></p>
  `;

  // Mostrar gráfico
  const ctx = document.getElementById("grafico").getContext("2d");
  if (window.miGrafico) window.miGrafico.destroy();
  window.miGrafico = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Costo", "Comisión", "Envío", "Ganancia"],
      datasets: [{
        label: "Distribución de costos",
        data: [
          costoUnitario,
          comisionML,
          costoEnvio,
          gananciaNeta > 0 ? gananciaNeta : 0
        ],
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"]
      }]
    },
    options: { responsive: true }
  });
}

// Texto para el envío
function textoEnvio(r) {
  const reputacion = document.getElementById("reputacion").value;
  if (r.aplicaEnvioGratis) {
    if (reputacion === "verde") {
      return `Envío gratis: MercadoLibre descuenta ${r.costoEnvio} COP al vendedor`;
    } else {
      return `El comprador paga el envío (vendedor nuevo, no se descuenta)`;
    }
  } else {
    return reputacion === "verde"
      ? "No aplica envío gratis (precio bajo)"
      : "No aplica envío gratis, el comprador paga el envío";
  }
}
