// lib/ai-service.ts
export const generateChart = async (description: string) => {
  try {
    const response = await fetch("/api/ai/generate-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) throw new Error("Failed to generate chart");
    return response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
