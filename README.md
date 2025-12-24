# EcoTrace Pro

A sustainability auditing and impact-tracking platform for institutions.

## Features

- **Institutional Workspace Selection**: Choose between Campus, Residential Society, or Municipal/Public Area contexts
- **Role-Based Access**: Reporter, Authority, or Viewer roles
- **Resource Waste Reporting**: Report water and electricity issues with location and severity
- **Issue Lifecycle Tracking**: Follow issues through their resolution process
- **Rule-Based Impact Calculation**: Deterministic calculations for environmental impact
- **Community Impact Dashboard**: Aggregate metrics without individual comparison
- **Sustainability Performance Analysis**: Hotspot identification and performance metrics
- **What-If Impact Simulator**: Planning tool for scaled scenarios
- **Environmental Audit Snapshot**: Structured summary reports

## Technical Details

- **Privacy-First**: All data stored locally in browser LocalStorage
- **Offline-Capable**: Works completely offline
- **Rule-Based**: No AI or machine learning, only deterministic calculations
- **No Accounts**: Session-based roles, no authentication required

## Impact Calculations

### Water Impact
- Shower (5 min): 50 liters
- Toilet flush: 6 liters
- Faucet (per minute): 9 liters
- Washing machine: 50 liters per load
- Dishwasher: 15 liters per cycle

### Energy Impact
- Air conditioning: 1.5 kWh per hour
- Space heater: 1.2 kWh per hour
- Refrigerator: 0.15 kWh per hour
- Washing machine: 0.8 kWh per load
- Dishwasher: 1.2 kWh per cycle

### Carbon Emissions
- Water treatment & distribution: 0.0003 kg CO₂ per liter
- Electricity (average grid): 0.4 kg CO₂ per kWh

## Usage

1. Open `index.html` in a web browser
2. Select your institutional context
3. Choose your role for the session
4. Use the navigation to access different features

## Browser Compatibility

Works in all modern browsers that support:
- LocalStorage
- ES6+ JavaScript
- CSS Grid and Flexbox

## Data Storage

All data is stored locally in the browser. To reset the application:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Run: `resetApp()`

## Design Principles

- Minimal, neutral interface
- Grayscale with muted greens and soft blues
- Flat UI design
- Clear typography
- Functional spacing
- Serious, institutional appearance