import { useState } from 'react'
import { FESTIVAL_TYPES } from '../../data/festivalTypes'
import './TypeSelectSheet.css'

function TypeSelectSheet({ isOpen, onClose, onSelect }) {
  const [selectedType, setSelectedType] = useState(null)

  const handleTypeClick = (type) => {
    setSelectedType(type)
  }

  const handleComplete = () => {
    if (selectedType) {
      onSelect(selectedType)
    }
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  return (
    <div className="type-sheet-backdrop" onClick={handleBackdropClick}>
      <div className="type-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="type-sheet-handle" aria-hidden />
        <h3 className="type-sheet-title">종류 선택</h3>

        <div className="type-sheet-content">
          <section className="type-list-section">
            <p className="type-list-label">종류</p>
            <div className="type-list">
              {FESTIVAL_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`type-chip ${selectedType?.id === type.id ? 'type-chip--active' : ''}`}
                  onClick={() => handleTypeClick(type)}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </section>
        </div>

        <button type="button" className="type-sheet-done-btn" onClick={handleComplete}>
          완료
        </button>
      </div>
    </div>
  )
}

export default TypeSelectSheet
