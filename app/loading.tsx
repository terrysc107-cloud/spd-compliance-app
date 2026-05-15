export default function LoadingPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#05091a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(59,130,246,0.2)',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
