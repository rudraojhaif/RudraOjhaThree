import { useState } from 'react'

interface LegPosition {
  x: number
  y: number
  id: string
}

interface ParaTableHUDProps {
  isVisible: boolean
  onClose: () => void
  onLegsUpdate: (legs: LegPosition[]) => void
  initialLegs?: LegPosition[]
}

export const ParaTableHUD = ({ isVisible, onClose, onLegsUpdate, initialLegs = [] }: ParaTableHUDProps) => {
  const [legs, setLegs] = useState<LegPosition[]>(
    initialLegs.length > 0
      ? initialLegs
      : [
          { x: 0.1, y: 0.1, id: '1' },
          { x: 0.9, y: 0.1, id: '2' },
          { x: 0.1, y: 0.9, id: '3' },
          { x: 0.9, y: 0.9, id: '4' }
        ]
  )

  if (!isVisible) return null

  const addLeg = () => {
    const newId = Date.now().toString()
    const newLegs = [...legs, { x: 0.5, y: 0.5, id: newId }]
    setLegs(newLegs)
    onLegsUpdate(newLegs)
  }

  const removeLeg = (id: string) => {
    if (legs.length <= 1) {
      alert('Table must have at least one leg!')
      return
    }
    const newLegs = legs.filter(leg => leg.id !== id)
    setLegs(newLegs)
    onLegsUpdate(newLegs)
  }

  const updateLeg = (id: string, field: 'x' | 'y', value: number) => {
    const newLegs = legs.map(leg =>
      leg.id === id ? { ...leg, [field]: value } : leg
    )
    setLegs(newLegs)
    onLegsUpdate(newLegs)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '320px',
        maxHeight: '80vh',
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '8px',
        padding: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#333333',
        zIndex: 2000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        overflowY: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#000000' }}>ParaTable</div>
          <div style={{ fontSize: '12px', color: '#666666', marginTop: '2px' }}>
            Parametric Table Constructor
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '28px',
            height: '28px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #d0d0d0',
            borderRadius: '4px',
            color: '#666666',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e0e0e0'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5'
            e.currentTarget.style.color = '#666666'
          }}
        >
          ×
        </button>
      </div>

      {/* Info */}
      <div
        style={{
          fontSize: '12px',
          marginBottom: '12px',
          padding: '10px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          lineHeight: '1.5',
          color: '#555555'
        }}
      >
        Coordinates are relative to table dimensions (0-1 scale).
        <br />
        Origin (0,0) = Left-Back corner of table
      </div>

      {/* Leg List */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#000000'
          }}
        >
          <span>Table Legs ({legs.length})</span>
          <button
            onClick={addLeg}
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: '#007bff',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 'normal',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            +
          </button>
        </div>

        {legs.map((leg, index) => (
          <div
            key={leg.id}
            style={{
              marginBottom: '12px',
              padding: '14px',
              backgroundColor: '#ffffff',
              border: '1px solid #d0d0d0',
              borderRadius: '6px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#000000' }}>
                Leg #{index + 1}
              </span>
              <button
                onClick={() => removeLeg(leg.id)}
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  color: '#dc3545',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff'
                  e.currentTarget.style.color = '#dc3545'
                }}
              >
                −
              </button>
            </div>

            {/* X Coordinate */}
            <div style={{ marginBottom: '10px' }}>
              <label
                style={{
                  fontSize: '12px',
                  display: 'block',
                  marginBottom: '6px',
                  color: '#555555',
                  fontWeight: '500'
                }}
              >
                X Position: {leg.x.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={leg.x}
                onChange={(e) => updateLeg(leg.id, 'x', parseFloat(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  accentColor: '#007bff',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Y Coordinate */}
            <div>
              <label
                style={{
                  fontSize: '12px',
                  display: 'block',
                  marginBottom: '6px',
                  color: '#555555',
                  fontWeight: '500'
                }}
              >
                Y Position: {leg.y.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={leg.y}
                onChange={(e) => updateLeg(leg.id, 'y', parseFloat(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  accentColor: '#007bff',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: '11px',
          textAlign: 'center',
          color: '#999999',
          paddingTop: '12px',
          borderTop: '1px solid #e0e0e0'
        }}
      >
        matrix.exe v1.0 | ParaTable System
      </div>
    </div>
  )
}
