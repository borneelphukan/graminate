// Contact Form
export type ContactInfo = {
  firstName: string;
  lastName: string;
  email: string;
  service: string;
  message: string;
};

export type ContactErrors = {
  firstName: string;
  lastName: string;
  email: string;
  service: string;
  message: string;
};

export type Jobs = {
  position: string;
  type: string;
  mode: string;
  description: string;
  tasks?: string[];
  requirements?: string[];
  benefits?: string[];
  jobpost: string;
};

export const reasonsForJoining = [
  "Flat hierarchies",
  "Short Decision-making Processes",
  "Young and Dynamic Team",
  "Plenty of Scope for Your Own Ideas",
  "Diverse Development Opportunities",
  "On-Site or Remote",
];

export const companyFeatures = [
  {
    title: "Growth",
    icon: "trending_up",
    description: [
      "Graminate is the fastest-growing ERP platform for farmers, actively contributing to India’s agricultural growth story.",
      "Each employee has their own area of responsibility for their projects and works closely with their own team as well as across departments.",
      "Grow into your position with us and take advantage of the development opportunities!",
    ],
  },
  {
    title: "Challenge",
    icon: "lightbulb",
    description: [
      "India’s demographic landscape is evolving, driving an unprecedented demand for agricultural products. Graminate is committed to supporting this growth by leading the way in digital innovation.",
      "Our success is powered by a passionate and creative team that stays ahead of the curve, ensuring Graminate’s strong presence in India’s agricultural growth.",
      "Be part of this journey—embrace the challenge and grow with us!",
    ],
  },
  {
    title: "Passion",
    icon: "volunteer_activism",
    description: [
      "We live and breathe agriculture. Our passion is what drives us. Together, we want to innovate and create a strong farming community.",
      "In short: We aim to be the digital home for farmers.",
    ],
  },
];
