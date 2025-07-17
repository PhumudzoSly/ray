export interface DatabaseProvider {
  name: string;
  description: string;
  databases: string[];
  link: string;
  features: string[];
  pricing: "free" | "freemium" | "paid";
  deployment: ("cloud" | "self-hosted" | "both")[];
}

export const DATABASE_PROVIDERS: DatabaseProvider[] = [
  {
    name: "Amazon Web Services (AWS)",
    description: "Comprehensive cloud database services by Amazon",
    databases: [
      "Amazon RDS (MySQL, PostgreSQL, Oracle, SQL Server, MariaDB)",
      "Amazon Aurora (MySQL, PostgreSQL)",
      "Amazon DynamoDB (NoSQL)",
      "Amazon DocumentDB (MongoDB-compatible)",
      "Amazon Redshift (Data Warehouse)",
      "Amazon Neptune (Graph Database)",
      "Amazon Timestream (Time Series)",
      "Amazon ElastiCache (Redis, Memcached)",
    ],
    link: "https://aws.amazon.com/products/databases/",
    features: [
      "Auto-scaling",
      "Multi-AZ deployment",
      "Automated backups",
      "Security",
      "Monitoring",
    ],
    pricing: "paid",
    deployment: ["cloud"],
  },
  {
    name: "Google Cloud Platform (GCP)",
    description: "Google's managed database services",
    databases: [
      "Cloud SQL (MySQL, PostgreSQL, SQL Server)",
      "Cloud Spanner (Distributed SQL)",
      "Firestore (NoSQL Document)",
      "Cloud Bigtable (NoSQL Wide-column)",
      "BigQuery (Data Warehouse)",
      "Cloud Memorystore (Redis, Memcached)",
      "Firebase Realtime Database",
    ],
    link: "https://cloud.google.com/products/databases",
    features: [
      "Global distribution",
      "ACID transactions",
      "Auto-scaling",
      "Real-time sync",
      "Security",
    ],
    pricing: "freemium",
    deployment: ["cloud"],
  },
  {
    name: "Microsoft Azure",
    description: "Microsoft's cloud database platform",
    databases: [
      "Azure SQL Database",
      "Azure Database for MySQL",
      "Azure Database for PostgreSQL",
      "Azure Cosmos DB (Multi-model NoSQL)",
      "Azure Synapse Analytics (Data Warehouse)",
      "Azure Cache for Redis",
      "Azure Database for MariaDB",
    ],
    link: "https://azure.microsoft.com/en-us/products/category/databases/",
    features: [
      "Global distribution",
      "Multi-model support",
      "Built-in AI",
      "Hybrid capabilities",
      "Security",
    ],
    pricing: "freemium",
    deployment: ["cloud"],
  },
  {
    name: "Firebase",
    description: "Google's mobile and web app development platform",
    databases: [
      "Cloud Firestore (NoSQL Document)",
      "Realtime Database (NoSQL JSON)",
    ],
    link: "https://firebase.google.com/products/firestore",
    features: [
      "Real-time sync",
      "Offline support",
      "Multi-platform SDKs",
      "Security rules",
      "Auto-scaling",
    ],
    pricing: "freemium",
    deployment: ["cloud"],
  },
  {
    name: "MongoDB",
    description: "Leading NoSQL document database platform",
    databases: [
      "MongoDB Atlas (Cloud)",
      "MongoDB Community Server",
      "MongoDB Enterprise Server",
    ],
    link: "https://www.mongodb.com/",
    features: [
      "Document-based",
      "Horizontal scaling",
      "Flexible schema",
      "Aggregation framework",
      "Full-text search",
    ],
    pricing: "freemium",
    deployment: ["both"],
  },
  {
    name: "PostgreSQL",
    description: "Advanced open-source relational database",
    databases: ["PostgreSQL"],
    link: "https://www.postgresql.org/",
    features: [
      "ACID compliance",
      "JSON support",
      "Full-text search",
      "Extensible",
      "Advanced indexing",
    ],
    pricing: "free",
    deployment: ["both"],
  },
  {
    name: "MySQL",
    description: "Popular open-source relational database",
    databases: ["MySQL Community Edition", "MySQL Enterprise Edition"],
    link: "https://www.mysql.com/",
    features: [
      "ACID compliance",
      "Replication",
      "Partitioning",
      "Performance optimization",
      "Security",
    ],
    pricing: "freemium",
    deployment: ["both"],
  },
  {
    name: "Oracle",
    description: "Enterprise-grade database solutions",
    databases: [
      "Oracle Database",
      "Oracle Autonomous Database",
      "Oracle MySQL Database Service",
      "Oracle NoSQL Database",
    ],
    link: "https://www.oracle.com/database/",
    features: [
      "Enterprise features",
      "AI/ML integration",
      "High availability",
      "Security",
      "Performance",
    ],
    pricing: "paid",
    deployment: ["both"],
  },
  {
    name: "Redis",
    description: "In-memory data structure store",
    databases: ["Redis Open Source", "Redis Enterprise", "Redis Cloud"],
    link: "https://redis.io/",
    features: [
      "In-memory storage",
      "Data structures",
      "Pub/sub messaging",
      "Lua scripting",
      "Clustering",
    ],
    pricing: "freemium",
    deployment: ["both"],
  },
  {
    name: "Supabase",
    description: "Open-source Firebase alternative",
    databases: ["PostgreSQL (with real-time features)"],
    link: "https://supabase.com/",
    features: [
      "Real-time subscriptions",
      "Built-in auth",
      "Auto-generated APIs",
      "Row-level security",
      "Dashboard",
    ],
    pricing: "freemium",
    deployment: ["both"],
  },
  {
    name: "PlanetScale",
    description: "Serverless MySQL platform",
    databases: ["MySQL (with branching)"],
    link: "https://planetscale.com/",
    features: [
      "Database branching",
      "Schema migrations",
      "Horizontal scaling",
      "Connection pooling",
      "Analytics",
    ],
    pricing: "freemium",
    deployment: ["cloud"],
  },
  {
    name: "Neon",
    description: "Serverless PostgreSQL platform",
    databases: ["PostgreSQL (serverless)"],
    link: "https://neon.tech/",
    features: [
      "Serverless",
      "Branching",
      "Auto-scaling",
      "Point-in-time recovery",
      "Connection pooling",
    ],
    pricing: "freemium",
    deployment: ["cloud"],
  },
  {
    name: "Fauna",
    description: "Serverless, globally distributed database",
    databases: ["FaunaDB (Document-relational)"],
    link: "https://fauna.com/",
    features: [
      "ACID transactions",
      "Global distribution",
      "Serverless",
      "Multi-model",
      "Time-travel queries",
    ],
    pricing: "freemium",
    deployment: ["cloud"],
  },
  {
    name: "Cassandra",
    description: "Distributed NoSQL database",
    databases: ["Apache Cassandra", "DataStax Astra (Cloud Cassandra)"],
    link: "https://cassandra.apache.org/",
    features: [
      "Distributed",
      "High availability",
      "Linear scalability",
      "Flexible data model",
      "No single point of failure",
    ],
    pricing: "freemium",
    deployment: ["both"],
  },
  {
    name: "Elasticsearch",
    description: "Search and analytics engine",
    databases: ["Elasticsearch", "Elastic Cloud"],
    link: "https://www.elastic.co/elasticsearch/",
    features: [
      "Full-text search",
      "Real-time analytics",
      "Distributed",
      "RESTful API",
      "Kibana integration",
    ],
    pricing: "freemium",
    deployment: ["both"],
  },
  {
    name: "InfluxDB",
    description: "Time series database platform",
    databases: ["InfluxDB Open Source", "InfluxDB Cloud"],
    link: "https://www.influxdata.com/",
    features: [
      "Time series optimized",
      "SQL-like query language",
      "Real-time analytics",
      "Downsampling",
      "Alerting",
    ],
    pricing: "freemium",
    deployment: ["both"],
  },
  {
    name: "CockroachDB",
    description: "Distributed SQL database",
    databases: ["CockroachDB", "CockroachDB Cloud"],
    link: "https://www.cockroachlabs.com/",
    features: [
      "Distributed SQL",
      "ACID transactions",
      "Horizontal scaling",
      "Survivability",
      "PostgreSQL compatibility",
    ],
    pricing: "freemium",
    deployment: ["both"],
  },
];

