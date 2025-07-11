import { useState } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { Play, Pause, RotateCcw, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

function EventSimulator() {
  const { socket, isConnected, emitEvent } = useSocket()
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationInterval, setSimulationInterval] = useState(null)

  const sampleEvents = [
    {
      type: 'shipment:created',
      data: {
        trackingNumber: 'CST' + Math.floor(Math.random() * 1000),
        status: 'Pending',
        origin: 'New York, USA',
        destination: 'London, UK',
        cargo: 'Electronics',
        weight: '500 kg'
      }
    },
    {
      type: 'shipment:updated',
      data: {
        trackingNumber: 'CST' + Math.floor(Math.random() * 1000),
        status: 'In Transit',
        location: 'Atlantic Ocean',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      type: 'shipment:delivered',
      data: {
        trackingNumber: 'CST' + Math.floor(Math.random() * 1000),
        status: 'Delivered',
        deliveryTime: new Date().toISOString(),
        recipient: 'John Smith'
      }
    },
    {
      type: 'system:alert',
      data: {
        message: 'Weather alert: Storm approaching shipping route',
        priority: 'high',
        affectedShipments: 5
      }
    },
    {
      type: 'shipment:delayed',
      data: {
        trackingNumber: 'CST' + Math.floor(Math.random() * 1000),
        reason: 'Port congestion',
        newEstimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ]

  const triggerRandomEvent = () => {
    if (!socket || !isConnected) {
      toast.error('Not connected to real-time service')
      return
    }

    const randomEvent = sampleEvents[Math.floor(Math.random() * sampleEvents.length)]
    
    // Simulate the event by triggering the socket listeners directly
    if (socket._listeners && socket._listeners[randomEvent.type]) {
      socket._listeners[randomEvent.type].forEach(callback => {
        callback(randomEvent.data)
      })
    }

    toast.success(`Simulated: ${randomEvent.type}`, {
      icon: '⚡',
      duration: 2000
    })
  }

  const startSimulation = () => {
    if (isSimulating) return

    setIsSimulating(true)
    const interval = setInterval(() => {
      triggerRandomEvent()
    }, 3000) // Trigger event every 3 seconds

    setSimulationInterval(interval)
    toast.success('Real-time simulation started', {
      icon: '🚀',
      duration: 2000
    })
  }

  const stopSimulation = () => {
    if (!isSimulating) return

    setIsSimulating(false)
    if (simulationInterval) {
      clearInterval(simulationInterval)
      setSimulationInterval(null)
    }

    toast('Real-time simulation stopped', {
      icon: '⏹️',
      duration: 2000
    })
  }

  const triggerSpecificEvent = (eventType) => {
    const event = sampleEvents.find(e => e.type === eventType)
    if (event && socket && socket._listeners && socket._listeners[event.type]) {
      socket._listeners[event.type].forEach(callback => {
        callback(event.data)
      })
      toast.success(`Triggered: ${eventType}`, {
        icon: '⚡',
        duration: 2000
      })
    }
  }

  return (
    <div className="event-simulator">
      <div className="simulator-header">
        <h3>
          <Zap size={20} />
          Real-time Event Simulator
        </h3>
        <p>Simulate real-time events to test notifications and dashboard updates</p>
      </div>

      <div className="simulator-controls">
        <div className="auto-simulation">
          <h4>Auto Simulation</h4>
          <div className="control-buttons">
            <button
              onClick={startSimulation}
              disabled={isSimulating || !isConnected}
              className="btn btn-success"
            >
              <Play size={16} />
              Start Auto Simulation
            </button>
            <button
              onClick={stopSimulation}
              disabled={!isSimulating}
              className="btn btn-secondary"
            >
              <Pause size={16} />
              Stop Simulation
            </button>
          </div>
          {isSimulating && (
            <div className="simulation-status">
              <div className="pulse-indicator"></div>
              <span>Simulating events every 3 seconds...</span>
            </div>
          )}
        </div>

        <div className="manual-triggers">
          <h4>Manual Event Triggers</h4>
          <div className="trigger-buttons">
            <button
              onClick={() => triggerSpecificEvent('shipment:created')}
              disabled={!isConnected}
              className="btn btn-info"
            >
              📦 New Shipment
            </button>
            <button
              onClick={() => triggerSpecificEvent('shipment:updated')}
              disabled={!isConnected}
              className="btn btn-info"
            >
              🔄 Update Shipment
            </button>
            <button
              onClick={() => triggerSpecificEvent('shipment:delivered')}
              disabled={!isConnected}
              className="btn btn-success"
            >
              ✅ Delivery
            </button>
            <button
              onClick={() => triggerSpecificEvent('shipment:delayed')}
              disabled={!isConnected}
              className="btn btn-warning"
            >
              ⚠️ Delay Alert
            </button>
            <button
              onClick={() => triggerSpecificEvent('system:alert')}
              disabled={!isConnected}
              className="btn btn-danger"
            >
              🚨 System Alert
            </button>
            <button
              onClick={triggerRandomEvent}
              disabled={!isConnected}
              className="btn btn-primary"
            >
              <RotateCcw size={16} />
              Random Event
            </button>
          </div>
        </div>
      </div>

      <div className="connection-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          <div className="status-dot"></div>
          <span>{isConnected ? 'Connected to real-time service' : 'Disconnected'}</span>
        </div>
      </div>
    </div>
  )
}

export default EventSimulator
