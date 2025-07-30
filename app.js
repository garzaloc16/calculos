// Datos temporales (se reemplazarán dinámicamente)
let categorias = [];

// Cargar categorías desde MercadoLibre (online)
async function cargarCategorias() {
  // Aquí simulo la carga online: en producción, conectar a la API real
  categorias = [
    { nombre: "Electrónica", clasica: 0.13, premium: 0.17 },
    { nombre: "Hogar", clasica: 0.13, premium: 0.17 },
    { nombre: "Ropa", clasica: 0.14, premium: 0.18 }
    // TODO: cargar todas automáticamente
  ];
  const select = document.getElementById("categoria");
  categorias.forEach((c, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = c.nombre;
    select.appendChild(option);
  });
}

window.onload = cargarCategorias;

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

// Simulación MercadoLibre
let chart = null;

function simular() {
  const idx = parseInt(document.getElementById("categoria").value);
  const margen = parseFloat(document.getElementById("margen").value) / 100;
  const precioManual = parseFloat(document.getElementById("precioManual").value) || 0;

  const { clasica, premium } = categorias[idx];
  const iva = 0.19;
  const envioGratis = 60000;

  // Precio sugerido: solo si no hay precio manual
  const base = costoUnitario;
  const precioSugerido = (base * (1 + margen)) / (1 - clasica * (1 + iva));

  function calcularGanancia(precio, comision) {
    let costoEnvio = precio >= envioGratis ? 5500 : 0; // tarifa simple <1kg
    let retencion = precio * comision;
    let ivaCom = retencion * iva;
    let totalRet = retencion + ivaCom;
    let neto = precio - totalRet - costoEnvio;
    let ganancia = neto - base;
    return { neto, ganancia, totalRet, costoEnvio };
  }

  const precioFinal = precioManual > 0 ? precioManual : precioSugerido;

  const clasicaRes = calcularGanancia(precioFinal, clasica);
  const premiumRes = calcularGanancia(precioFinal, premium);

  // Mostrar resultados
  const resultados = `
    <h3>Resultados</h3>
    <p><strong>Precio usado:</strong> ${precioFinal.toFixed(2)} COP</p>
    <h4>Clásica</h4>
    <ul>
      <li>Ingreso neto: ${clasicaRes.neto.toFixed(2)} COP</li>
      <li>Ganancia neta: ${clasicaRes.ganancia.toFixed(2)} COP</li>
      <li>Comisiones+IVA: ${clasicaRes.totalRet.toFixed(2)} COP</li>
      <li>Envío descontado: ${clasicaRes.costoEnvio}</li>
    </ul>
    <h4>Premium</h4>
    <ul>
      <li>Ingreso neto: ${premiumRes.neto.toFixed(2)} COP</li>
      <li>Ganancia neta: ${premiumRes.ganancia.toFixed(2)} COP</li>
      <li>Comisiones+IVA: ${premiumRes.totalRet.toFixed(2)} COP</li>
      <li>Envío descontado: ${premiumRes.costoEnvio}</li>
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
