// Configuración de comisiones por categoría
const categorias = {
  "Electrónica (13%)": { clasica: 0.13, premium: 0.28 },
  "Hogar (13%)": { clasica: 0.13, premium: 0.28 },
  "Ropa y accesorios (17%)": { clasica: 0.17, premium: 0.32 },
  "Deportes (14%)": { clasica: 0.14, premium: 0.29 },
  "Juguetes (15%)": { clasica: 0.15, premium: 0.30 },
  "Herramientas (13%)": { clasica: 0.13, premium: 0.28 },
};

// IVA sobre la comisión
const IVA = 0.19;

// Llenar categorías
window.onload = () => {
  const select = document.getElementById("categoria");
  for (const cat in categorias) {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  }
};

// Cálculo costo unitario
function calcularCostoUnitario() {
  const unidades = +document.getElementById("unidades").value;
  const valorCompra = +document.getElementById("valorCompra").value;
  const envioInt = +document.getElementById("envioInt").value;
  const impuestos = +document.getElementById("impuestos").value;
  const costoUnitario = (valorCompra + envioInt + impuestos) / unidades;

  document.getElementById("resultadoImportacion").innerText =
    `Costo unitario: ${costoUnitario.toFixed(0)} COP`;
  return costoUnitario;
}

function simular() {
  const unidades = +document.getElementById("unidades").value;
  const categoria = document.getElementById("categoria").value;
  const reputacion = document.getElementById("reputacion").value;
  const margen = +document.getElementById("margen").value / 100;
  const precioManual = +document.getElementById("precioManual").value;
  const costoUnitario = calcularCostoUnitario();

  const { clasica, premium } = categorias[categoria];

  // ¿El vendedor paga el envío?
  let costoEnvio = 0;
  if (reputacion === "verde") {
    // MercadoLíder suele cubrir envíos en productos > 79,900 COP
    costoEnvio = 10000; // estimado
  }

  // Función para calcular precio para cada tipo de publicación
  const calcularPrecio = (tasa) => {
    return (
      (costoUnitario * (1 + margen) + costoEnvio) /
      (1 - tasa * (1 + IVA))
    );
  };

  // Precios sugeridos para cada tipo
  const precioSugeridoClasica = calcularPrecio(clasica);
  const precioSugeridoPremium = calcularPrecio(premium);

  // Si hay precio manual, usamos ese precio en los cálculos
  const precioUsado = (tipo) =>
    precioManual > 0
      ? precioManual
      : tipo === "clasica"
      ? precioSugeridoClasica
      : precioSugeridoPremium;

  // Función para calcular resultado neto
  const calcularResultados = (tipo, tasa) => {
    const precio = precioUsado(tipo);
    const comision = precio * tasa;
    const comisionConIVA = comision * (1 + IVA);
    const netoUnidad = precio - comisionConIVA - costoEnvio - costoUnitario;
    const netoTotal = netoUnidad * unidades;
    const inversionTotal = costoUnitario * unidades;
    const porcentajeReal = (netoUnidad / costoUnitario) * 100;

    return {
      tipo,
      precio,
      netoUnidad,
      netoTotal,
      inversionTotal,
      porcentajeReal,
    };
  };

  const resultadosClasica = calcularResultados("clasica", clasica);
  const resultadosPremium = calcularResultados("premium", premium);

  // Mostrar resultados
  const resultadosDiv = document.getElementById("resultados");
  resultadosDiv.innerHTML = `
    <h3>Resultados publicación Clásica</h3>
    <p>Precio sugerido: ${resultadosClasica.precio.toFixed(0)} COP</p>
    <p><b>Ganancia neta por unidad:</b> ${resultadosClasica.netoUnidad.toFixed(0)} COP</p>
    <p><b>Ganancia neta total (${unidades} uds):</b> ${resultadosClasica.netoTotal.toFixed(0)} COP</p>
    <p><b>Esto es lo que te ganas</b> (${resultadosClasica.porcentajeReal.toFixed(1)}% real)</p>
    <p>Recuperas tu inversión de ${resultadosClasica.inversionTotal.toFixed(0)} COP y recibes ${resultadosClasica.netoTotal.toFixed(0)} COP en ganancias.</p>

    <hr>

    <h3>Resultados publicación Premium</h3>
    <p>Precio sugerido: ${resultadosPremium.precio.toFixed(0)} COP</p>
    <p><b>Ganancia neta por unidad:</b> ${resultadosPremium.netoUnidad.toFixed(0)} COP</p>
    <p><b>Ganancia neta total (${unidades} uds):</b> ${resultadosPremium.netoTotal.toFixed(0)} COP</p>
    <p><b>Esto es lo que te ganas</b> (${resultadosPremium.porcentajeReal.toFixed(1)}% real)</p>
    <p>Recuperas tu inversión de ${resultadosPremium.inversionTotal.toFixed(0)} COP y recibes ${resultadosPremium.netoTotal.toFixed(0)} COP en ganancias.</p>
  `;
}
