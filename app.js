// === Datos de comisiones y categorías MercadoLibre Colombia ===
const categorias = {
  "Electrónica": { clasica: 0.13, premium: 0.17 },
  "Hogar": { clasica: 0.13, premium: 0.17 },
  "Ropa y accesorios": { clasica: 0.14, premium: 0.17 },
  "Deportes": { clasica: 0.13, premium: 0.17 },
  "Belleza y cuidado personal": { clasica: 0.15, premium: 0.17 },
  "Juguetes": { clasica: 0.13, premium: 0.17 },
  "Herramientas": { clasica: 0.13, premium: 0.17 },
  "Vehículos - Accesorios": { clasica: 0.13, premium: 0.17 },
};

// === Rellenar select de categorías ===
window.onload = () => {
  const select = document.getElementById("categoria");
  Object.keys(categorias).forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
  actualizarDetalleCategoria();
};

document.getElementById("categoria").addEventListener("change", actualizarDetalleCategoria);

function actualizarDetalleCategoria() {
  const cat = document.getElementById("categoria").value;
  const detalle = document.getElementById("detalleCategoria");
  const comision = categorias[cat];
  detalle.innerHTML = `Clásica: ${comision.clasica * 100}%, Premium: ${comision.premium * 100}%`;
}

// === Función para calcular costo unitario ===
function calcularCostoUnitario() {
  const unidades = parseFloat(document.getElementById("unidades").value);
  const valorCompra = parseFloat(document.getElementById("valorCompra").value);
  const envioInt = parseFloat(document.getElementById("envioInt").value);
  const impuestos = parseFloat(document.getElementById("impuestos").value);

  if (unidades <= 0) {
    document.getElementById("resultadoImportacion").textContent = "Ingrese unidades válidas.";
    return;
  }

  const total = valorCompra + envioInt + impuestos;
  const costoUnitario = total / unidades;

  document.getElementById("resultadoImportacion").textContent =
    `Costo unitario: ${costoUnitario.toFixed(2)} COP (total: ${total.toFixed(2)} COP)`;
}

// === Función principal de simulación ===
function simular() {
  const unidades = parseFloat(document.getElementById("unidades").value);
  const valorCompra = parseFloat(document.getElementById("valorCompra").value);
  const envioInt = parseFloat(document.getElementById("envioInt").value);
  const impuestos = parseFloat(document.getElementById("impuestos").value);
  const margenDeseado = parseFloat(document.getElementById("margen").value);
  const precioManual = parseFloat(document.getElementById("precioManual").value);
  const reputacion = document.getElementById("reputacion").value;
  const categoria = document.getElementById("categoria").value;

  const inversionTotal = valorCompra + envioInt + impuestos;
  const costoUnitario = inversionTotal / unidades;

  // Definir límites para envíos gratis
  const limiteEnvioGratis = 79900;
  const costoEnvio = 6000;

  // Obtener porcentajes de comisiones
  const { clasica, premium } = categorias[categoria];

  // Función para calcular los valores
  function calcular(precioBase, comision) {
    let comisionFinal = comision;
    // reputación verde tiene tarifa 2% menos
    if (reputacion === "verde") {
      comisionFinal = comision - 0.02;
      if (comisionFinal < 0) comisionFinal = 0;
    }

    let costoEnvioVendedor = 0;
    if (precioBase >= limiteEnvioGratis) {
      // envío gratis: mercado libre cubre una parte, pero una parte la cubre el vendedor
      costoEnvioVendedor = costoEnvio;
    }

    const comisionValor = precioBase * comisionFinal;
    const ivaComision = comisionValor * 0.19; // IVA del 19% sobre la comisión
    const totalRetenciones = comisionValor + ivaComision;

    const neto = precioBase - totalRetenciones - costoEnvioVendedor;
    const ganancia = neto - costoUnitario;
    const margenReal = (ganancia / costoUnitario) * 100;

    return { neto, ganancia, margenReal, totalRet: totalRetenciones, envioGratis: costoEnvioVendedor > 0 };
  }

  const precioSugerido = costoUnitario * (1 + margenDeseado / 100);
  const precioFinal = precioManual > 0 ? precioManual : precioSugerido;
  const esSugerido = precioManual <= 0;

  const clasicaRes = calcular(precioFinal, clasica);
  const premiumRes = calcular(precioFinal, premium);

  // Totales multiplicados por la cantidad de unidades
  const totalRecibidoClasica = clasicaRes.neto * unidades;
  const totalGananciaClasica = clasicaRes.ganancia * unidades;
  const totalRecibidoPremium = premiumRes.neto * unidades;
  const totalGananciaPremium = premiumRes.ganancia * unidades;

  const textoEnvio = (res) =>
    res.envioGratis ? "Gratis para el cliente (costo vendedor 6000 COP)" : "No gratis (costo vendedor 0 COP)";

  // --- RESULTADOS HTML ---
  const resultados = `
    <h3>Resultados</h3>
    <p><strong>Precio final utilizado:</strong> ${precioFinal.toFixed(2)} COP 
       ${esSugerido ? '(calculado con el margen deseado)' : '(ingresado manualmente)'}
    </p>

    <h4>Clásica</h4>
    <ul>
      <li>Ingreso neto: ${clasicaRes.neto.toFixed(2)} COP</li>
      <li><strong>Ganancia neta: ${clasicaRes.ganancia.toFixed(2)} COP</strong> (esto es lo que te ganas, ${clasicaRes.margenReal.toFixed(1)}%)</li>
      <li>Comisiones+IVA: ${clasicaRes.totalRet.toFixed(2)} COP</li>
      <li>Envío: ${textoEnvio(clasicaRes)}</li>
    </ul>

    <h4>Premium</h4>
    <ul>
      <li>Ingreso neto: ${premiumRes.neto.toFixed(2)} COP</li>
      <li><strong>Ganancia neta: ${premiumRes.ganancia.toFixed(2)} COP</strong> (esto es lo que te ganas, ${premiumRes.margenReal.toFixed(1)}%)</li>
      <li>Comisiones+IVA: ${premiumRes.totalRet.toFixed(2)} COP</li>
      <li>Envío: ${textoEnvio(premiumRes)}</li>
    </ul>

    <div style="background-color: #fff9c4; padding: 15px; margin-top: 20px; border: 2px solid #fbc02d; border-radius: 8px;">
      <h3>Resumen total para las ${unidades} unidades</h3>
      <p>
        Invertiste en total: <strong>${inversionTotal.toFixed(2)} COP</strong><br><br>

        <strong>Clásica:</strong><br>
        Recibirías en total (ya descontado todo): <strong>${totalRecibidoClasica.toFixed(2)} COP</strong><br>
        De esa cantidad, tu ganancia neta sería: <strong>${totalGananciaClasica.toFixed(2)} COP</strong><br><br>

        <strong>Premium:</strong><br>
        Recibirías en total (ya descontado todo): <strong>${totalRecibidoPremium.toFixed(2)} COP</strong><br>
        De esa cantidad, tu ganancia neta sería: <strong>${totalGananciaPremium.toFixed(2)} COP</strong>
      </p>
    </div>
  `;

  document.getElementById("resultados").innerHTML = resultados;

  // --- Gráfico ---
  const ctx = document.getElementById("grafico").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Clásica", "Premium"],
      datasets: [
        {
          label: "Ganancia neta por unidad (COP)",
          data: [clasicaRes.ganancia, premiumRes.ganancia],
          backgroundColor: ["#4caf50", "#ff9800"],
        },
      ],
    },
    options: { responsive: true },
  });
}
