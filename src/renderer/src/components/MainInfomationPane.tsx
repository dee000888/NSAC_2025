import React from 'react';

export default function MainInfomationPane(): React.ReactElement {
  return (
    <div className="absolute inset-0 flex items-center justify-start">
      <div className="p-4 ml-40 flex flex-col justify-center rounded bg-gray-950 bg-opacity-40 backdrop-blur-md text-white">
        
        <div>
          <pre className="mb-2">
            <p>Place: Olympus Mons</p>
            <p>Planet: Mars</p>
            <p>Pressure: 0.6 kPa</p>
            <p>Gravity: 3.71 m/s²</p>
            <p>Temperature: -125°C to 20°C</p>
          </pre>
          <p>- Mars is the 4th planet from the Sun.</p>
          <p>- It has two moons: Phobos and Deimos.</p>
          <p>- Surface temperature ranges from -125°C to 20°C.</p>
          <p>- Known as the Red Planet due to iron oxide.</p>
        </div>
      </div>
    </div>
  );
}
