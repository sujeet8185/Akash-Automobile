import { NavLink } from "react-router-dom"
import { LayoutDashboard, Package, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/items", label: "Items", icon: Package },
  { to: "/companies", label: "Companies", icon: Building2 },
]

export default function Sidebar() {
  return (
    <aside className="w-64 flex flex-col bg-[#1b4965] text-white">
      {/* Shop photo banner */}
      <div className="relative h-28 overflow-hidden flex-shrink-0">
        <img
          src="/shop.jpg"
          alt="Akash Automobile"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#1b4965]/40 to-[#1b4965]" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h1 className="font-extrabold text-sm text-white leading-tight drop-shadow">Akash Automobile</h1>
          <p className="text-[#bee9e8] text-[10px]">Stock Management System</p>
        </div>
      </div>

      <Separator className="bg-[#62b6cb]/30" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[#bee9e8] text-xs font-semibold uppercase tracking-widest px-3 mb-3">
          Main Menu
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#62b6cb] text-white shadow-md"
                  : "text-[#bee9e8] hover:bg-[#62b6cb]/20 hover:text-white"
              )
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#62b6cb]/30">
        <p className="text-[#bee9e8] text-xs text-center">Genuine Spare Parts & Accessories</p>
        <p className="text-[#5fa8d3] text-xs text-center mt-0.5">v1.0.0</p>
      </div>
    </aside>
  )
}

