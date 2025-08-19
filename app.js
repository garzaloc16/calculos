"use client";

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
} as const;

// Normaliza números con coma/punto y sin espacios
const toNumber = (v: string) => {
  const s = (v ?? "").toString().trim().replace(/\s+/g, "").replace(/,/g, ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
};

export default function App() {
  const [costo, setCosto] = useState("");
  const [precio, setPrecio] = useState("");
  const [publicacion, setPublicacion] = useState<"clasica" | "premium">("clasica");
  const [reputacion, setReputacion] = useState<"nuevo" | "verde">("nuevo");
  const [resultado, setResultado] = useState<null | {
    comision: number;
    envio: number;
    gastos: number;
    ganancia: number;
    margen: number;
    rentabilidad: number;
  }>(null);

  const calcular = () => {
    const costoNum = toNumber(costo);
    const precioNum = toNumber(precio);

    if (!Number.isFinite(costoNum) || !Number.isFinite(precioNum)) {
      alert("Por favor ingresa valores válidos");
      return;
    }

    // Comisión Mercado Libre (mismas fórmulas)
    const comision = publicacion === "clasica" ? precioNum * 0.13 : precioNum * 0.17;

    // Envío según tabla (mismo comportamiento que tenías)
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

    // Rentabilidad respecto al costo (puede ser Infinity si costo=0)
    const rentabilidad = (ganancia / costoNum) * 100;

    setResultado({ comision, envio, gastos, ganancia, margen, rentabilidad });
  };

  const fmtMoney = (n: number) =>
    Number.isFinite(n) ? `$${n.toFixed(0)}` : "—";

  const fmtPct = (n: number) =>
    Number.isFinite(n) ? `${n.toFixed(2)}%` : (n === Infinity || n === -Infinity ? "∞" : "—");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-bold">Simulador Mercado Libre</h1>

          <div>
            <label>Costo del producto:</label>
            <Input
              type="number"
              inputMode="decimal"
              step="any"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
            />
          </div>

          <div>
            <label>Precio de venta:</label>
            <Input
              type="number"
              inputMode="decimal"
              step="any"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>

          <div>
            <label>Tipo de publicación:</label>
            <select
              className="border rounded p-2 w-full"
              value={publicacion}
              onChange={(e) => setPublicacion(e.target.value as "clasica" | "premium")}
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
              onChange={(e) => setReputacion(e.target.value as "nuevo" | "verde")}
            >
              <option value="nuevo">Nuevo vendedor</option>
              <option value="verde">Vendedor verde</option>
            </select>
          </div>

          <Button type="button" onClick={calcular} className="w-full">
            Calcular
          </Button>

          {resultado && (
            <div className="mt-6 space-y-2">
              <p>📦 Comisión: {fmtMoney(resultado.comision)}</p>
              <p>🚚 Envío: {fmtMoney(resultado.envio)}</p>
              <p>💰 Gastos totales: {fmtMoney(resultado.gastos)}</p>
              <p>✅ Ganancia neta: {fmtMoney(resultado.ganancia)}</p>
              <p>📊 Margen sobre venta: {fmtPct(resultado.margen)}</p>
              <p>📈 Rentabilidad sobre costo: {fmtPct(resultado.rentabilidad)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
    }
