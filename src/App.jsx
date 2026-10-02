import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Sprout, RefreshCw } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000"; 
const CLIENTE_ID = 1;

export default function App() {
  const [balance, setBalance] = useState({ total_ingresos: 185000, total_gastos: 92400, margen_neto: 92600 });
  const [movimientos, setMovimientos] = useState([
    { tipo_movimiento: 'GASTO', categoria: 'Jornales', monto: 14000, descripcion: 'Pago de deshierbe', fecha: '28/09/2026' },
    { tipo_movimiento: 'GASTO', categoria: 'Insumos', monto: 26500, descripcion: 'Fertilizante Urea', fecha: '25/09/2026' },
    { tipo_movimiento: 'INGRESO', categoria: 'Venta Cosecha', monto: 120000, descripcion: 'Cosecha de temporada', fecha: '20/09/2026' },
  ]);
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    tipo_movimiento: 'GASTO',
    monto: '',
    categoria: 'Insumos',
    descripcion: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const resBalance = await fetch(`${API_URL}/clientes/${CLIENTE_ID}/balance`);
      if (resBalance.ok) setBalance(await resBalance.json());

      const resMovimientos = await fetch(`${API_URL}/clientes/${CLIENTE_ID}/movimientos`);
      if (resMovimientos.ok) setMovimientos(await resMovimientos.json());
    } catch {
      // Mantiene datos locales si el backend aún no corre
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!nuevoMovimiento.monto) return;
    
    const montoNum = parseFloat(nuevoMovimiento.monto);
    const item = { ...nuevoMovimiento, monto: montoNum, fecha: 'Hoy' };

    try {
      await fetch(`${API_URL}/movimientos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_cliente: CLIENTE_ID, ...nuevoMovimiento, monto: montoNum })
      });
      cargarDatos();
    } catch {
      setMovimientos([item, ...movimientos]);
      if (item.tipo_movimiento === 'INGRESO') {
        setBalance(b => ({ ...b, total_ingresos: b.total_ingresos + montoNum, margen_neto: b.margen_neto + montoNum }));
      } else {
        setBalance(b => ({ ...b, total_gastos: b.total_gastos + montoNum, margen_neto: b.margen_neto - montoNum }));
      }
    }

    setMostrarModal(false);
    setNuevoMovimiento({ tipo_movimiento: 'GASTO', monto: '', categoria: 'Insumos', descripcion: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sprout className="text-emerald-600" /> Control Financiero Agrícola
            </h1>
            <p className="text-sm text-slate-500">Panel administrativo del productor</p>
          </div>
          <div className="flex gap-2">
            <button onClick={cargarDatos} className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 bg-white shadow-sm">
              <RefreshCw size={18} className={cargando ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={() => setMostrarModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition"
            >
              <Plus size={18} /> Registrar Movimiento
            </button>
          </div>
        </header>

        {/* Tarjetas KPI */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Ingresos</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-slate-900">${balance.total_ingresos.toLocaleString()}</span>
              <TrendingUp className="text-emerald-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Gastos</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-slate-900">${balance.total_gastos.toLocaleString()}</span>
              <TrendingDown className="text-rose-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-400">Margen Neto</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-emerald-600">${balance.margen_neto.toLocaleString()}</span>
              <DollarSign className="text-emerald-600" size={24} />
            </div>
          </div>
        </section>

        {/* Lista de Registros */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Operaciones Recientes</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {movimientos.map((m, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div>
                  <p className="font-medium text-slate-800">{m.categoria}</p>
                  <p className="text-xs text-slate-400">{m.descripcion || m.fecha || 'Sin descripción'}</p>
                </div>
                <span className={`font-semibold ${m.tipo_movimiento === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {m.tipo_movimiento === 'INGRESO' ? '+' : '-'}${Number(m.monto).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Modal flotante */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold mb-4">Registrar Operación</h3>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNuevoMovimiento({ ...nuevoMovimiento, tipo_movimiento: 'GASTO' })}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg border ${
                    nuevoMovimiento.tipo_movimiento === 'GASTO' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setNuevoMovimiento({ ...nuevoMovimiento, tipo_movimiento: 'INGRESO' })}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg border ${
                    nuevoMovimiento.tipo_movimiento === 'INGRESO' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  Ingreso
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Monto ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={nuevoMovimiento.monto}
                  onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, monto: e.target.value })}
                  className="w-full text-xl font-bold p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Categoría</label>
                <select
                  value={nuevoMovimiento.categoria}
                  onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, categoria: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Insumos">Insumos y Fertilizantes</option>
                  <option value="Jornales">Mano de Obra / Jornales</option>
                  <option value="Combustible">Combustible</option>
                  <option value="Venta Cosecha">Venta de Cosecha</option>
                  <option value="Venta Animales">Venta de Ganado/Animales</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej. Pago de 5 jornales"
                  value={nuevoMovimiento.descripcion}
                  onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, descripcion: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 py-2.5 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}