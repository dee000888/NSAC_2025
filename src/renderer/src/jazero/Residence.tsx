import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import residenceImage from '../assets/images/residence.png';

export  default function Residence(): React.ReactElement {
  return (
    <div>
      <img src={residenceImage} alt="Residence"
        className="h-full absolute right-16"
      />
      <ResidenceModule top={120} right={470} />
      <ResidenceModule top={465} right={470} />
      <ResidenceModule top={295} right={645} />
    </div>
  )
}

function ResidenceModule(props: { top: number; right: number }): React.ReactElement {
  const ringRef = useRef<HTMLDivElement>(null)
  const { top, right } = props

  useEffect(() => {
    if (ringRef.current) {
      animate(ringRef.current, {
        rotate: '360deg',
        duration: 8000,
        easing: 'linear',
        loop: true
      })
    }
  }, [])

  return (
    <div
      className="absolute inline-block hover:cursor-pointer"
      style={{ top: `${top}px`, right: `${right}px` }}
    >
      {/* Rotating dashed ring */}
      <div
        ref={ringRef}
        className="absolute w-32 h-32 border-4 border-dashed border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  )
}



