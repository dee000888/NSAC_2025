import { useState } from "react"
import { ResidenceContext } from "./ResidenceContext"

export default function ResidenceProvider({ children }: { children: React.ReactNode }): 
React.JSX.Element {
  const [value, setValue] = useState('Hello from context!')
  return (
    <ResidenceContext.Provider value={{ value, setValue }}>
      {children}
    </ResidenceContext.Provider>
  )
}
