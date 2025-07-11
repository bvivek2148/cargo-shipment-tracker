import { Toaster } from 'react-hot-toast'

function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '400px'
        },

        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff'
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981'
          }
        },
        error: {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: '#fff'
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444'
          }
        },
        loading: {
          style: {
            background: '#3b82f6',
            color: '#fff'
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#3b82f6'
          }
        }
      }}
    />
  )
}

export default ToastContainer
