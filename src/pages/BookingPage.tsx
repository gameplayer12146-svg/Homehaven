import React from 'react';
import { BookingWizard } from '../components/booking/BookingWizard.js';

interface BookingPageProps {
  initialServiceId?: string;
  initialProviderId?: string;
  onNavigate: (tab: string, param?: any) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  initialServiceId,
  initialProviderId,
  onNavigate
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BookingWizard
        initialServiceId={initialServiceId}
        initialProviderId={initialProviderId}
        onBookingComplete={bookingId => {
          onNavigate('booking-detail', bookingId);
        }}
        onCancel={() => {
          onNavigate('services');
        }}
      />
    </div>
  );
};
