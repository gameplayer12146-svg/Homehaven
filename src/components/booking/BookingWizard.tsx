import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { showToast } from '../../hooks/useToast.js';
import { ProgressBar } from '../ui/ProgressBar.js';
import { DateStrip } from '../ui/DateStrip.js';
import { TimeSlotChips } from '../ui/TimeSlotChips.js';
import { PriceBreakdown } from '../ui/PriceBreakdown.js';
import { ProviderCard } from '../provider/ProviderCard.js';
import { SkeletonCard } from '../ui/SkeletonCard.js';
import { formatCurrency, formatDate, formatTimeSlot } from '../../utils/helpers.js';
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Clock, Calendar, AlertCircle } from 'lucide-react';

interface BookingWizardProps {
  initialServiceId?: string;
  initialProviderId?: string;
  onBookingComplete: (bookingId: string) => void;
  onCancel: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  initialServiceId,
  initialProviderId,
  onBookingComplete,
  onCancel
}) => {
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  // Selection states
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || '');
  const [selectedProviderId, setSelectedProviderId] = useState<string>(initialProviderId || '');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [addressLine, setAddressLine] = useState<string>('');
  const [addressCity, setAddressCity] = useState<string>('Bengaluru');
  const [addressPincode, setAddressPincode] = useState<string>('560034');
  const [addressLabel, setAddressLabel] = useState<string>('Home');
  const [problemNote, setProblemNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [srvRes, provRes, bookRes] = await Promise.all([
          api.get('/api/services'),
          api.get('/api/providers'),
          api.get('/api/bookings/mine').catch(() => ({ success: false, bookings: [] }))
        ]);

        if (srvRes.success) setServices(srvRes.services || []);
        if (provRes.success) setProviders(provRes.providers || []);
        if (bookRes.success) setExistingBookings(bookRes.bookings || []);
      } catch (err: any) {
        showToast(err.message || 'Failed to load booking data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Pre-fill user address if available
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const primary = user.addresses[0];
      setAddressLine(primary.line);
      setAddressCity(primary.city);
      setAddressPincode(primary.pincode);
      setAddressLabel(primary.label);
    }
  }, [user]);

  // Jump to step 2 if initialServiceId passed
  useEffect(() => {
    if (initialServiceId && !selectedServiceId) {
      setSelectedServiceId(initialServiceId);
      setStep(2);
    }
  }, [initialServiceId]);

  const selectedService = services.find(s => s._id === selectedServiceId);
  const selectedProvider = providers.find(p => p._id === selectedProviderId);

  // Filter providers that offer the chosen service
  const filteredProviders = providers.filter(p =>
    !selectedServiceId || p.services?.includes(selectedServiceId)
  );

  // Determine booked slots for selected provider on selected date
  const bookedSlots = existingBookings
    .filter(b => b.providerId === selectedProviderId && b.date === selectedDate && b.status !== 'cancelled')
    .map(b => b.timeSlot);

  // Steps definition
  const stepTitles = ['Select Service', 'Pick Specialist', 'Date & Address', 'Confirm & Book'];

  // Handle step transitions
  const handleNext = () => {
    if (step === 1) {
      if (!selectedServiceId) {
        showToast('Please select a service to continue', 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedProviderId) {
        showToast('Please choose a specialist to perform this service', 'error');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedDate) {
        showToast('Please choose an appointment date', 'error');
        return;
      }
      if (!selectedSlot) {
        showToast('Please choose an available time slot', 'error');
        return;
      }
      if (!addressLine.trim()) {
        showToast('Please enter your service address', 'error');
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  // Final Submit
  const handleConfirmBooking = async () => {
    if (!user) {
      showToast('Please sign in or create an account to finalize your booking', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/bookings', {
        serviceId: selectedServiceId,
        providerId: selectedProviderId,
        date: selectedDate,
        timeSlot: selectedSlot,
        address: {
          label: addressLabel,
          line: addressLine,
          city: addressCity,
          pincode: addressPincode
        },
        problemNote
      });

      if (res.success && res.booking) {
        showToast('Appointment reserved successfully!', 'success');
        onBookingComplete(res.booking._id);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to complete booking. Slot may have been taken.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const visitFee = 149;
  const estimate = selectedService?.basePrice || 399;
  const subtotal = visitFee + estimate;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Top Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif-display text-stone-900">
            Book a Home Specialist
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Certified craftspeople · Upfront pricing · Real-time schedule sync
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-lg border border-stone-200"
        >
          Cancel
        </button>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        currentStep={step}
        steps={stepTitles}
        onStepClick={targetStep => setStep(targetStep)}
      />

      {/* STEP 1: SELECT SERVICE */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-stone-900">
              1. Choose the service you need
            </h3>
            <span className="text-xs text-stone-400">8 certified categories available</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {services.map(srv => {
                const isSelected = selectedServiceId === srv._id;
                return (
                  <div
                    key={srv._id}
                    onClick={() => setSelectedServiceId(srv._id)}
                    className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#0F4C5C] bg-[#0F4C5C]/5 ring-2 ring-[#0F4C5C]/20 shadow-md'
                        : 'border-stone-200/80 bg-white hover:border-stone-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-2xl shadow-xs">
                          {srv.icon}
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-stone-400 block">From</span>
                          <span className="text-lg font-bold font-serif-display text-[#0F4C5C] font-mono tabular-nums">
                            {formatCurrency(srv.basePrice)}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-semibold text-stone-900 text-base mt-3">
                        {srv.name}
                      </h4>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                        {srv.description}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-500">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Approx. {srv.duration} mins</span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-400 text-[11px]">
                        {srv.inclusions?.length || 4} guaranteed check items
                      </span>
                      <span className={`font-semibold ${isSelected ? 'text-[#0F4C5C]' : 'text-stone-400'}`}>
                        {isSelected ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedServiceId}
              className="px-6 py-3 bg-[#0F4C5C] text-white rounded-xl text-xs font-semibold hover:bg-[#0A3642] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <span>Next: Pick Specialist</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CHOOSE PROVIDER */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                2. Choose your specialist
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Showing vetted professionals certified for <strong>{selectedService?.name}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-[#0F4C5C] hover:underline"
            >
              Change service
            </button>
          </div>

          {filteredProviders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200">
              <p className="text-sm text-stone-600">No specialists currently listed for this specific category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProviders.map(prov => {
                const isSelected = selectedProviderId === prov._id;
                return (
                  <ProviderCard
                    key={prov._id}
                    provider={prov}
                    selected={isSelected}
                    onSelect={() => setSelectedProviderId(prov._id)}
                    showBookButton={false}
                  />
                );
              })}
            </div>
          )}

          <div className="pt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedProviderId}
              className="px-6 py-3 bg-[#0F4C5C] text-white rounded-xl text-xs font-semibold hover:bg-[#0A3642] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <span>Next: Schedule Visit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PICK DATE, TIME & ADDRESS */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                3. Choose appointment date & location
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Specialist: <strong>{selectedProvider?.user?.name}</strong> · Service: <strong>{selectedService?.name}</strong>
              </p>
            </div>
          </div>

          {/* 7-Day Date Strip */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0F4C5C]" />
              Select Date:
            </label>
            <DateStrip
              selectedDate={selectedDate}
              onSelectDate={d => {
                setSelectedDate(d);
                setSelectedSlot(''); // reset slot when date changes
              }}
            />
          </div>

          {/* Time Slot Chips with booked greyed out */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0F4C5C]" />
                Select Time Slot:
              </label>
              <span className="text-[11px] text-stone-400">
                {bookedSlots.length > 0 ? `${bookedSlots.length} slot(s) already reserved` : 'All slots available'}
              </span>
            </div>
            <TimeSlotChips
              slots={selectedProvider?.availability?.slots || ['09:00', '11:00', '14:00', '16:00']}
              bookedSlots={bookedSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={s => setSelectedSlot(s)}
            />
          </div>

          {/* Service Address Inputs */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-4">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#0F4C5C]" />
              Service Address Details
            </h4>

            {user?.addresses && user.addresses.length > 1 && (
              <div className="flex gap-2">
                {user.addresses.map(addr => (
                  <button
                    key={addr._id}
                    type="button"
                    onClick={() => {
                      setAddressLine(addr.line);
                      setAddressCity(addr.city);
                      setAddressPincode(addr.pincode);
                      setAddressLabel(addr.label);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      addressLine === addr.line
                        ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {addr.label}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-medium text-stone-600">Flat / House No, Building, Street / Area</label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={e => setAddressLine(e.target.value)}
                  placeholder="e.g. Flat 402, Shanthi Niketan, 7th Main, 4th Block, Koramangala"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-stone-600">Metro City</label>
                <select
                  value={addressCity}
                  onChange={e => setAddressCity(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-stone-600">PIN Code (6 digits)</label>
              <input
                type="text"
                value={addressPincode}
                onChange={e => setAddressPincode(e.target.value)}
                placeholder="560034"
                maxLength={6}
                className="w-full sm:w-48 text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
              />
            </div>

            {/* Problem Description Note */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-medium text-stone-600">
                Problem Description or Notes for Specialist (Optional)
              </label>
              <textarea
                value={problemNote}
                onChange={e => setProblemNote(e.target.value)}
                placeholder="Describe any symptoms, model details, or access instructions (e.g., 'Gate code 4012, water shutoff under sink')..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedDate || !selectedSlot || !addressLine.trim()}
              className="px-6 py-3 bg-[#0F4C5C] text-white rounded-xl text-xs font-semibold hover:bg-[#0A3642] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <span>Next: Review Breakdown</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRM & TRANSPARENT PRICE BREAKDOWN */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              4. Review and confirm booking
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Please review appointment parameters and transparent fee breakdown before confirming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Summary Box */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-4">
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wide">
                Appointment Summary
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 pb-3 border-b border-stone-100">
                  <div className="w-10 h-10 rounded-xl bg-[#0F4C5C]/10 text-xl flex items-center justify-center shrink-0">
                    {selectedService?.icon}
                  </div>
                  <div>
                    <span className="text-stone-400 text-[11px] block">Service</span>
                    <h5 className="font-semibold text-stone-900 text-sm">{selectedService?.name}</h5>
                    <span className="text-stone-500 text-[11px]">Duration: ~{selectedService?.duration} mins</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-3 border-b border-stone-100">
                  <img
                    src={selectedProvider?.user?.avatar}
                    alt={selectedProvider?.user?.name}
                    className="w-10 h-10 rounded-xl object-cover border border-stone-200 bg-stone-100 shrink-0"
                  />
                  <div>
                    <span className="text-stone-400 text-[11px] block">Specialist</span>
                    <h5 className="font-semibold text-stone-900 text-sm">{selectedProvider?.user?.name}</h5>
                    <span className="text-stone-500 text-[11px]">
                      {selectedProvider?.experience} yrs exp · {selectedProvider?.rating} ★ ({selectedProvider?.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Date:</span>
                    <span className="font-semibold text-stone-800">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Time Slot:</span>
                    <span className="font-semibold text-stone-800 font-mono tabular-nums">{formatTimeSlot(selectedSlot)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Address:</span>
                    <span className="font-medium text-stone-800 text-right max-w-[200px] truncate">
                      {addressLine}, {addressCity}
                    </span>
                  </div>
                  {problemNote && (
                    <div className="pt-2 text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg">
                      Note: "{problemNote}"
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transparent Price Breakdown */}
            <PriceBreakdown
              visitFee={visitFee}
              estimate={estimate}
              tax={tax}
              total={total}
              serviceName={selectedService?.name}
            />
          </div>

          <div className="pt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={submitting}
              className="px-8 py-3.5 bg-[#E36414] hover:bg-[#C5530E] text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all shadow-md shadow-[#E36414]/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Confirming Appointment...' : `Confirm & Reserve (${formatCurrency(total)})`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
