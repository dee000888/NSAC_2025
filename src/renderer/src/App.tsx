import { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { ResidenceContext } from "./contexts/ResidenceContext";
import Jezero from "./jezero/Jezero";
import HabitatModule from "./habitatModule/HabitatModule";
import RecycleStation from "./recycleStation/recycleStation";

export default function App(): React.JSX.Element {
  
  const residenceContext = useContext(ResidenceContext);

  if (!residenceContext) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Jezero />} />
      <Route path="/habitatmodule" element={<HabitatModule />} />
      <Route path="/recyclestation" element={<RecycleStation />} />
    </Routes>
  );
  
}
