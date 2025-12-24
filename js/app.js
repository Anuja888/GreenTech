// EcoTrace Pro Main Application

class EcoTraceApp {
    constructor() {
        if (window.ecoTraceApp) {
            return; // Prevent re-initialization
        }
        window.ecoTraceApp = this;
        this.workspace = dataManager.getWorkspace();
        this.role = dataManager.getRole();
        this.init();
    }

    init() {
        // Check if workspace and role are set
        if (!this.workspace) {
            uiManager.showWorkspaceSelection();
            return;
        }
        if (!this.role) {
            uiManager.showRoleSelection();
            return;
        }
        
        // Both are set, initialize the app
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
        // Add a section explaining calculations
        const calcSection = document.createElement('div');
        calcSection.className = 'section';
        calcSection.innerHTML = `
            <h2>How Impact is Calculated</h2>
            <div class="card">
                <h3>Water Impact</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Activity</th>
                            <th>Liters per Use</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Shower (5 min)</td><td>50L</td></tr>
                        <tr><td>Toilet Flush</td><td>6L</td></tr>
                        <tr><td>Faucet (per minute)</td><td>9L</td></tr>
                        <tr><td>Washing Machine</td><td>50L</td></tr>
                        <tr><td>Dishwasher</td><td>15L</td></tr>
                    </tbody>
                </table>
                
                <h3>Energy Impact</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Appliance</th>
                            <th>kWh per Hour</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Air Conditioning</td><td>1.5 kWh</td></tr>
                        <tr><td>Space Heater</td><td>1.2 kWh</td></tr>
                        <tr><td>Refrigerator</td><td>0.15 kWh</td></tr>
                        <tr><td>Washing Machine</td><td>0.8 kWh</td></tr>
                        <tr><td>Dishwasher</td><td>1.2 kWh</td></tr>
                    </tbody>
                </table>
                
                <h3>Carbon Emissions</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Source</th>
                            <th>Emission Factor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Water Treatment & Distribution</td><td>0.0003 kg CO₂ per liter</td></tr>
                        <tr><td>Electricity (Average Grid)</td><td>0.4 kg CO₂ per kWh</td></tr>
                    </tbody>
                </table>
                
                <p><em>All calculations are based on standard industry benchmarks and are deterministic. No predictions or AI-generated estimates are used.</em></p>
            </div>
        `;
        
        // Insert after main content
        document.getElementById('main-content').appendChild(calcSection);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ecoTraceApp = new EcoTraceApp();
});

// For development/testing: Add a reset function
window.resetApp = function() {
    dataManager.clearAll();
    location.reload();
};