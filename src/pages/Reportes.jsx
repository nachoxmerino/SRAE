import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, Share2, Mail, ChevronDown, Search, BarChart3 } from 'lucide-react';
import Header from '../components/Header';
import { useApp } from '../contexts/AppContext';
import { getCursos, getReporte, exportReporte, getAlumnosAll } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PieChart from '../components/PieChart';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Reportes({ onMenuClick }) {
  const { user } = useAuth();
  const { showToast } = useApp();
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroAlumno, setFiltroAlumno] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('90');
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [c, a] = await Promise.all([
        getCursos(user?.id || 'd1'),
        getAlumnosAll(),
      ]);
      setCursos(c);
      setAlumnos(a);
    };
    load();
  }, [user?.id]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await getReporte({ cursoId: filtroCurso, alumnoId: filtroAlumno, periodo: filtroPeriodo });
      setReporte(data);
      setGenerated(true);
      showToast('Reporte generado exitosamente', 'success');
    } catch {
      showToast('Error al generar reporte', 'error');
    }
    setLoading(false);
  };

  const handleExport = async (tipo) => {
    try {
      await exportReporte(tipo, reporte);
      showToast(`Reporte exportado como ${tipo.toUpperCase()}`, 'success');
    } catch {
      showToast('Error al exportar', 'error');
    }
  };

  return (
    <div>
      <Header title="Reportes" onMenuClick={onMenuClick} />
      <div className="page-content">
        <div className="card" style={{ marginLeft: 16, marginRight: 16 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600 }}>Filtros</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <select
                value={filtroCurso}
                onChange={e => setFiltroCurso(e.target.value)}
                className="input-field"
                style={{ height: 42, fontSize: 13, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Todos los cursos</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={filtroAlumno}
                onChange={e => setFiltroAlumno(e.target.value)}
                className="input-field"
                style={{ height: 42, fontSize: 13, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Todos los alumnos</option>
                {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={filtroPeriodo}
                onChange={e => setFiltroPeriodo(e.target.value)}
                className="input-field"
                style={{ height: 42, fontSize: 13, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="30">Últimos 30 días</option>
                <option value="60">Últimos 60 días</option>
                <option value="90">Últimos 90 días</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }} />
            </div>
          </div>
        </div>

        {!generated && !loading && (
          <button className="btn-primary ripple" onClick={handleGenerate} style={{ marginTop: 8 }}>
            <BarChart3 size={18} />
            Generar reporte
          </button>
        )}

        {loading && <SkeletonLoader count={3} />}

        {generated && reporte && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <PieChart pct={reporte.pct} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#4CAF50' }}>{reporte.presentes}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>Presentes</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#F9A825' }}>{reporte.tardes}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>Tardanzas</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#E53935' }}>{reporte.ausentes}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>Ausentes</div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: '#888' }}>Total: {reporte.total} registros</div>
            </div>

            <div className="card" style={{ maxHeight: 200, overflowY: 'auto' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Detalle por alumno</h4>
              {reporte.detalle.map(d => (
                <div key={d.alumnoId} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid #F5F5F5', fontSize: 13
                }}>
                  <span style={{ fontWeight: 500 }}>{d.alumnoNombre}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: d.pct >= 85 ? '#4CAF50' : d.pct >= 70 ? '#F9A825' : '#E53935', fontWeight: 600 }}>
                      {d.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Exportar reporte</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="export-group">
                  <button className="btn-secondary ripple" onClick={() => handleExport('pdf')}>
                    <FileText size={16} /> PDF
                  </button>
                  <button className="btn-secondary ripple" onClick={() => handleExport('xlsx')}>
                    <FileSpreadsheet size={16} /> Excel
                  </button>
                  <button className="btn-secondary ripple" onClick={() => handleExport('csv')}>
                    <FileText size={16} /> CSV
                  </button>
                </div>
                <div className="export-group">
                  <button className="btn-secondary ripple">
                    <Download size={16} /> Descargar
                  </button>
                  <button className="btn-secondary ripple">
                    <Share2 size={16} /> Compartir
                  </button>
                  <button className="btn-secondary ripple">
                    <Mail size={16} /> Enviar
                  </button>
                </div>
              </div>
            </div>

            <button className="btn-primary ripple" onClick={handleGenerate} disabled={loading}>
              <BarChart3 size={18} />
              {loading ? 'Generando...' : 'Regenerar reporte'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
