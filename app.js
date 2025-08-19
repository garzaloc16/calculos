// app.js

// Datos de categorías con porcentaje de comisión
const categorias = {
  "Electrónica": 0.13,
  "Hogar": 0.13,
  "Ropa y accesorios": 0.13,
  "Belleza y cuidado personal": 0.14,
  "Deportes": 0.14,
  "Juguetes": 0.15,
  "Vehículos - Accesorios": 0.13,
  "Otros": 0.17
};

// Constantes de envío
const FREE_SHIPPING_THRESHOLD = 60000;
const envioPorReputacion = (reputacion) => (reputacion === "nuevo" ? 9000 : 7000);

// Rellenar selector de categorías
const selectCategoria = document.getElementById("categoria");
for (const cat in categorias) {
  const option = document.createElement("option");
  option.value = cat;
  option.textContent = `${cat} (${(categorias[cat] * 100).toFixed(0)}%)`;
  selectCategoria.appendChild(option);
}

// Mostrar detalle cuando cambia la categoría
selectCategoria.addEventListener("change", () => {
  const cat = selectCategoria.value;
  const porcentaje = categorias[cat] * 100;
  document.getElementById("detalleCategoria").innerText =
    `Comisión en esta categoría: ${porcentaje}% (Clásica) o +5% (Premium)`;
});

// --- 1) Cálculo de costo unitario ---
function calcularCostoUnitario() {
  const unidades = parseFloat(document.getElementById("unidades").value);
  const valorCompra = parseFloat(document.getElementById("valorCompra").value);
  const envioInt = parseFloat(document.getElementById("envioInt").value);
  const impuestos = parseFloat(document.getElementById("impuestos").value);

  if (!unidades || unidades <= 0) {
    alert("Las unidades deben ser mayores a 0");
    return NaN;
  }

  const costoUnitario = (valorCompra + envioInt + impuestos) / unidades;
  document.getElementById("resultadoImportacion").innerText =
    `Costo unitario: ${costoUnitario.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`;
  return costoUnitario;
}

