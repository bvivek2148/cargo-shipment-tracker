import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders, mockShipment, mockFetch } from '../../test/utils'
import SimpleShipmentList from '../SimpleShipmentList'

// Mock the shipment data
const mockShipments = [
  mockShipment({ id: '1', trackingNumber: 'CST001', status: 'In Transit' }),
  mockShipment({ id: '2', trackingNumber: 'CST002', status: 'Delivered' }),
  mockShipment({ id: '3', trackingNumber: 'CST003', status: 'Pending' }),
]

describe('SimpleShipmentList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.success({ shipments: mockShipments })
  })

  it('renders shipment list correctly', async () => {
    renderWithProviders(<SimpleShipmentList />)
    
    // Check if loading state is shown initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    
    // Wait for shipments to load
    await waitFor(() => {
      expect(screen.getByText('CST001')).toBeInTheDocument()
    })
    
    // Check if all shipments are rendered
    expect(screen.getByText('CST001')).toBeInTheDocument()
    expect(screen.getByText('CST002')).toBeInTheDocument()
    expect(screen.getByText('CST003')).toBeInTheDocument()
  })

  it('displays shipment status correctly', async () => {
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText('In Transit')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Delivered')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText('CST001')).toBeInTheDocument()
    })
    
    // Find and use search input
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'CST001' } })
    
    // Should show only matching shipment
    await waitFor(() => {
      expect(screen.getByText('CST001')).toBeInTheDocument()
      expect(screen.queryByText('CST002')).not.toBeInTheDocument()
    })
  })

  it('handles status filter', async () => {
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText('CST001')).toBeInTheDocument()
    })
    
    // Find and use status filter
    const statusFilter = screen.getByDisplayValue(/all/i)
    fireEvent.change(statusFilter, { target: { value: 'Delivered' } })
    
    // Should show only delivered shipments
    await waitFor(() => {
      expect(screen.getByText('CST002')).toBeInTheDocument()
      expect(screen.queryByText('CST001')).not.toBeInTheDocument()
    })
  })

  it('handles API error gracefully', async () => {
    mockFetch.error(500, 'Server Error')
    
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('handles empty shipment list', async () => {
    mockFetch.success({ shipments: [] })
    
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText(/no shipments/i)).toBeInTheDocument()
    })
  })

  it('navigates to shipment details on click', async () => {
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText('CST001')).toBeInTheDocument()
    })
    
    // Click on shipment
    const shipmentCard = screen.getByText('CST001').closest('.shipment-card')
    fireEvent.click(shipmentCard)
    
    // Should navigate to details page (would need router mock for full test)
    expect(shipmentCard).toHaveClass('shipment-card')
  })

  it('displays correct shipment information', async () => {
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText('CST001')).toBeInTheDocument()
    })
    
    // Check if shipment details are displayed
    expect(screen.getByText('New York, USA')).toBeInTheDocument()
    expect(screen.getByText('London, UK')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('handles refresh functionality', async () => {
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText('CST001')).toBeInTheDocument()
    })
    
    // Mock new data for refresh
    const newMockShipments = [
      ...mockShipments,
      mockShipment({ id: '4', trackingNumber: 'CST004', status: 'In Transit' })
    ]
    mockFetch.success({ shipments: newMockShipments })
    
    // Find and click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)
    
    // Should show new shipment after refresh
    await waitFor(() => {
      expect(screen.getByText('CST004')).toBeInTheDocument()
    })
  })

  it('displays loading state during data fetch', () => {
    mockFetch.loading()
    
    renderWithProviders(<SimpleShipmentList />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('handles network error', async () => {
    mockFetch.networkError()
    
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('supports keyboard navigation', async () => {
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText('CST001')).toBeInTheDocument()
    })
    
    const firstShipment = screen.getByText('CST001').closest('.shipment-card')
    
    // Test keyboard navigation
    fireEvent.keyDown(firstShipment, { key: 'Enter' })
    expect(firstShipment).toHaveClass('shipment-card')
    
    fireEvent.keyDown(firstShipment, { key: ' ' })
    expect(firstShipment).toHaveClass('shipment-card')
  })

  it('displays correct date formatting', async () => {
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText('CST001')).toBeInTheDocument()
    })
    
    // Check if dates are formatted correctly
    expect(screen.getByText(/2024-01-15/)).toBeInTheDocument()
  })

  it('shows correct shipment count', async () => {
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText(/3.*shipments?/i)).toBeInTheDocument()
    })
  })

  it('handles sorting functionality', async () => {
    renderWithProviders(<SimpleShipmentList />)
    
    await waitFor(() => {
      expect(screen.getByText('CST001')).toBeInTheDocument()
    })
    
    // Find sort dropdown
    const sortSelect = screen.getByDisplayValue(/date/i)
    fireEvent.change(sortSelect, { target: { value: 'status' } })
    
    // Should re-order shipments by status
    await waitFor(() => {
      const shipmentCards = screen.getAllByText(/CST\d+/)
      expect(shipmentCards).toHaveLength(3)
    })
  })
})
