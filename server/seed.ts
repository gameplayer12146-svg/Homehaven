import bcrypt from 'bcryptjs';
import { db, IUser, IService, IProvider, IBooking, IReview } from './config/db.js';

export async function runSeed(force = true) {
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const customerPassword = await bcrypt.hash('customer123', salt);
  const providerPassword = await bcrypt.hash('provider123', salt);

  // 1. Users with Indian Names & Indian addresses
  const users: IUser[] = [
    {
      _id: 'user_admin_01',
      name: 'Aarav Mehta',
      email: 'admin@homehaven.in',
      password: adminPassword,
      phone: '+91 98201 11223',
      role: 'admin',
      avatar: '/src/assets/images/admin_aarav_1791559371540.jpg',
      addresses: [],
      isApproved: true,
      createdAt: '2026-01-15T08:00:00Z'
    },
    {
      _id: 'user_cust_01',
      name: 'Ananya Iyer',
      email: 'ananya@example.com',
      password: customerPassword,
      phone: '+91 98450 44321',
      role: 'customer',
      avatar: '/src/assets/images/customer_ananya_1791559347949.jpg',
      addresses: [
        {
          _id: 'addr_ananya_koramangala',
          label: 'Primary Residence',
          line: 'Flat 402, Shanthi Niketan Apartments, 7th Main, 4th Block, Koramangala',
          city: 'Bengaluru',
          pincode: '560034',
          lat: 12.9352,
          lng: 77.6245
        },
        {
          _id: 'addr_ananya_indiranagar',
          label: 'Family Home',
          line: 'Villa 12, 100 Feet Road, HAL 2nd Stage, Indiranagar',
          city: 'Bengaluru',
          pincode: '560038',
          lat: 12.9719,
          lng: 77.6412
        }
      ],
      isApproved: true,
      createdAt: '2026-02-01T10:30:00Z'
    },
    {
      _id: 'user_cust_02',
      name: 'Rohan Verma',
      email: 'rohan@example.com',
      password: customerPassword,
      phone: '+91 98190 77889',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
      addresses: [
        {
          _id: 'addr_rohan_bandra',
          label: 'Sea View Flat',
          line: 'Flat 11B, Silver Beach Residency, Perry Cross Road, Bandra West',
          city: 'Mumbai',
          pincode: '400050',
          lat: 19.0596,
          lng: 72.8295
        }
      ],
      isApproved: true,
      createdAt: '2026-02-14T11:00:00Z'
    },
    // Specialists (Indian service pros)
    {
      _id: 'user_prov_01',
      name: 'Ajay Sharma',
      email: 'ajay@homehaven.in',
      password: providerPassword,
      phone: '+91 98860 12345',
      role: 'provider',
      avatar: '/src/assets/images/specialist_amit_1791557023399.jpg',
      addresses: [{ label: 'Workshop Hub', line: 'Shop 14, 80 Feet Road, 6th Block, Koramangala', city: 'Bengaluru', pincode: '560095' }],
      isApproved: true,
      createdAt: '2026-01-20T09:00:00Z'
    },
    {
      _id: 'user_prov_02',
      name: 'Priya Sundaram',
      email: 'priya@homehaven.in',
      password: providerPassword,
      phone: '+91 97410 99887',
      role: 'provider',
      avatar: '/src/assets/images/specialist_priya_1791556991888.jpg',
      addresses: [{ label: 'Service Center', line: '24, CMH Road, Metro Pillar 42, Indiranagar', city: 'Bengaluru', pincode: '560038' }],
      isApproved: true,
      createdAt: '2026-01-22T09:00:00Z'
    },
    {
      _id: 'user_prov_03',
      name: 'Rajesh Kumar',
      email: 'rajesh@homehaven.in',
      password: providerPassword,
      phone: '+91 99001 55443',
      role: 'provider',
      avatar: '/src/assets/images/technician_rajesh_1791556981367.jpg',
      addresses: [{ label: 'Dispatch Desk', line: 'Plot 88, 27th Main, Sector 1, HSR Layout', city: 'Bengaluru', pincode: '560102' }],
      isApproved: true,
      createdAt: '2026-01-25T09:00:00Z'
    },
    {
      _id: 'user_prov_04',
      name: 'Vikramaditya Singh',
      email: 'vikram@homehaven.in',
      password: providerPassword,
      phone: '+91 98200 66778',
      role: 'provider',
      avatar: '/src/assets/images/specialist_vikram_1791559083877.jpg',
      addresses: [{ label: 'Studio Base', line: 'Unit 4, Industrial Area, Andheri East', city: 'Mumbai', pincode: '400069' }],
      isApproved: true,
      createdAt: '2026-01-28T09:00:00Z'
    },
    {
      _id: 'user_prov_05',
      name: 'Kavita Reddy',
      email: 'kavita@homehaven.in',
      password: providerPassword,
      phone: '+91 94400 33221',
      role: 'provider',
      avatar: '/src/assets/images/specialist_kavita_1791559094547.jpg',
      addresses: [{ label: 'Dispatch', line: 'Road No 36, Beside Metro Station, Jubilee Hills', city: 'Hyderabad', pincode: '500033' }],
      isApproved: true,
      createdAt: '2026-02-02T09:00:00Z'
    },
    {
      _id: 'user_prov_06',
      name: 'Suresh Nair',
      email: 'suresh@homehaven.in',
      password: providerPassword,
      phone: '+91 98451 88776',
      role: 'provider',
      avatar: '/src/assets/images/specialist_suresh_1791559326850.jpg',
      addresses: [{ label: 'Workshop', line: 'Sarjapur Main Road, Bellandur', city: 'Bengaluru', pincode: '560103' }],
      isApproved: false, // Pending verification
      createdAt: '2026-03-01T09:00:00Z'
    }
  ];

  // 2. Services with Indian Rupee rates
  const services: IService[] = [
    {
      _id: 'srv_plumbing',
      name: 'Plumbing Repair & Leak Fixing',
      category: 'plumbing',
      description: 'Leak detection, tap cartridge replacement, jet spray fix, washbasin blockage clearing, and pipe joint sealing.',
      basePrice: 349,
      duration: 60,
      icon: '🔧',
      inclusions: [
        'Complete pipeline pressure and leak check',
        'Washer, teflon tape & cartridge resealing',
        'Drain trap clog removal up to 10 feet',
        'Post-repair 15-minute leak inspection'
      ],
      exclusions: [
        'Concealed wall tile demolition',
        'Main overhead water tank pipeline replacement'
      ],
      isActive: true,
      keywords: ['leak', 'pipe', 'tap', 'drain', 'clog', 'sink', 'toilet', 'flush', 'water pressure', 'geyser connection']
    },
    {
      _id: 'srv_electrical',
      name: 'Electrical Diagnostics & Wiring',
      category: 'electrical',
      description: 'Troubleshooting tripping MCB breakers, ceiling fan repair, switchboard replacement, and geyser wiring check.',
      basePrice: 399,
      duration: 60,
      icon: '⚡',
      inclusions: [
        'Digital multimeter voltage & earthing test',
        'Up to 2 modular switch or socket replacements',
        'Short-circuit tracing in switchboard',
        'MCB trip resistance check'
      ],
      exclusions: [
        '3-phase whole-house main panel rewiring',
        'Concealed conduit wall channelling'
      ],
      isActive: true,
      keywords: ['spark', 'shock', 'mcb', 'tripping', 'fan', 'switch', 'light', 'flickering', 'socket', 'wire', 'power cut']
    },
    {
      _id: 'srv_cleaning',
      name: 'Deep House Cleaning & Sanitization',
      category: 'cleaning',
      description: 'Thorough scrub-down covering kitchen chimney grease, bathroom hard-water scale, tile grouting, and balcony cleaning.',
      basePrice: 1499,
      duration: 180,
      icon: '✨',
      inclusions: [
        'Kitchen stovetop, tiles & chimney surface degreasing',
        'Bathroom tiles, taps & sanitaryware descaling',
        'Fan blades, window tracks & switchboard wiping',
        'Floor single-disc scrubbing & wet vacuuming'
      ],
      exclusions: [
        'Exterior building glass abseiling',
        'Debris removal after civil masonry'
      ],
      isActive: true,
      keywords: ['clean', 'dirty', 'dust', 'deep clean', 'sanitize', 'stain', 'chimney', 'kitchen', 'bathroom', 'hard water']
    },
    {
      _id: 'srv_ac_repair',
      name: 'Split AC Service & Jet Pump Wash',
      category: 'ac_repair',
      description: 'High-pressure indoor & outdoor unit coil wash, cooling gas pressure check, drain tray cleaning, and cooling check.',
      basePrice: 699,
      duration: 75,
      icon: '❄️',
      inclusions: [
        'Indoor cooling coil jet foam wash with jacket bag',
        'Outdoor condenser fins wash & debris removal',
        'R-32 / R-410A gas pressure measurement',
        'Drain pipe back-flush & anti-fungal treatment'
      ],
      exclusions: [
        'Compressor replacement hardware',
        'Copper piping rewiring over 3 meters'
      ],
      isActive: true,
      keywords: ['ac', 'cooling', 'not cold', 'water leakage', 'gas leak', 'freon', 'split ac', 'compressor', 'filter']
    },
    {
      _id: 'srv_painting',
      name: 'Interior Accent & Wall Painting',
      category: 'painting',
      description: 'Putty touch-up, sanding, primer coating, and dual coats of luxury emulsion with laser-sharp masking.',
      basePrice: 2999,
      duration: 240,
      icon: '🎨',
      inclusions: [
        'Nail hole putty filling & smooth machine sanding',
        'Floor sheeting & switchboard masking tape cover',
        'Two uniform coats of premium low-VOC washable paint',
        'Zero-drip post-work cleanup'
      ],
      exclusions: [
        'External weather-proof texture paint',
        'Heavy dampness seepage waterproofing'
      ],
      isActive: true,
      keywords: ['paint', 'color', 'wall', 'putty', 'primer', 'stain', 'peeling', 'accent wall', 'emulsion']
    },
    {
      _id: 'srv_pest_control',
      name: 'Eco Gel Pest Control & Shielding',
      category: 'pest_control',
      description: 'Odorless botanical micro-gel treatment for cockroaches, ant barriers, and kitchen cabinet crack shielding.',
      basePrice: 849,
      duration: 60,
      icon: '🛡️',
      inclusions: [
        'Odorless German Bayer gel dots in cabinets & hinges',
        'Drain pipe & sink perimeter spray treatment',
        'Child & pet safe formulation (no vacating home)',
        'Free 45-day warranty touch-up guarantee'
      ],
      exclusions: [
        'Heavy termite wood drilling treatment',
        'Bird netting balcony installation'
      ],
      isActive: true,
      keywords: ['cockroach', 'pest', 'ant', 'termite', 'bugs', 'gel', 'pantry', 'insects', 'lizard', 'mosquitoes']
    },
    {
      _id: 'srv_appliance_repair',
      name: 'Washing Machine & Fridge Repair',
      category: 'appliance_repair',
      description: 'Diagnostics for washing machine spin errors, refrigerator cooling issues, microwave, and dishwasher check.',
      basePrice: 499,
      duration: 60,
      icon: '🔌',
      inclusions: [
        'Diagnostic error code read & circuit check',
        'Drain pump, drive belt & thermostat test',
        'Door gasket & thermal fuse check',
        'Standard estimate quotation before part purchase'
      ],
      exclusions: [
        'Compressor sealed system welding',
        'Commercial appliance electronics'
      ],
      isActive: true,
      keywords: ['washer', 'dryer', 'fridge', 'refrigerator', 'microwave', 'not spinning', 'not cooling', 'noise']
    },
    {
      _id: 'srv_carpentry',
      name: 'Door Alignment & Modular Carpentry',
      category: 'carpentry',
      description: 'Main door latch fix, wardrobe hinge alignment, drawer channel replacement, and curtain rod installation.',
      basePrice: 449,
      duration: 75,
      icon: '🪚',
      inclusions: [
        'Door bottom trimming & strike plate alignment',
        'Soft-close wardrobe hydraulic hinge tightening',
        'Stud wall drilling for shelves / TV mounting',
        'Wood surface polish & touch-up'
      ],
      exclusions: [
        'Whole-flat custom modular kitchen woodwork',
        'Structural wooden staircase framing'
      ],
      isActive: true,
      keywords: ['door', 'jammed', 'cupboard', 'hinge', 'wardrobe', 'shelf', 'wood', 'drawer', 'lock', 'carpenter']
    }
  ];

  // 3. Providers
  const providers: IProvider[] = [
    {
      _id: 'prov_01',
      userId: 'user_prov_01', // Ajay Sharma
      services: ['srv_plumbing', 'srv_ac_repair'],
      experience: 10,
      rating: 4.9,
      reviewCount: 68,
      jobsDone: 240,
      trustScore: 98,
      availability: {
        days: [1, 2, 3, 4, 5, 6],
        slots: ['09:00', '11:00', '14:00', '16:30', '18:30']
      },
      city: 'Bengaluru',
      bio: 'ITI certified master plumber and HVAC technician with 10 years experience serving Koramangala, Indiranagar, and HSR Layout.'
    },
    {
      _id: 'prov_02',
      userId: 'user_prov_02', // Priya Sundaram
      services: ['srv_cleaning'],
      experience: 7,
      rating: 4.95,
      reviewCount: 84,
      jobsDone: 310,
      trustScore: 99,
      availability: {
        days: [1, 2, 3, 4, 5],
        slots: ['08:30', '11:30', '15:00']
      },
      city: 'Bengaluru',
      bio: 'Hospital-grade sanitization expert. Uses eco-friendly Diversey chemicals safe for toddlers and pets.'
    },
    {
      _id: 'prov_03',
      userId: 'user_prov_03', // Rajesh Kumar
      services: ['srv_electrical', 'srv_appliance_repair'],
      experience: 9,
      rating: 4.88,
      reviewCount: 52,
      jobsDone: 195,
      trustScore: 96,
      availability: {
        days: [0, 1, 2, 3, 4, 5],
        slots: ['09:30', '12:00', '14:30', '17:00']
      },
      city: 'Bengaluru',
      bio: 'Licensed wireman with 9 years handling heavy appliances, inverter setups, and smart switchboards.'
    },
    {
      _id: 'prov_04',
      userId: 'user_prov_04', // Vikramaditya Singh
      services: ['srv_painting', 'srv_carpentry'],
      experience: 8,
      rating: 4.92,
      reviewCount: 45,
      jobsDone: 140,
      trustScore: 97,
      availability: {
        days: [1, 2, 3, 4, 5, 6],
        slots: ['09:00', '13:00', '16:00']
      },
      city: 'Mumbai',
      bio: 'Asian Paints certified master applicator and finish carpenter serving Bandra, Juhu, and Powai.'
    },
    {
      _id: 'prov_05',
      userId: 'user_prov_05', // Kavita Reddy
      services: ['srv_pest_control'],
      experience: 8,
      rating: 4.89,
      reviewCount: 56,
      jobsDone: 210,
      trustScore: 97,
      availability: {
        days: [1, 2, 3, 4, 5, 6],
        slots: ['09:00', '11:30', '14:00', '16:30']
      },
      city: 'Hyderabad',
      bio: 'Urban pest management specialist. Focuses on odorless German formulations with 45-day warranty guarantee.'
    },
    {
      _id: 'prov_06',
      userId: 'user_prov_06', // Suresh Nair
      services: ['srv_carpentry', 'srv_appliance_repair', 'srv_plumbing'],
      experience: 6,
      rating: 4.78,
      reviewCount: 22,
      jobsDone: 75,
      trustScore: 92,
      availability: {
        days: [2, 3, 4, 5, 6],
        slots: ['10:00', '14:00', '16:30']
      },
      city: 'Bengaluru',
      bio: 'Cabinetry and appliance troubleshooter based near Bellandur.'
    }
  ];

  // 4. Sample Bookings in Indian currency (visit fee ₹149 + estimate + 18% GST)
  const bookings: IBooking[] = [
    {
      _id: 'book_01',
      customerId: 'user_cust_01', // Ananya Iyer
      providerId: 'prov_01', // Ajay Sharma
      serviceId: 'srv_plumbing',
      date: '2026-10-10',
      timeSlot: '09:00',
      address: {
        label: 'Primary Residence',
        line: 'Flat 402, Shanthi Niketan Apartments, 7th Main, 4th Block, Koramangala',
        city: 'Bengaluru',
        pincode: '560034'
      },
      problemNote: 'Kitchen sink pipe dripping into cabinet whenever tap is opened at high pressure.',
      status: 'accepted',
      priceBreakdown: {
        visitFee: 149,
        estimate: 349,
        tax: 90, // 18% GST
        total: 588
      },
      timeline: [
        { status: 'requested', at: '2026-10-09T05:30:00Z', note: 'Booking requested by Ananya' },
        { status: 'accepted', at: '2026-10-09T06:15:00Z', note: 'Ajay Sharma confirmed appointment' }
      ],
      createdAt: '2026-10-09T05:30:00Z'
    },
    {
      _id: 'book_02',
      customerId: 'user_cust_01', // Ananya Iyer
      providerId: 'prov_02', // Priya Sundaram
      serviceId: 'srv_cleaning',
      date: '2026-10-09',
      timeSlot: '11:30',
      address: {
        label: 'Primary Residence',
        line: 'Flat 402, Shanthi Niketan Apartments, 7th Main, 4th Block, Koramangala',
        city: 'Bengaluru',
        pincode: '560034'
      },
      problemNote: 'Festival pre-cleaning for whole 3BHK, especially kitchen tiles and bathroom hard-water stains.',
      status: 'on_the_way',
      priceBreakdown: {
        visitFee: 149,
        estimate: 1499,
        tax: 297,
        total: 1945
      },
      timeline: [
        { status: 'requested', at: '2026-10-08T14:00:00Z' },
        { status: 'accepted', at: '2026-10-08T15:20:00Z' },
        { status: 'on_the_way', at: '2026-10-09T06:45:00Z', note: 'Priya dispatched with machine & solutions, reaching in 20 mins' }
      ],
      createdAt: '2026-10-08T14:00:00Z'
    },
    {
      _id: 'book_03',
      customerId: 'user_cust_01', // Ananya Iyer
      providerId: 'prov_03', // Rajesh Kumar
      serviceId: 'srv_electrical',
      date: '2026-10-09',
      timeSlot: '09:30',
      address: {
        label: 'Family Home',
        line: 'Villa 12, 100 Feet Road, HAL 2nd Stage, Indiranagar',
        city: 'Bengaluru',
        pincode: '560038'
      },
      problemNote: 'Living room ceiling fan making humming noise and MCB tripping when AC is switched on.',
      status: 'in_progress',
      priceBreakdown: {
        visitFee: 149,
        estimate: 399,
        tax: 99,
        total: 647
      },
      timeline: [
        { status: 'requested', at: '2026-10-08T09:00:00Z' },
        { status: 'accepted', at: '2026-10-08T10:10:00Z' },
        { status: 'on_the_way', at: '2026-10-09T06:10:00Z' },
        { status: 'in_progress', at: '2026-10-09T06:40:00Z', note: 'Rajesh testing capacitor & circuit load' }
      ],
      createdAt: '2026-10-08T09:00:00Z'
    },
    {
      _id: 'book_04',
      customerId: 'user_cust_01', // Ananya Iyer
      providerId: 'prov_01', // Ajay Sharma
      serviceId: 'srv_ac_repair',
      date: '2026-09-28',
      timeSlot: '14:00',
      address: {
        label: 'Primary Residence',
        line: 'Flat 402, Shanthi Niketan Apartments, 7th Main, 4th Block, Koramangala',
        city: 'Bengaluru',
        pincode: '560034'
      },
      problemNote: 'Daikin split AC blowing room temperature air instead of cooling.',
      status: 'completed',
      priceBreakdown: {
        visitFee: 149,
        estimate: 699,
        tax: 153,
        total: 1001
      },
      timeline: [
        { status: 'requested', at: '2026-09-27T10:00:00Z' },
        { status: 'accepted', at: '2026-09-27T11:00:00Z' },
        { status: 'on_the_way', at: '2026-09-28T13:00:00Z' },
        { status: 'in_progress', at: '2026-09-28T13:35:00Z' },
        { status: 'completed', at: '2026-09-28T15:10:00Z', note: 'Outdoor condenser washed, capacitor replaced, cooling verified at 18°C' }
      ],
      createdAt: '2026-09-27T10:00:00Z'
    },
    {
      _id: 'book_05',
      customerId: 'user_cust_02', // Rohan Verma
      providerId: 'prov_04', // Vikramaditya Singh
      serviceId: 'srv_painting',
      date: '2026-10-12',
      timeSlot: '09:00',
      address: {
        label: 'Sea View Flat',
        line: 'Flat 11B, Silver Beach Residency, Perry Cross Road, Bandra West',
        city: 'Mumbai',
        pincode: '400050'
      },
      problemNote: 'Accent wall painting with Royal Luxury Emulsion in master bedroom.',
      status: 'requested',
      priceBreakdown: {
        visitFee: 149,
        estimate: 2999,
        tax: 567,
        total: 3715
      },
      timeline: [
        { status: 'requested', at: '2026-10-09T03:00:00Z', note: 'Awaiting specialist confirmation' }
      ],
      createdAt: '2026-10-09T03:00:00Z'
    },
    {
      _id: 'book_06',
      customerId: 'user_cust_02', // Rohan Verma
      providerId: 'prov_05', // Kavita Reddy
      serviceId: 'srv_pest_control',
      date: '2026-09-15',
      timeSlot: '14:00',
      address: {
        label: 'Sea View Flat',
        line: 'Flat 11B, Silver Beach Residency, Perry Cross Road, Bandra West',
        city: 'Mumbai',
        pincode: '400050'
      },
      problemNote: 'Small German cockroaches noticed under modular kitchen sink.',
      status: 'completed',
      priceBreakdown: {
        visitFee: 149,
        estimate: 849,
        tax: 180,
        total: 1178
      },
      timeline: [
        { status: 'requested', at: '2026-09-14T11:00:00Z' },
        { status: 'accepted', at: '2026-09-14T12:00:00Z' },
        { status: 'completed', at: '2026-09-15T15:30:00Z', note: 'Odorless Bayer gel applied in all cabinets, 45-day warranty issued' }
      ],
      createdAt: '2026-09-14T11:00:00Z'
    }
  ];

  // 5. Reviews
  const reviews: IReview[] = [
    {
      _id: 'rev_01',
      bookingId: 'book_04',
      customerId: 'user_cust_01',
      providerId: 'prov_01',
      rating: 5,
      tags: ['punctual', 'clean work', 'expert diagnosis', 'fair pricing'],
      comment: 'Ajay was right on time and diagnosed the capacitor issue quickly. The AC is chilling again. Very polite and honest pricing.',
      createdAt: '2026-09-28T16:00:00Z'
    },
    {
      _id: 'rev_02',
      bookingId: 'book_06',
      customerId: 'user_cust_02',
      providerId: 'prov_05',
      rating: 5,
      tags: ['pet-safe', 'thorough', 'clean work'],
      comment: 'Kavita applied the gel thoroughly in all corners. Completely odorless and safe for our dog. Cockroaches vanished within two days!',
      createdAt: '2026-09-15T17:00:00Z'
    }
  ];

  db.resetWithData({
    users,
    services,
    providers,
    bookings,
    reviews
  });

  console.log('HomeHaven India seed data loaded.');
}
