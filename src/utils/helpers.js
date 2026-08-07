export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short'
  });
}

export function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export function getDayName(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { weekday: 'long' });
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export function getTodayDate() {
  return formatDate(new Date().toISOString());
}

export function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

export function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function classNames(...args) {
  return args.filter(Boolean).join(' ');
}

export function getStatusBadge(estado) {
  const map = {
    presente: { label: 'Presente', class: 'badge-presente' },
    tarde: { label: 'Tarde', class: 'badge-tarde' },
    ausente: { label: 'Ausente', class: 'badge-ausente' },
  };
  return map[estado] || { label: estado, class: '' };
}

export function getStatusColor(estado) {
  const map = {
    presente: 'text-green-600',
    tarde: 'text-yellow-600',
    ausente: 'text-red-600',
  };
  return map[estado] || '';
}

export function getInitialsColor(name) {
  const colors = ['#F47C20', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722', '#607D8B', '#795548', '#00BCD4'];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function descargarArchivo(contenido, nombreArchivo, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
