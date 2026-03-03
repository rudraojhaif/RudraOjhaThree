import { SelectedObjectType, StaircaseParams } from '@/types/selection'

interface PropertiesPanelProps {
  selectedObject: SelectedObjectType
  staircaseParams?: StaircaseParams
  onStaircaseParamChange?: (key: keyof StaircaseParams, value: number) => void
  onPrintDocument?: () => void
  onExportOBJ?: () => void
  onViewPDF?: () => void
}

export const PropertiesPanel = ({
  selectedObject,
  staircaseParams,
  onStaircaseParamChange,
  onPrintDocument,
  onExportOBJ,
  onViewPDF
}: PropertiesPanelProps) => {
  if (!selectedObject) return null

  const isMobileLayout = window.innerWidth < 600
  const panelStyle: React.CSSProperties = isMobileLayout ? {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxHeight: '50vh',
    backgroundColor: 'rgba(10, 10, 15, 0.97)',
    border: '2px solid #404050',
    borderRadius: '8px 8px 0 0',
    padding: '12px',
    fontFamily: '"Courier New", monospace',
    color: '#ffffff',
    zIndex: 2000,
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.6)',
    overflowY: 'auto'
  } : {
    position: 'fixed',
    right: '20px',
    top: '20px',
    width: '320px',
    maxHeight: '80vh',
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    border: '2px solid #404050',
    borderRadius: '8px',
    padding: '16px',
    fontFamily: '"Courier New", monospace',
    color: '#ffffff',
    zIndex: 2000,
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
    overflowY: 'auto'
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    textShadow: 'none',
    borderBottom: '1px solid #404050',
    paddingBottom: '8px',
    color: '#ffffff'
  }

  const sliderLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#cccccc',
    marginBottom: '6px',
    display: 'flex',
    justifyContent: 'space-between'
  }

  const sliderStyle: React.CSSProperties = {
    width: '100%',
    accentColor: '#808090',
    marginBottom: '12px',
    cursor: 'pointer',
    height: isMobileLayout ? '24px' : undefined
  }

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    marginTop: '12px',
    backgroundColor: '#303040',
    border: '1px solid #505060',
    color: '#ffffff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: '"Courier New", monospace',
    transition: 'all 0.2s',
    textShadow: 'none'
  }

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#505060'
    e.currentTarget.style.color = '#ffffff'
    e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.2)'
  }

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = '#303040'
    e.currentTarget.style.color = '#ffffff'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div style={panelStyle}>
      {selectedObject === 'staircase' && staircaseParams && (
        <>
          <div style={titleStyle}>FLY ME TO THE MOON PARAMS</div>

          <label style={sliderLabelStyle}>
            <span>Steps</span>
            <span>{staircaseParams.steps}</span>
          </label>
          <input
            type="range"
            min="4"
            max="32"
            step="1"
            value={staircaseParams.steps}
            onChange={(e) => onStaircaseParamChange?.('steps', parseInt(e.target.value))}
            style={sliderStyle}
          />

          <label style={sliderLabelStyle}>
            <span>Rise</span>
            <span>{staircaseParams.rise.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={staircaseParams.rise}
            onChange={(e) => onStaircaseParamChange?.('rise', parseFloat(e.target.value))}
            style={sliderStyle}
          />

          <label style={sliderLabelStyle}>
            <span>Twist</span>
            <span>{staircaseParams.twist.toFixed(1)}°</span>
          </label>
          <input
            type="range"
            min="180"
            max="1080"
            step="45"
            value={staircaseParams.twist}
            onChange={(e) => onStaircaseParamChange?.('twist', parseFloat(e.target.value))}
            style={sliderStyle}
          />

          <label style={sliderLabelStyle}>
            <span>Width</span>
            <span>{staircaseParams.width.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={staircaseParams.width}
            onChange={(e) => onStaircaseParamChange?.('width', parseFloat(e.target.value))}
            style={sliderStyle}
          />

          <label style={sliderLabelStyle}>
            <span>Depth</span>
            <span>{staircaseParams.depth.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.2"
            max="1.5"
            step="0.1"
            value={staircaseParams.depth}
            onChange={(e) => onStaircaseParamChange?.('depth', parseFloat(e.target.value))}
            style={sliderStyle}
          />

          <label style={sliderLabelStyle}>
            <span>Thickness</span>
            <span>{staircaseParams.thickness.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="0.5"
            step="0.05"
            value={staircaseParams.thickness}
            onChange={(e) => onStaircaseParamChange?.('thickness', parseFloat(e.target.value))}
            style={sliderStyle}
          />

          <label style={sliderLabelStyle}>
            <span>Column Radius</span>
            <span>{staircaseParams.columnRadius.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={staircaseParams.columnRadius}
            onChange={(e) => onStaircaseParamChange?.('columnRadius', parseFloat(e.target.value))}
            style={sliderStyle}
          />

          <label style={sliderLabelStyle}>
            <span>Rail Height</span>
            <span>{staircaseParams.railHeight.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="1"
            max="4"
            step="0.1"
            value={staircaseParams.railHeight}
            onChange={(e) => onStaircaseParamChange?.('railHeight', parseFloat(e.target.value))}
            style={sliderStyle}
          />

          <button
            style={buttonStyle}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            onClick={onExportOBJ}
          >
            EXPORT AS OBJ
          </button>
        </>
      )}

      {selectedObject === 'monitor' && (
        <>
          <div style={titleStyle}>CRT MONITOR</div>
          <button
            style={buttonStyle}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            onClick={onViewPDF}
          >
            VIEW PDF
          </button>
          <button
            style={buttonStyle}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            onClick={onPrintDocument}
          >
            DOWNLOAD PDF
          </button>
        </>
      )}

      {selectedObject === 'printer' && (
        <>
          <div style={titleStyle}>PRINTER</div>
          <button
            style={buttonStyle}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            onClick={onPrintDocument}
          >
            PRINT MY DOCUMENT
          </button>
        </>
      )}
    </div>
  )
}
