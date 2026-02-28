import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Plus, Minus, Package } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { formatDateTime, formatCurrency } from "@/lib/utils"

export default function StockPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [addDialog, setAddDialog] = useState(false)
  const [removeDialog, setRemoveDialog] = useState(false)
  const [qty, setQty] = useState("")
  const [notes, setNotes] = useState("")

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: () => api.get(`/inventory/items/${id}/`).then((r) => r.data),
  })

  const { data: transactions } = useQuery({
    queryKey: ["item-transactions", id],
    queryFn: () => api.get(`/inventory/items/${id}/transactions/`).then((r) => r.data),
  })

  const addMutation = useMutation({
    mutationFn: () => api.post(`/inventory/items/${id}/add-stock/`, { quantity: Number(qty), notes }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["item", id] })
      queryClient.invalidateQueries({ queryKey: ["item-transactions", id] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["items"] })
      toast({ title: "Stock added", description: res.data.detail })
      setAddDialog(false); setQty(""); setNotes("")
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.response?.data?.quantity?.[0] || "Failed to add stock.", variant: "destructive" })
    },
  })

  const removeMutation = useMutation({
    mutationFn: () => api.post(`/inventory/items/${id}/remove-stock/`, { quantity: Number(qty), notes }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["item", id] })
      queryClient.invalidateQueries({ queryKey: ["item-transactions", id] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["items"] })
      toast({ title: "Stock removed", description: res.data.detail })
      setRemoveDialog(false); setQty(""); setNotes("")
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.response?.data?.quantity?.[0] || "Failed to remove stock.", variant: "destructive" })
    },
  })

  if (isLoading || !item) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#62b6cb] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const stockStatus = item.quantity === 0 ? "destructive" : item.is_low_stock ? "warning" : "success"
  const stockLabel = item.quantity === 0 ? "Out of Stock" : item.is_low_stock ? "Low Stock" : "In Stock"

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="text-gray-500">
          <Link to="/items"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Items</Link>
        </Button>
      </div>

      {/* Item Info */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-[#1b4965] via-[#2d6a8f] to-[#5fa8d3] text-white overflow-hidden">
        <CardContent className="p-0">
          {/* Top section */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              {/* Left: identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-[#bee9e8]" />
                  </div>
                  <span className="text-[#bee9e8] text-sm font-medium tracking-wide">
                    {item.company_name || "No company"}
                  </span>
                </div>
                <h2 className="text-2xl font-bold leading-tight truncate">{item.name}</h2>
                {item.part_number && (
                  <p className="text-[#cae9ff] text-sm mt-1 opacity-80">Part #: {item.part_number}</p>
                )}
                {item.description && (
                  <p className="text-[#cae9ff] text-xs mt-1.5 opacity-70 line-clamp-2">{item.description}</p>
                )}
              </div>
              {/* Right: quantity */}
              <div className="flex flex-col items-center bg-white/10 rounded-2xl px-5 py-3 flex-shrink-0 text-center border border-white/20">
                <p className="text-5xl font-extrabold leading-none tracking-tight">{item.quantity}</p>
                <p className="text-[#cae9ff] text-xs font-semibold uppercase mt-1 tracking-widest">{item.unit}</p>
                <Badge variant={stockStatus} className="mt-2 text-xs px-3">
                  {stockLabel}
                </Badge>
              </div>
            </div>
          </div>
          {/* Bottom stats */}
          <div className="grid grid-cols-3 divide-x divide-white/15 border-t border-white/20 bg-black/10">
            <div className="px-5 py-4">
              <p className="text-[#bee9e8] text-xs uppercase tracking-wider mb-1 font-medium">Min Alert</p>
              <p className="text-white font-bold text-lg">{item.min_stock_level}</p>
              <p className="text-[#cae9ff] text-xs opacity-70">{item.unit}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[#bee9e8] text-xs uppercase tracking-wider mb-1 font-medium">Purchase Price</p>
              <p className="text-white font-bold text-lg">{formatCurrency(item.purchase_price)}</p>
              <p className="text-[#cae9ff] text-xs opacity-70">per {item.unit}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[#bee9e8] text-xs uppercase tracking-wider mb-1 font-medium">Selling Price</p>
              <p className="text-white font-bold text-lg">{formatCurrency(item.selling_price)}</p>
              <p className="text-[#cae9ff] text-xs opacity-70">per {item.unit}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="brand"
          className="flex-1"
          onClick={() => { setQty(""); setNotes(""); setAddDialog(true) }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Stock
        </Button>
        <Button
          variant="brandOutline"
          className="flex-1"
          onClick={() => { setQty(""); setNotes(""); setRemoveDialog(true) }}
          disabled={item.quantity === 0}
        >
          <Minus className="w-4 h-4 mr-2" /> Remove / Sell
        </Button>
        <Button asChild variant="outline">
          <Link to={`/items/${id}/edit`}>Edit Item</Link>
        </Button>
      </div>

      {/* Transaction History */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#1b4965] text-base">Transaction History</CardTitle>
          <CardDescription>All stock movements for this item</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {(!transactions || transactions.length === 0) ? (
            <div className="py-10 text-center text-gray-400">
              <p className="text-sm">No transactions recorded yet</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50 z-10">
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead>Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn: any) => (
                    <TableRow key={txn.id}>
                      <TableCell>
                        <Badge variant={txn.transaction_type === "ADD" ? "success" : "destructive"}>
                          {txn.transaction_type === "ADD" ? "Added" : "Removed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        <span className={txn.transaction_type === "ADD" ? "text-green-700" : "text-red-700"}>
                          {txn.transaction_type === "ADD" ? "+" : "-"}{txn.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm max-w-[200px] truncate">
                        {txn.notes || "—"}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">{txn.performed_by_name}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{formatDateTime(txn.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Stock Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1b4965]">Add Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Quantity to Add <span className="text-red-500">*</span></Label>
              <Input
                type="number" min={1} placeholder="Enter quantity"
                value={qty} onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="e.g. Purchase from supplier, PO#123..."
                rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button variant="brand" onClick={() => addMutation.mutate()} disabled={!qty || addMutation.isPending}>
              {addMutation.isPending ? "Adding..." : "Add Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Stock Dialog */}
      <Dialog open={removeDialog} onOpenChange={setRemoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1b4965]">Remove Stock / Mark as Sold</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-800 border border-amber-200">
              Current stock: <strong>{item.quantity} {item.unit}</strong>
            </div>
            <div className="space-y-1.5">
              <Label>Quantity to Remove <span className="text-red-500">*</span></Label>
              <Input
                type="number" min={1} max={item.quantity} placeholder="Enter quantity"
                value={qty} onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="e.g. Sold to customer, Damaged goods..."
                rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => removeMutation.mutate()} disabled={!qty || removeMutation.isPending}>
              {removeMutation.isPending ? "Removing..." : "Remove Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
