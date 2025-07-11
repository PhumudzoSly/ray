// validationStrategies.ts

export interface ValidationStrategy {
  id: string;
  name: string;
  description?: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  description?: string;
}

export const validationStrategies: ValidationStrategy[] = [
  // --- LEAN STARTUP STRATEGY ---
  {
    id: "lean-startup",
    name: "Lean Startup",
    description:
      "Emphasizes rapid iteration and learning through experimentation. Build-Measure-Learn.",
    tasks: [
      {
        id: "problem-validation",
        name: "Validate the Problem",
        description:
          "Conduct user interviews to confirm that you are solving a real problem. Aim for 10-15 interviews. Talk to people about their lives, don't force the questions",
      },
      {
        id: "solution-validation",
        name: "Validate the Solution",
        description:
          "Build a minimum viable product (MVP) and test it with users. What features are necessary for users? What is just 'nice' to have?",
      },
      {
        id: "landing-page-mvp",
        name: "Create a Landing Page MVP",
        description:
          "Build a landing page using a no-code tool, to test and measure what the user activity will be. Aim to have a compelling description, logo and demo, and then ask for email",
      },
      {
        id: "market-validation",
        name: "Validate the Market",
        description:
          "Research market size. Is the market available, big enough? Is this worth it?",
      },
    ],
  },

  // --- THE MOM TEST STRATEGY ---
  {
    id: "mom-test",
    name: "The Mom Test",
    description:
      "Talk to customers about their lives and problems, not about your idea. Avoid leading questions.",
    tasks: [
      {
        id: "uncover-pain-points",
        name: "Uncover Pain Points",
        description:
          "Ask open-ended questions to uncover real pain points and needs. Don't ask for direct opinion to avoid fake positive feedback",
      },
      {
        id: "identify-customer-segments",
        name: "Identify customer segment",
        description:
          "Identify which segment of your customer is actually going to buy your product. Who is the customer that NEEDS this?",
      },

      {
        id: "validate-pricing",
        name: "Validate Pricing",
        description: "How much is your customer willing to pay?",
      },
    ],
  },

  // --- JOBS TO BE DONE STRATEGY ---
  {
    id: "jobs-to-be-done",
    name: "Jobs to Be Done",
    description:
      "Understand the 'job' that customers are hiring your product to do. Focus on underlying needs.",
    tasks: [
      {
        id: "identify-customer-job",
        name: "Identify Customer Job",
        description:
          "In what circumstances the customer 'hires' your product to solve a problem? Describe the context",
      },
      {
        id: "identify-competing-solutions",
        name: "Identify Competing Solutions",
        description:
          "Find which solutions the customer would use if your product was not there",
      },
      {
        id: "validate-value-proposition",
        name: "Validate Value Proposition",
        description:
          "The user's goal and value proposition of this product should be directly addressed. Focus on building the features they need. How do we build this, how can we make money?",
      },
    ],
  },

  // --- DESIGN THINKING STRATEGY ---
  {
    id: "design-thinking",
    name: "Design Thinking",
    description:
      "A human-centered approach to problem-solving: Empathize, Define, Ideate, Prototype, Test.",
    tasks: [
      {
        id: "empathize-with-users",
        name: "Empathize with Users",
        description:
          "Conduct user research to deeply understand their needs, pain points, and motivations.",
      },
      {
        id: "define-the-problem",
        name: "Define the Problem",
        description:
          "Clearly articulate the problem you are trying to solve based on user research.",
      },
      {
        id: "ideate-solutions",
        name: "Ideate Solutions",
        description:
          "Brainstorm a wide range of potential solutions to the defined problem.",
      },
      {
        id: "prototype-solutions",
        name: "Prototype Solutions",
        description:
          "Create low-fidelity prototypes of the most promising solutions.",
      },
      {
        id: "test-prototypes",
        name: "Test Prototypes",
        description:
          "Gather user feedback on the prototypes and iterate based on the results.",
      },
    ],
  },

  {
    id: "lean-ux",
    name: "Lean UX",
    description:
      "Focuses on rapid experimentation and iterative design based on user feedback.",
    tasks: [
      {
        id: "assumptions",
        name: "Identify Assumptions",
        description:
          "Create a assumptions on the product. What's the most important thing that we think is going to be delivered to customers?",
      },
      {
        id: "hypotheses",
        name: "Hypotheses what our product should do",
        description:
          "What do we need this product to be? Do we need to create A, B or C type of solution that will solve this?",
      },
      {
        id: "experimentation",
        name: "Experiment with users",
        description:
          "Test the user and see if our hypothesis is correct. You need to fail before you succeed",
      },
    ],
  },

  {
    id: "growth-hacking",
    name: "Growth Hacking",
    description:
      "Focuses on rapid experimentation and iterative design based on user feedback.",
    tasks: [
      {
        id: "experimentationGrowth",
        name: "Focus on Growth",
        description:
          "Understand the user's perspective, and then use that perspective to validate/invalidate",
      },
      {
        id: "findEffectiveExperiment",
        name: "Find effective strategies",
        description:
          "What strategies do I know to help test my ideas, validate my idea or market my product",
      },
      {
        id: "buildMarketing",
        name: "Find quick marketing",
        description:
          "After seeing the results. Should we continue marketing? If so, where do we go?",
      },
    ],
  },
];
