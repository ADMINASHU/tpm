// This is your release history — add a new entry here for each release.
// standard-version will auto-update CHANGELOG.md but we maintain this for the UI.
const releases = [
    {
        version: "0.1.0",
        date: "2026-03-01",
        latest: true,
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
