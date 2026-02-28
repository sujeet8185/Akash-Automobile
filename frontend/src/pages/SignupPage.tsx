import { useState } from "react"
import { Navigate, Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Lock, User, Mail, Phone, Wrench, Zap, Shield } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().max(15, "Phone too long").optional().or(z.literal("")),
})
type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/auth/register/", {
        username: data.username,
        password: data.password,
        email: data.email || undefined,
        phone: data.phone || undefined,
      })
      localStorage.setItem("auth_token", res.data.token)
      await login(data.username, data.password)
      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      const errs = err?.response?.data
      if (errs) {
        const msg = Object.values(errs).flat().join(" ")
        setError(msg)
      } else {
        setError("Registration failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <img src="/shop.jpg" alt="Akash Automobile" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-[#1b4965]/60 to-black/50" />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/20 shadow-lg">
              <img src="/shop.jpg" alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow">Akash Automobile</h1>
              <p className="text-[#bee9e8] text-xs">Genuine Spare Parts · Lubricants · Accessories</p>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
              Join the<br /><span className="text-[#62b6cb]">Akash</span><br />Family.
            </h2>
            <p className="text-white/70 mt-4 text-base max-w-xs">Create your account and start managing inventory today.</p>
            <div className="flex flex-wrap gap-2 mt-6">
              {[{ icon: Wrench, label: "Spare Parts Tracking" }, { icon: Zap, label: "Real-time Stock" }, { icon: Shield, label: "Secure Access" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-xs font-medium">
                  <Icon className="w-3.5 h-3.5 text-[#bee9e8]" />{label}
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/40 text-xs">© {new Date().getFullYear()} Akash Automobile. All rights reserved.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-3 overflow-hidden shadow-lg">
              <img src="/shop.jpg" alt="Akash Automobile" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-[#1b4965]">Akash Automobile</h1>
            <p className="text-gray-400 text-sm">Stock Management System</p>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#1b4965]">Create account</h2>
            <p className="text-gray-400 text-sm mt-1">Sign up to get started</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-[#1b4965] font-medium text-sm">Username <span className="text-red-500">*</span></Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="username" placeholder="Choose a username" className="pl-10 h-11 border-gray-200 rounded-xl focus-visible:ring-[#62b6cb]" {...register("username")} />
              </div>
              {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#1b4965] font-medium text-sm">Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="password" type="password" placeholder="Create a password" className="pl-10 h-11 border-gray-200 rounded-xl focus-visible:ring-[#62b6cb]" {...register("password")} />
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#1b4965] font-medium text-sm">Email <span className="text-gray-400 text-xs font-normal">(optional)</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="email" type="email" placeholder="your@email.com" className="pl-10 h-11 border-gray-200 rounded-xl focus-visible:ring-[#62b6cb]" {...register("email")} />
              </div>
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[#1b4965] font-medium text-sm">Phone <span className="text-gray-400 text-xs font-normal">(optional)</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="phone" type="tel" placeholder="e.g. 9876543210" className="pl-10 h-11 border-gray-200 rounded-xl focus-visible:ring-[#62b6cb]" {...register("phone")} />
              </div>
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl text-white font-semibold text-sm mt-1" style={{ background: "linear-gradient(135deg, #1b4965, #62b6cb)" }} disabled={loading}>
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account...</span> : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#1b4965] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
