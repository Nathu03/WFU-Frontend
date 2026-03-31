'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download, FileText, Calendar, TrendingUp, DollarSign, Users,
  Wrench, Package, BarChart3, PieChart, Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';

const reportTypes = [
  { id: 'users', name: 'User Report', icon: Users, description: 'User registration and activity statistics' },
  { id: 'services', name: 'Service Report', icon: Wrench, description: 'Service requests and completion rates' },
  { id: 'payments', name: 'Payment Report', icon: DollarSign, description: 'Payment transactions and revenue' },
  { id: 'rentals', name: 'Rental Report', icon: Package, description: 'Rental orders and inventory usage' },
  { id: 'employees', name: 'Employee Report', icon: Users, description: 'Employee performance and attendance' },
  { id: 'finance', name: 'Finance Report', icon: TrendingUp, description: 'Financial overview and projections' },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('services');
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [exportFormat, setExportFormat] = useState('csv');

  const { data, isLoading } = useQuery({
    queryKey: ['report', selectedReport, dateFrom, dateTo],
    queryFn: () => api.get(`/admin/reports/${selectedReport}`, {
      params: { from: dateFrom, to: dateTo },
    }),
  });

  const reportData = data?.data?.data || {};

  const handleExport = async () => {
    try {
      const response = await api.get(`/admin/reports/${selectedReport}/export`, {
        params: { from: dateFrom, to: dateTo, format: exportFormat },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport}_report_${dateFrom}_${dateTo}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-slate-500">Generate and export detailed reports</p>
        </div>
        <div className="flex gap-2">
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span className="text-sm text-slate-500">Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-auto"
            />
            <span className="text-slate-500">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const lastWeek = new Date(today);
                lastWeek.setDate(lastWeek.getDate() - 7);
                setDateFrom(lastWeek.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
              }}
            >
              Last 7 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const lastMonth = new Date(today);
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                setDateFrom(lastMonth.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
              }}
            >
              Last 30 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const lastYear = new Date(today);
                lastYear.setFullYear(lastYear.getFullYear() - 1);
                setDateFrom(lastYear.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
              }}
            >
              Last Year
            </Button>
          </div>
        </div>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedReport === report.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-white hover:border-primary/50'
            }`}
          >
            <report.icon className={`w-6 h-6 mb-2 ${selectedReport === report.id ? '' : 'text-slate-500'}`} />
            <p className="font-medium text-sm">{report.name}</p>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl border p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : (
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reportData.summary?.map((item: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-50/50 rounded-xl">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                    {item.change !== undefined && (
                      <p className={`text-sm ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.change >= 0 ? '+' : ''}{item.change}% from previous period
                      </p>
                    )}
                  </div>
                )) || (
                  <div className="col-span-4 text-center py-8 text-slate-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No data available for this period</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              {reportData.details?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(reportData.details[0] || {}).map((key) => (
                          <th key={key} className="text-left py-3 px-4 font-medium text-slate-500">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.details.map((row: any, index: number) => (
                        <tr key={index} className="border-b last:border-0">
                          {Object.values(row).map((value: any, i: number) => (
                            <td key={i} className="py-3 px-4">{String(value)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No detailed data available for this period</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="charts" className="mt-6">
              <div className="text-center py-12 text-slate-500">
                <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Charts visualization</p>
                <p className="text-sm">Interactive charts would be displayed here using a charting library like Recharts</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
