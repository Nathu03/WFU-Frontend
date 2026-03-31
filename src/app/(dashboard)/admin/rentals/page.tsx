'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Search, Package, ShoppingCart, Clock, AlertTriangle, Plus,
  CheckCircle2, Edit, Loader2, Trash2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface RentalItem {
  id: number;
  item_code: string;
  name: string;
  description: string;
  category_id: number | null;
  category: { id: number; name: string } | null;
  daily_rate: number;
  weekly_rate: number | null;
  monthly_rate: number | null;
  deposit_amount: number;
  currency: string;
  quantity_total: number;
  quantity_available: number;
  condition: string;
  status: string;
  is_active: boolean;
}

interface RentalOrder {
  id: number;
  reference_code: string;
  client: { name: string };
  rental_item: { name: string };
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  available:    'bg-emerald-100 text-emerald-700',
  out_of_stock: 'bg-red-100 text-red-700',
  maintenance:  'bg-amber-100 text-amber-700',
  retired:      'bg-slate-100 text-slate-600',
  pending:      'bg-amber-100 text-amber-700',
  confirmed:    'bg-blue-100 text-blue-700',
  active:       'bg-emerald-100 text-emerald-700',
  returning:    'bg-violet-100 text-violet-700',
  completed:    'bg-slate-100 text-slate-600',
  cancelled:    'bg-red-100 text-red-700',
  overdue:      'bg-red-200 text-red-800',
};

