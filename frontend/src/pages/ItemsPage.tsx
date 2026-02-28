import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Pencil, Trash2, ArrowUpDown, Package, Filter } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

export default function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const filters: Record<string, string> = {}
  if (search) filters.search = search
  if (searchParams.get("low_stock")) filters.low_stock = "true"
  if (searchParams.get("company")) filters.company = searchParams.get("company")!
  if (searchParams.get("is_active")) filters.is_active = searchParams.get("is_active")!

  const { data, isLoading } = useQuery({
    queryKey: ["items", filters],
    queryFn: () => api.get("/inventory/items/", { params: filters }).then((r) => r.data),
  })

  const { data: companies } = useQuery({
    queryKey: ["companies-dropdown"],
    queryFn: () => api.get("/companies/dropdown/").then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/inventory/items/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast({ title: "Item deleted", description: "Item has been removed successfully.", variant: "destructive" })
      setDeleteId(null)
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" })
    },
  })

  const items = data?.results ?? data ?? []

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search items, part numbers..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                const p = new URLSearchParams(searchParams)
                e.target.value ? p.set("search", e.target.value) : p.delete("search")
                setSearchParams(p)
              }}
            />
          </div>
          <Select
            value={searchParams.get("company") || "all"}
            onValueChange={(v) => {
              const p = new URLSearchParams(searchParams)
              v === "all" ? p.delete("company") : p.set("company", v)
              setSearchParams(p)
            }}
          >
            <SelectTrigger className="w-44">
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies?.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={searchParams.get("low_stock") || "all"}
            onValueChange={(v) => {
              const p = new URLSearchParams(searchParams)
              v === "true" ? p.set("low_stock", "true") : p.delete("low_stock")
              setSearchParams(p)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Stock status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="true">Low Stock Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild variant="brand">
          <Link to="/items/new">
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Link>
        </Button>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-[#62b6cb] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="font-medium">No items found</p>
              <p className="text-sm mt-1">Add your first item to get started</p>
              <Button asChild variant="brand" className="mt-4">
                <Link to="/items/new"><Plus className="w-4 h-4 mr-1" /> Add Item</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Item Name</TableHead>
                  <TableHead>Part No.</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1">
                      Quantity <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-[#cae9ff]/20">
                    <TableCell className="font-medium text-[#1b4965]">{item.name}</TableCell>
                    <TableCell className="text-gray-500 text-xs">{item.part_number || "—"}</TableCell>
                    <TableCell>{item.company_name || <span className="text-gray-400">—</span>}</TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${item.quantity === 0 ? "text-red-600" : item.is_low_stock ? "text-amber-600" : "text-gray-800"}`}
                      >
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs uppercase">{item.unit}</TableCell>
                    <TableCell className="text-gray-700">{formatCurrency(item.purchase_price)}</TableCell>
                    <TableCell className="text-gray-700">{formatCurrency(item.selling_price)}</TableCell>
                    <TableCell>
                      {item.quantity === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : item.is_low_stock ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#62b6cb] hover:text-[#1b4965] hover:bg-[#cae9ff]">
                          <Link to={`/items/${item.id}/stock`} title="Manage Stock">
                            <ArrowUpDown className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-[#1b4965] hover:bg-[#cae9ff]">
                          <Link to={`/items/${item.id}/edit`} title="Edit">
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteId(item.id)}
                          title="Delete"
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1b4965]">Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone and will remove all associated stock transactions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
