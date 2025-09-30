import { useEffect } from 'react'
import Jazero from './jazero/Jazero'

export default function App(): React.JSX.Element {

  // Initialize IPC handle
  // Temp
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  useEffect(() => {
    ipcHandle()
  }, [])

  return (
      <Jazero />

  )

}
