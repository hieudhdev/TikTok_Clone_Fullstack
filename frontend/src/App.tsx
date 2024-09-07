import AuthModal from "./components/AuthModal"
import useGeneralStore from "./stores/generalStore"
import { useState } from "react"
import EditProfile from "./components/EditProfile"

function App() {
  const isLoginOpen = useGeneralStore((state) => state.isLoginOpen)
  const isEditProfileOpen = useGeneralStore((state) => state.isEditProfileOpen)

  return (
    <div>
      {isLoginOpen && <AuthModal />}
      {isEditProfileOpen && <EditProfile />}
    </div>
  )
}

export default App