// Helper functions
export const getDatabasesByDeployment = (
  deployment: "cloud" | "self-hosted" | "both"
) => {
  return DATABASE_PROVIDERS.filter(
    (provider) =>
      provider.deployment.includes(deployment) ||
      provider.deployment.includes("both")
  );
};

export const getFreeDatabases = () => {
  return DATABASE_PROVIDERS.filter((provider) => provider.pricing === "free");
};

export const getFreemiumDatabases = () => {
  return DATABASE_PROVIDERS.filter(
    (provider) => provider.pricing === "freemium"
  );
};

export const getPaidDatabases = () => {
  return DATABASE_PROVIDERS.filter((provider) => provider.pricing === "paid");
};

export const getCloudDatabases = () => {
  return DATABASE_PROVIDERS.filter((provider) =>
    provider.deployment.includes("cloud")
  );
};

export const getSelfHostedDatabases = () => {
  return DATABASE_PROVIDERS.filter(
    (provider) =>
      provider.deployment.includes("self-hosted") ||
      provider.deployment.includes("both")
  );
};

// Database type categories
export const SQL_DATABASES = [
  "PostgreSQL",
  "MySQL",
  "Oracle Database",
  "SQL Server",
  "MariaDB",
  "Amazon Aurora",
  "Cloud SQL",
  "Azure SQL Database",
  "CockroachDB",
];

export const NOSQL_DATABASES = [
  "MongoDB",
  "DynamoDB",
  "Firestore",
  "DocumentDB",
  "Cosmos DB",
  "Cassandra",
  "Redis",
  "FaunaDB",
  "Bigtable",
];

export const TIME_SERIES_DATABASES = ["InfluxDB", "Amazon Timestream"];

export const GRAPH_DATABASES = ["Amazon Neptune", "Neo4j"];

export const SEARCH_DATABASES = ["Elasticsearch", "Amazon CloudSearch"];
