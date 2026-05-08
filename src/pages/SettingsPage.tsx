import { useEffect, useState } from 'react';
import { User, Building, Mail, Bell, Shield, Wallet, Save, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/http';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validations/profile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: '',
      email: '',
      business_name: '',
    },
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchJson<{ profile: any }>('/api/profile');
        if (!mounted) return;
        form.reset({
          full_name: res.profile?.full_name ?? '',
          email: res.profile?.email ?? '',
          business_name: res.profile?.business_name ?? '',
        });
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [form]);

  const handleSave = async (data: ProfileUpdateInput) => {
    try {
      await fetchJson('/api/profile', { method: 'PUT', body: JSON.stringify(data) });
      toast.success('Settings saved successfully!');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save settings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500">Manage your account and business preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white border border-slate-100 shadow-sm rounded-xl p-1 h-auto flex-wrap sm:flex-nowrap gap-1">
          <TabsTrigger value="profile" className="rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
            <User className="w-3.5 h-3.5 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
            <Bell className="w-3.5 h-3.5 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
            <Shield className="w-3.5 h-3.5 mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
            <Wallet className="w-3.5 h-3.5 mr-2" /> Billing
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-slate-800">Business Profile</CardTitle>
                <CardDescription className="text-slate-500">
                  This information will be displayed on your invoices and portal.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 space-y-6">
                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-blue-500 group-hover:text-blue-500 transition-all cursor-pointer">
                      <User className="w-10 h-10" />
                    </div>
                    <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 bg-white shadow-md border-slate-200">
                      <Pencil className="w-3.5 h-3.5 text-slate-600" />
                    </Button>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-slate-800">Store Branding</p>
                    <p className="text-xs text-slate-500">Upload a square image (minimum 400x400px). JPG or PNG preferred.</p>
                    <div className="flex gap-2 mt-3">
                       <Button variant="outline" size="sm" className="rounded-lg h-8 px-4 text-[10px] font-bold uppercase tracking-wider border-slate-200 text-slate-500">Remove</Button>
                       <Button size="sm" className="rounded-lg h-8 px-4 text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">Change</Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Company Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input
                      disabled={loading}
                      {...form.register('business_name')}
                      className="rounded-lg pl-10 h-11 border-slate-200 bg-slate-50 focus:bg-white"
                    />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input
                        disabled={loading}
                        {...form.register('full_name')}
                        className="rounded-lg pl-10 h-11 border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input
                        disabled={loading}
                        type="email"
                        {...form.register('email')}
                        className="rounded-lg pl-10 h-11 border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-8 pb-8 justify-end gap-3 pt-6">
                <Button variant="ghost" className="rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-400">Reset</Button>
                <Button onClick={form.handleSubmit(handleSave)} className="rounded-lg bg-slate-900 text-white gap-2 px-8 font-bold uppercase tracking-wider text-[10px] h-10">
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-rose-50/30 border border-rose-100 shadow-none rounded-2xl overflow-hidden">
               <CardHeader className="px-8 pt-8">
                <CardTitle className="text-rose-600 text-lg uppercase tracking-wider">Danger Zone</CardTitle>
                <CardDescription className="text-rose-500/70">
                  Permanently delete your account and all associated data.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <p className="text-xs text-rose-500 font-bold uppercase tracking-tight mb-4">Once deleted, your account cannot be recovered. Please be certain.</p>
                <Button variant="destructive" className="rounded-lg font-bold uppercase tracking-wider text-[10px] h-10 px-6">Delete Account</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
             <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden h-64 flex items-center justify-center">
                <p className="text-slate-400 italic text-sm">Notification settings coming soon...</p>
             </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
