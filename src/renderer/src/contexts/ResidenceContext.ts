import { createContext } from 'react'

export const ResidenceContext = createContext<{
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
} | null>(null)
