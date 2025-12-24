// EcoTrace Pro Data Management
// All data stored in browser LocalStorage

class DataManager {
    constructor() {
        this.storage = window.localStorage;
        this.keys = {
            WORKSPACE: 'ecotrace_workspace',
            ROLE: 'ecotrace_role',
            ISSUES: 'ecotrace_issues',
            IMPACT_CALCULATIONS: 'ecotrace_calculations'
        };
    }

    // Workspace management
    setWorkspace(workspace) {
        this.storage.setItem(this.keys.WORKSPACE, workspace);
    }

    getWorkspace() {
        return this.storage.getItem(this.keys.WORKSPACE);
    }

    // Role management (session-based)
    setRole(role) {
        sessionStorage.setItem(this.keys.ROLE, role);
    }

    getRole() {
        return sessionStorage.getItem(this.keys.ROLE);
    }

    // Issues management
    getIssues() {
        const issues = this.storage.getItem(this.keys.ISSUES);
        return issues ? JSON.parse(issues) : [];
    }

    saveIssues(issues) {
        this.storage.setItem(this.keys.ISSUES, JSON.stringify(issues));
    }

    addIssue(issue) {
        const issues = this.getIssues();
        issue.id = Date.now().toString();
        issue.timestamp = new Date().toISOString();
        issue.status = 'Reported';
        issue.statusHistory = [{
            status: 'Reported',
            timestamp: issue.timestamp
        }];
        issues.push(issue);
        this.saveIssues(issues);
        return issue.id;
    }

    updateIssueStatus(issueId, newStatus, authority = '') {
        const issues = this.getIssues();
        const issue = issues.find(i => i.id === issueId);
        if (issue) {
            issue.status = newStatus;
            issue.statusHistory.push({
                status: newStatus,
                timestamp: new Date().toISOString(),
                authority: authority
            });
            this.saveIssues(issues);
        }
    }

    // Impact calculations
    getImpactCalculations() {
        const calc = this.storage.getItem(this.keys.IMPACT_CALCULATIONS);
        return calc ? JSON.parse(calc) : this.getDefaultCalculations();
    }

    getDefaultCalculations() {
        return {
            water: {
                shower: 50, // liters per 5 min shower
                toilet: 6, // liters per flush
                faucet: 9, // liters per minute
                washingMachine: 50, // liters per load
                dishwasher: 15 // liters per cycle
            },
            energy: {
                ac: 1.5, // kWh per hour
                heater: 1.2, // kWh per hour
                refrigerator: 0.15, // kWh per hour
                washingMachine: 0.8, // kWh per load
                dishwasher: 1.2 // kWh per cycle
            },
            carbon: {
                water: 0.0003, // kg CO2 per liter
                electricity: 0.4 // kg CO2 per kWh (average)
            }
        };
    }

    // Analytics
    getAnalytics(filters = {}) {
        const issues = this.getIssues();
        const calculations = this.getImpactCalculations();
        
        let filteredIssues = issues;
        
        if (filters.timeRange) {
            const now = new Date();
            const startDate = new Date();
            switch (filters.timeRange) {
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
            }
            filteredIssues = issues.filter(issue => new Date(issue.timestamp) >= startDate);
        }
        
        if (filters.location) {
            filteredIssues = filteredIssues.filter(issue => issue.location === filters.location);
        }
        
        const totalIssues = filteredIssues.length;
        const resolvedIssues = filteredIssues.filter(i => i.status === 'Resolved').length;
        const pendingIssues = totalIssues - resolvedIssues;
        
        // Initialize impact variables
        let waterSaved = 0;
        let energySaved = 0;
        let co2Avoided = 0;
        
        // Calculate impact based on resolved issues
        filteredIssues.forEach(issue => {
            if (issue.status === 'Resolved') {
                if (issue.resourceType === 'Water') {
                    // Estimate: each resolved water issue saves equivalent to 2 showers per week for a month
                    waterSaved += calculations.water.shower * 8;
                    co2Avoided += calculations.water.shower * 8 * calculations.carbon.water;
                } else if (issue.resourceType === 'Electricity') {
                    // Estimate: each resolved energy issue saves 5 hours of AC per week for a month
                    energySaved += calculations.energy.ac * 20;
                    co2Avoided += calculations.energy.ac * 20 * calculations.carbon.electricity;
                }
            }
        });
        
        return {
            totalIssues,
            resolvedIssues,
            pendingIssues,
            waterSaved,
            energySaved,
            co2Avoided
        };
    }

    // Hotspot analysis
    getHotspots() {
        const issues = this.getIssues();
        const locationStats = {};
        
        issues.forEach(issue => {
            if (!locationStats[issue.location]) {
                locationStats[issue.location] = {
                    total: 0,
                    resolved: 0,
                    avgResolutionTime: 0,
                    severity: { low: 0, medium: 0, high: 0 }
                };
            }
            locationStats[issue.location].total++;
            if (issue.status === 'Resolved') {
                locationStats[issue.location].resolved++;
            }
            locationStats[issue.location].severity[issue.severity.toLowerCase()]++;
        });
        
        // Calculate average resolution time
        Object.keys(locationStats).forEach(location => {
            const resolvedIssues = issues.filter(i => i.location === location && i.status === 'Resolved');
            if (resolvedIssues.length > 0) {
                const totalTime = resolvedIssues.reduce((sum, issue) => {
                    const reported = new Date(issue.timestamp);
                    const resolved = new Date(issue.statusHistory[issue.statusHistory.length - 1].timestamp);
                    return sum + (resolved - reported);
                }, 0);
                locationStats[location].avgResolutionTime = totalTime / resolvedIssues.length / (1000 * 60 * 60 * 24); // days
            }
        });
        
        return locationStats;
    }

    // What-if simulator
    simulateImpact(inputs) {
        const calculations = this.getImpactCalculations();
        
        // More realistic simulation: assume reduced usage due to efficiency measures
        const dailyWaterSavings = inputs.people * inputs.frequency * inputs.duration * calculations.water.shower * 0.3; // 30% reduction
        const dailyEnergySavings = inputs.people * inputs.frequency * inputs.duration * calculations.energy.ac * 0.3; // 30% reduction
        
        const annualWaterSavings = dailyWaterSavings * 365;
        const annualEnergySavings = dailyEnergySavings * 365;
        const annualCo2Reduction = (annualWaterSavings * calculations.carbon.water) + (annualEnergySavings * calculations.carbon.electricity);
        const treeEquivalent = annualCo2Reduction / 22; // 1 tree absorbs ~22kg CO2 per year
        
        return {
            annualWaterSavings,
            annualEnergySavings,
            annualCo2Reduction,
            treeEquivalent
        };
    }

    // Clear all data (for testing)
    clearAll() {
        Object.values(this.keys).forEach(key => {
            this.storage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    }
}

const dataManager = new DataManager();