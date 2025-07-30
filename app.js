// ===============================
// Tabla de categorías ML Colombia
// ===============================
let categorias = [
  { nombre: "Accesorios para Vehículos", clasica: 0.13, premium: 0.17 },
  { nombre: "Agro", clasica: 0.11, premium: 0.15 },
  { nombre: "Animales y Mascotas", clasica: 0.13, premium: 0.17 },
  { nombre: "Antigüedades y Colecciones", clasica: 0.15, premium: 0.19 },
  { nombre: "Arte, Papelería y Mercería", clasica: 0.13, premium: 0.17 },
  { nombre: "Bebés", clasica: 0.13, premium: 0.17 },
  { nombre: "Belleza y Cuidado Personal", clasica: 0.13, premium: 0.17 },
  { nombre: "Cámaras y Accesorios", clasica: 0.13, premium: 0.17 },
  { nombre: "Celulares y Teléfonos", clasica: 0.13, premium: 0.17 },
  { nombre: "Computación", clasica: 0.13, premium: 0.17 },
  { nombre: "Consolas y Videojuegos", clasica: 0.13, premium: 0.17 },
  { nombre: "Construcción", clasica: 0.13, premium: 0.17 },
  { nombre: "Deportes y Fitness", clasica: 0.13, premium: 0.17 },
  { nombre: "Electrodomésticos", clasica: 0.13, premium: 0.17 },
  { nombre: "Electrónica, Audio y Video", clasica: 0.13, premium: 0.17 },
  { nombre: "Herramientas", clasica: 0.13, premium: 0.17 },
  { nombre: "Hogar y Muebles", clasica: 0.13, premium: 0.17 },
  { nombre: "Industrias y Oficinas", clasica: 0.13, premium: 0.17 },
  { nombre: "Instrumentos Musicales", clasica: 0.13, premium: 0.17 },
  { nombre: "Juegos y Juguetes", clasica: 0.13, premium: 0.17 },
  { nombre: "Libros, Revistas y Comics", clasica: 0.13, premium: 0.17 },
  { nombre: "Moda", clasica: 0.14, premium: 0.18 },
  { nombre: "Música, Películas y Series", clasica: 0.13, premium: 0.17 },
  { nombre: "Recuerdos, Cotillón y Fiestas", clasica: 0.13, premium: 0.17 },
  { nombre: "Relojes y Joyas", clasica: 0.13, premium: 0.17 },
  { nombre: "Salud y Equipamiento Médico", clasica: 0.13, premium: 0.17 },
  { nombre: "Servicios", clasica: 0.15, premium: 0.19 },
  { nombre: "Souvenirs, Cotillón y Fiestas", clasica: 0.13, premium: 0.17 },
  { nombre: "Otras categorías", clasica: 0.13, premium: 0.17 }
];

// ===============================
// Cargar categorías en el select
// ===============================
function cargarCategorias() {
  const select = document.getElementById("categoria");
  select.innerHTML = "";
  categorias.forEach((c, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${c.nombre}`;
    select.appendChild(option);
  });

  // Mostrar detalle inicial
  mostrarDetalleCategoria(0);

  // Cada vez que cambia selección, mostrar detalle
  select.addEventListener("change", () => {
    mostrarDetalleCategoria(parseInt(select.value));
  });
}

// Muestra los porcentajes seleccionados en un div
function mostrarDetalleCategoria(idx) {
  const detalle = document.getElementById("detalleCategoria");
  const c = categorias[idx];
  detalle.innerHTML = `
    <p><strong>Comisión Clásica:</strong> ${(c.clasica*100).toFixed(0)}% | 
       <strong>Comisión Premium:</strong> ${(c.premium*100).toFixed(0)}%</p>
  `;
}

window.onload = cargarCategorias;

// ===============================
// Cálculo costo unitario
// ===============================
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

// ===============================
// Simulación MercadoLibre
// ===============================
let chart = null;

function simular() {
  const idx = parseInt(document.getElementById("categoria").value);
  const margen = parseFloat(document.getElementById("margen").value) / 100;
  const precioManual = parseFloat(document.getElementById("precioManual").value) || 0;

  const { clasica, premium } = categorias[idx];
  const iva = 0.19;
  const envioGratis = 60000;

  const base = costoUnitario;
  const precioSugerido = (base * (1 + margen)) / (1 - clasica * (1 + iva));

  function calcularGanancia(precio, comision) {
    const aplicaEnvioGratis = precio >= envioGratis;
    const costoEnvio = aplicaEnvioGratis ? 5500 : 0; // tarifa simple <1kg
    const retencion = precio * comision;
    const ivaCom = retencion * iva;
    const totalRet = retencion + ivaCom;
    const neto = precio - totalRet - costoEnvio;
    const ganancia = neto - base;
    return { neto, ganancia, totalRet, costoEnvio, aplicaEnvioGratis };
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
       ${esSugerido ? '(calculado con margen)' : '(ingresado manualmente)'}
    </p>

    <h4>Clásica</h4>
    <ul>
      <li>Ingreso neto: ${clasicaRes.neto.toFixed(2)} COP</li>
      <li>Ganancia neta: ${clasicaRes.ganancia.toFixed(2)} COP</li>
      <li>Comisiones+IVA: ${clasicaRes.totalRet.toFixed(2)} COP</li>
      <li>Envío: ${textoEnvio(clasicaRes)}</li>
    </ul>

    <h4>Premium</h4>
    <ul>
      <li>Ingreso neto: ${premiumRes.neto.toFixed(2)} COP</li>
      <li>Ganancia neta: ${premiumRes.ganancia.toFixed(2)} COP</li>
      <li>Comisiones+IVA: ${premiumRes.totalRet.toFixed(2)} COP</li>
      <li>Envío: ${textoEnvio(premiumRes)}</li>
    </ul>
  `;
  document.getElementById("resultados").innerHTML = resultados;

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
