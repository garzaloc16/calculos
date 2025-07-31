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

function simular() {
  const unidades = parseFloat(document.getElementById("unidades").value);
  const costoUnitario = calcularCostoUnitario();
  const categoria = document.getElementById("categoria").value;
  const reputacion = document.getElementById("reputacion").value;
  const margenDeseado = parseFloat(document.getElementById("margen").value) / 100;
  const precioManual = parseFloat(document.getElementById("precioManual").value) || 0;

  const comisionBase = categorias[categoria];
  const comisionPremiumExtra = 0.05;

  // Función para calcular precio de venta que garantice el margen neto deseado
  function calcularPrecioVenta(margen, comision) {
    // Fórmula ajustada: ingreso neto = precio * (1 - comision) - envioGratis
    // Queremos que ingreso neto = costoUnitario * (1 + margen)
    // Para envío gratis se descuenta después, aquí solo usamos la parte de comisión
    return (costoUnitario * (1 + margen)) / (1 - comision);
  }

  // Precios sugeridos
  let precioClasica = calcularPrecioVenta(margenDeseado, comisionBase);
  let precioPremium = calcularPrecioVenta(margenDeseado, comisionBase + comisionPremiumExtra);

  // Si el usuario ingresa un precio manual, se usa ese precio
  if (precioManual > 0) {
    precioClasica = precioManual;
    precioPremium = precioManual;
  }

  // Función para calcular resultados finales teniendo en cuenta envío gratis
  function calcularResultados(precio, comision) {
    let costoEnvioGratis = 0;
    if (precio >= 79900) {
      // costo de envío según reputación
      costoEnvioGratis = reputacion === "nuevo" ? 9000 : 7000;
    }

    const comisionTotal = precio * comision;
    const ingresoNeto = precio - comisionTotal - costoEnvioGratis - costoUnitario;

    const gananciaNetaPorUnidad = ingresoNeto;
    const gananciaTotal = gananciaNetaPorUnidad * unidades;
    const inversionTotal = costoUnitario * unidades;

    return { precio, gananciaNetaPorUnidad, gananciaTotal, inversionTotal, costoEnvioGratis };
  }

  const resClasica = calcularResultados(precioClasica, comisionBase);
  const resPremium = calcularResultados(precioPremium, comisionBase + comisionPremiumExtra);

  const resultadosDiv = document.getElementById("resultados");
  resultadosDiv.innerHTML = `
    <h3>Resultados:</h3>

    <h4>Publicación Clásica</h4>
    <p>Precio sugerido: ${resClasica.precio.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</p>
    <p>Envío: ${resClasica.costoEnvioGratis > 0 ? `Gratis (costo vendedor ${resClasica.costoEnvioGratis.toLocaleString("es-CO", { style: "currency", currency: "COP" })})` : "No gratis (costo vendedor 0 COP)"}</p>
    <p><b>Ganancia neta por unidad: ${resClasica.gananciaNetaPorUnidad.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</b> (esto es lo que te ganas, descontando TODO)</p>
    <p><b>Total ganancias netas (todas las unidades): ${resClasica.gananciaTotal.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</b></p>
    <p>Inversión recuperada: ${resClasica.inversionTotal.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</p>

    <h4>Publicación Premium</h4>
    <p>Precio sugerido: ${resPremium.precio.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</p>
    <p>Envío: ${resPremium.costoEnvioGratis > 0 ? `Gratis (costo vendedor ${resPremium.costoEnvioGratis.toLocaleString("es-CO", { style: "currency", currency: "COP" })})` : "No gratis (costo vendedor 0 COP)"}</p>
    <p><b>Ganancia neta por unidad: ${resPremium.gananciaNetaPorUnidad.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</b> (esto es lo que te ganas, descontando TODO)</p>
    <p><b>Total ganancias netas (todas las unidades): ${resPremium.gananciaTotal.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</b></p>
    <p>Inversión recuperada: ${resPremium.inversionTotal.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</p>
  `;
}
