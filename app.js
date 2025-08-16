import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Tabla de tarifas de envío según publicación y reputación
const envioTarifas = {
  clasica: {
    nuevo: 9000,   // Vendedor nuevo, publicación clásica
    verde: 7000,   // Vendedor verde, publicación clásica
  },
  premium: {
    nuevo: 7000,   // Vendedor nuevo, premium
    verde: 0,      // Vendedor verde, premium (ML asume costo)
  },
};

export default function App() {
  const [costo, setCosto] = useState("");
  const [precio, setPrecio] = useState("");
  const [publicacion, setPublicacion] = useState("clasica");
  const [reputacion, setReputacion] = useState("nuevo");
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const costoNum = parseFloat(costo);
    const precioNum = parseFloat(precio);

    if (isNaN(costoNum) || isNaN(precioNum)) {
      alert("Por favor ingresa valores válidos");
      return;
    }

    // Comisión Mercado Libre
    const comision =
      publicacion === "clasica" ? precioNum * 0.13 : precioNum * 0.17;

    // Envío según tabla
    let envio = envioTarifas[publicacion][reputacion];

    // Si supera los 60k, comprador no paga envío,
    // pero para el vendedor se descuenta igual de la ganancia
    if (precioNum >= 60000) {
      envio = envioTarifas[publicacion][reputacion];
    }

    // Total de gastos (costo producto + comisión + envío)
    const gastos = costoNum + comision + envio;

    // Ganancia neta
    const ganancia = precioNum - gastos;

    // Margen de ganancia
    const margen = (ganancia / precioNum) * 100;

    // Rentabilidad respecto al costo
    const rentabilidad = (ganancia / costoNum) * 100;

    setResultado({
      comision,
      envio,
      gastos,
      ganancia,
      margen,
      rentabilidad,
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-bold">Simulador Mercado Libre</h1>

          <div>
            <label>Costo del producto:</label>
            <Input
              type="number"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
            />
          </div>

          <div>
            <label>Precio de venta:</label>
            <Input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>

          <div>
            <label>Tipo de publicación:</label>
            <select
              className="border rounded p-2 w-full"
              value={publicacion}
              onChange={(e) => setPublicacion(e.target.value)}
            >
              <option value="clasica">Clásica (13%)</option>
              <option value="premium">Premium (17%)</option>
            </select>
          </div>

          <div>
            <label>Reputación:</label>
            <select
              className="border rounded p-2 w-full"
              value={reputacion}
              onChange={(e) => setReputacion(e.target.value)}
            >
              <option value="nuevo">Nuevo vendedor</option>
              <option value="verde">Vendedor verde</option>
            </select>
          </div>

          <Button onClick={calcular} className="w-full">
            Calcular
          </Button>

          {resultado && (
            <div className="mt-6 space-y-2">
              <p>📦 Comisión: ${resultado.comision.toFixed(0)}</p>
              <p>🚚 Envío: ${resultado.envio.toFixed(0)}</p>
              <p>💰 Gastos totales: ${resultado.gastos.toFixed(0)}</p>
              <p>✅ Ganancia neta: ${resultado.ganancia.toFixed(0)}</p>
              <p>📊 Margen sobre venta: {resultado.margen.toFixed(2)}%</p>
              <p>📈 Rentabilidad sobre costo: {resultado.rentabilidad.toFixed(2)}%</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
