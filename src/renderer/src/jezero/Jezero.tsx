import { useContext, useState } from "react";
import marsImage from "../assets/images/mars.jpg";
import HabitatModuleSelecter from "./HabitatModuleSelecter";
import MainInfomation from "@renderer/jezero/MainInfomation";
import residenceImage from "../assets/images/residence.png";
import { ResidenceContext } from "@renderer/contexts/ResidenceContext";
import { HabitatModuleEnum } from "@renderer/lib/types";

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
  
  const moduleInfo = {
    LivingSpaceModule: {
      title: "Living Space Module",
      description:
        "The Living Space Module is a self-sustaining habitat \ndesigned to support human life on Mars.",
      coords: { top: 120, right: 343 },
      onClick: () => residenceContext?.setSelectedScene(HabitatModuleEnum.LivingSpaceModule),
    },
    StorageModule: {
      title: "Storage Module",
      description:
        "The Storage Module provides secure containment for food, \ntools, and essential supplies needed for daily survival.",
      coords: { top: 197, right: 205 },
      onClick: () => residenceContext?.setSelectedScene(HabitatModuleEnum.StorageModule),
    },
    SurgicalModule: {
      title: "Surgical Module",
      description:
        "The Surgical Module serves as a medical bay equipped \nfor surgeries, treatments, and emergency healthcare on Mars.",
      coords: { top: 197, right: 480 },
      onClick: () => residenceContext?.setSelectedScene(HabitatModuleEnum.SurgicalModule),
    },
  
    RecyclingModule: {
      title: "Recycling Module",
      description:
        "The Recycling Module processes waste materials into reusable \nresources, ensuring sustainability within the habitat.",
      coords: { top: 435, right: 343 },
      onClick: () => residenceContext?.setSelectedScene(HabitatModuleEnum.RecyclingModule),
    },
    LabModule: {
      title: "Lab Module",
      description:
        "The Lab Module enables scientific experiments, material testing, \nand research critical for long-term missions.",
      coords: { top: 360, right: 480 },
      onClick: () => residenceContext?.setSelectedScene(HabitatModuleEnum.LabModule),
    },
    PlantationModule: {
      title: "Plantation Module",
      description:
        "The Plantation Module supports food production and \noxygen generation through hydroponics and controlled agriculture.",
      coords: { top: 360, right: 205 },
      onClick: () => residenceContext?.setSelectedScene(HabitatModuleEnum.PlantationModule),
    },
  };


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
        {Object.entries(moduleInfo).map(([key, module]) => (
          <HabitatModuleSelecter
            key={key}
            {...module.coords}
            onClick={module.onClick}
            onHover={() =>
              setMainInformation(
                <div>
                  <pre className="mb-2">
                    <p>Module: {module.title}</p>
                  </pre>
                  <p>{module.description}</p>
                </div>
              )
            }
            onLeave={() => setMainInformation(defaultInformation)}
          />
        ))}      
        
      </div>
      
    </div>
  );
}