// --- 2) Simulación MercadoLibre ---
function simular() {
  const unidades = parseFloat(document.getElementById("unidades").value);
  const costoUnitario = calcularCostoUnitario();
  if (isNaN(costoUnitario)) return; // si falló el cálculo unitario, detenemos

  const categoria = document.getElementById("categoria").value;
  const reputacion = document.getElementById("reputacion").value;
  const margenDeseado = parseFloat(document.getElementById("margen").value) / 100;
  const precioManual = parseFloat(document.getElementById("precioManual").value) || 0;

  const comisionBase = categorias[categoria];
  const comisionPremiumExtra = 0.05;

  // Calcula precio sugerido garantizando margen, con lógica de 2 pasos:
  // 1) Sin envío; 2) Si activa envío gratis, recalcula incluyendo el envío del vendedor.
  function calcularPrecioVenta(margen, comision, reputacion) {
    // Paso 1: ignorando envío
    let p = (costoUnitario * (1 + margen)) / (1 - comision);

    // Si el precio calculado activa envío gratis, incluir el costo del vendedor y recalcular
    if (p >= FREE_SHIPPING_THRESHOLD) {
      const envio = envioPorReputacion(reputacion);
      p = (costoUnitario * (1 + margen) + envio) / (1 - comision);
      // Opcional: si justo cae por debajo del umbral tras recalcular, no pasa nada;
      // el margen quedará un pelín por encima de lo pedido (mejor para ti).
    }

    return p;
  }

  let precioClasica = calcularPrecioVenta(margenDeseado, comisionBase, reputacion);
  let precioPremium = calcularPrecioVenta(margenDeseado, comisionBase + comisionPremiumExtra, reputacion);

  if (precioManual > 0) {
    precioClasica = precioManual;
    precioPremium = precioManual;
  }

  // Con un precio dado, calcular resultados reales (incluye envío del vendedor solo si hay envío gratis)
  function calcularResultados(precio, comision) {
    let costoEnvioGratis = 0;
    if (precio >= FREE_SHIPPING_THRESHOLD) {
      costoEnvioGratis = envioPorReputacion(reputacion); // costo que asume el vendedor
    }

    const comisionTotal = precio * comision;
    const ingresoNeto = precio - comisionTotal - costoEnvioGratis - costoUnitario;

    const gananciaNetaPorUnidad = ingresoNeto;
    const gananciaTotal = gananciaNetaPorUnidad * unidades;
    const inversionTotal = costoUnitario * unidades;

    // Margen neto real sobre costo unitario
    const margenReal = (gananciaNetaPorUnidad / costoUnitario) * 100;

    return { precio, gananciaNetaPorUnidad, gananciaTotal, inversionTotal, costoEnvioGratis, margenReal };
  }

  const resClasica = calcularResultados(precioClasica, comisionBase);
  const resPremium = calcularResultados(precioPremium, comisionBase + comisionPremiumExtra);

  // Mostrar resultados (no se toca el diseño)
  const resultadosDiv = document.getElementById("resultados");
  resultadosDiv.innerHTML = `
    <h3>Resultados:</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:15px;">
      <div style="border:1px solid #ccc;padding:15px;border-radius:10px;background:#f9f9f9;">
        <h4 style="margin-bottom:10px;">Publicación Clásica</h4>
        <p><b>Precio sugerido:</b> ${resClasica.precio.toLocaleString("es-CO",{style:"currency",currency:"COP"})}</p>
        <p><b>Envío:</b> ${resClasica.costoEnvioGratis > 0 ? `Gratis (costo vendedor ${resClasica.costoEnvioGratis.toLocaleString("es-CO",{style:"currency",currency:"COP"})})` : "No gratis (costo vendedor 0 COP)"}</p>
        <p><b>Ganancia neta por unidad:</b> ${resClasica.gananciaNetaPorUnidad.toLocaleString("es-CO",{style:"currency",currency:"COP"})} <span style="color:green;">(esto es lo que te ganas descontando TODO)</span></p>
        <p><b>Total ganancias netas:</b> ${resClasica.gananciaTotal.toLocaleString("es-CO",{style:"currency",currency:"COP"})}</p>
        <p><b>Recuperas tu inversión:</b> ${resClasica.inversionTotal.toLocaleString("es-CO",{style:"currency",currency:"COP"})}</p>
        <p><b>Margen neto real:</b> ${resClasica.margenReal.toFixed(2)}%</p>
      </div>

      <div style="border:1px solid #ccc;padding:15px;border-radius:10px;background:#f9f9f9;">
        <h4 style="margin-bottom:10px;">Publicación Premium</h4>
        <p><b>Precio sugerido:</b> ${resPremium.precio.toLocaleString("es-CO",{style:"currency",currency:"COP"})}</p>
        <p><b>Envío:</b> ${resPremium.costoEnvioGratis > 0 ? `Gratis (costo vendedor ${resPremium.costoEnvioGratis.toLocaleString("es-CO",{style:"currency",currency:"COP"})})` : "No gratis (costo vendedor 0 COP)"}</p>
        <p><b>Ganancia neta por unidad:</b> ${resPremium.gananciaNetaPorUnidad.toLocaleString("es-CO",{style:"currency",currency:"COP"})} <span style="color:green;">(esto es lo que te ganas descontando TODO)</span></p>
        <p><b>Total ganancias netas:</b> ${resPremium.gananciaTotal.toLocaleString("es-CO",{style:"currency",currency:"COP"})}</p>
        <p><b>Recuperas tu inversión:</b> ${resPremium.inversionTotal.toLocaleString("es-CO",{style:"currency",currency:"COP"})}</p>
        <p><b>Margen neto real:</b> ${resPremium.margenReal.toFixed(2)}%</p>
      </div>
    </div>

    <div style="margin-top:30px;">
      <canvas id="graficoGanancias" height="200"></canvas>
    </div>
  `;

  // Gráfico (idéntico)
  const ctx = document.getElementById("graficoGanancias").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Ganancia por unidad", "Ganancia total", "Inversión recuperada"],
      datasets: [
        {
          label: "Clásica",
          data: [
            resClasica.gananciaNetaPorUnidad,
            resClasica.gananciaTotal,
            resClasica.inversionTotal
          ],
          backgroundColor: "rgba(54, 162, 235, 0.6)"
        },
        {
          label: "Premium",
          data: [
            resPremium.gananciaNetaPorUnidad,
            resPremium.gananciaTotal,
            resPremium.inversionTotal
          ],
          backgroundColor: "rgba(255, 99, 132, 0.6)"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Comparación Clásica vs Premium" }
      },
      scales: {
        y: { ticks: { callback: value => value.toLocaleString("es-CO") } }
      }
    }
  });
}
