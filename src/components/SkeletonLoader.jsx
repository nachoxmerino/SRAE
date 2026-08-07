export default function SkeletonLoader({ count = 3, height = 80 }) {
  return (
    <div className="page-padding" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height, width: '100%' }} />
      ))}
    </div>
  );
}
