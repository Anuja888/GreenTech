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

    
    setWorkspace(workspace) {
        this.storage.setItem(this.keys.WORKSPACE, workspace);
    }

    getWorkspace() {
        return this.storage.getItem(this.keys.WORKSPACE);
    }

    
    setRole(role) {
        sessionStorage.setItem(this.keys.ROLE, role);
    }

    getRole() {
        return sessionStorage.getItem(this.keys.ROLE);
    }

   
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

    
    getImpactCalculations() {
        const calc = this.storage.getItem(this.keys.IMPACT_CALCULATIONS);
        return calc ? JSON.parse(calc) : this.getDefaultCalculations();
    }

    getDefaultCalculations() {
        return {
            water: {
                shower: 50, 
                toilet: 6,
                faucet: 9, 
                washingMachine: 50, 
                dishwasher: 15 
            },
            energy: {
                ac: 1.5, 
                heater: 1.2, 
                refrigerator: 0.15, 
                washingMachine: 0.8, 
                dishwasher: 1.2 
            },
            carbon: {
                water: 0.0003, 
                electricity: 0.4 
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
        
        
        let waterSaved = 0;
        let energySaved = 0;
        let co2Avoided = 0;
        
        
        filteredIssues.forEach(issue => {
            if (issue.status === 'Resolved') {
                if (issue.resourceType === 'Water') {
                    
                    waterSaved += 30;
                    co2Avoided += 30 * calculations.carbon.water;
                } else if (issue.resourceType === 'Electricity') {
                    
                    energySaved += 5;
                    co2Avoided += 5 * calculations.carbon.electricity;
                }
            }
        });
        
        return {
            totalIssues,
            resolvedIssues,
            pendingIssues,
            waterSaved: Math.round(waterSaved),
            energySaved: Math.round(energySaved),
            co2Avoided
        };
    }

    
    getTrends(filters = {}) {
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
        
        
        const dailyData = {};
        filteredIssues.forEach(issue => {
            const date = new Date(issue.timestamp).toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = { reported: 0, resolved: 0, waterSaved: 0, energySaved: 0 };
            }
            dailyData[date].reported++;
            if (issue.status === 'Resolved') {
                dailyData[date].resolved++;
                if (issue.resourceType === 'Water') {
                    dailyData[date].waterSaved += 30;
                } else if (issue.resourceType === 'Electricity') {
                    dailyData[date].energySaved += 5;
                }
            }
        });
        
        
        const trends = Object.entries(dailyData)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date));
        
        return trends;
    }

    
    getPeriodComparison(filters = {}) {
        const issues = this.getIssues();
        const now = new Date();
        
        let filteredIssues = issues;
        
        if (filters.location) {
            filteredIssues = filteredIssues.filter(issue => issue.location === filters.location);
        }
        
        
        let currentStart, previousStart, previousEnd;
        if (filters.timeRange === 'week') {
            currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            previousStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
            previousEnd = currentStart;
        } else if (filters.timeRange === 'month') {
            currentStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            previousStart = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
            previousEnd = currentStart;
        } else if (filters.timeRange === 'year') {
            currentStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            previousStart = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
            previousEnd = currentStart;
        } else {
            
            currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            previousStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            previousEnd = currentStart;
        }
        
        const currentPeriodIssues = filteredIssues.filter(issue => new Date(issue.timestamp) >= currentStart);
        const previousPeriodIssues = filteredIssues.filter(issue => {
            const date = new Date(issue.timestamp);
            return date >= previousStart && date < previousEnd;
        });
        
        const current = this.calculatePeriodMetrics(currentPeriodIssues);
        const previous = this.calculatePeriodMetrics(previousPeriodIssues);
        
        return {
            current,
            previous,
            changes: {
                totalIssues: this.calculateChange(current.totalIssues, previous.totalIssues),
                resolvedIssues: this.calculateChange(current.resolvedIssues, previous.resolvedIssues),
                waterSaved: this.calculateChange(current.waterSaved, previous.waterSaved),
                energySaved: this.calculateChange(current.energySaved, previous.energySaved)
            }
        };
    }

    calculatePeriodMetrics(issues) {
        const totalIssues = issues.length;
        const resolvedIssues = issues.filter(i => i.status === 'Resolved').length;
        let waterSaved = 0;
        let energySaved = 0;
        
        issues.forEach(issue => {
            if (issue.status === 'Resolved') {
                if (issue.resourceType === 'Water') {
                    waterSaved += 30;
                } else if (issue.resourceType === 'Electricity') {
                    energySaved += 5;
                }
            }
        });
        
        return { totalIssues, resolvedIssues, waterSaved, energySaved };
    }

    calculateChange(current, previous) {
        if (previous === 0) return current > 0 ? '+' + current : current;
        const change = ((current - previous) / previous) * 100;
        const sign = change > 0 ? '+' : '';
        return sign + change.toFixed(1) + '%';
    }

    
    getHighImpactLocations(filters = {}) {
        const hotspots = this.getHotspots(filters);
        
        return Object.entries(hotspots)
            .map(([location, stats]) => ({
                location,
                unresolvedIssues: stats.total - stats.resolved,
                estimatedImpact: this.calculateLocationImpact(stats),
                avgResolutionTime: stats.avgResolutionTime
            }))
            .filter(loc => loc.unresolvedIssues > 0)
            .sort((a, b) => b.estimatedImpact - a.estimatedImpact); // Sort by impact descending
    }

    calculateLocationImpact(stats) {
        // Simple impact score: unresolved issues * severity weight
        const severityWeight = {
            high: 3,
            medium: 2,
            low: 1
        };
        
        return stats.total * (
            (stats.severity.high * severityWeight.high) +
            (stats.severity.medium * severityWeight.medium) +
            (stats.severity.low * severityWeight.low)
        ) / stats.total;
    }

    // Hotspot analysis
    getHotspots(filters = {}) {
        const issues = this.getIssues();
        
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
        
        const locationStats = {};
        
        filteredIssues.forEach(issue => {
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
            const resolvedIssues = filteredIssues.filter(i => i.location === location && i.status === 'Resolved');
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
