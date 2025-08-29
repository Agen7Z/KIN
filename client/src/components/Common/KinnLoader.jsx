import React from 'react'

const KinnLoader = ({ message = 'Loading...' }) => {
  const [activeIdx, setActiveIdx] = React.useState(0)
  const letters = ['K', 'I', 'N', 'N']

  React.useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % letters.length)
    }, 300)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      <div className="flex items-center gap-4 mb-4 select-none">
        {letters.map((ch, idx) => (
          <span
            key={idx}
            className={`text-4xl md:text-5xl font-serif tracking-[0.35em] ${
              idx === activeIdx ? 'text-gray-900' : 'text-gray-400'
            } ${idx === activeIdx ? 'scale-110' : 'scale-100'}`}
            style={{ transition: 'all 200ms ease' }}
          >
            {ch}
          </span>
        ))}
      </div>
      <div className="relative h-8 w-8 mb-3">
        <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-900 animate-spin" />
      </div>
      <p className="text-gray-600 text-sm md:text-base">{message}</p>
    </div>
  )
}

export default KinnLoader


