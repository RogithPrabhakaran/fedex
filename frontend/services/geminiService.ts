
import { Customer } from "../types";

export const geminiService = {
  async generateCampaignContent(templateName: string, customerCount: number) {
    // Mock implementation for now
    return `Generated content for ${templateName} targeting ${customerCount} customers.`;
  },

  async analyzeCustomerRisk(customer: Customer) {
    // Mock implementation for now
    return {
      strategy: "Follow up with payment plan",
      reasoning: `Customer has ${customer.repaymentProbability}% probability based on payment history`,
      priority: customer.repaymentProbability > 70 ? "Low" : customer.repaymentProbability > 40 ? "Medium" : "High"
    };
  }
};
