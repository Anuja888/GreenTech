// EcoTrace Pro UI Management

class UIManager {
    constructor() {
        this.mainContent = document.getElementById('main-content');
        this.nav = document.getElementById('nav');
        this.currentRole = null;
        this.currentWorkspace = null;
        
        if (!this.mainContent) {
            console.error('main-content element not found');
            return;
        }
        if (!this.nav) {
            console.error('nav element not found');
            return;
        }
        
        // Set up navigation event listener once
        this.nav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const sectionId = e.target.dataset.section;
                const currentRole = dataManager.getRole();
                const currentWorkspace = dataManager.getWorkspace();
                this.showSection(sectionId, currentRole, currentWorkspace);
                this.updateActiveNav(sectionId);
            }
        });
    }

    // Navigation
    updateNavigation(role, workspace) {
        this.currentRole = role;
        this.currentWorkspace = workspace;
        
        const navItems = [
            { id: 'dashboard', label: 'Dashboard', roles: ['Reporter', 'Authority', 'Viewer'] },
            { id: 'report', label: 'Report Issue', roles: ['Reporter'] },
            { id: 'issues', label: 'Issue Tracking', roles: ['Reporter', 'Authority', 'Viewer'] },
            { id: 'analytics', label: 'Analytics', roles: ['Authority', 'Viewer'] },
            { id: 'simulator', label: 'Impact Simulator', roles: ['Authority', 'Viewer'] },
            { id: 'audit', label: 'Audit Snapshot', roles: ['Authority', 'Viewer'] }
        ];

        const filteredItems = navItems.filter(item => item.roles.includes(role));
        
        this.nav.innerHTML = '<ul>' + filteredItems.map(item => 
            `<li><a href="#" data-section="${item.id}">${item.label}</a></li>`
        ).join('') + '</ul>';

        // Update user settings display
        this.updateUserSettings(role, workspace);
    }

    updateUserSettings(role, workspace) {
        const userSettings = document.getElementById('user-settings');
        if (!userSettings) return;

        const workspaceDisplay = workspace ? workspace.charAt(0).toUpperCase() + workspace.slice(1) : 'Not Set';
        const roleDisplay = role || 'Not Set';

        userSettings.innerHTML = `
            <div class="setting-item">
                <span>Context: ${workspaceDisplay}</span>
                <button id="change-workspace" title="Change Operating Context">Change</button>
            </div>
            <div class="setting-item">
                <span>Role: ${roleDisplay}</span>
                <button id="change-role" title="Change Role">Change</button>
            </div>
            <button id="reset-session" title="Reset Session" style="background-color: var(--error-red); color: white;">Reset</button>
        `;

        // Add event listeners
        document.getElementById('change-workspace')?.addEventListener('click', () => {
            this.showWorkspaceSelection();
        });

        document.getElementById('change-role')?.addEventListener('click', () => {
            this.showRoleSelection();
        });

        document.getElementById('reset-session')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the session? This will clear all data and return to the setup screen.')) {
                dataManager.clearAll();
                location.reload();
            }
        });
    }

    updateActiveNav(activeSection) {
        this.nav.querySelectorAll('a').forEach(link => {
            link.classList.toggle('active', link.dataset.section === activeSection);
        });
    }

    // Section display
    showSection(sectionId, role, workspace) {
        console.log(`showSection called: sectionId=${sectionId}, role=${role}, workspace=${workspace}`);
        
        // Validate role
        if (!role) {
            console.warn('No role specified for showSection, redirecting to role selection');
            this.showRoleSelection();
            return;
        }

        // Check if the section is allowed for this role
        const allowedSections = {
            'Reporter': ['dashboard', 'report', 'issues'],
            'Authority': ['dashboard', 'issues', 'analytics', 'simulator', 'audit'],
            'Viewer': ['dashboard', 'issues', 'analytics', 'simulator', 'audit']
        };
        
        if (!allowedSections[role] || !allowedSections[role].includes(sectionId)) {
            console.warn(`Section '${sectionId}' not allowed for role '${role}', redirecting to dashboard`);
            this.showSection('dashboard', role, workspace); // Redirect to dashboard
            return;
        }
        
        switch (sectionId) {
            case 'dashboard':
                this.showDashboard(role, workspace);
                break;
            case 'report':
                this.showReportForm();
                break;
            case 'issues':
                this.showIssues(role, workspace);
                break;
            case 'analytics':
                this.showAnalytics();
                break;
            case 'simulator':
                this.showSimulator();
                break;
            case 'audit':
                this.showAudit();
                break;
        }
    }

    // Dashboard
    showDashboard(role, workspace) {
        try {
            console.log('showDashboard called with role:', role, 'workspace:', workspace);
            const analytics = dataManager.getAnalytics(window.ecoTraceApp.currentFilters);
            const trends = dataManager.getTrends(window.ecoTraceApp.currentFilters);
            const comparison = dataManager.getPeriodComparison(window.ecoTraceApp.currentFilters);
            const highImpactLocations = dataManager.getHighImpactLocations(window.ecoTraceApp.currentFilters);
            console.log('Analytics data:', analytics);
            
            const content = `
                <div class="section">
                    <h2>Community Impact Dashboard</h2>
                    <table class="dashboard-table">
                        <tbody>
                            <tr>
                                <td>Total Issues</td>
                                <td class="metric-value">${analytics.totalIssues}</td>
                            </tr>
                            <tr>
                                <td>Resolved</td>
                                <td class="metric-value">${analytics.resolvedIssues}</td>
                            </tr>
                            <tr>
                                <td>Pending</td>
                                <td class="metric-value">${analytics.pendingIssues}</td>
                            </tr>
                            <tr>
                                <td>Water Saved</td>
                                <td class="metric-value">${analytics.waterSaved}L</td>
                            </tr>
                            <tr>
                                <td>Energy Saved</td>
                                <td class="metric-value">${analytics.energySaved}kWh</td>
                            </tr>
                            <tr>
                                <td>CO₂ Avoided</td>
                                <td class="metric-value">${analytics.co2Avoided.toFixed(1)}kg</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="filter-group">
                        <div>
                            <label for="time-filter">Time Range:</label>
                            <select id="time-filter">
                                <option value="all" ${window.ecoTraceApp.currentFilters.timeRange === 'all' ? 'selected' : ''}>All Time</option>
                                <option value="week" ${window.ecoTraceApp.currentFilters.timeRange === 'week' ? 'selected' : ''}>Last Week</option>
                                <option value="month" ${window.ecoTraceApp.currentFilters.timeRange === 'month' ? 'selected' : ''}>Last Month</option>
                                <option value="year" ${window.ecoTraceApp.currentFilters.timeRange === 'year' ? 'selected' : ''}>Last Year</option>
                            </select>
                        </div>
                        <div>
                            <label for="location-filter">Location:</label>
                            <select id="location-filter">
                                <option value="" ${window.ecoTraceApp.currentFilters.location === '' ? 'selected' : ''}>All Locations</option>
                                ${this.getLocationOptions()}
                            </select>
                        </div>
                    </div>
                    
                    <h3>Trends Over Time</h3>
                    <div class="table-scroll">
                        <table class="trends-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Reported</th>
                                    <th>Resolved</th>
                                    <th>Water Saved</th>
                                    <th>Energy Saved</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${trends.length > 0 ? trends.map(trend => `
                                    <tr>
                                        <td>${new Date(trend.date).toLocaleDateString()}</td>
                                        <td>${trend.reported}</td>
                                        <td>${trend.resolved}</td>
                                        <td>${trend.waterSaved}L</td>
                                        <td>${trend.energySaved}kWh</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="5">No data available</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                    
                    <h3>Period Comparison</h3>
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Current Period</th>
                                <th>Previous Period</th>
                                <th>Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Total Issues</td>
                                <td>${comparison.current.totalIssues}</td>
                                <td>${comparison.previous.totalIssues}</td>
                                <td>${comparison.changes.totalIssues}</td>
                            </tr>
                            <tr>
                                <td>Resolved Issues</td>
                                <td>${comparison.current.resolvedIssues}</td>
                                <td>${comparison.previous.resolvedIssues}</td>
                                <td>${comparison.changes.resolvedIssues}</td>
                            </tr>
                            <tr>
                                <td>Water Saved</td>
                                <td>${comparison.current.waterSaved}L</td>
                                <td>${comparison.previous.waterSaved}L</td>
                                <td>${comparison.changes.waterSaved}</td>
                            </tr>
                            <tr>
                                <td>Energy Saved</td>
                                <td>${comparison.current.energySaved}kWh</td>
                                <td>${comparison.previous.energySaved}kWh</td>
                                <td>${comparison.changes.energySaved}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3>High-Impact Locations</h3>
                    <div class="table-scroll">
                        <table class="locations-table">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Unresolved Issues</th>
                                    <th>Estimated Impact</th>
                                    <th>Avg Resolution Time (days)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${highImpactLocations.length > 0 ? highImpactLocations.map(loc => `
                                    <tr>
                                        <td>${loc.location}</td>
                                        <td>${loc.unresolvedIssues}</td>
                                        <td>${loc.estimatedImpact.toFixed(1)}</td>
                                        <td>${loc.avgResolutionTime.toFixed(1)}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4">No high-impact locations</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            console.log('Setting mainContent innerHTML');
            this.mainContent.innerHTML = content;
            
            // Add filter listeners
            const timeFilter = document.getElementById('time-filter');
            const locationFilter = document.getElementById('location-filter');
            
            if (timeFilter) {
                timeFilter.addEventListener('change', () => {
                    window.ecoTraceApp.currentFilters.timeRange = timeFilter.value;
                    this.updateDashboard();
                });
            } else {
                console.error('time-filter element not found');
            }
            
            if (locationFilter) {
                locationFilter.addEventListener('change', () => {
                    window.ecoTraceApp.currentFilters.location = locationFilter.value;
                    this.updateDashboard();
                });
            } else {
                console.error('location-filter element not found');
            }
            
            console.log('Dashboard rendered successfully');
        } catch (error) {
            console.error('Error in showDashboard:', error);
            this.mainContent.innerHTML = `
                <div class="section">
                    <h2>Error Loading Dashboard</h2>
                    <p>An error occurred while loading the dashboard. Please try refreshing the page.</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    }

    updateDashboard() {
        const analytics = dataManager.getAnalytics(window.ecoTraceApp.currentFilters);
        const trends = dataManager.getTrends(window.ecoTraceApp.currentFilters);
        const comparison = dataManager.getPeriodComparison(window.ecoTraceApp.currentFilters);
        const highImpactLocations = dataManager.getHighImpactLocations(window.ecoTraceApp.currentFilters);
        
        // Update metrics in table
        const rows = this.mainContent.querySelectorAll('.dashboard-table tbody tr');
        rows[0].cells[1].textContent = analytics.totalIssues;
        rows[1].cells[1].textContent = analytics.resolvedIssues;
        rows[2].cells[1].textContent = analytics.pendingIssues;
        rows[3].cells[1].textContent = `${analytics.waterSaved}L`;
        rows[4].cells[1].textContent = `${analytics.energySaved}kWh`;
        rows[5].cells[1].textContent = `${analytics.co2Avoided.toFixed(1)}kg`;
        
        // Update trends table
        const trendsTable = this.mainContent.querySelector('.trends-table tbody');
        trendsTable.innerHTML = trends.length > 0 ? trends.map(trend => `
            <tr>
                <td>${new Date(trend.date).toLocaleDateString()}</td>
                <td>${trend.reported}</td>
                <td>${trend.resolved}</td>
                <td>${trend.waterSaved}L</td>
                <td>${trend.energySaved}kWh</td>
            </tr>
        `).join('') : '<tr><td colspan="5">No data available</td></tr>';
        
        // Update comparison table
        const comparisonRows = this.mainContent.querySelectorAll('.comparison-table tbody tr');
        comparisonRows[0].cells[1].textContent = comparison.current.totalIssues;
        comparisonRows[0].cells[2].textContent = comparison.previous.totalIssues;
        comparisonRows[0].cells[3].textContent = comparison.changes.totalIssues;
        
        comparisonRows[1].cells[1].textContent = comparison.current.resolvedIssues;
        comparisonRows[1].cells[2].textContent = comparison.previous.resolvedIssues;
        comparisonRows[1].cells[3].textContent = comparison.changes.resolvedIssues;
        
        comparisonRows[2].cells[1].textContent = `${comparison.current.waterSaved}L`;
        comparisonRows[2].cells[2].textContent = `${comparison.previous.waterSaved}L`;
        comparisonRows[2].cells[3].textContent = comparison.changes.waterSaved;
        
        comparisonRows[3].cells[1].textContent = `${comparison.current.energySaved}kWh`;
        comparisonRows[3].cells[2].textContent = `${comparison.previous.energySaved}kWh`;
        comparisonRows[3].cells[3].textContent = comparison.changes.energySaved;
        
        // Update high-impact locations table
        const locationsTable = this.mainContent.querySelector('.locations-table tbody');
        locationsTable.innerHTML = highImpactLocations.length > 0 ? highImpactLocations.map(loc => `
            <tr>
                <td>${loc.location}</td>
                <td>${loc.unresolvedIssues}</td>
                <td>${loc.estimatedImpact.toFixed(1)}</td>
                <td>${loc.avgResolutionTime.toFixed(1)}</td>
            </tr>
        `).join('') : '<tr><td colspan="4">No high-impact locations</td></tr>';
    }

    getLocationOptions() {
        const issues = dataManager.getIssues();
        const locations = [...new Set(issues.map(issue => issue.location).filter(loc => loc))];
        return locations.map(location => `<option value="${location}">${location}</option>`).join('');
    }

    // Report form
    showReportForm() {
        const content = `
            <div class="section">
                <h2>Report Resource Waste Issue</h2>
                <div class="card">
                    <form id="report-form">
                        <div class="form-group">
                            <label for="resource-type">Resource Type:</label>
                            <select id="resource-type" required>
                                <option value="">Select Resource</option>
                                <option value="Water">Water</option>
                                <option value="Electricity">Electricity</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="location">Location:</label>
                            <input type="text" id="location" placeholder="e.g., Block A, Room 101" required>
                        </div>
                        <div class="form-group">
                            <label for="severity">Severity:</label>
                            <select id="severity" required>
                                <option value="">Select Severity</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="note">Note (Optional):</label>
                            <textarea id="note" rows="3" placeholder="Additional details..."></textarea>
                        </div>
                        <button type="submit">Submit Report</button>
                    </form>
                </div>
            </div>
        `;
        this.mainContent.innerHTML = content;
        
        document.getElementById('report-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReport();
        });
    }

    submitReport() {
        const issue = {
            resourceType: document.getElementById('resource-type').value,
            location: document.getElementById('location').value,
            severity: document.getElementById('severity').value,
            note: document.getElementById('note').value
        };
        
        dataManager.addIssue(issue);
        alert('Issue reported successfully!');
        this.showReportForm(); // Reset form
        
        // Update dashboard if it's currently visible
        if (document.querySelector('.dashboard-table')) {
            this.updateDashboard();
        }
    }

    // Issues tracking
    showIssues(role, workspace) {
        const issues = dataManager.getIssues();
        const isAuthority = role === 'Authority';
        const isCampusSociety = ['Campus', 'Residential Society'].includes(workspace);
        
        const statusOptions = isCampusSociety 
            ? ['Reported', 'Acknowledged', 'In Progress', 'Resolved']
            : ['Reported', 'Forwarded to authority', 'Status pending'];
        
        const content = `
            <div class="section">
                <h2>Issue Lifecycle Tracking</h2>
                <table class="issues-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Severity</th>
                            <th>Status</th>
                            <th>Reported</th>
                            ${isAuthority ? '<th>Action</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${issues.map(issue => `
                            <tr>
                                <td>${issue.resourceType}</td>
                                <td>${issue.location}</td>
                                <td class="severity severity-${issue.severity.toLowerCase()}">${issue.severity}</td>
                                <td class="status status-${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</td>
                                <td>${new Date(issue.timestamp).toLocaleDateString()}</td>
                                ${isAuthority ? `
                                    <td>
                                        <select class="status-update" data-issue-id="${issue.id}">
                                            <option value="">Select Status</option>
                                            ${statusOptions.map(status => 
                                                `<option value="${status}" ${status === issue.status ? 'selected' : ''}>${status}</option>`
                                            ).join('')}
                                        </select>
                                        <button class="update-status-btn" data-issue-id="${issue.id}">Update</button>
                                    </td>
                                ` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        this.mainContent.innerHTML = content;
        
        // Add status update listeners
        if (isAuthority) {
            document.querySelectorAll('.update-status-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const issueId = e.target.dataset.issueId;
                    const select = document.querySelector(`.status-update[data-issue-id="${issueId}"]`);
                    const newStatus = select.value;
                    if (newStatus) {
                        dataManager.updateIssueStatus(issueId, newStatus, 'Authority');
                        this.showIssues(role, workspace);
                        // Also update dashboard if it's currently visible
                        if (document.querySelector('.dashboard-table')) {
                            this.updateDashboard();
                        }
                    }
                });
            });
        }
    }

    getStatusTimeline(issue) {
        return `
            <div class="status-timeline">
                <h4>Status History:</h4>
                <ul>
                    ${issue.statusHistory.map(entry => `
                        <li>${entry.status} - ${new Date(entry.timestamp).toLocaleString()} ${entry.authority ? `(${entry.authority})` : ''}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    // Analytics
    showAnalytics() {
        const hotspots = dataManager.getHotspots(window.ecoTraceApp.currentFilters);
        const deviation = this.calculateDeviation();
        const content = `
            <div class="section">
                <h2>Sustainability Performance & Hotspot Analysis</h2>
                
                <div class="tabs">
                    <div class="tab active" data-tab="hotspots">Hotspots</div>
                    <div class="tab" data-tab="performance">Performance</div>
                    <div class="tab" data-tab="deviation">Deviation</div>
                </div>
                
                <div id="hotspots-tab" class="tab-content active">
                    <h3>Areas with Repeated Issues</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Location</th>
                                <th>Total Issues</th>
                                <th>Resolved</th>
                                <th>Avg Resolution Time (days)</th>
                                <th>High Severity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(hotspots).map(([location, stats]) => `
                                <tr>
                                    <td>${location}</td>
                                    <td>${stats.total}</td>
                                    <td>${stats.resolved}</td>
                                    <td>${stats.avgResolutionTime.toFixed(1)}</td>
                                    <td>${stats.severity.high}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div id="performance-tab" class="tab-content">
                    <h3>System Performance Metrics</h3>
                    <table class="performance-table">
                        <tbody>
                            <tr>
                                <td>Active Locations</td>
                                <td>${Object.keys(hotspots).length}</td>
                            </tr>
                            <tr>
                                <td>Total Issues</td>
                                <td>${Object.values(hotspots).reduce((sum, loc) => sum + loc.total, 0)}</td>
                            </tr>
                            <tr>
                                <td>Issues Resolved</td>
                                <td>${Object.values(hotspots).reduce((sum, loc) => sum + loc.resolved, 0)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div id="deviation-tab" class="tab-content">
                    <h3>Environmental Deviation Analysis</h3>
                    <div class="card">
                        <p>Analysis of system performance changes compared to baseline benchmarks.</p>
                        <div class="metrics">
                            <div class="metric">
                                <div class="metric-value ${deviation.waterChange > 0 ? 'negative' : 'positive'}">${deviation.waterChange > 0 ? '+' : ''}${deviation.waterChange}L</div>
                                <div class="metric-label">Water Load Change</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value ${deviation.energyChange > 0 ? 'negative' : 'positive'}">${deviation.energyChange > 0 ? '+' : ''}${deviation.energyChange}kWh</div>
                                <div class="metric-label">Energy Load Change</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value ${deviation.carbonChange > 0 ? 'negative' : 'positive'}">${deviation.carbonChange > 0 ? '+' : ''}${deviation.carbonChange.toFixed(1)}kg</div>
                                <div class="metric-label">Carbon Load Change</div>
                            </div>
                        </div>
                        <p class="deviation-status">${deviation.status}</p>
                    </div>
                </div>
            </div>
        `;
        this.mainContent.innerHTML = content;
        
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab + '-tab').classList.add('active');
            });
        });
    }

    // Simulator
    showSimulator() {
        const content = `
            <div class="section">
                <h2>What-If Impact Simulator</h2>
                <div class="card">
                    <p>This tool helps plan for scaled scenarios and policy decisions.</p>
                    <form id="simulator-form">
                        <div class="form-group">
                            <label for="sim-people">Number of People:</label>
                            <input type="number" id="sim-people" min="1" value="100" required>
                        </div>
                        <div class="form-group">
                            <label for="sim-frequency">Frequency (times per day):</label>
                            <input type="number" id="sim-frequency" min="1" value="2" required>
                        </div>
                        <div class="form-group">
                            <label for="sim-duration">Duration (hours per use):</label>
                            <input type="number" id="sim-duration" min="0.1" step="0.1" value="0.5" required>
                        </div>
                        <button type="submit">Calculate Impact</button>
                    </form>
                    <div id="simulation-results" class="hidden">
                        <h3>Annual Impact Projection</h3>
                        <div class="metrics">
                            <div class="metric">
                                <div class="metric-value" id="water-savings">0L</div>
                                <div class="metric-label">Water Savings</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value" id="energy-savings">0kWh</div>
                                <div class="metric-label">Energy Savings</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value" id="co2-reduction">0kg</div>
                                <div class="metric-label">CO₂ Reduction</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value" id="tree-equivalent">0</div>
                                <div class="metric-label">Tree Equivalent</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.mainContent.innerHTML = content;
        
        document.getElementById('simulator-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.runSimulation();
        });
    }

    runSimulation() {
        const inputs = {
            people: parseInt(document.getElementById('sim-people').value),
            frequency: parseInt(document.getElementById('sim-frequency').value),
            duration: parseFloat(document.getElementById('sim-duration').value)
        };
        
        const results = dataManager.simulateImpact(inputs);
        
        document.getElementById('water-savings').textContent = `${results.annualWaterSavings.toFixed(0)}L`;
        document.getElementById('energy-savings').textContent = `${results.annualEnergySavings.toFixed(0)}kWh`;
        document.getElementById('co2-reduction').textContent = `${results.annualCo2Reduction.toFixed(1)}kg`;
        document.getElementById('tree-equivalent').textContent = results.treeEquivalent.toFixed(1);
        
        document.getElementById('simulation-results').classList.remove('hidden');
    }

    // Audit snapshot
    showAudit() {
        const analytics = dataManager.getAnalytics(window.ecoTraceApp.currentFilters);
        const content = `
            <div class="section">
                <h2>Environmental Audit Snapshot</h2>
                <div class="audit-report">
                    <div class="report-header">
                        <strong>Report Period:</strong> ${window.ecoTraceApp.currentFilters.timeRange === 'all' ? 'All Time' : 
                            window.ecoTraceApp.currentFilters.timeRange === 'week' ? 'Last Week' :
                            window.ecoTraceApp.currentFilters.timeRange === 'month' ? 'Last Month' : 'Last Year'}
                        ${window.ecoTraceApp.currentFilters.location ? `<br><strong>Location Filter:</strong> ${window.ecoTraceApp.currentFilters.location}` : ''}
                        <br><strong>Generated:</strong> ${new Date().toLocaleString()}
                    </div>
                    <table class="audit-table">
                        <tbody>
                            <tr>
                                <td>Total Issues Reported</td>
                                <td>${analytics.totalIssues}</td>
                            </tr>
                            <tr>
                                <td>Issues Resolved</td>
                                <td>${analytics.resolvedIssues}</td>
                            </tr>
                            <tr>
                                <td>Issues Pending</td>
                                <td>${analytics.pendingIssues}</td>
                            </tr>
                            <tr>
                                <td>Total Water Saved</td>
                                <td>${analytics.waterSaved}L</td>
                            </tr>
                            <tr>
                                <td>Total Energy Saved</td>
                                <td>${analytics.energySaved}kWh</td>
                            </tr>
                            <tr>
                                <td>Total CO₂ Avoided</td>
                                <td>${analytics.co2Avoided.toFixed(1)}kg</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        this.mainContent.innerHTML = content;
    }

    // Setup screens
    showWorkspaceSelection() {
        const content = `
            <div class="section">
                <h2>Select Operating Context</h2>
                <div class="card">
                    <p>Choose the institutional context for this session:</p>
                    <div class="form-group">
                        <button id="workspace-campus" class="workspace-btn">Campus</button>
                        <button id="workspace-society" class="workspace-btn">Residential Society</button>
                        <button id="workspace-municipal" class="workspace-btn">Municipal / Public Area</button>
                    </div>
                </div>
            </div>
        `;
        this.mainContent.innerHTML = content;
        
        // Update user settings display
        this.updateUserSettings(dataManager.getRole(), null);
        
        document.querySelectorAll('.workspace-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                dataManager.setWorkspace(btn.id.split('-')[1]);
                // Check if role is already set (changing workspace)
                const currentRole = dataManager.getRole();
                if (currentRole) {
                    window.ecoTraceApp.initializeApp();
                } else {
                    this.showRoleSelection();
                }
            });
        });
    }

    showRoleSelection() {
        const content = `
            <div class="section">
                <h2>Select Role</h2>
                <div class="card">
                    <p>Choose your role for this session:</p>
                    <div class="form-group">
                        <button id="role-reporter" class="role-btn">Reporter</button>
                        <button id="role-authority" class="role-btn">Authority</button>
                        <button id="role-viewer" class="role-btn">Viewer</button>
                    </div>
                </div>
            </div>
        `;
        this.mainContent.innerHTML = content;
        
        // Update user settings display
        this.updateUserSettings(null, dataManager.getWorkspace());
        
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const role = btn.id.split('-')[1].charAt(0).toUpperCase() + btn.id.split('-')[1].slice(1);
                dataManager.setRole(role);
                window.ecoTraceApp.initializeApp();
            });
        });
    }

    calculateDeviation() {
        const issues = dataManager.getIssues();
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const previousWeek = new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Apply current filters to issues
        let filteredIssues = issues;
        if (window.ecoTraceApp.currentFilters.timeRange) {
            const startDate = new Date();
            switch (window.ecoTraceApp.currentFilters.timeRange) {
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    startDate.setFullYear(1970); // All time
            }
            filteredIssues = issues.filter(issue => new Date(issue.timestamp) >= startDate);
        }
        if (window.ecoTraceApp.currentFilters.location) {
            filteredIssues = filteredIssues.filter(issue => issue.location === window.ecoTraceApp.currentFilters.location);
        }
        
        // Calculate current week issues
        const currentWeekIssues = filteredIssues.filter(issue => new Date(issue.timestamp) >= lastWeek);
        const previousWeekIssues = filteredIssues.filter(issue => {
            const date = new Date(issue.timestamp);
            return date >= previousWeek && date < lastWeek;
        });
        
        // Calculate impact changes (simplified)
        const currentImpact = this.calculatePeriodImpact(currentWeekIssues);
        const previousImpact = this.calculatePeriodImpact(previousWeekIssues);
        
        const waterChange = currentImpact.water - previousImpact.water;
        const energyChange = currentImpact.energy - previousImpact.energy;
        const carbonChange = currentImpact.carbon - previousImpact.carbon;
        
        let status = "System performance stable";
        if (waterChange > 10 || energyChange > 5 || carbonChange > 2) {
            status = "System deviation detected - increased environmental load";
        } else if (waterChange < -10 || energyChange < -5 || carbonChange < -2) {
            status = "System performance improved - reduced environmental load";
        }
        
        return {
            waterChange: Math.round(waterChange),
            energyChange: Math.round(energyChange),
            carbonChange: carbonChange,
            status: status
        };
    }

    calculatePeriodImpact(issues) {
        const calculations = dataManager.getImpactCalculations();
        let water = 0;
        let energy = 0;
        let carbon = 0;
        
        issues.forEach(issue => {
            if (issue.status !== 'Resolved') {
                if (issue.resourceType === 'Water') {
                    water += 100; // Estimated liters per unresolved issue
                    carbon += 100 * calculations.carbon.water;
                } else if (issue.resourceType === 'Electricity') {
                    energy += 10; // Estimated kWh per unresolved issue
                    carbon += 10 * calculations.carbon.electricity;
                }
            }
        });
        
        return { water, energy, carbon };
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        this.mainContent.insertBefore(alert, this.mainContent.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }
}

const uiManager = new UIManager();