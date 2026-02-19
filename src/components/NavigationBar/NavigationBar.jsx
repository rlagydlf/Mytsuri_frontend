import { NavLink } from 'react-router-dom'
import './NavigationBar.css'

const NAV_ITEMS = [
  { to: '/', label: '홈', activeIcon: '/assets/nav_home_active.svg', inactiveIcon: '/assets/nav_home_inactive.svg', end: true },
  { to: '/map', label: '지도', activeIcon: '/assets/nav_map_active.svg', inactiveIcon: '/assets/nav_map_inactive.svg', end: false },
  { to: '/list', label: '북마크', activeIcon: '/assets/nav_list_active.svg', inactiveIcon: '/assets/nav_list_inactive.svg', end: false },
  { to: '/profile', label: '마이', activeIcon: '/assets/nav_profile_active.svg', inactiveIcon: '/assets/nav_profile_inactive.svg', end: false },
]

function NavigationBar() {
  return (
    <nav
      className="nav-bar"
      role="navigation"
      aria-label="하단 메뉴"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <img
                src={isActive ? item.activeIcon : item.inactiveIcon}
                alt=""
                className="nav-icon"
                aria-hidden={true}
              />
              <span className="nav-label">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default NavigationBar
