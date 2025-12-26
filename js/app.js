// EcoTrace Pro Main Application

class EcoTraceApp {
    constructor() {
        if (window.ecoTraceApp) {
            return; 
        }
        window.ecoTraceApp = this;
        this.workspace = dataManager.getWorkspace();
        this.role = dataManager.getRole();
        this.currentFilters = { timeRange: 'all', location: '' };
        this.init();
    }

    init() {
        
        if (!this.workspace) {
            uiManager.showWorkspaceSelection();
            return;
        }
        if (!this.role) {
            uiManager.showRoleSelection();
            return;
        }
        
        
        this.initializeApp();
    }

    initializeApp() {
        this.workspace = dataManager.getWorkspace();
        this.role = dataManager.getRole();
        
        uiManager.updateNavigation(this.role, this.workspace);
        uiManager.showSection('dashboard', this.role, this.workspace);
        
        // Show impact calculation info
        this.showCalculationInfo();
    }

    showCalculationInfo() {
       
        const calcSection = document.createElement('div');
        calcSection.className = 'section';
        calcSection.innerHTML = `
            <h2>How Impact is Calculated</h2>
            <div class="calc-reference">
                <table class="calc-table">
                    <thead>
                        <tr>
                            <th>Resource</th>
                            <th>Activity</th>
                            <th>Consumption Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td rowspan="5">Water</td>
                            <td>Shower (5 min)</td>
                            <td>50L</td>
                        </tr>
                        <tr>
                            <td>Toilet Flush</td>
                            <td>6L</td>
                        </tr>
                        <tr>
                            <td>Faucet (per minute)</td>
                            <td>9L</td>
                        </tr>
                        <tr>
                            <td>Washing Machine</td>
                            <td>50L</td>
                        </tr>
                        <tr>
                            <td>Dishwasher</td>
                            <td>15L</td>
                        </tr>
                        <tr>
                            <td rowspan="5">Energy</td>
                            <td>Air Conditioning</td>
                            <td>1.5 kWh/hour</td>
                        </tr>
                        <tr>
                            <td>Space Heater</td>
                            <td>1.2 kWh/hour</td>
                        </tr>
                        <tr>
                            <td>Refrigerator</td>
                            <td>0.15 kWh/hour</td>
                        </tr>
                        <tr>
                            <td>Washing Machine</td>
                            <td>0.8 kWh/load</td>
                        </tr>
                        <tr>
                            <td>Dishwasher</td>
                            <td>1.2 kWh/cycle</td>
                        </tr>
                        <tr>
                            <td rowspan="2">Carbon</td>
                            <td>Water Treatment & Distribution</td>
                            <td>0.0003 kg CO₂/L</td>
                        </tr>
                        <tr>
                            <td>Electricity (Average Grid)</td>
                            <td>0.4 kg CO₂/kWh</td>
                        </tr>
                    </tbody>
                </table>
                <p>Impact calculations are deterministic and based on standard industry benchmarks. Each resolved issue contributes a fixed savings amount to the totals.</p>
            </div>
        `;
        
        
        document.getElementById('main-content').appendChild(calcSection);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    window.ecoTraceApp = new EcoTraceApp();
});


window.resetApp = function() {
    dataManager.clearAll();
    location.reload();
};
