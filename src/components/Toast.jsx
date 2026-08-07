import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function Toast() {
  const { toast } = useApp();

  const icons = {
    success: <CheckCircle size={18} color="#4CAF50" />,
    error: <XCircle size={18} color="#E53935" />,
    info: <Info size={18} color="#F47C20" />,
  };

  const bgColors = {
    success: '#E8F5E9',
    error: '#FFEBEE',
    info: '#FFF3E0',
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          style={{
            position: 'fixed', bottom: 90, left: 16, right: 16,
            maxWidth: 398, margin: '0 auto',
            background: bgColors[toast.type] || bgColors.success,
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 999,
          }}
        >
          {icons[toast.type] || icons.info}
          <span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
