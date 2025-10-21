import React from 'react';


interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, actions, className, style }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div
        className={className}
        style={{ background: '#fff', borderRadius: 8, minWidth: 340, maxWidth: 420, boxShadow: '0 2px 16px #0002', padding: 32, position: 'relative', ...style }}
      >
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
        <div style={{ margin: '16px 0' }}>{children}</div>
        {actions && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>{actions}</div>}
      </div>
    </div>
  );
};

export default Modal;
