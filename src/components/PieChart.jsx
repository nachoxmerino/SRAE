export default function PieChart({ pct, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const center = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size}>
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="#F0F0F0" strokeWidth={strokeWidth}
        />
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={pct >= 85 ? '#4CAF50' : pct >= 70 ? '#F9A825' : '#E53935'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>{pct}%</div>
        <div style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>
          {pct >= 85 ? 'Bueno' : pct >= 70 ? 'Regular' : 'Riesgo'}
        </div>
      </div>
    </div>
  );
}
