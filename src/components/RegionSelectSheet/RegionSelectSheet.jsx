import { useState } from 'react'
import { JAPAN_REGIONS, toShortName } from '../../data/regions'
import './RegionSelectSheet.css'

function RegionSelectSheet({ isOpen, onClose, onSelect }) {
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedPrefecture, setSelectedPrefecture] = useState(null)

  const handleRegionClick = (region) => {
    setSelectedRegion(region)
    setSelectedPrefecture(null)
  }

  const handlePrefectureClick = (prefecture) => {
    setSelectedPrefecture(prefecture)
  }

  const handleComplete = () => {
    if (selectedPrefecture) {
      onSelect(selectedPrefecture.name)
    }
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  return (
    <div className="region-sheet-backdrop" onClick={handleBackdropClick}>
      <div className="region-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="region-sheet-handle" aria-hidden />
        <h3 className="region-sheet-title">지역 선택</h3>

        <div className="region-sheet-content">
          <section className="region-list-section">
            <p className="region-list-label">지역</p>
            <div className="region-list">
              {JAPAN_REGIONS.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  className={`region-chip ${selectedRegion?.id === region.id ? 'region-chip--active' : ''}`}
                  onClick={() => handleRegionClick(region)}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </section>

          {selectedRegion && (
            <section className="prefecture-list-section">
              <div className="prefecture-list">
                {selectedRegion.prefectures.map((pref) => (
                  <button
                    key={pref.id}
                    type="button"
                    className={`prefecture-chip ${selectedPrefecture?.id === pref.id ? 'prefecture-chip--active' : ''}`}
                    onClick={() => handlePrefectureClick(pref)}
                  >
                    {toShortName(pref.name)}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <button type="button" className="region-sheet-done-btn" onClick={handleComplete}>
          완료
        </button>
      </div>
    </div>
  )
}

export default RegionSelectSheet
