const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Generate SLA violation alert message
   */
  async generateSLAAlert(caseData) {
    const prompt = `You are a professional notification generator for FedEx's debt collection system.

**STRICT RULES:**
- Use ONLY the provided data below
- Do NOT invent or guess any information
- Output a concise, professional alert message (3-4 sentences max)
- Focus on actionable information

**Case Data:**
- Case ID: ${caseData.case_id}
- Tracking: ${caseData.tracking_no || 'N/A'}
- Debtor: ${caseData.debtor_name}
- Amount: $${caseData.case_amount}
- DPD (Days Past Due): ${caseData.dpd}
- Assigned DCA: ${caseData.dca_name}
- Status: ${caseData.status}
- Priority: ${caseData.priority}
- SLA Status: ${caseData.sla_status}

**Task:**
Generate a professional alert message for the FedEx dashboard that:
1. States the SLA violation clearly
2. Mentions the case details
3. Suggests immediate action

Output only the alert message, nothing else.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.templateAlert(caseData);
    }
  }

  /**
   * Generate escalation reasoning
   */
  async generateEscalationReasoning(caseData, violations) {
    const prompt = `You are analyzing a debt collection case for escalation decision.

**Case Information:**
- Case ID: ${caseData.case_id}
- Debtor: ${caseData.debtor_name}
- Amount: $${caseData.case_amount}
- DPD: ${caseData.dpd}
- Priority: ${caseData.priority}
- DCA: ${caseData.dca_name}

**Violations Detected:**
${violations.map((v, i) => `${i + 1}. ${v}`).join('\n')}

**Task:**
In 2-3 sentences, explain why this case should be escalated to senior management.
Focus on business impact and urgency.

Output only the reasoning, nothing else.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return `Case requires escalation due to ${violations.length} SLA violations and ${caseData.dpd} days past due.`;
    }
  }

  /**
   * Fallback template-based alert
   */
  templateAlert(caseData) {
    return `⚠️ SLA VIOLATION DETECTED
Case ${caseData.case_id} for ${caseData.debtor_name} has breached SLA deadline.
Amount: $${caseData.case_amount} | DPD: ${caseData.dpd} days
Assigned to: ${caseData.dca_name} | Status: ${caseData.status}
Action Required: Immediate escalation recommended.`;
  }
}

module.exports = new GeminiService();
