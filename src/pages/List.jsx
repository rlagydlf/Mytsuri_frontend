import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import NavigationBar from '../components/NavigationBar'
import './List.css'

const DUMMY_LISTS = [
  {
    id: 1,
    name: '가고 싶은 여름 축제',
    coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    festivals: [
      { id: 101, title: '타카야마 여름 축제', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400' },
      { id: 102, title: '기온 마츠리', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400' },
      { id: 103, title: '텐진 마쓰리', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
      { id: 104, title: '아오모리 네부타', image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400' },
      { id: 105, title: '삿포로 눈 축제', image: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f8?w=400' },
    ],
  },
]

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FC4A3A" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  )
}

function List() {
  const navigate = useNavigate()
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchLists = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/lists', {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (isMounted) setLists(Array.isArray(data) ? data : [])
      } catch (e) {
        if (e.name === 'AbortError') return
        if (isMounted) setLists(DUMMY_LISTS)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchLists()
    return () => { isMounted = false; controller.abort() }
  }, [])

  return (
    <div className="list-page">
      <div className="list-top-fixed">
        <StatusBar />
        <header className="list-header">
          <h1 className="list-header-title">리스트</h1>
        </header>
      </div>

      <main className="list-main">
        {loading && <p className="list-loading">불러오는 중...</p>}

        {!loading && lists.length === 0 && (
          <p className="list-empty">저장한 리스트가 없어요</p>
        )}

        <div className="list-cards">
          {lists.map((list) => (
            <article
              key={list.id}
              className="list-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/list/${list.id}`)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/list/${list.id}`)}
            >
              <div className="list-card-cover">
                <img src={list.coverImage || list.festivals?.[0]?.image} alt="" className="list-card-cover-img" />
                <div className="list-card-cover-gradient" />
                <div className="list-card-cover-text">
                  <p className="list-card-name">{list.name}</p>
                  <p className="list-card-count">{list.festivals?.length || 0}개의 축제</p>
                </div>
              </div>

              {list.festivals && list.festivals.length > 0 && (
                <div className="list-card-previews">
                  {list.festivals.slice(0, 3).map((fest) => (
                    <div key={fest.id} className="list-card-preview">
                      <div className="list-card-preview-img-wrap">
                        {fest.image ? (
                          <img src={fest.image} alt={fest.title} />
                        ) : (
                          <div className="list-card-preview-placeholder" />
                        )}
                      </div>
                      <p className="list-card-preview-title">{fest.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </main>

      <button
        type="button"
        className="list-fab"
        aria-label="리스트 추가"
        onClick={() => navigate('/list/new')}
      >
        <PlusIcon />
      </button>

      <NavigationBar />
    </div>
  )
}

export default List
