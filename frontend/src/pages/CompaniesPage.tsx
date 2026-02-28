import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Pencil, Trash2, Building2, Search } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

const schema = z.object({
  name: z.string().min(1, "Company name is required"),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  gst_number: z.string().optional(),
  is_active: z.boolean().default(true),
})
type FormData = z.infer<typeof schema>

export default function CompaniesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editData, setEditData] = useState<any | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["companies", search],
    queryFn: () => api.get("/companies/", { params: search ? { search } : {} }).then((r) => r.data),
  })

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const openCreate = () => {
    setEditData(null)
    reset({
      name: "", contact_person: "", phone: "", email: "",
      address: "", city: "", state: "", gst_number: "", is_active: true,
    })
    setDialogOpen(true)
  }

  const openEdit = (company: any) => {
    setEditData(company)
    reset({
      name: company.name,
      contact_person: company.contact_person || "",
      phone: company.phone || "",
      email: company.email || "",
      address: company.address || "",
      city: company.city || "",
      state: company.state || "",
      gst_number: company.gst_number || "",
      is_active: company.is_active,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      editData
        ? api.put(`/companies/${editData.id}/`, data)
        : api.post("/companies/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["companies-dropdown"] })
      toast({
        title: editData ? "Company updated" : "Company added",
        description: editData ? "Changes saved." : "New company created.",
      })
      setDialogOpen(false)
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.response?.data?.name?.[0] || "Failed to save.",
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/companies/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["companies-dropdown"] })
      toast({ title: "Company deleted", variant: "destructive" })
      setDeleteId(null)
    },
    onError: () => {
      toast({ title: "Cannot delete", description: "Company may have associated items.", variant: "destructive" })
    },
  })

  const companies = data?.results ?? data ?? []

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search companies..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="brand" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Add Company
        </Button>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-[#62b6cb] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : companies.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="font-medium">No companies found</p>
              <p className="text-sm mt-1">Add your first supplier company</p>
              <Button variant="brand" className="mt-4" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-1" /> Add Company
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>GST No.</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company: any) => (
                  <TableRow key={company.id} className="hover:bg-[#cae9ff]/20">
                    <TableCell className="font-medium text-[#1b4965]">{company.name}</TableCell>
                    <TableCell className="text-gray-600">{company.contact_person || "—"}</TableCell>
                    <TableCell className="text-gray-500">{company.phone || "—"}</TableCell>
                    <TableCell className="text-gray-500">{company.city || "—"}</TableCell>
                    <TableCell className="text-gray-500 text-xs">{company.gst_number || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="info">{company.item_count} items</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={company.is_active ? "success" : "secondary"}>
                        {company.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">{formatDate(company.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-[#1b4965] hover:bg-[#cae9ff]"
                          onClick={() => openEdit(company)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteId(company.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1b4965]">
              {editData ? "Edit Company" : "Add New Company"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Company Name <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Bosch India Ltd." {...register("name")} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Contact Person</Label>
                <Input placeholder="Full name" {...register("contact_person")} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input placeholder="+91 XXXXX XXXXX" {...register("phone")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="company@email.com" {...register("email")} />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Textarea placeholder="Street address..." rows={2} {...register("address")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input placeholder="e.g. Mumbai" {...register("city")} />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input placeholder="e.g. Maharashtra" {...register("state")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>GST Number</Label>
              <Input placeholder="e.g. 27XXXXX" {...register("gst_number")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="brand" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : (editData ? "Save Changes" : "Add Company")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure? This will not delete associated items but will unlink them from this company.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
