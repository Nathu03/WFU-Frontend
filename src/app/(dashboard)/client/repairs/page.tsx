'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  CheckCircle,
  Wrench,
  Eye,
  MapPin,
  Calendar,
  User,
  Phone,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface Repair {
  id: number;
  reference_code: string;
  item: {
    type: string;
    brand: string;
    model: string;
  };
  issue: {
    description: string;
  };
  status: {
    current: string;
    label: string;
    color: string;
  };
  assigned_employee: {
    user: {
      name: string;
    };
  } | null;
  scheduling: {
    scheduled_date: string;
    completed_at: string | null;
  };
  completion?: {
    photo: string;
    notes: string;
    work_performed: string;
  };
  payment?: {
    total: number;
    status: string;
  };
  created_at: string;
}

interface RepairDetails {
  repair: Repair;
  timeline: Array<{
    from_status: string;
    to_status: string;
    notes: string;
    changed_by: string;
    changed_at: string;
  }>;
}

export default function ClientRepairsPage() {
  const [status, setStatus] = useState('all');
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: repairs, isLoading } = useQuery({
    queryKey: ['my-repairs', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      const response = await apiClient.get(`/client/repairs?${params}`);
      return response.data;
    },
  });

  const { data: repairDetails, isLoading: detailsLoading } = useQuery<RepairDetails>({
    queryKey: ['repair-details', selectedRepair?.id],
    queryFn: async () => {
      if (!selectedRepair) return null;
      const response = await apiClient.get(`/client/repairs/${selectedRepair.id}/track`);
      return response.data.data;
    },
    enabled: !!selectedRepair && detailsOpen,
  });

  const getStatusBadge = (status: { current: string; label: string; color: string }) => {
    const colorMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      green: 'default',
      yellow: 'secondary',
      red: 'destructive',
      gray: 'outline',
      blue: 'secondary',
      cyan: 'default',
    };
    return <Badge variant={colorMap[status.color] || 'outline'}>{status.label}</Badge>;
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Wrench className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">My Repairs</h1>
        <p className="text-slate-500">Track your repair service requests</p>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Repairs List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : repairs?.data?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Wrench className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No repair requests yet</h3>
            <p className="text-slate-500 mb-4">
              You haven't submitted any repair service requests.
            </p>
            <Button>Request Repair Service</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {repairs?.data?.map((repair: Repair) => (
            <Card key={repair.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{repair.item?.type}</h3>
                      {getStatusBadge(repair.status)}
                    </div>
                    <p className="text-sm text-slate-500">
                      {repair.item?.brand} {repair.item?.model}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Reference:</span> {repair.reference_code}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(repair.scheduling?.scheduled_date).toLocaleDateString()}
                      </div>
                      {repair.assigned_employee && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {repair.assigned_employee.user?.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRepair(repair);
                      setDetailsOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Track
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Repair Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Repair Tracking</DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : repairDetails ? (
            <div className="space-y-6">
              {/* Repair Info */}
              <div className="bg-slate-100 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{repairDetails.repair.reference_code}</h3>
                  {getStatusBadge(repairDetails.repair.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Item</p>
                    <p className="font-medium">
                      {repairDetails.repair.item?.type} - {repairDetails.repair.item?.brand}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Scheduled Date</p>
                    <p className="font-medium">
                      {new Date(repairDetails.repair.scheduling?.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
                  {repairDetails.repair.assigned_employee && (
                    <div>
                      <p className="text-slate-500">Technician</p>
                      <p className="font-medium">{repairDetails.repair.assigned_employee.user?.name}</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-slate-500 text-sm">Issue Description</p>
                  <p>{repairDetails.repair.issue?.description}</p>
                </div>
              </div>

              {/* Completion Info */}
              {repairDetails.repair.status.current === 'completed' && repairDetails.repair.completion && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Repair Completed
                  </h4>
                  {repairDetails.repair.completion.photo && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Completion Photo</p>
                      <img
                        src={repairDetails.repair.completion.photo}
                        alt="Completion"
                        className="rounded-lg max-h-48 object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-500">Work Performed</p>
                    <p>{repairDetails.repair.completion.work_performed}</p>
                  </div>
                  {repairDetails.repair.completion.notes && (
                    <div>
                      <p className="text-sm text-slate-500">Notes</p>
                      <p>{repairDetails.repair.completion.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Info */}
              {repairDetails.repair.payment && (
                <div className="bg-slate-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Payment</h4>
                  <div className="flex justify-between items-center">
                    <span>Total Amount</span>
                    <span className="font-bold">LKR {repairDetails.repair.payment.total?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span>Status</span>
                    <Badge variant={repairDetails.repair.payment.status === 'paid' ? 'default' : 'outline'}>
                      {repairDetails.repair.payment.status}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="font-semibold mb-4">Status Timeline</h4>
                <div className="space-y-4">
                  {repairDetails.timeline?.map((log, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {getTimelineIcon(log.to_status)}
                        {index < repairDetails.timeline.length - 1 && (
                          <div className="w-px h-full bg-border mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium capitalize">{log.to_status.replace('_', ' ')}</p>
                        {log.notes && <p className="text-sm text-slate-500">{log.notes}</p>}
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(log.changed_at).toLocaleString()} • {log.changed_by}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
