import { Wifi, WifiOff, Activity } from 'lucide-react'
import { useSocket } from '../../contexts/SocketContext'

function RealTimeStatus() {
  const { isConnected } = useSocket()

  return (
    <div className={`realtime-status ${isConnected ? 'connected' : 'disconnected'}`}>
      <div className="status-indicator">
        {isConnected ? (
          <>
            <Activity size={14} className="status-icon pulse" />
            <span className="status-text">Live</span>
          </>
        ) : (
          <>
            <WifiOff size={14} className="status-icon" />
            <span className="status-text">Offline</span>
          </>
        )}
      </div>
    </div>
  )
}

export default RealTimeStatus
