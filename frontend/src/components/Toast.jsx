import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="text-success" />;
      case 'error':   return <XCircle size={20} className="text-danger" />;
      case 'warning': return <AlertCircle size={20} className="text-warning" />;
      case 'info':    return <Info size={20} className="text-info" />;
      default:        return <CheckCircle size={20} className="text-success" />;
    }
  };

  return (
    <div
      className="toast show position-fixed"
      style={{
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '300px',
        maxWidth: '400px'
      }}
      role="alert"
    >
      <div className="toast-header border-0 pb-0">
        <div className="d-flex align-items-center gap-2 flex-grow-1">
          {getIcon()}
          <strong className="me-auto">
            {type === 'success' && 'Success'}
            {type === 'error' && 'Error'}
            {type === 'warning' && 'Warning'}
            {type === 'info' && 'Info'}
          </strong>
        </div>
        <button
          type="button"
          className="btn-close btn-close-white ms-2"
          onClick={onClose}
          style={{ background: 'none', border: 'none' }}
        >
          <X size={16} />
        </button>
      </div>
      <div className="toast-body">
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

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  const removeToast = id => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="toast-container position-fixed" style={{ top: '20px', right: '20px', zIndex: 9999 }}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
          duration={0} // duration handled by showToast
        />
      ))}
    </div>
  );

  return { showToast, ToastContainer };
};
