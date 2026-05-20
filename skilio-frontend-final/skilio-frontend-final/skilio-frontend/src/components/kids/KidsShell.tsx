import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useKidsStore } from '@/store/kidsStore'

export function KidsShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedChild = useKidsStore((s) => s.selectedChild)

  // Hide the tab during active missions — the player has its own immersive top bar
  const isMission = /^\/kids\/play\//.test(location.pathname)

  return (
    <div className="min-h-screen kids-app-shell">
      {!isMission && (
        <div style={{
          position: 'fixed', bottom: '1.25rem', right: '1.25rem',
          zIndex: 200,
          display: 'flex', gap: '0.5rem',
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.55rem 1rem',
              background: 'rgba(13,10,26,0.92)',
              border: '1px solid rgba(124,58,237,0.4)',
              borderRadius: '100px',
              color: 'rgba(248,250,252,0.85)',
              fontSize: '0.82rem', fontWeight: 800,
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              fontFamily: '"Nunito", system-ui, sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            <span style={{ fontSize: '0.95rem' }}>🏠</span>
            {selectedChild ? `Exit ${selectedChild.display_name}'s mode` : 'Back to dashboard'}
          </button>
        </div>
      )}
      <Outlet />
    </div>
  )
}
