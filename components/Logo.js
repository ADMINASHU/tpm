import React from 'react'

const Logo = () => {
    return (
        <div className="flex flex-col items-center justify-center leading-none">
            <span className="text-[24px] font-bold tracking-widest text-red-600" style={{ fontFamily: '"Bell MT", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif' }}>
                TECHSER
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-slate-800 uppercase" style={{ fontFamily: '"Arial", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif' }}>
                PLANT MANAGEMENT
            </span>
        </div>
    )
}

export default Logo