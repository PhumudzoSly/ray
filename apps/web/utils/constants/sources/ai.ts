export interface AIPlatform {
    name: string;
    description: string;
    type: ("LLM" | "API" | "SDK" | "Platform" | "Model Hub")[];
    link: string;
    features: string[];
    pricing: "free" | "freemium" | "paid";
}

export const AI_PLATFORMS: AIPlatform[] = [
    {
        name: "OpenAI",
        description: "Leading provider of large language models and generative AI APIs (GPT, DALL·E, Whisper)",
        type: ["LLM", "API", "Platform"],
        link: "https://openai.com/",
        features: [
            "ChatGPT API",
            "DALL·E image generation",
            "Whisper speech-to-text",
            "Fine-tuning",
            "Embeddings",
        ],
        pricing: "paid",
    },
    {
        name: "Vercel AI SDK",
        description: "Open-source SDK for building AI-powered apps with React, Next.js, and popular AI providers.",
        type: ["SDK"],
        link: "https://sdk.vercel.ai/",
        features: [
            "React/Next.js integration",
            "Streaming responses",
            "Provider-agnostic",
            "OpenAI, Anthropic, Hugging Face, etc.",
        ],
        pricing: "free",
    },
    {
        name: "Google Vertex AI",
        description: "Google Cloud's managed platform for training, deploying, and scaling AI models.",
        type: ["Platform", "API", "LLM"],
        link: "https://cloud.google.com/vertex-ai",
        features: [
            "Model training & deployment",
            "Generative AI APIs",
            "AutoML",
            "Data labeling",
            "Integration with Google Cloud",
        ],
        pricing: "paid",
    },
    {
        name: "OpenRouter",
        description: "Unified API gateway for accessing multiple LLM providers (OpenAI, Anthropic, Google, etc.)",
        type: ["API", "Platform"],
        link: "https://openrouter.ai/",
        features: [
            "Unified LLM API",
            "Multiple providers",
            "Pay-as-you-go",
            "API key management",
        ],
        pricing: "paid",
    },
    {
        name: "Hugging Face",
        description: "Open-source model hub and API for thousands of AI models (NLP, vision, audio, etc.)",
        type: ["Model Hub", "API", "Platform"],
        link: "https://huggingface.co/",
        features: [
            "Model hub",
            "Inference API",
            "Spaces (hosted apps)",
            "Datasets",
            "Training & fine-tuning",
        ],
        pricing: "freemium",
    },
    {
        name: "Anthropic",
        description: "AI research company providing Claude LLMs for safe, conversational AI.",
        type: ["LLM", "API"],
        link: "https://www.anthropic.com/",
        features: [
            "Claude LLM API",
            "Constitutional AI",
            "Long context windows",
        ],
        pricing: "paid",
    },
    {
        name: "Cohere",
        description: "Enterprise AI platform for LLMs, embeddings, and retrieval-augmented generation.",
        type: ["LLM", "API", "Platform"],
        link: "https://cohere.com/",
        features: [
            "Command LLM API",
            "Embeddings",
            "RAG (retrieval-augmented generation)",
            "Multilingual support",
        ],
        pricing: "paid",
    },
    {
        name: "Replicate",
        description: "Run open-source AI models in the cloud via simple API (vision, audio, LLMs, etc.)",
        type: ["API", "Platform", "Model Hub"],
        link: "https://replicate.com/",
        features: [
            "Model API",
            "Open-source models",
            "Pay-per-use",
            "Hosted inference",
        ],
        pricing: "paid",
    },
    {
        name: "Microsoft Azure AI",
        description: "Cloud-based AI services including OpenAI, vision, speech, and custom models.",
        type: ["Platform", "API", "LLM"],
        link: "https://azure.microsoft.com/en-us/products/ai-services/",
        features: [
            "Azure OpenAI Service",
            "Cognitive Services (vision, speech, language)",
            "Model deployment",
            "Enterprise security",
        ],
        pricing: "paid",
    },
    {
        name: "Ollama",
        description: "Run open-source LLMs locally with a simple CLI and API.",
        type: ["LLM", "API", "Platform"],
        link: "https://ollama.com/",
        features: [
            "Local LLM inference",
            "Model library",
            "No cloud required",
            "Simple API",
        ],
        pricing: "free",
    },
    {
        name: "LangChain",
        description: "Framework for building applications with LLMs, agents, and tools.",
        type: ["SDK", "Platform"],
        link: "https://www.langchain.com/",
        features: [
            "LLM orchestration",
            "Agents & tools",
            "Integrations",
            "Open-source",
        ],
        pricing: "free",
    },
    {
        name: "LlamaIndex",
        description: "Framework for building LLM-powered apps with data connectors and retrieval.",
        type: ["SDK", "Platform"],
        link: "https://www.llamaindex.ai/",
        features: [
            "Data connectors",
            "RAG pipelines",
            "Open-source",
            "Integrations",
        ],
        pricing: "free",
    },
];

// Helper functions
export const getAIByType = (type: "LLM" | "API" | "SDK" | "Platform" | "Model Hub") => {
    return AI_PLATFORMS.filter(
        (ai) => ai.type.includes(type)
    );
};

export const getFreeAI = () => {
    return AI_PLATFORMS.filter((ai) => ai.pricing === "free");
};

export const getFreemiumAI = () => {
    return AI_PLATFORMS.filter((ai) => ai.pricing === "freemium");
};

export const getPaidAI = () => {
    return AI_PLATFORMS.filter((ai) => ai.pricing === "paid");
}; 