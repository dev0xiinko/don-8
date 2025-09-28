"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface ProfileContextType {
  userName: string
  profileImage: string | null
  setUserName: (name: string) => void
  setProfileImage: (image: string | null) => void
  saveProfile: () => void
}

const ProfileContext = createContext<ProfileContextType | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)

  // Load profile data from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("userName")
    const savedImage = localStorage.getItem("profileImage")
    
    if (savedName) setUserName(savedName)
    if (savedImage) setProfileImage(savedImage)
  }, [])

  // Save profile data to localStorage
  const saveProfile = () => {
    if (userName) localStorage.setItem("userName", userName)
    if (profileImage) localStorage.setItem("profileImage", profileImage)
  }

  return (
    <ProfileContext.Provider
      value={{
        userName,
        profileImage,
        setUserName,
        setProfileImage,
        saveProfile
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}