function FieldRow({ label, htmlFor, children, className = '' }: { label: string; htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

const INITIAL_FORM = {
  name: '', description: '', category_id: '', daily_rate: '',
  weekly_rate: '', monthly_rate: '', deposit_amount: '',
  quantity_total: '1', condition: 'good', status: 'available', is_active: true,
};

export default function RentalsPage() {
  const [itemSearch, setItemSearch]   = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');

  // dialogs
  const [itemDialog, setItemDialog]   = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelItem]    = useState<RentalItem | null>(null);
  const [deleteConfirm, setDelConfirm]= useState<RentalItem | null>(null);
  const [orderActions, setOrderAct]   = useState<{ order: RentalOrder; action: string } | null>(null);

  const queryClient = useQueryClient();

  /* ── Queries ── */
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['rental-items', itemSearch],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (itemSearch) p.append('search', itemSearch);
      return (await apiClient.get(`/rentals/items?${p}`)).data;
    },
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['rental-orders', orderSearch, orderStatus],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (orderSearch) p.append('search', orderSearch);
      if (orderStatus !== 'all') p.append('status', orderStatus);
      return (await apiClient.get(`/rentals/orders?${p}`)).data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['rental-categories'],
    queryFn: async () => (await apiClient.get('/rentals/items/categories')).data,
  });

  /* ── Mutations ── */
  const createItem = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiClient.post('/rentals/items', payload),
    onSuccess: () => {
      toast.success('Rental item created');
      queryClient.invalidateQueries({ queryKey: ['rental-items'] });
      setItemDialog(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create item'),
  });

  const updateItem = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      apiClient.put(`/rentals/items/${id}`, data),
    onSuccess: () => {
      toast.success('Item updated');
      queryClient.invalidateQueries({ queryKey: ['rental-items'] });
      setItemDialog(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/rentals/items/${id}`),
    onSuccess: () => {
      toast.success('Item deleted');
      queryClient.invalidateQueries({ queryKey: ['rental-items'] });
      setDelConfirm(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const orderAction = useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) =>
      apiClient.post(`/rentals/orders/${id}/${action}`),
    onSuccess: (_, { action }) => {
      toast.success(`Order ${action} successful`);
      queryClient.invalidateQueries({ queryKey: ['rental-orders'] });
      setOrderAct(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Action failed'),
  });

  const items: RentalItem[]  = itemsData?.data ?? [];
  const orders: RentalOrder[]= ordersData?.data ?? [];
  const categories: any[]    = categoriesData?.data ?? [];

  const activeItems    = items.filter((i) => i.is_active).length;
  const availableItems = items.filter((i) => i.status === 'available').length;
  const activeOrders   = orders.filter((o) => o.status === 'active').length;
  const overdueOrders  = orders.filter((o) => o.status === 'active' && new Date(o.end_date) < new Date()).length;

  const handleItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      name:               fd.get('name'),
      description:        fd.get('description') || undefined,
      category_id:        fd.get('category_id') && fd.get('category_id') !== 'none' ? fd.get('category_id') : undefined,
      daily_rate:         fd.get('daily_rate'),
      weekly_rate:        fd.get('weekly_rate') || undefined,
      monthly_rate:       fd.get('monthly_rate') || undefined,
      deposit_amount:     fd.get('deposit_amount'),
      quantity_total:     fd.get('quantity_total'),
      condition:          fd.get('condition'),
      status:             fd.get('status'),
      is_active:          fd.get('is_active') === 'true',
    };
    if (itemDialog === 'edit' && selectedItem) {
      updateItem.mutate({ id: selectedItem.id, data: payload });
    } else {
      createItem.mutate(payload);
    }
  };

  const openCreate = () => { setSelItem(null); setItemDialog('create'); };
  const openEdit   = (item: RentalItem) => { setSelItem(item); setItemDialog('edit'); };

  const isPending = createItem.isPending || updateItem.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Rental Management</h1>
          <p className="page-subtitle">Manage rental items, inventory and orders</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />Add Rental Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Items',    value: activeItems,       sub: `${availableItems} available`, icon: Package,      color: 'bg-indigo-100 text-indigo-600',  val: 'text-slate-900' },
          { label: 'Active Rentals', value: activeOrders,      sub: null,                           icon: ShoppingCart, color: 'bg-blue-100 text-blue-600',     val: 'text-blue-700' },
          { label: 'Pending Returns',value: orders.filter((o) => o.status === 'returning').length, sub: null, icon: Clock, color: 'bg-amber-100 text-amber-600', val: 'text-amber-700' },
          { label: 'Overdue',        value: overdueOrders,     sub: null,                           icon: AlertTriangle, color: 'bg-red-100 text-red-600',      val: 'text-red-700' },
        ].map(({ label, value, sub, icon: Icon, color, val }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className={`text-2xl font-bold ${val} mb-1`}>{value}</div>
            <p className="text-sm font-medium text-slate-600">{label}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Rental Items</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* ── ITEMS TAB ── */}
        <TabsContent value="items" className="space-y-4 mt-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search items…" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} className="pl-9" />
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Daily Rate</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsLoading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-12"><Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-500" /></TableCell></TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Package className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-slate-500 font-medium">No rental items found</p>
                        <p className="text-slate-400 text-xs mt-1">Click &quot;Add Rental Item&quot; to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell><span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{item.item_code}</span></TableCell>
                        <TableCell>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          {item.description && <p className="text-xs text-slate-500 truncate max-w-[180px]">{item.description}</p>}
                        </TableCell>
                        <TableCell className="text-slate-700">{item.category?.name || '—'}</TableCell>
                        <TableCell className="font-semibold text-slate-900">LKR {Number(item.daily_rate).toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`text-sm font-semibold ${item.quantity_available === 0 ? 'text-red-600' : 'text-slate-700'}`}>
                            {item.quantity_available}/{item.quantity_total}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize text-slate-700">{item.condition || '—'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[item.status] || 'bg-slate-100 text-slate-700'}`}>
                            {item.status?.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="text-indigo-600 hover:bg-indigo-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDelConfirm(item)} className="text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ORDERS TAB ── */}
        <TabsContent value="orders" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search orders…" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={orderStatus} onValueChange={setOrderStatus}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="returning">Returning</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12"><Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-500" /></TableCell></TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-slate-500 font-medium">No orders found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell><span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{order.reference_code}</span></TableCell>
                        <TableCell className="font-medium text-slate-900">{order.client?.name}</TableCell>
                        <TableCell className="text-slate-700">{order.rental_item?.name}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(order.start_date).toLocaleDateString()} – {new Date(order.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">LKR {order.total_amount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-700'}`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {order.status === 'pending' && (
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                onClick={() => setOrderAct({ order, action: 'confirm' })}>Confirm</Button>
                            )}
                            {order.status === 'confirmed' && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                onClick={() => setOrderAct({ order, action: 'dispatch' })}>Dispatch</Button>
                            )}
                            {order.status === 'active' && (
                              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                                onClick={() => setOrderAct({ order, action: 'complete' })}>Return</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── ADD / EDIT ITEM DIALOG ── */}
      <Dialog open={itemDialog !== null} onOpenChange={(open) => !open && setItemDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{itemDialog === 'edit' ? 'Edit Rental Item' : 'Add New Rental Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-5 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldRow label="Item Name *" htmlFor="item-name" className="sm:col-span-2">
                <Input id="item-name" name="name" placeholder="e.g. Heavy Duty Generator 5kVA" required defaultValue={selectedItem?.name} />
              </FieldRow>

              <FieldRow label="Category" htmlFor="item-cat">
                <Select name="category_id" defaultValue={selectedItem?.category_id?.toString() || 'none'}>
                  <SelectTrigger id="item-cat"><SelectValue placeholder="Select category…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    {categories.length === 0 && <SelectItem value="_empty" disabled>No categories — add via Settings</SelectItem>}
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Condition *" htmlFor="item-cond">
                <Select name="condition" defaultValue={selectedItem?.condition || 'good'} required>
                  <SelectTrigger id="item-cond"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Daily Rate (LKR) *" htmlFor="item-daily">
                <Input id="item-daily" name="daily_rate" type="number" step="0.01" min="0" placeholder="0.00" required defaultValue={selectedItem?.daily_rate} />
              </FieldRow>

              <FieldRow label="Weekly Rate (LKR)" htmlFor="item-weekly">
                <Input id="item-weekly" name="weekly_rate" type="number" step="0.01" min="0" placeholder="Auto-calc if empty" defaultValue={selectedItem?.weekly_rate ?? ''} />
              </FieldRow>

              <FieldRow label="Monthly Rate (LKR)" htmlFor="item-monthly">
                <Input id="item-monthly" name="monthly_rate" type="number" step="0.01" min="0" placeholder="Auto-calc if empty" defaultValue={selectedItem?.monthly_rate ?? ''} />
              </FieldRow>

              <FieldRow label="Deposit Amount (LKR) *" htmlFor="item-deposit">
                <Input id="item-deposit" name="deposit_amount" type="number" step="0.01" min="0" placeholder="0.00" required defaultValue={selectedItem?.deposit_amount} />
              </FieldRow>

              <FieldRow label="Total Quantity *" htmlFor="item-qty">
                <Input id="item-qty" name="quantity_total" type="number" min="1" placeholder="1" required defaultValue={selectedItem?.quantity_total ?? 1} />
              </FieldRow>

              <FieldRow label="Status" htmlFor="item-status">
                <Select name="status" defaultValue={selectedItem?.status || 'available'}>
                  <SelectTrigger id="item-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Active" htmlFor="item-active">
                <Select name="is_active" defaultValue={selectedItem?.is_active === false ? 'false' : 'true'}>
                  <SelectTrigger id="item-active"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active (listed)</SelectItem>
                    <SelectItem value="false">Inactive (hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
            </div>

            <FieldRow label="Description" htmlFor="item-desc">
              <Textarea id="item-desc" name="description" placeholder="Describe the item, specifications, usage notes…" rows={3} defaultValue={selectedItem?.description} />
            </FieldRow>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setItemDialog(null)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{itemDialog === 'edit' ? 'Saving…' : 'Creating…'}</> : (itemDialog === 'edit' ? 'Save Changes' : 'Create Item')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM ── */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDelConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Rental Item</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-slate-700">Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteConfirm?.name}</span>?</p>
            <p className="text-sm text-slate-500 mt-1">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelConfirm(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteItem.isPending}
              onClick={() => deleteConfirm && deleteItem.mutate(deleteConfirm.id)}>
              {deleteItem.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting…</> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ORDER ACTION CONFIRM ── */}
      <Dialog open={orderActions !== null} onOpenChange={(open) => !open && setOrderAct(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="capitalize">{orderActions?.action} Order</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-slate-700">Confirm <span className="font-semibold capitalize">{orderActions?.action}</span> for order <span className="font-semibold text-indigo-600">{orderActions?.order.reference_code}</span>?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderAct(null)}>Cancel</Button>
            <Button disabled={orderAction.isPending}
              onClick={() => orderActions && orderAction.mutate({ id: orderActions.order.id, action: orderActions.action })}>
              {orderAction.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</> : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
