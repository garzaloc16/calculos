// app.js

// ====== Configuración ======
const FREE_SHIPPING_THRESHOLD = 60000; // Envío gratis desde $60.000 COP (CO)

// Datos de categorías con porcentaje de comisión (Clásica).
// Premium = comisión base + 5%
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

// Tabla simple de “costo de envío” (aporte del vendedor) por tipo de publicación y reputación.
// Ajusta estos valores si tu cuenta muestra otros montos en el simulador de ML.
const envioTarifas = {
  clasica: { nuevo: 9000, verde: 7000 },
  premium: { nuevo: 7000, verde: 0 }
};

// ====== UI: rellenar selector de categorías ======
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

// ====== Cálculo costo unitario ======
function calcularCostoUnitario() {
  const unidades = parseFloat(document.getElementById("unidades").value);
  const valorCompra = parseFloat(document.getElementById("valorCompra").value);
  const envioInt = parseFloat(document.getElementById("envioInt").value);
  const impuestos = parseFloat(document.getElementById("impuestos").value);

  const costoUnitario = (valorCompra + envioInt + impuestos) / unidades;
  document.getElementById("resultadoImportacion").innerText =
    `Costo unitario: ${costoUnitario.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`;
  return costoUnitario;
}

// ====== Simulación ML ======
function simular() {
  const unidades = parseFloat(document.getElementById("unidades").value);
  const costoUnitario = calcularCostoUnitario();
  const categoria = document.getElementById("categoria").value;
  const reputacion = document.getElementById("reputacion").value;
  const margenDeseado = parseFloat(document.getElementById("margen").value) / 100;
  const precioManual = parseFloat(document.getElementById("precioManual").value) || 0;

  const comisionBase = categorias[categoria];
  const comisionPremiumExtra = 0.05;

  // Costo de envío estimado (si aplica envío gratis)
  const costoEnvioClasica = envioTarifas.clasica[reputacion];
  const costoEnvioPremium = envioTarifas.premium[reputacion];

  // Calcula un precio de venta que garantice el margen deseado,
  // agregando costo de envío SOLO si el precio final activa envío gratis.
  function calcularPrecioVentaRobusto(margen, comision, costoEnvio) {
    // Itera hasta estabilizar si debe incluir envío o no según el umbral
    let incluyeEnvio = false;
    let precio = 0;

    for (let i = 0; i < 3; i++) {
      const extraEnvio = incluyeEnvio ? costoEnvio : 0;
      precio = (costoUnitario * (1 + margen) + extraEnvio) / (1 - comision);
      const debeIncluir = precio >= FREE_SHIPPING_THRESHOLD;
      if (debeIncluir === incluyeEnvio) break;
      incluyeEnvio = debeIncluir;
    }
    return { precio, incluyeEnvio };
  }

  // Sugerencias automáticas (salvo que el usuario ponga precio manual)
  let sugClasica = calcularPrecioVentaRobusto(margenDeseado, comisionBase, costoEnvioClasica);
  let sugPremium = calcularPrecioVentaRobusto(margenDeseado, comisionBase + comisionPremiumExtra, costoEnvioPremium);

  let precioClasica = precioManual > 0 ? precioManual : sugClasica.precio;
  let precioPremium = precioManual > 0 ? precioManual : sugPremium.precio;

  function calcularResultados(precio, comision, costoEnvioTabla) {
    // ¿Activa envío gratis?
    const envioGratis = precio >= FREE_SHIPPING_THRESHOLD;

    // Si hay envío gratis, el vendedor asume el costo según tabla; si no, lo paga el comprador (0 para el vendedor)
    const costoEnvioVendedor = envioGratis ? costoEnvioTabla : 0;

    const comisionTotal = precio * comision;
    const ingresoNeto = precio - comisionTotal - costoEnvioVendedor - costoUnitario;

    const gananciaNetaPorUnidad = ingresoNeto;
    const gananciaTotal = gananciaNetaPorUnidad * unidades;
    const inversionTotal = costoUnitario * unidades;

    const margenReal = (gananciaNetaPorUnidad / costoUnitario) * 100;

    // Texto de envío
    const envioTexto = envioGratis
      ? `Gratis para el comprador (lo paga el vendedor ${costoEnvioVendedor.toLocaleString("es-CO",{style:"currency",currency:"COP"})})`
      : "No gratis (lo paga el comprador)";

    return {
      precio,
      gananciaNetaPorUnidad,
      gananciaTotal,
      inversionTotal,
      margenReal,
      envioTexto
    };
  }

  const resClasica = calcularResultados(
    precioClasica,
    comisionBase,
    costoEnvioClasica
  );

  const resPremium = calcularResultados(
    precioPremium,
    comisionBase + comisionPremiumExtra,
    costoEnvioPremium
  );

  // ====== UI de resultados (sin tocar tu diseño) ======
  const resultadosDiv = document.getElementById("resultados");
  resultadosDiv.innerHTML = `
    <h3>Resultados:</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:15px;">
      <div style="border:1px solid #ccc;padding:15px;border-radius:10px;background:#f9f9f9;">
        <h4 style="margin-bottom:10px;">Publicación Clásica</h4>
        <p><b>Precio sugerido:</b> ${resClasica.precio.toLocaleString("es-CO",{style:"currency",currency:"COP"})}</p>
        <p><b>Envío:</b> ${resClasica.envioTexto}</p>
        <p><b>Ganancia neta por unidad:</b> ${resClasica.gananciaNetaPorUnidad.toLocaleString("es-CO",{style:"currency",currency:"COP"})} <span style="color:green;">(esto es lo que te ganas descontando TODO)</span></p>
        <p><b>Total ganancias netas:</b> ${resClasica.gananciaTotal.toLocaleString("es-CO",{style:"currency",currency:"COP"})}</p>
        <p><b>Recuperas tu inversión:</b> ${resClasica.inversionTotal.toLocaleString("es-CO",{style:"currency",currency:"COP"})}</p>
        <p><b>Margen neto real:</b> ${resClasica.margenReal.toFixed(2)}%</p>
      </div>

      <div style="border:1px solid #ccc;padding:15px;border-radius:10px;background:#f9f9f9;">
        <h4 style="margin-bottom:10px;">Publicación Premium</h4>
        <p><b>Precio sugerido:</b> ${resPremium.precio.toLocaleString("es-CO",{style:"currency",currency:"COP"})}</p>
        <p><b>Envío:</b> ${resPremium.envioTexto}</p>
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

  // ====== Gráfico comparativo ======
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
