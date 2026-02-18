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
    icon: "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
    description: [
      "Graminate is the fastest-growing ERP platform for farmers, actively contributing to India’s agricultural growth story.",
      "Each employee has their own area of responsibility for their projects and works closely with their own team as well as across departments.",
      "Grow into your position with us and take advantage of the development opportunities!",
    ],
  },
  {
    title: "Challenge",
    icon: "M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
    description: [
      "India’s demographic landscape is evolving, driving an unprecedented demand for agricultural products. Graminate is committed to supporting this growth by leading the way in digital innovation.",
      "Our success is powered by a passionate and creative team that stays ahead of the curve, ensuring Graminate’s strong presence in India’s agricultural growth.",
      "Be part of this journey—embrace the challenge and grow with us!",
    ],
  },
  {
    title: "Passion",
    icon: "M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z",
    description: [
      "We live and breathe agriculture. Our passion is what drives us. Together, we want to innovate and create a strong farming community.",
      "In short: We aim to be the digital home for farmers.",
    ],
  },
];
