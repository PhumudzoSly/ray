import { Inngest } from "inngest";
import { prisma } from "@workspace/backend";

export const inngest = new Inngest({ id: "rayai" });

// Background task for idea validation
export const validateIdea = inngest.createFunction(
    { name: "Validate Idea" },
    { event: "idea/validate" },
    async ({ event, step }) => {
        const { ideaId } = event.data;

        // Step 1: Fetch idea data
        const idea = await step.run("fetch-idea", async () => {
            const idea = await prisma.idea.findUnique({
                where: { id: ideaId },
                include: {
                    aiOverallValidation: true,
                },
            });

            if (!idea) {
                throw new Error(`Idea with ID ${ideaId} not found`);
            }

            return idea;
        });

        // Step 2: Run AI validation analysis
        const validationResults = await step.run("run-ai-validation", async () => {
            // Simulate AI validation process
            // In a real implementation, this would call AI services
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

            return {
                overallScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
                recommendation: "This idea shows strong market potential based on our analysis.",
                marketSize: "Large market opportunity identified",
                competitorAnalysis: "Competitive landscape analyzed",
                customerFit: "Strong customer fit indicators",
                feasibility: "Technically feasible with current resources",
                financials: "Positive financial projections",
                userStories: [
                    "As a user, I want to solve this problem quickly",
                    "As a business, I need this solution to improve efficiency"
                ]
            };
        });

        // Step 3: Update idea with validation results
        const updatedIdea = await step.run("update-idea", async () => {
            const status = validationResults.overallScore >= 70 ? "VALIDATED" : "FAILED";

            // Update the idea with validation results
            const updated = await prisma.idea.update({
                where: { id: ideaId },
                data: {
                    status,
                    aiOverallValidation: {
                        upsert: {
                            create: {
                                overallRating: validationResults.overallScore,
                                overallComment: validationResults.recommendation,
                                lastValidated: new Date(),
                                marketSize: validationResults.marketSize,
                                competitorAnalysis: validationResults.competitorAnalysis,
                                customerFit: validationResults.customerFit,
                                feasibility: validationResults.feasibility,
                                financials: validationResults.financials,
                                userStories: validationResults.userStories,
                            },
                            update: {
                                overallRating: validationResults.overallScore,
                                overallComment: validationResults.recommendation,
                                lastValidated: new Date(),
                                marketSize: validationResults.marketSize,
                                competitorAnalysis: validationResults.competitorAnalysis,
                                customerFit: validationResults.customerFit,
                                feasibility: validationResults.feasibility,
                                financials: validationResults.financials,
                                userStories: validationResults.userStories,
                            },
                        },
                    },
                },
                include: {
                    aiOverallValidation: true,
                },
            });

            return updated;
        });

        return {
            success: true,
            ideaId,
            validationResults,
            updatedIdea
        };
    }
);
