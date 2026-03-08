// This is your release history — add a new entry here for each release.
// standard-version will auto-update CHANGELOG.md but we maintain this for the UI.
const releases = [
    {
        version: "0.2.0",
        date: "2026-03-08",
        latest: true,
        improvements: [
            "Decoupled Architecture: Separated Master Configs from Stock Items/Products",
            "BOM Cost Integration: Automated cost calculation from BOM components",
            "Stock Overview: Weighted average cost display derived from transactions",
            "Assembly Reversal: Automated 'Reverse & Delete' with stock restoration",
            "Database Health: Network-aware monitoring with global UI alerts",
            "CSV Logistics: Enhanced Import with duplicate detection and status badges",
            "Multi-version BOM Support with compound indexing",
            "Real-time Assembly Log with 10s auto-polling",
        ],
        fixes: [
            "Resolved 500 errors in Supplier mapping and assembly validation",
            "Fixed Item valuation errors during serialized assembly production",
            "Corrected 'Unknown' item codes in BOM configuration tables",
        ],
        patches: [
            "Improved connection responsiveness with browser-level listeners",
            "Consistent persistence for buffer levels and descriptions across all config models",
        ],
    },
    {
        version: "0.1.0",
        date: "2026-03-06",
        latest: false,
        improvements: [
            "Initial project scaffold with Next.js 16 App Router",
            "Strict light-mode Tailwind CSS configuration",
            "MongoDB connection utility with caching",
            "NextAuth.js Credentials Provider with JWT (factoryId, role, storeId)",
            "Route protection via proxy.js middleware",
            "Horizontal sticky Navbar with Procurement, Inventory, Production, Logistics, Finance, Setup, Guide links",
            "Footer with dynamic year, version from package.json, and Powered by AASoftLabs branding",
        ],
        fixes: [],
        patches: [
            "Fixed Next.js 16 build errors by using dynamic route exports (force-dynamic)",
            "Resolved Google Fonts fetch timeout by removing server-side font loading",
        ],
    },
];

export default releases;
