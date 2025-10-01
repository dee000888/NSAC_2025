import { useContext, useEffect } from 'react'
import { ResidenceContext } from './contexts/ResidenceContext'
import Jazero from './jazero/Jazero'

export default function App(): React.JSX.Element {

  // Initialize IPC handle
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  
  const residenceContext = useContext(ResidenceContext)

  useEffect(() => {
    ipcHandle()
  }, [])

  return (
      <Jazero />
  )

}
