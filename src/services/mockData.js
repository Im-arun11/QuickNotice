export const MOCK_NOTICES = [
  {
    id: "1",
    title: "Catering Helper Needed for Wedding Event",
    category: "Catering",
    description: "We need 3 helpers for a wedding catering event. Tasks include serving food, clearing tables, and assisting in the kitchen.",
    salary: 800,
    salaryType: "day",
    peopleNeeded: 3,
    peopleApplied: 1,
    location: "Coimbatore",
    address: "Royal Mahal, Trichy Road, Coimbatore, Tamil Nadu",
    date: "2026-07-24",
    workingTime: "6:00 PM - 11:00 PM",
    phoneNumber: "+91 98765 43210",
    requirements: [
      "Must be punctual",
      "Good communication skills in Tamil/English",
      "Prior experience in catering/hospitality is a plus"
    ],
    status: "open",
    employer: {
      id: "emp1",
      companyName: "Ramesh Catering Services",
      contactPerson: "Ramesh Kumar",
      rating: 4.8
    },
    createdAt: "2026-07-07T12:00:00.000Z"
  },
  {
    id: "2",
    title: "Helpers Needed for College Event Setup",
    category: "College Events",
    description: "Looking for energetic students to help set up the stage, banners, and seating arrangements for an upcoming cultural event.",
    salary: 500,
    salaryType: "day",
    peopleNeeded: 5,
    peopleApplied: 3,
    location: "Coimbatore",
    address: "PSG Tech Grounds, Peelamedu, Coimbatore, Tamil Nadu",
    date: "2026-07-22",
    workingTime: "9:00 AM - 5:00 PM",
    phoneNumber: "+91 98765 00123",
    requirements: [
      "Ability to lift moderate weight (chairs, tables)",
      "Must follow coordinator's instructions carefully",
      "College students preferred"
    ],
    status: "open",
    employer: {
      id: "emp2",
      companyName: "Symphony Event Managers",
      contactPerson: "Ananya Sen",
      rating: 4.5
    },
    createdAt: "2026-07-08T09:30:00.000Z"
  },
  {
    id: "3",
    title: "Delivery Boys Needed for Weekend Rush",
    category: "Delivery",
    description: "We need delivery associates for Friday-Sunday evening rush. Standard delivery tasks using your own two-wheeler.",
    salary: 700,
    salaryType: "day",
    peopleNeeded: 4,
    peopleApplied: 0,
    location: "Coimbatore",
    address: "Urban Foods Hub, RS Puram, Coimbatore, Tamil Nadu",
    date: "2026-07-23",
    workingTime: "5:00 PM - 11:00 PM",
    phoneNumber: "+91 94444 88888",
    requirements: [
      "Must own a two-wheeler with valid driving license",
      "Smart phone with active internet access",
      "Familiarity with RS Puram and surrounding routes"
    ],
    status: "open",
    employer: {
      id: "emp3",
      companyName: "Urban Foods Express",
      contactPerson: "Karthik Raja",
      rating: 4.6
    },
    createdAt: "2026-07-08T15:45:00.000Z"
  },
  {
    id: "4",
    title: "Home Cleaning Assistant Needed",
    category: "Cleaning",
    description: "Required an assistant to help deep clean a 3BHK villa. Dusting, vacuuming, floor washing, and window cleaning.",
    salary: 600,
    salaryType: "day",
    peopleNeeded: 1,
    peopleApplied: 1,
    location: "Coimbatore",
    address: "Serene Villas, Saravanampatti, Coimbatore, Tamil Nadu",
    date: "2026-07-21",
    workingTime: "8:00 AM - 2:00 PM",
    phoneNumber: "+91 90000 11111",
    requirements: [
      "Must be honest and hardworking",
      "Previous cleaning experience is helpful",
      "Bring comfortable working clothes"
    ],
    status: "open",
    employer: {
      id: "emp4",
      companyName: "Private Villa Owner",
      contactPerson: "Mrs. Revathi",
      rating: 4.9
    },
    createdAt: "2026-07-09T08:15:00.000Z"
  },
  {
    id: "5",
    title: "Assistant Cook / Kitchen Hand for Weekend Catering",
    category: "Cook",
    description: "Looking for an assistant cook to chop vegetables, prepare gravies, and maintain kitchen cleanliness under main chef direction.",
    salary: 900,
    salaryType: "day",
    peopleNeeded: 2,
    peopleApplied: 2,
    location: "Chennai",
    address: "Sri Sai catering Hall, T.Nagar, Chennai, Tamil Nadu",
    date: "2026-07-25",
    workingTime: "5:00 AM - 2:00 PM",
    phoneNumber: "+91 99999 77777",
    requirements: [
      "Basic food preparation and chopping skills",
      "Maintain strict personal hygiene standards",
      "Must be comfortable working in a fast-paced hot kitchen"
    ],
    status: "open",
    employer: {
      id: "emp1",
      companyName: "Sri Sai Catering Services",
      contactPerson: "Sundar Rajan",
      rating: 4.7
    },
    createdAt: "2026-07-06T06:00:00.000Z"
  },
  {
    id: "6",
    title: "Wall Painter Assistant for Residential House",
    category: "Painter",
    description: "Urgent need for 2 painter assistants to help sand walls and apply primer coats for a double-story house painting project.",
    salary: 750,
    salaryType: "day",
    peopleNeeded: 2,
    peopleApplied: 1,
    location: "Chennai",
    address: "Greenwood Enclave, Sholinganallur, Chennai, Tamil Nadu",
    date: "2026-07-28",
    workingTime: "9:00 AM - 6:00 PM",
    phoneNumber: "+91 98888 66666",
    requirements: [
      "Basic knowledge of wall preparation and brushes",
      "Not afraid of heights (will need to use scaffold/ladders)",
      "Physical stamina to sand walls"
    ],
    status: "open",
    employer: {
      id: "emp5",
      companyName: "Perfect Decors & Painters",
      contactPerson: "Selvan M.",
      rating: 4.4
    },
    createdAt: "2026-07-05T11:20:00.000Z"
  }
];

export const MOCK_CATEGORIES = [
  "Catering",
  "Delivery",
  "Construction",
  "Cleaning",
  "Painter",
  "Driver",
  "College Events",
  "Warehouse",
  "Electrician",
  "Cook"
];

export const MOCK_LOCATIONS = [
  "Coimbatore",
  "Chennai",
  "Bangalore",
  "Madurai",
  "Trichy"
];
