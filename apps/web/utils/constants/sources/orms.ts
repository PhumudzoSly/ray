export interface ORMPlatform {
    name: string;
    description: string;
    languages: string[];
    link: string;
    features: string[];
    type: ("Active Record" | "Data Mapper" | "Hybrid" | "Query Builder")[];
    license: "open-source" | "commercial" | "freemium";
}

export const ORM_PLATFORMS: ORMPlatform[] = [
    {
        name: "Drizzle ORM",
        description: "TypeScript ORM for SQL databases with a focus on type safety and simplicity.",
        languages: ["TypeScript", "JavaScript"],
        link: "https://orm.drizzle.team/",
        features: [
            "Type-safe queries",
            "Schema inference",
            "Migrations",
            "Lightweight",
        ],
        type: ["Query Builder", "Data Mapper"],
        license: "open-source",
    },
    {
        name: "Prisma",
        description: "Next-generation TypeScript ORM for Node.js and TypeScript.",
        languages: ["TypeScript", "JavaScript"],
        link: "https://www.prisma.io/",
        features: [
            "Type-safe client",
            "Migrations",
            "Data modeling",
            "Introspection",
        ],
        type: ["Data Mapper"],
        license: "open-source",
    },
    {
        name: "TypeORM",
        description: "ORM for TypeScript and JavaScript (ES7, ES6, ES5).",
        languages: ["TypeScript", "JavaScript"],
        link: "https://typeorm.io/",
        features: [
            "Active Record & Data Mapper",
            "Migrations",
            "Multiple DB support",
            "Decorators",
        ],
        type: ["Active Record", "Data Mapper"],
        license: "open-source",
    },
    {
        name: "Sequelize",
        description: "Promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite, and MSSQL.",
        languages: ["JavaScript", "TypeScript"],
        link: "https://sequelize.org/",
        features: [
            "Promise-based",
            "Migrations",
            "Associations",
            "Hooks",
        ],
        type: ["Active Record"],
        license: "open-source",
    },
    {
        name: "Mongoose",
        description: "MongoDB object modeling tool for Node.js.",
        languages: ["JavaScript", "TypeScript"],
        link: "https://mongoosejs.com/",
        features: [
            "Schema-based",
            "Validation",
            "Middleware",
            "Population",
        ],
        type: ["Active Record"],
        license: "open-source",
    },
    {
        name: "Hibernate",
        description: "Mature, high-performance ORM for Java.",
        languages: ["Java"],
        link: "https://hibernate.org/",
        features: [
            "JPA implementation",
            "Caching",
            "Lazy loading",
            "Migrations",
        ],
        type: ["Data Mapper"],
        license: "open-source",
    },
    {
        name: "SQLAlchemy",
        description: "The Python SQL toolkit and ORM.",
        languages: ["Python"],
        link: "https://www.sqlalchemy.org/",
        features: [
            "Core & ORM layers",
            "Schema migrations (Alembic)",
            "Flexible query API",
            "Multiple DB support",
        ],
        type: ["Data Mapper", "Query Builder"],
        license: "open-source",
    },
    {
        name: "Entity Framework",
        description: "ORM for .NET applications (C#).",
        languages: ["C#", ".NET"],
        link: "https://learn.microsoft.com/en-us/ef/",
        features: [
            "LINQ queries",
            "Migrations",
            "Change tracking",
            "Multiple DB support",
        ],
        type: ["Data Mapper"],
        license: "open-source",
    },
    {
        name: "GORM",
        description: "The fantastic ORM library for Golang.",
        languages: ["Go"],
        link: "https://gorm.io/",
        features: [
            "Auto migrations",
            "Associations",
            "Hooks",
            "Preloading",
        ],
        type: ["Active Record"],
        license: "open-source",
    },
    {
        name: "ActiveRecord (Rails)",
        description: "Rails' built-in ORM for Ruby.",
        languages: ["Ruby"],
        link: "https://guides.rubyonrails.org/active_record_basics.html",
        features: [
            "Convention over configuration",
            "Migrations",
            "Associations",
            "Callbacks",
        ],
        type: ["Active Record"],
        license: "open-source",
    },
    {
        name: "Doctrine ORM",
        description: "Powerful PHP ORM for relational databases.",
        languages: ["PHP"],
        link: "https://www.doctrine-project.org/projects/orm.html",
        features: [
            "Data Mapper",
            "Migrations",
            "DQL (Doctrine Query Language)",
            "Multiple DB support",
        ],
        type: ["Data Mapper"],
        license: "open-source",
    },
    {
        name: "Eloquent ORM",
        description: "Laravel's ORM for PHP.",
        languages: ["PHP"],
        link: "https://laravel.com/docs/eloquent",
        features: [
            "Active Record",
            "Relationships",
            "Migrations",
            "Query builder",
        ],
        type: ["Active Record"],
        license: "open-source",
    },
];

// Helper functions
export const getORMsByLanguage = (language: string) => {
    return ORM_PLATFORMS.filter((orm) => orm.languages.includes(language));
};

export const getORMsByType = (type: "Active Record" | "Data Mapper" | "Hybrid" | "Query Builder") => {
    return ORM_PLATFORMS.filter((orm) => orm.type.includes(type));
};

export const getOpenSourceORMs = () => {
    return ORM_PLATFORMS.filter((orm) => orm.license === "open-source");
};

export const getCommercialORMs = () => {
    return ORM_PLATFORMS.filter((orm) => orm.license === "commercial");
};

export const getFreemiumORMs = () => {
    return ORM_PLATFORMS.filter((orm) => orm.license === "freemium");
};
