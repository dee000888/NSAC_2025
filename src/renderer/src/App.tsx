import { useContext, useEffect } from "react";
import { ResidenceContext } from "./contexts/ResidenceContext";
import Jezero from "./jezero/Jezero";
import { ipcRenderer } from "electron";

export default function App(): React.JSX.Element {
  
  const residenceContext = useContext(ResidenceContext);
  
  useEffect(() => {

    async function getBinTrashData() {
      try {
        const smartBins = await ipcRenderer.invoke("getSmartBins");
        const trashItems = await ipcRenderer.invoke("getTrashItems");
        residenceContext?.setSmartBins(smartBins);
        residenceContext?.setTrashItems(trashItems);
      } catch (err) {
        console.error("Failed to fetch bin/trash data:", err);
      }
    };

    getBinTrashData();
    
  }, [residenceContext]);

  if (!residenceContext) {
    return <div>Loading...</div>;
  }

  // return (residenceContext.selectedScene === "Jezero" ? <Jezero /> : <div>Loading...</div>);
  return <Jezero />;
  
}
