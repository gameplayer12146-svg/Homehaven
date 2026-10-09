export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTimeSlot(slot: string): string {
  if (!slot) return '';
  const [hours, minutes] = slot.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export const STATUS_LABELS: Record<string, { label: string; step: number; color: string; desc: string }> = {
  requested: {
    label: 'Booking Requested',
    step: 1,
    color: 'text-amber-800 bg-amber-50 border-amber-200',
    desc: 'Specialist has received your request and will confirm shortly.'
  },
  accepted: {
    label: 'Confirmed by Specialist',
    step: 2,
    color: 'text-teal-800 bg-teal-50 border-teal-200',
    desc: 'Appointment is locked in specialist schedule.'
  },
  on_the_way: {
    label: 'Technician Dispatched',
    step: 3,
    color: 'text-indigo-800 bg-indigo-50 border-indigo-200',
    desc: 'Specialist is en route with required toolkit & spare parts.'
  },
  in_progress: {
    label: 'Service in Progress',
    step: 4,
    color: 'text-amber-900 bg-orange-50 border-orange-200',
    desc: 'Diagnostics or active repair work currently underway.'
  },
  completed: {
    label: 'Completed & Verified',
    step: 5,
    color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    desc: 'Work verified, post-repair inspection checklist signed off.'
  },
  cancelled: {
    label: 'Cancelled',
    step: 0,
    color: 'text-rose-800 bg-rose-50 border-rose-200',
    desc: 'This booking has been cancelled.'
  }
};
