# EcoTrace Pro

EcoTrace Pro is a straightforward tool for checking and understanding sustainability
in shared environments such as **campuses, residential societies, and public areas**.
It focuses mainly on **water and electricity usage**, keeping things simple so that
waste is easier to notice, track, and act on.

In shared spaces, problems like leaking taps or unnecessary energy use often go
unnoticed because no one clearly sees the bigger picture. EcoTrace Pro tries to
solve that by improving **visibility and accountability** at a system level.

---

## How It Works

The entire application runs **directly in the browser**.  
There are:
- no servers,
- no user accounts,
- and no data sent anywhere.

All information stays on the user’s device using browser storage, which keeps privacy
intact. The app also works **completely offline**.

Unlike AI-based tools that hide how results are produced, EcoTrace Pro relies on
**simple, rule-based calculations**. The assumptions used for impact calculations
are visible and fixed, so anyone can understand where the numbers come from.
This makes the system easier to trust and reason about.

---

## Approach to Sustainability

Waste in common areas often happens not because people don’t care, but because it is
hard to see. A slow drip, lights left on, or inefficient usage usually slips by without
being reported.

EcoTrace Pro treats sustainability as an **engineering and system-level problem**,
not a competition between individuals. The goal is to reduce waste without blame,
by making patterns and outcomes clear.

---

## Getting Started

When the app opens, the user first selects the **context**:
- Campus
- Residential Society
- Municipal / Public Area

This choice affects the language used in the app, the workflows that appear, and the
types of analysis available.

For each session, the user also selects a **role**:
- **Reporter** – logs issues and views their impact
- **Authority** – updates issue status and reviews performance
- **Viewer** – views dashboards in read-only mode

There are no passwords or logins. Roles exist only for the current session.

---

## Reporting and Tracking Issues

Users can report:
- water-related issues (leaks, excessive use),
- electricity-related issues (unnecessary usage, faulty appliances).

Each report includes:
- a location,
- a severity level,
- and a timestamp.

For campuses and residential societies, issues move through:
- Reported → Acknowledged → In Progress → Resolved

For public or municipal areas:
- Reported → Forwarded → Status Pending

From this, the app shows how long issues take to resolve and who is responsible at
each stage.

---

## Impact Calculations and Dashboard

All impact calculations use **fixed benchmark values**.
There are no adaptive models or hidden formulas.

The dashboard brings together system-level information such as:
- total issues reported,
- resolved versus pending issues,
- water saved,
- energy saved,
- CO₂ avoided.

All views remain **aggregate-only**, with no individual comparisons.

---

## Analysis and Insights

For authority roles, the app highlights:
- locations with repeated problems,
- areas with large unresolved impacts,
- average resolution times.

If performance declines, EcoTrace Pro shows the **additional load** added back to the
system in terms of water, energy, and carbon, compared against a baseline. This is
presented as a system shift, not a personal failure.

---

## What-If Simulation and Audit Snapshots

The app includes a **what-if simulator** that allows users to explore scenarios such as:
- what happens if a large group reduces water usage slightly each day,
- how small changes add up over a year.

This is meant for **planning and awareness**, not daily monitoring.

EcoTrace Pro can also generate **snapshot reports** for a selected time period,
summarizing total impact, open issues, and key problem areas. These are intended as
internal summaries, not social posts.

---

## Technical Notes

- All data is stored locally in the browser
- The app works without an internet connection
- No backend servers or APIs are used
- No user accounts or authentication
- No AI or machine learning involved

These choices are intentional and support the privacy-first design.

---

## Impact Benchmarks Used

### Water
- 5-minute shower: 50 liters  
- Toilet flush: 6 liters  
- Faucet: 9 liters per minute  
- Washing machine: 50 liters per load  
- Dishwasher: 15 liters per cycle  

### Energy
- Air conditioning: 1.5 kWh per hour  
- Space heater: 1.2 kWh per hour  
- Refrigerator: 0.15 kWh per hour  
- Washing machine: 0.8 kWh per load  
- Dishwasher: 1.2 kWh per cycle  

### Carbon
- Water treatment & distribution: 0.0003 kg CO₂ per liter  
- Electricity (average grid): 0.4 kg CO₂ per kWh  

All calculations are deterministic and consistent.

---

## Usage

1. Open `index.html` in a modern web browser  
2. Select the operational context  
3. Choose a role for the session  
4. Navigate through dashboards, issue tracking, analysis, and simulation views  

---

## Browser Requirements

Works in modern browsers that support:
- LocalStorage
- ES6+ JavaScript
- CSS Grid and Flexbox

---

## Resetting the App

Since everything is stored locally:
1. Open browser developer tools  
2. Go to the Console tab  
3. Run the function `resetApp()`

---

## Design Philosophy

The interface is intentionally:
- minimal,
- neutral,
- information-focused.

There are no animations, gamification elements, or flashy visuals.  
The emphasis is on clarity, reliability, and trust.

---

## Final Note

EcoTrace Pro focuses on sustainability through **honest data and system-wide
accountability**, without hype or hidden logic.

It may feel simple to some, but for shared environments where waste is usually
invisible, that transparency is exactly the point.


--

##Check our fully working website:
https://green-tech-wheat.vercel.app/
