import { useState } from 'react'
import { Search, Filter, X, Calendar, Package, Weight, MapPin } from 'lucide-react'
import { format } from 'date-fns'

function AdvancedFilters({ onFiltersChange, initialFilters = {} }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    startDate: '',
    endDate: '',
    minWeight: '',
    maxWeight: '',
    cargoType: '',
    origin: '',
    destination: '',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  })

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'In Transit', label: 'In Transit' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' }
  ]

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
    { value: 'estimatedDelivery', label: 'Delivery Date' },
    { value: 'trackingNumber', label: 'Tracking Number' }
  ]

  const cargoTypes = [
    'Electronics', 'Textiles', 'Machinery', 'Food & Beverages', 
    'Chemicals', 'Automotive', 'Pharmaceuticals', 'Raw Materials',
    'Consumer Goods', 'Industrial Equipment'
  ]

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: 'all',
      startDate: '',
      endDate: '',
      minWeight: '',
      maxWeight: '',
      cargoType: '',
      origin: '',
      destination: '',
      priority: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = () => {
    return filters.search || 
           filters.status !== 'all' || 
           filters.startDate || 
           filters.endDate || 
           filters.minWeight || 
           filters.maxWeight || 
           filters.cargoType || 
           filters.origin || 
           filters.destination || 
           filters.priority !== 'all'
  }

  return (
    <div className="advanced-filters">
      {/* Basic Search and Status Filter */}
      <div className="basic-filters">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by tracking number, origin, destination, or cargo..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="status-filter"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`filter-toggle ${isExpanded ? 'active' : ''}`}
        >
          <Filter size={16} />
          Advanced Filters
          {hasActiveFilters() && <span className="filter-indicator" />}
        </button>

        {hasActiveFilters() && (
          <button onClick={clearFilters} className="clear-filters">
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="advanced-panel">
          <div className="filter-grid">
            {/* Date Range */}
            <div className="filter-group">
              <label>
                <Calendar size={16} />
                Date Range
              </label>
              <div className="date-range">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  placeholder="Start Date"
                />
                <span>to</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  placeholder="End Date"
                />
              </div>
            </div>

            {/* Weight Range */}
            <div className="filter-group">
              <label>
                <Weight size={16} />
                Weight Range
              </label>
              <div className="weight-range">
                <input
                  type="number"
                  placeholder="Min (kg)"
                  value={filters.minWeight}
                  onChange={(e) => handleFilterChange('minWeight', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max (kg)"
                  value={filters.maxWeight}
                  onChange={(e) => handleFilterChange('maxWeight', e.target.value)}
                />
              </div>
            </div>

            {/* Cargo Type */}
            <div className="filter-group">
              <label>
                <Package size={16} />
                Cargo Type
              </label>
              <select
                value={filters.cargoType}
                onChange={(e) => handleFilterChange('cargoType', e.target.value)}
              >
                <option value="">All Types</option>
                {cargoTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="filter-group">
              <label>Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filters */}
            <div className="filter-group">
              <label>
                <MapPin size={16} />
                Origin
              </label>
              <input
                type="text"
                placeholder="Filter by origin..."
                value={filters.origin}
                onChange={(e) => handleFilterChange('origin', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>
                <MapPin size={16} />
                Destination
              </label>
              <input
                type="text"
                placeholder="Filter by destination..."
                value={filters.destination}
                onChange={(e) => handleFilterChange('destination', e.target.value)}
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="sort-options">
            <div className="sort-group">
              <label>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sort-group">
              <label>Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedFilters
