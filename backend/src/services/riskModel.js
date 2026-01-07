const calculateRisk = (company, gdpValue) => {
    let score = 0; // 0 (Safe) to 100 (Critical Risk)

    // 1. Status Check (50 pts)
    const status = company.data.company_status.toLowerCase();
    if (status.includes('liquid') || status.includes('struck')) score += 100; // Auto-fail
    else if (status === 'active') score += 10;
    else score += 40;

    // 2. Capital Strength (30 pts)
    // Formula: (Total Debt / Paid Up Capital). If high, risk increases.
    // For this demo, let's say if Paid Up < 1,00,000, it's risky.
    const capital = company.data.paid_up_capital;
    if (capital < 100000) score += 30;
    else if (capital < 1000000) score += 15;

    // 3. Macro GDP Context (20 pts)
    // If GDP is massive (like India), we reduce risk slightly (-5)
    if (gdpValue > 3000000000000) score -= 5; 

    // Cap score at 100
    score = Math.min(Math.max(score, 0), 100);

    // Classification
    let verdict = "LOW RISK";
    let action = "Standard Collection";
    
    if (score > 80) { verdict = "CRITICAL"; action = "LEGAL ACTION"; }
    else if (score > 40) { verdict = "MEDIUM"; action = "DCA REFERRAL"; }

    return { score, verdict, action };
};

module.exports = { calculateRisk };