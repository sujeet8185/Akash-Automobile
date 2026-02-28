import { useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Save } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

const schema = z.object({
  name: z.string().min(1, "Item name is required"),
  part_number: z.string().optional(),
  company: z.string().optional().nullable(),
  description: z.string().optional(),
  unit: z.string().default("pcs"),
  quantity: z.coerce.number().min(0, "Quantity must be 0 or more"),
  min_stock_level: z.coerce.number().min(0).default(5),
  purchase_price: z.coerce.number().min(0).default(0),
  selling_price: z.coerce.number().min(0).default(0),
  is_active: z.boolean().default(true),
})
type FormData = z.infer<typeof schema>

export default function ItemFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: companies } = useQuery({
    queryKey: ["companies-dropdown"],
    queryFn: () => api.get("/companies/dropdown/").then((r) => r.data),
  })

  const { data: itemData } = useQuery({
    queryKey: ["item", id],
    queryFn: () => api.get(`/inventory/items/${id}/`).then((r) => r.data),
    enabled: isEdit,
  })

  const {
    register, handleSubmit, control, reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (itemData) {
      reset({
        ...itemData,
        company: itemData.company ? String(itemData.company) : null,
        quantity: itemData.quantity,
        min_stock_level: itemData.min_stock_level,
        purchase_price: itemData.purchase_price,
        selling_price: itemData.selling_price,
      })
    }
  }, [itemData, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, company: data.company ? Number(data.company) : null }
      return isEdit
        ? api.put(`/inventory/items/${id}/`, payload)
        : api.post("/inventory/items/", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast({
        title: isEdit ? "Item updated" : "Item added",
        description: isEdit ? "Changes saved successfully." : "New item added to inventory.",
        variant: "success" as any,
      })
      navigate("/items")
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.name?.[0] || "Failed to save item."
      toast({ title: "Error", description: msg, variant: "destructive" })
    },
  })

  const onSubmit = (data: FormData) => mutation.mutate(data)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="text-gray-500">
          <Link to="/items"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-[#1b4965] to-[#62b6cb] text-white rounded-t-lg">
          <CardTitle className="text-white text-lg">
            {isEdit ? "Edit Item" : "Add New Item"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Company */}
            <div className="space-y-1.5">
              <Label className="text-[#1b4965] font-medium">Company</Label>
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Company</SelectItem>
                      {companies?.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Item Name */}
            <div className="space-y-1.5">
              <Label className="text-[#1b4965] font-medium">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input placeholder="e.g. Brake Pad Set" {...register("name")} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            {/* Part Number */}
            <div className="space-y-1.5">
              <Label className="text-[#1b4965] font-medium">Part Number</Label>
              <Input placeholder="e.g. BP-1234" {...register("part_number")} />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-[#1b4965] font-medium">Description</Label>
              <Textarea placeholder="Optional item description..." rows={3} {...register("description")} />
            </div>

            {/* Unit + Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[#1b4965] font-medium">Unit</Label>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { value: "pcs", label: "Pieces" },
                          { value: "set", label: "Set" },
                          { value: "ltr", label: "Litre" },
                          { value: "kg", label: "Kilogram" },
                          { value: "mtr", label: "Meter" },
                          { value: "box", label: "Box" },
                        ].map((u) => (
                          <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#1b4965] font-medium">
                  Quantity Available <span className="text-red-500">*</span>
                </Label>
                <Input type="number" min={0} placeholder="0" {...register("quantity")} />
                {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity.message}</p>}
              </div>
            </div>

            {/* Min Stock Level */}
            <div className="space-y-1.5">
              <Label className="text-[#1b4965] font-medium">Minimum Stock Alert Level</Label>
              <Input type="number" min={0} placeholder="5" {...register("min_stock_level")} />
              <p className="text-xs text-gray-400">Alert when quantity falls below this number</p>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[#1b4965] font-medium">Purchase Price (₹)</Label>
                <Input type="number" step="0.01" min={0} placeholder="0.00" {...register("purchase_price")} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#1b4965] font-medium">Selling Price (₹)</Label>
                <Input type="number" step="0.01" min={0} placeholder="0.00" {...register("selling_price")} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="brand" disabled={mutation.isPending} className="flex-1">
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    {isEdit ? "Save Changes" : "Add Item"}
                  </>
                )}
              </Button>
              <Button asChild variant="outline">
                <Link to="/items">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
