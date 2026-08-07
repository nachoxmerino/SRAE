import { Menu, Bell, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ title, onMenuClick, onBack, showBack, rightAction }) {
  return (
    <div className="header">
      <div className="header-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '40px' }}>
          {showBack ? (
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}>
              <ChevronLeft size={24} />
            </button>
          ) : (
            <button onClick={onMenuClick} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}>
              <Menu size={22} />
            </button>
          )}
        </div>
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="header-title"
          style={{ flex: 1, margin: 0, fontSize: '17px', fontWeight: '600' }}
        >
          {title}
        </motion.h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: '40px' }}>
          {rightAction || (
            <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', position: 'relative' }}>
              <Bell size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
