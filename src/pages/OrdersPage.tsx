import { useEffect, useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChefHat,
  ShoppingBag
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Order, OrderStatus, PaymentMethod } from '@/types';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { fetchJson } from '@/lib/http';
import { toIsoDateString } from '@/lib/date';
import { mapOrder, type DbOrder } from '@/lib/mappers';
import { orderFormSchema, type OrderFormInput } from '@/lib/validations/order';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<OrderFormInput>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: '',
      phoneNumber: '',
      items: '',
      orderDate: toIsoDateString(new Date()),
      quantity: 1,
      totalAmount: 0,
      paymentMethod: 'Cash',
      status: 'Pending',
    }
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchJson<{ orders: DbOrder[] }>(
        `/api/orders?search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`
      );
      setOrders((res.orders ?? []).map(mapOrder));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const onSubmit = async (data: OrderFormInput) => {
    const payload = {
      customer_name: data.customerName,
      phone_number: data.phoneNumber,
      order_date: data.orderDate,
      order_items: data.items,
      quantity: data.quantity,
      total_amount: data.totalAmount,
      payment_method: data.paymentMethod,
      order_status: data.status,
    };

    try {
      if (editingOrder) {
        await fetchJson(`/api/orders/${editingOrder.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Order updated successfully');
      } else {
        await fetchJson(`/api/orders`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Order created successfully');
      }
      handleCloseDialog();
      await loadOrders();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save order');
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setValue('customerName', order.customerName);
    setValue('phoneNumber', order.phoneNumber);
    setValue('items', order.items);
    setValue('orderDate', toIsoDateString(new Date(order.date)));
    setValue('quantity', order.quantity);
    setValue('totalAmount', order.totalAmount);
    setValue('paymentMethod', order.paymentMethod);
    setValue('status', order.status);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => setDeleteId(id);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingOrder(null);
    reset();
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return <Clock className="w-3 h-3" />;
      case 'Preparing': return <ChefHat className="w-3 h-3" />;
      case 'Completed': return <CheckCircle2 className="w-3 h-3" />;
      case 'Cancelled': return <XCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete order?"
        description="This will permanently remove the order from your account."
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await fetchJson(`/api/orders/${deleteId}`, { method: 'DELETE' });
            toast.success('Order deleted');
            await loadOrders();
          } catch (e: any) {
            toast.error(e?.message || 'Failed to delete order');
          } finally {
            setDeleteId(null);
          }
        }}
      />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Order Management</h2>
          <p className="text-sm text-slate-500">Keep track of all your customer orders efficiently.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm shadow-slate-200 gap-2 h-10 font-bold uppercase tracking-wider text-xs" onClick={() => { setEditingOrder(null); reset(); }}>
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Create New Order</DialogTitle>
              <DialogDescription className="text-slate-500">
                Fill in the details below to add a customer order.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="customerName" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Name</Label>
                  <Input id="customerName" {...register('customerName')} className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-colors" />
                  {errors.customerName && <p className="text-[10px] text-destructive">{errors.customerName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</Label>
                  <Input id="phoneNumber" {...register('phoneNumber')} className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-colors" />
                  {errors.phoneNumber && <p className="text-[10px] text-destructive">{errors.phoneNumber.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="orderDate" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Date</Label>
                <Input id="orderDate" type="date" {...register('orderDate')} className="rounded-lg border-slate-200 bg-slate-50" />
                {errors.orderDate && <p className="text-[10px] text-destructive">{errors.orderDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="items" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Items</Label>
                <Input id="items" {...register('items')} placeholder="e.g. 2x Margherita Pizza" className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-colors" />
                {errors.items && <p className="text-[10px] text-destructive">{errors.items.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="quantity" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity</Label>
                  <Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} className="rounded-lg border-slate-200 bg-slate-50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="totalAmount" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount ($)</Label>
                  <Input id="totalAmount" type="number" {...register('totalAmount', { valueAsNumber: true })} className="rounded-lg border-slate-200 bg-slate-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment</Label>
                  <Select 
                    defaultValue="Cash" 
                    onValueChange={(val) => val && setValue('paymentMethod', val as PaymentMethod)}
                  >
                    <SelectTrigger className="rounded-lg border-slate-200 bg-slate-50">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</Label>
                  <Select 
                    defaultValue="Pending" 
                    onValueChange={(val) => val && setValue('status', val as OrderStatus)}
                  >
                    <SelectTrigger className="rounded-lg border-slate-200 bg-slate-50">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Preparing">Preparing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-6">
                <Button type="button" variant="ghost" onClick={handleCloseDialog} className="rounded-lg text-slate-500 font-bold uppercase tracking-wider text-[10px]">Cancel</Button>
                <Button type="submit" className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-8 font-bold uppercase tracking-wider text-[10px]">
                  {editingOrder ? 'Update' : 'Save Order'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search orders..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 border-none bg-transparent focus-visible:ring-0 rounded-lg text-sm text-slate-600"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto px-2">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? 'all')}>
            <SelectTrigger className="h-9 w-full sm:w-[130px] rounded-lg border-slate-200 text-[10px] font-bold uppercase tracking-wider bg-slate-50">
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Preparing">Preparing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent border-slate-50">
              <TableHead className="pl-6 w-[120px] text-[10px] uppercase font-bold text-slate-400 tracking-widest">ID</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Customer</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Date</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Items</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Amount</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Status</TableHead>
              <TableHead className="text-right pr-6 text-[10px] uppercase font-bold text-slate-400 tracking-widest">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ShoppingBag className="w-10 h-10 opacity-20 mb-2" />
                    <p className="text-sm font-bold uppercase tracking-widest">Loading…</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ShoppingBag className="w-10 h-10 opacity-20 mb-2" />
                    <p className="text-sm font-bold uppercase tracking-widest">No orders found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 group">
                  <TableCell className="pl-6 font-mono text-[10px] font-bold text-slate-400">
                    #{order.id.split('-')[1] || order.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">{order.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{order.phoneNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-500">
                    {format(new Date(order.date), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-slate-600">
                    {order.items}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900 text-sm">
                    ${order.totalAmount}
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter opacity-70 mt-0.5">{order.paymentMethod}</div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={`rounded-lg px-2 py-0.5 gap-1.5 text-[9px] font-bold uppercase tracking-tight flex items-center w-fit border-none shadow-none ${
                        order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                        order.status === 'Preparing' ? 'bg-amber-50 text-amber-600' :
                        order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600' :
                        'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-slate-200 w-40">
                        <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400">Manage</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(order)} className="gap-2 cursor-pointer rounded-lg text-sm font-semibold">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(order.id)} 
                          className="gap-2 text-rose-600 focus:text-rose-700 cursor-pointer rounded-lg text-sm font-semibold hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
