'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Settings, Globe, CreditCard, Bell, Shield, Mail, Phone,
  Loader2, Save, RotateCcw, Image, Palette,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

const defaultBranding = {
  site_name: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  favicon_url: '',
  icon_url: '',
  og_image_url: '',
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();
  const canViewSettings = hasPermission('settings.view');
  const canUpdateSettings = hasPermission('settings.update');

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => api.get('/admin/settings'),
    enabled: canViewSettings,
  });

  const settings = settingsData?.data?.data || {};

  const [generalSettings, setGeneralSettings] = useState({
    app_name: '',
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    timezone: 'Asia/Colombo',
    date_format: 'Y-m-d',
    currency: 'LKR',
  });

  const [paymentSettings, setPaymentSettings] = useState({
    payment_gateway: 'stripe',
    stripe_public_key: '',
    stripe_secret_key: '',
    payhere_merchant_id: '',
    payhere_secret: '',
    tax_rate: '0',
    enable_online_payment: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    whatsapp_notifications: false,
    sms_gateway: '',
    ultramsg_instance: '',
    ultramsg_token: '',
  });

  const [securitySettings, setSecuritySettings] = useState({
    max_login_attempts: '5',
    lockout_duration: '30',
    password_min_length: '8',
    require_2fa: false,
    session_lifetime: '120',
  });

  const [brandingSettings, setBrandingSettings] = useState<typeof defaultBranding>(defaultBranding);

  useEffect(() => {
    if (settings.general) setGeneralSettings((prev) => ({ ...prev, ...settings.general }));
    if (settings.payment) setPaymentSettings((prev) => ({ ...prev, ...settings.payment }));
    if (settings.notification) setNotificationSettings((prev) => ({ ...prev, ...settings.notification }));
    if (settings.security) setSecuritySettings((prev) => ({ ...prev, ...settings.security }));
    if (settings.branding) setBrandingSettings((prev) => ({ ...defaultBranding, ...prev, ...settings.branding }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => api.put('/admin/settings', data),
    onSuccess: () => {
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    },
  });

  const handleSaveAll = () => {
    saveMutation.mutate({
      general: generalSettings,
      payment: paymentSettings,
      notification: notificationSettings,
      security: securitySettings,
      branding: brandingSettings,
    });
  };

  if (!canViewSettings) {
    return (
      <div className="p-6">
        <p className="text-slate-500">You do not have permission to view settings.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-500">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
            Reset
          </Button>
          {canUpdateSettings && (
          <Button onClick={handleSaveAll} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" aria-hidden="true" />
            )}
            Save All
          </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 max-w-3xl">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="w-4 h-4" aria-hidden="true" />
            General
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" aria-hidden="true" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="notification" className="flex items-center gap-2">
            <Bell className="w-4 h-4" aria-hidden="true" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" aria-hidden="true" />
            Security
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" aria-hidden="true" />
            Branding
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6">
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5" aria-hidden="true" />
              General Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="app_name">Application Name</Label>
                <Input
                  id="app_name"
                  value={generalSettings.app_name}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, app_name: e.target.value })}
                  placeholder="We4U"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={generalSettings.company_name}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, company_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_email">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="company_email"
                    type="email"
                    value={generalSettings.company_email}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, company_email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_phone">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="company_phone"
                    value={generalSettings.company_phone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, company_phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company_address">Company Address</Label>
                <Textarea
                  id="company_address"
                  value={generalSettings.company_address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, company_address: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={generalSettings.timezone}
                  onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Colombo">Asia/Colombo (UTC+5:30)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={generalSettings.currency}
                  onValueChange={(value) => setGeneralSettings({ ...generalSettings, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LKR">LKR - Sri Lankan Rupee</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="mt-6">
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5" aria-hidden="true" />
              Payment Configuration
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="payment_gateway">Primary Payment Gateway</Label>
                <Select
                  value={paymentSettings.payment_gateway}
                  onValueChange={(value) => setPaymentSettings({ ...paymentSettings, payment_gateway: value })}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="payhere">PayHere</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Stripe Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripe_public">Publishable Key</Label>
                    <Input
                      id="stripe_public"
                      value={paymentSettings.stripe_public_key}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_public_key: e.target.value })}
                      placeholder="pk_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe_secret">Secret Key</Label>
                    <Input
                      id="stripe_secret"
                      type="password"
                      value={paymentSettings.stripe_secret_key}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_secret_key: e.target.value })}
                      placeholder="sk_..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Default Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    value={paymentSettings.tax_rate}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, tax_rate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Online Payments</Label>
                  <div className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      id="enable_online_payment"
                      checked={paymentSettings.enable_online_payment}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enable_online_payment: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="enable_online_payment" className="text-sm">
                      Enable online card payments
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notification" className="mt-6">
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" aria-hidden="true" />
              Notification Configuration
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="email_notifications"
                  checked={notificationSettings.email_notifications}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, email_notifications: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="email_notifications">Enable email notifications</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sms_notifications"
                  checked={notificationSettings.sms_notifications}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, sms_notifications: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="sms_notifications">Enable SMS notifications</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="whatsapp_notifications"
                  checked={notificationSettings.whatsapp_notifications}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, whatsapp_notifications: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="whatsapp_notifications">Enable WhatsApp notifications</label>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-6">
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" aria-hidden="true" />
              Security Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                <Input
                  id="max_login_attempts"
                  type="number"
                  value={securitySettings.max_login_attempts}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, max_login_attempts: e.target.value })}
                  disabled={!canUpdateSettings}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lockout_duration">Lockout Duration (minutes)</Label>
                <Input
                  id="lockout_duration"
                  type="number"
                  value={securitySettings.lockout_duration}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, lockout_duration: e.target.value })}
                  disabled={!canUpdateSettings}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_min_length">Minimum Password Length</Label>
                <Input
                  id="password_min_length"
                  type="number"
                  value={securitySettings.password_min_length}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, password_min_length: e.target.value })}
                  disabled={!canUpdateSettings}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session_lifetime">Session Lifetime (minutes)</Label>
                <Input
                  id="session_lifetime"
                  type="number"
                  value={securitySettings.session_lifetime}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, session_lifetime: e.target.value })}
                  disabled={!canUpdateSettings}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Branding / Site appearance – favicon, meta, icons */}
        <TabsContent value="branding" className="mt-6">
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Image className="w-5 h-5" aria-hidden="true" />
              Site branding &amp; meta
            </h3>
            <p className="text-sm text-slate-500">
              These values drive the site title, description, favicon, and social preview. Changes apply across the frontend after save.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="brand_site_name">Site name</Label>
                <Input
                  id="brand_site_name"
                  value={brandingSettings.site_name}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, site_name: e.target.value })}
                  placeholder="We4U"
                  disabled={!canUpdateSettings}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="brand_meta_title">Meta title (browser tab / SEO)</Label>
                <Input
                  id="brand_meta_title"
                  value={brandingSettings.meta_title}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, meta_title: e.target.value })}
                  placeholder="We4U - Service Operations Platform"
                  disabled={!canUpdateSettings}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="brand_meta_description">Meta description (SEO)</Label>
                <Textarea
                  id="brand_meta_description"
                  value={brandingSettings.meta_description}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, meta_description: e.target.value })}
                  placeholder="Enterprise service operations, employee management, and rental platform"
                  rows={2}
                  disabled={!canUpdateSettings}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="brand_meta_keywords">Meta keywords (optional, comma-separated)</Label>
                <Input
                  id="brand_meta_keywords"
                  value={brandingSettings.meta_keywords}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, meta_keywords: e.target.value })}
                  placeholder="services, repairs, rentals"
                  disabled={!canUpdateSettings}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand_favicon_url">Favicon URL</Label>
                <Input
                  id="brand_favicon_url"
                  value={brandingSettings.favicon_url}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, favicon_url: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                  disabled={!canUpdateSettings}
                />
                <p className="text-xs text-slate-500">e.g. /favicon.ico or full URL</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand_icon_url">Apple touch icon / icon URL</Label>
                <Input
                  id="brand_icon_url"
                  value={brandingSettings.icon_url}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, icon_url: e.target.value })}
                  placeholder="https://example.com/icon.png"
                  disabled={!canUpdateSettings}
                />
                <p className="text-xs text-slate-500">Larger icon for bookmarks / PWA</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="brand_og_image_url">Open Graph image URL (social preview)</Label>
                <Input
                  id="brand_og_image_url"
                  value={brandingSettings.og_image_url}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, og_image_url: e.target.value })}
                  placeholder="https://example.com/og-image.png"
                  disabled={!canUpdateSettings}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
