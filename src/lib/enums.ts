/**
 * All enums mirror the database migration enum values exactly.
 * These are the single source of truth for select options in the frontend.
 */

// users table: status
export const USER_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
] as const;

// employees table: status
export const EMPLOYEE_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'terminated', label: 'Terminated' },
] as const;

// attendance_logs table: status
export const ATTENDANCE_STATUSES = [
  { value: 'checked_in', label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
  { value: 'auto_closed', label: 'Auto Closed' },
  { value: 'absent', label: 'Absent' },
] as const;

// service_requests table: status
export const SERVICE_REQUEST_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'enroute', label: 'En Route' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'qc_check', label: 'QC Check' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'on_hold', label: 'On Hold' },
] as const;

// service_requests table: priority
export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const;

// services table: pricing_type
export const PRICING_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'rental', label: 'Rental' },
  { value: 'custom', label: 'Custom Quote' },
] as const;

// repair_services table: status
export const REPAIR_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'enroute', label: 'En Route' },
  { value: 'diagnosing', label: 'Diagnosing' },
  { value: 'awaiting_approval', label: 'Awaiting Approval' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'awaiting_parts', label: 'Awaiting Parts' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

// repair_services table: service_type
export const REPAIR_SERVICE_TYPES = [
  { value: 'on_site', label: 'On Site' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'drop_off', label: 'Drop Off' },
] as const;

// rental_orders table: status
export const RENTAL_ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'awaiting_pickup', label: 'Awaiting Pickup' },
  { value: 'active', label: 'Active' },
  { value: 'return_pending', label: 'Return Pending' },
  { value: 'returned', label: 'Returned' },
  { value: 'inspecting', label: 'Inspecting' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'disputed', label: 'Disputed' },
] as const;

// rental_orders table: rental_period
export const RENTAL_PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

// service_payments table: status
export const PAYMENT_STATUSES = [
  { value: 'initiated', label: 'Initiated' },
  { value: 'pending_finance_review', label: 'Pending Review' },
  { value: 'finance_verified', label: 'Finance Verified' },
  { value: 'finance_head_approved', label: 'Approved' },
  { value: 'success', label: 'Success' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

// service_payments table: payment_method
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Card' },
  { value: 'online_gateway', label: 'Online Gateway' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'mobile_wallet', label: 'Mobile Wallet' },
] as const;

// risk_events table: severity
export const RISK_SEVERITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const;

// risk_events table: category
export const RISK_CATEGORIES = [
  { value: 'cash_leakage', label: 'Cash Leakage' },
  { value: 'employee_tool_misuse', label: 'Tool Misuse' },
  { value: 'fake_service_completion', label: 'Fake Completion' },
  { value: 'rental_damage', label: 'Rental Damage' },
  { value: 'system_data_loss', label: 'Data Loss' },
  { value: 'unauthorized_access', label: 'Unauthorized Access' },
  { value: 'fraud_attempt', label: 'Fraud Attempt' },
  { value: 'policy_violation', label: 'Policy Violation' },
  { value: 'other', label: 'Other' },
] as const;

// agreements table: type
export const AGREEMENT_TYPES = [
  { value: 'employment', label: 'Employment' },
  { value: 'nda', label: 'NDA' },
  { value: 'probation', label: 'Probation' },
  { value: 'rental', label: 'Rental' },
  { value: 'service', label: 'Service' },
  { value: 'custom', label: 'Custom' },
] as const;

// agreements table: status
export const AGREEMENT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_signature', label: 'Pending Signature' },
  { value: 'signed', label: 'Signed' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

// rental_customers: verification_status
export const VERIFICATION_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
] as const;

// notification_logs: channel
export const NOTIFICATION_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'push', label: 'Push' },
  { value: 'database', label: 'In-App' },
] as const;

// Helper: get label from value
export function getEnumLabel(
  enums: ReadonlyArray<{ value: string; label: string }>,
  value: string
): string {
  return enums.find((e) => e.value === value)?.label ?? value;
}
