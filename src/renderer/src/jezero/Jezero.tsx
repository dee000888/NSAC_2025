import { useContext, useState } from "react";
import marsImage from "../assets/images/mars.jpg";
import ResidenceModule from "./ResidenceModule";
import MainInfomation from "@renderer/jezero/MainInfomation";
import residenceImage from "../assets/images/residence.png";
import { ResidenceContext } from "@renderer/contexts/ResidenceContext";

export default function Jezero(): React.ReactElement {
  
  const residenceContext = useContext(ResidenceContext);
  
  const defaultInformation = <div>
    <pre className="mb-2">
      <p>Place: Jazero Crater</p>
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
  
  const [mainInformation, setMainInformation] = useState<React.ReactElement >(defaultInformation);

  if (!residenceContext) {
    return <div>Loading...</div>;
  }
  
  return (
    <div
      className="w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${marsImage})` }}
    >
      
      {/* Main information */}
      <MainInfomation>
        {mainInformation}
      </MainInfomation>
      
      {/* Habitat selector */}
      <div>
        <img
          src={residenceImage}
          alt="Residence"
          className="h-full absolute right-16 drop-shadow-2xl"
        />
        {/* Living Space Module */}
        <ResidenceModule top={120} right={470} onClick={() => residenceContext.setSelectedScene("LivingSpaceModule")}
          onHover={() => setMainInformation(
            <div>
              <pre className="mb-2">
                <p>Module: Residence</p>
                <p>Module: Residence</p>
                <p>Module: Residence</p>
              </pre>
              <p>- Many activities are done here</p>
              <p>- Many activities are done here</p>
              <p>- Many activities are done here</p>
              <p>- Many activities are done here</p>
            </div>
          )}
          onLeave={() => setMainInformation(defaultInformation)}
        />
      </div>
      
    </div>
  );
}
