import { useEffect, useMemo, useState } from 'react';
import { 
  Star, 
  Search, 
  Filter, 
  MessageCircle, 
  Trash2, 
  Pencil, 
  User, 
  Plus,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Feedback } from '@/types';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { fetchJson } from '@/lib/http';
import { toIsoDateString } from '@/lib/date';
import { mapFeedback, type DbFeedback } from '@/lib/mappers';
import { feedbackFormSchema, type FeedbackFormInput } from '@/lib/validations/feedback';

const StarRating = ({ 
  rating, 
  setRating, 
  editable = false 
}: { 
  rating: number; 
  setRating?: (r: number) => void; 
  editable?: boolean 
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileHover={editable ? { scale: 1.2 } : {}}
          whileTap={editable ? { scale: 0.9 } : {}}
          onClick={() => editable && setRating?.(star)}
          onMouseEnter={() => editable && setHover(star)}
          onMouseLeave={() => editable && setHover(0)}
          className={`relative focus:outline-none ${editable ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`w-5 h-5 transition-colors duration-200 ${
              star <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted'
            } ${star <= (hover || rating) && editable ? 'drop-shadow-md' : ''}`}
          />
          {star <= rating && !editable && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 bg-amber-400/20 blur-sm rounded-full -z-10"
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredFeedback = useMemo(() => {
    return feedback.filter(fb => {
      const matchesSearch = fb.customerName.toLowerCase().includes(search.toLowerCase()) || fb.message.toLowerCase().includes(search.toLowerCase());
      const matchesRating = ratingFilter === 'all' || fb.rating === parseInt(ratingFilter);
      return matchesSearch && matchesRating;
    });
  }, [feedback, search, ratingFilter]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FeedbackFormInput>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      customerName: '',
      phoneNumber: '',
      message: '',
      rating: 5,
      feedbackDate: toIsoDateString(new Date()),
    }
  });

  const rating = watch('rating');

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetchJson<{ feedback: DbFeedback[] }>(
        `/api/feedback?search=${encodeURIComponent(search)}&rating=${encodeURIComponent(ratingFilter)}`
      );
      setFeedback((res.feedback ?? []).map(mapFeedback));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, ratingFilter]);

  const onSubmit = async (data: FeedbackFormInput) => {
    const payload = {
      customer_name: data.customerName,
      phone_number: data.phoneNumber,
      feedback_message: data.message,
      rating: data.rating,
      feedback_date: data.feedbackDate,
    };

    try {
      if (editingFeedback) {
        await fetchJson(`/api/feedback/${editingFeedback.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Feedback updated');
      } else {
        await fetchJson(`/api/feedback`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Feedback added! Thank you.');
      }
      handleClose();
      await loadFeedback();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save feedback');
    }
  };

  const handleEdit = (fb: Feedback) => {
    setEditingFeedback(fb);
    setValue('customerName', fb.customerName);
    setValue('phoneNumber', fb.phoneNumber);
    setValue('message', fb.message);
    setValue('rating', fb.rating);
    setValue('feedbackDate', toIsoDateString(new Date(fb.date)));
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => setDeleteId(id);

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingFeedback(null);
    reset();
  };

  return (
    <div className="space-y-6 pb-20">
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete feedback?"
        description="This will permanently remove the feedback from your account."
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await fetchJson(`/api/feedback/${deleteId}`, { method: 'DELETE' });
            toast.success('Feedback removed');
            await loadFeedback();
          } catch (e: any) {
            toast.error(e?.message || 'Failed to delete feedback');
          } finally {
            setDeleteId(null);
          }
        }}
      />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Customer Feedback</h2>
          <p className="text-sm text-slate-500">What your customers are saying about your business.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm shadow-slate-200 gap-2 h-10 font-bold uppercase tracking-wider text-xs" onClick={() => { setEditingFeedback(null); reset(); }}>
              <Plus className="w-4 h-4 mr-2" /> Share Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-800">{editingFeedback ? 'Edit Feedback' : 'Give Feedback'}</DialogTitle>
              <DialogDescription className="text-slate-500">
                Share your thoughts and rating below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</Label>
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <StarRating rating={rating} setRating={(r) => setValue('rating', r)} editable />
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-tight">{rating} Stars</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fb-name" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</Label>
                  <Input id="fb-name" {...register('customerName')} className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white" />
                  {errors.customerName && <p className="text-[10px] text-destructive">{errors.customerName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fb-phone" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</Label>
                  <Input id="fb-phone" {...register('phoneNumber')} className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fb-date" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</Label>
                <Input id="fb-date" type="date" {...register('feedbackDate')} className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white" />
                {errors.feedbackDate && <p className="text-[10px] text-destructive">{errors.feedbackDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fb-msg" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Message</Label>
                <textarea 
                  id="fb-msg" 
                  {...register('message')}
                  className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-600"
                  placeholder="Tell us what you think..."
                />
                {errors.message && <p className="text-[10px] text-destructive">{errors.message.message}</p>}
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={handleClose} className="rounded-lg text-slate-500 font-bold uppercase tracking-wider text-[10px]">Cancel</Button>
                <Button type="submit" className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-10 font-bold uppercase tracking-wider text-[10px]">Submit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search reviews..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 border-none bg-transparent focus-visible:ring-0 rounded-lg text-sm text-slate-600"
          />
        </div>
        <Select value={ratingFilter} onValueChange={(val) => setRatingFilter(val ?? 'all')}>
          <SelectTrigger className="h-9 w-full sm:w-[130px] rounded-lg border-slate-200 text-[10px] font-bold uppercase tracking-wider bg-slate-50">
             <div className="flex items-center gap-2">
              <Star className="w-3 h-3" />
              <SelectValue placeholder="Rating" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200">
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 stars</SelectItem>
            <SelectItem value="4">4 stars</SelectItem>
            <SelectItem value="3">3 stars</SelectItem>
            <SelectItem value="2">2 stars</SelectItem>
            <SelectItem value="1">1 star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-2 lg:col-span-3 bg-white border border-slate-100 shadow-sm rounded-2xl p-10 text-center text-slate-400"
            >
              Loading…
            </motion.div>
          ) : (
          filteredFeedback.map((fb, idx) => (
            <motion.div
              key={fb.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden h-full flex flex-col group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-800">{fb.customerName}</CardTitle>
                        <CardDescription className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">{format(new Date(fb.date), 'MMM dd, yyyy')}</CardDescription>
                      </div>
                    </div>
                    <div className="flex text-amber-400 text-[10px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < fb.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 px-6">
                  <div className="relative">
                    <MessageCircle className="absolute -left-2 -top-2 w-10 h-10 text-slate-100 -z-0" />
                    <p className="text-xs text-slate-500 italic leading-relaxed relative z-10 py-2">
                      "{fb.message}"
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-6 px-6 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all" onClick={() => handleEdit(fb)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all" onClick={() => handleDelete(fb.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )))}
        </AnimatePresence>
      </div>

      {filteredFeedback.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <MessageCircle className="w-16 h-16 opacity-10 mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest opacity-30">No feedback yet</p>
        </div>
      )}
    </div>
  );
}
