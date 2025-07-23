import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Add CSS animations
const toastStyles = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideOutDown {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(100%);
    }
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'toast-styles';
  styleElement.textContent = toastStyles;
  document.head.appendChild(styleElement);
}

export const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-success" />;
      case 'error':
        return <XCircle size={20} className="text-danger" />;
      case 'warning':
        return <AlertCircle size={20} className="text-warning" />;
      case 'info':
        return <Info size={20} className="text-info" />;
      default:
        return <CheckCircle size={20} className="text-success" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-success';
      case 'error':
        return 'bg-danger';
      case 'warning':
        return 'bg-warning';
      case 'info':
        return 'bg-info';
      default:
        return 'bg-success';
    }
  };

  return (
    <div 
      className={`toast show position-fixed mb-3`}
      style={{
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '320px',
        maxWidth: '400px',
        backgroundColor: 'white',
        border: `1px solid ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'}`,
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        animation: 'slideInUp 0.3s ease-out'
      }}
      role="alert"
    >
      <div className="toast-header border-0 pb-2" style={{ backgroundColor: 'transparent' }}>
        <div className="d-flex align-items-center gap-2 flex-grow-1">
          {getIcon()}
          <strong className="me-auto" style={{ fontSize: '14px', fontWeight: '600' }}>
            {type === 'success' && 'Success'}
            {type === 'error' && 'Error'}
            {type === 'warning' && 'Warning'}
            {type === 'info' && 'Info'}
          </strong>
        </div>
        <button 
          type="button" 
          className="btn p-1" 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none',
            borderRadius: '6px',
            transition: 'background-color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <X size={16} className="text-muted" />
        </button>
      </div>
      <div className="toast-body pt-0" style={{ fontSize: '14px', lineHeight: '1.4' }}>
        {message}
      </div>
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div 
      className="toast-container position-fixed" 
      style={{ 
        bottom: '20px', 
        right: '20px', 
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
          duration={0} // We handle duration in useToast
        />
      ))}
    </div>
  );

  return {
    showToast,
    ToastContainer
  };
};