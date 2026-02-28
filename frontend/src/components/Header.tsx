import { useLocation } from "react-router-dom"
import { LogOut, User } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/items": "Items",
  "/items/new": "Add New Item",
  "/companies": "Companies",
}

export default function Header() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const title =
    Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] ??
    "Akash Automobile"

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h2 className="text-lg font-semibold text-[#1b4965]">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 rounded-full bg-[#cae9ff] flex items-center justify-center">
            <User className="w-4 h-4 text-[#1b4965]" />
          </div>
          <span className="font-medium text-[#1b4965]">
            {user?.first_name || user?.username}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Logout
        </Button>
      </div>
    </header>
  )
}
