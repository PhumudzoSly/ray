// Predefined library recommendations
export const LIBRARY_RECOMMENDATIONS: Record<
  string,
  Array<{
    name: string;
    installCommand: string;
    description: string;
    documentationUrl: string;
    configRequired?: boolean;
    configNotes?: string;
  }>
> = {
  ui: [
    {
      name: "shadcn/ui",
      installCommand: "npx shadcn-ui@latest init",
      description:
        "Beautifully designed components built with Radix UI and Tailwind CSS",
      documentationUrl: "https://ui.shadcn.com",
      configRequired: true,
      configNotes: "Requires Tailwind CSS configuration",
    },
    {
      name: "radix-ui",
      installCommand: "npm install @radix-ui/react-*",
      description: "Low-level UI primitives with accessibility built-in",
      documentationUrl: "https://radix-ui.com",
    },
    {
      name: "framer-motion",
      installCommand: "npm install framer-motion",
      description: "Production-ready motion library for React",
      documentationUrl: "https://framer.com/motion",
    },
    {
      name: "chakra-ui",
      installCommand:
        "npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion",
      description:
        "Simple, modular and accessible component library for React.",
      documentationUrl: "https://chakra-ui.com/docs/getting-started",
      configRequired: true,
      configNotes: "Requires Emotion and Framer Motion as peer dependencies.",
    },
    {
      name: "mantine",
      installCommand: "npm install @mantine/core @mantine/hooks",
      description: "A fully featured React components and hooks library.",
      documentationUrl: "https://mantine.dev/getting-started/",
    },
    {
      name: "ant-design",
      installCommand: "npm install antd",
      description:
        "A design system with a set of high-quality React components.",
      documentationUrl: "https://ant.design/docs/react/introduce",
    },
    {
      name: "blueprintjs",
      installCommand: "npm install @blueprintjs/core",
      description: "React-based UI toolkit for the web.",
      documentationUrl: "https://blueprintjs.com/docs/",
    },
  ],
  state: [
    {
      name: "zustand",
      installCommand: "npm install zustand",
      description: "Small, fast and scalable state-management solution",
      documentationUrl: "https://zustand-demo.pmnd.rs",
    },
    {
      name: "redux-toolkit",
      installCommand: "npm install @reduxjs/toolkit react-redux",
      description:
        "The official, opinionated, batteries-included toolset for Redux",
      documentationUrl: "https://redux-toolkit.js.org",
    },
    {
      name: "jotai",
      installCommand: "npm install jotai",
      description: "Primitive and flexible state management for React",
      documentationUrl: "https://jotai.org",
    },
    {
      name: "recoil",
      installCommand: "npm install recoil",
      description:
        "State management library for React apps with atomic state and derived data.",
      documentationUrl: "https://recoiljs.org/",
    },
    {
      name: "mobx",
      installCommand: "npm install mobx mobx-react",
      description: "Simple, scalable state management for JavaScript apps.",
      documentationUrl: "https://mobx.js.org/",
    },
    {
      name: "effector",
      installCommand: "npm install effector",
      description: "Fast and powerful reactive state manager.",
      documentationUrl: "https://effector.dev/docs/introduction/installation",
    },
    {
      name: "valtio",
      installCommand: "npm install valtio",
      description: "Makes proxy-state simple for React and Vanilla.",
      documentationUrl: "https://valtio.pmnd.rs/docs/introduction",
    },
  ],
  auth: [
    {
      name: "better-auth",
      installCommand: "npm install better-auth",
      description:
        "The most comprehensive authentication library for TypeScript",
      documentationUrl: "https://better-auth.com",
      configRequired: true,
      configNotes: "Requires database setup and environment variables",
    },
    {
      name: "next-auth",
      installCommand: "npm install next-auth",
      description: "Complete open source authentication solution for Next.js",
      documentationUrl: "https://next-auth.js.org",
      configRequired: true,
    },
    {
      name: "clerk",
      installCommand: "npm install @clerk/nextjs",
      description: "Complete user management platform",
      documentationUrl: "https://clerk.com/docs",
      configRequired: true,
    },
    {
      name: "firebase-auth",
      installCommand: "npm install firebase",
      description: "Firebase Authentication for web and mobile apps.",
      documentationUrl: "https://firebase.google.com/docs/auth",
      configRequired: true,
      configNotes: "Requires Firebase project setup.",
    },
    {
      name: "auth0",
      installCommand: "npm install @auth0/auth0-react",
      description: "Easy authentication and authorization for React apps.",
      documentationUrl: "https://auth0.com/docs/quickstart/spa/react",
      configRequired: true,
    },
    {
      name: "passport.js",
      installCommand: "npm install passport",
      description: "Simple, unobtrusive authentication for Node.js.",
      documentationUrl: "http://www.passportjs.org/docs/",
    },
    {
      name: "magic-link",
      installCommand: "npm install @magic-sdk/admin @magic-sdk/react",
      description: "Passwordless authentication for web and mobile apps.",
      documentationUrl: "https://magic.link/docs",
    },
  ],
  database: [
    {
      name: "drizzle-orm",
      installCommand: "npm install drizzle-orm",
      description: "TypeScript ORM that feels like writing SQL",
      documentationUrl: "https://orm.drizzle.team",
      configRequired: true,
      configNotes: "Requires database driver and schema setup",
    },
    {
      name: "prisma",
      installCommand: "npm install prisma @prisma/client",
      description: "Next-generation Node.js and TypeScript ORM",
      documentationUrl: "https://prisma.io",
      configRequired: true,
    },
    {
      name: "convex",
      installCommand: "npm install convex",
      description: "The backend application platform with everything you need",
      documentationUrl: "https://convex.dev",
      configRequired: true,
    },
    {
      name: "supabase",
      installCommand: "npm install @supabase/supabase-js",
      description:
        "The open source Firebase alternative. Backend-as-a-Service platform.",
      documentationUrl: "https://supabase.com/docs",
      configRequired: true,
      configNotes: "Requires Supabase project setup.",
    },
    {
      name: "planetscale",
      installCommand: "npm install @planetscale/database",
      description: "Serverless MySQL database platform.",
      documentationUrl:
        "https://docs.planetscale.com/reference/planetscale-nodejs",
      configRequired: true,
      configNotes: "Requires PlanetScale account and database setup.",
    },
    {
      name: "firebase-firestore",
      installCommand: "npm install firebase",
      description:
        "Cloud Firestore is a flexible, scalable database for mobile, web, and server development.",
      documentationUrl: "https://firebase.google.com/docs/firestore",
      configRequired: true,
      configNotes: "Requires Firebase project setup.",
    },
    {
      name: "mongodb-atlas",
      installCommand: "npm install mongodb",
      description:
        "MongoDB Atlas is a fully managed cloud database developed by the same people that build MongoDB.",
      documentationUrl: "https://www.mongodb.com/docs/atlas/",
      configRequired: true,
      configNotes: "Requires MongoDB Atlas account and cluster setup.",
    },
    {
      name: "neon",
      installCommand: "npm install neon-db",
      description:
        "Serverless Postgres. Built for the cloud, based on Postgres.",
      documentationUrl: "https://neon.tech/docs/introduction",
      configRequired: true,
      configNotes: "Requires Neon account and project setup.",
    },
    {
      name: "typeORM",
      installCommand: "npm install typeorm reflect-metadata",
      description: "ORM for TypeScript and JavaScript (ES7, ES6, ES5).",
      documentationUrl: "https://typeorm.io/",
      configRequired: true,
    },
  ],
  api: [
    {
      name: "axios",
      installCommand: "npm install axios",
      description: "Promise based HTTP client for the browser and node.js",
      documentationUrl: "https://axios-http.com",
    },
    {
      name: "swr",
      installCommand: "npm install swr",
      description: "Data fetching library for React",
      documentationUrl: "https://swr.vercel.app",
    },
    {
      name: "react-query",
      installCommand: "npm install @tanstack/react-query",
      description: "Powerful data synchronization for React",
      documentationUrl: "https://tanstack.com/query",
    },
    {
      name: "ky",
      installCommand: "npm install ky",
      description: "Tiny & elegant HTTP client based on the browser Fetch API.",
      documentationUrl: "https://ky.js.org/",
    },
    {
      name: "graphql-request",
      installCommand: "npm install graphql-request",
      description:
        "Minimal GraphQL client supporting Node and browsers for scripts or simple apps.",
      documentationUrl: "https://github.com/prisma-labs/graphql-request",
    },
    {
      name: "apollo-client",
      installCommand: "npm install @apollo/client graphql",
      description:
        "Comprehensive state management library for JavaScript that enables you to manage both local and remote data with GraphQL.",
      documentationUrl: "https://www.apollographql.com/docs/react/",
    },
    {
      name: "got",
      installCommand: "npm install got",
      description:
        "Human-friendly and powerful HTTP request library for Node.js.",
      documentationUrl: "https://github.com/sindresorhus/got",
    },
  ],
  testing: [
    {
      name: "vitest",
      installCommand: "npm install -D vitest",
      description: "A blazing fast unit test framework powered by Vite",
      documentationUrl: "https://vitest.dev",
    },
    {
      name: "testing-library",
      installCommand:
        "npm install -D @testing-library/react @testing-library/jest-dom",
      description: "Simple and complete testing utilities for React",
      documentationUrl: "https://testing-library.com",
    },
    {
      name: "playwright",
      installCommand: "npm install -D @playwright/test",
      description: "Fast and reliable end-to-end testing for modern web apps",
      documentationUrl: "https://playwright.dev",
    },
    {
      name: "jest",
      installCommand: "npm install -D jest",
      description: "Delightful JavaScript Testing Framework.",
      documentationUrl: "https://jestjs.io/",
    },
    {
      name: "cypress",
      installCommand: "npm install -D cypress",
      description:
        "Fast, easy and reliable testing for anything that runs in a browser.",
      documentationUrl: "https://www.cypress.io/",
    },
    {
      name: "mocha",
      installCommand: "npm install -D mocha",
      description:
        "Simple, flexible, fun JavaScript test framework for Node.js & The Browser.",
      documentationUrl: "https://mochajs.org/",
    },
    {
      name: "enzyme",
      installCommand: "npm install -D enzyme enzyme-adapter-react-16",
      description: "JavaScript Testing utilities for React.",
      documentationUrl: "https://enzymejs.github.io/enzyme/",
    },
  ],
  validation: [
    {
      name: "zod",
      installCommand: "npm install zod",
      description:
        "TypeScript-first schema validation with static type inference",
      documentationUrl: "https://zod.dev",
    },
    {
      name: "react-hook-form",
      installCommand: "npm install react-hook-form",
      description: "Performant, flexible forms with easy validation",
      documentationUrl: "https://react-hook-form.com",
    },
    {
      name: "yup",
      installCommand: "npm install yup",
      description: "Dead simple Object schema validation",
      documentationUrl: "https://github.com/jquense/yup",
    },
    {
      name: "superstruct",
      installCommand: "npm install superstruct",
      description:
        "A simple and composable way to validate data in JavaScript (and TypeScript).",
      documentationUrl: "https://docs.superstructjs.org/",
    },
    {
      name: "class-validator",
      installCommand: "npm install class-validator",
      description: "Decorator-based property validation for classes.",
      documentationUrl: "https://github.com/typestack/class-validator",
    },
    {
      name: "ajv",
      installCommand: "npm install ajv",
      description: "The fastest JSON schema validator for Node.js and browser.",
      documentationUrl: "https://ajv.js.org/",
    },
    {
      name: "io-ts",
      installCommand: "npm install io-ts",
      description:
        "Runtime type system for IO decoding/encoding in TypeScript.",
      documentationUrl: "https://gcanti.github.io/io-ts/",
    },
  ],
  ai: [
    {
      name: "vercel-ai",
      installCommand: "npm install ai",
      description:
        "Build AI-powered applications with React, Svelte, Vue, and Solid",
      documentationUrl: "https://sdk.vercel.ai",
    },
    {
      name: "openai",
      installCommand: "npm install openai",
      description: "Official OpenAI API client",
      documentationUrl: "https://platform.openai.com/docs",
      configRequired: true,
    },
    {
      name: "langchain",
      installCommand: "npm install langchain",
      description:
        "Framework for developing applications powered by language models",
      documentationUrl: "https://langchain.com",
    },
    {
      name: "huggingface.js",
      installCommand: "npm install @huggingface/inference",
      description: "JavaScript client for Hugging Face Inference API.",
      documentationUrl: "https://huggingface.co/docs/api-inference/index",
    },
    {
      name: "replicate",
      installCommand: "npm install replicate",
      description:
        "Client for running machine learning models on Replicate from Node.js and browser.",
      documentationUrl: "https://replicate.com/docs/reference/nodejs",
    },
    {
      name: "@tensorflow/tfjs",
      installCommand: "npm install @tensorflow/tfjs",
      description:
        "A library for developing and training ML models in JavaScript.",
      documentationUrl: "https://www.tensorflow.org/js",
    },
    {
      name: "onnxruntime-web",
      installCommand: "npm install onnxruntime-web",
      description: "Run ONNX models in browser and Node.js.",
      documentationUrl: "https://onnxruntime.ai/docs/",
    },
  ],
};
