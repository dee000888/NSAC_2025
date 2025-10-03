import React, { useEffect, useRef, useState } from "react";
import { animate } from "animejs";

type ResidenceModuleProps = {
  top: number;
  right: number;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
};

export default function ResidenceModule(props: ResidenceModuleProps): React.ReactElement {
  
  const [hovering, setHovering] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const { top, right, onClick, onHover, onLeave } = props;

  useEffect(() => {
    if (ringRef.current) {
      animate(ringRef.current, {
        rotate: "360deg",
        duration: 8000,
        easing: "linear",
        loop: true,
      });
    }
  }, []);

  return (
    <div
      className="absolute w-32 h-32 inline-block hover:cursor-pointer"
      style={{ top: `${top}px`, right: `${right}px` }}
      onClick={onClick}
      onMouseEnter={() => {
        setHovering(true);
        onHover();
      }}
      onMouseLeave={() => {
        setHovering(false);
        onLeave();
      }}
    >
      {/* Rotating dashed ring */}
      {hovering && (
        <div
          ref={ringRef}
          className="absolute w-32 h-32 border-4 border-dashed border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        />
      )}
    </div>
  );
}
