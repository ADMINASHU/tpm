import React from 'react'

const Logo = () => {
    return (
        <div className="flex flex-col leading-none">
            <span className="text-[22px] font-bold tracking-widest text-red-600" style={{ fontFamily: '"Bell MT", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif' }}>
                TECHSER
            </span>
            <span className="text-[8px] font-semibold tracking-[0.2em] text-slate-500 uppercase" style={{ fontFamily: '"Serif", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif' }}>
                PLANT MANAGEMENT
            </span>
        </div>
    )
}

export default Logo