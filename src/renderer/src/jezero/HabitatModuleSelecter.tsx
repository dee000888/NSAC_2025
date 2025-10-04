import React, { useEffect, useRef, useState } from "react";
import { animate } from "animejs";

type HabitatModuleSelecterProps = {
  top: number;
  right: number;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
};

export default function HabitatModuleSelecter(props: HabitatModuleSelecterProps): React.ReactElement {
  
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
      className="w-36 h-36 hover:cursor-pointer absolute"
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
      {hovering && (
        <div
          ref={ringRef}
          className="w-full h-full border-4 border-dashed border-blue-500 rounded-full pointer-events-none"
        />
      )}
    </div>

  );
}
