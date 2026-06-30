# UI/UX Specification & Frontend Architecture: Homepage
**Project**: Construction Labour Management System (CLMS)  
**Role**: Senior UI/UX Designer & Frontend Architect

---

## 1. Visual Mockup

A custom generated mockup of the SaaS landing page design can be viewed in the project artifact files. It displays a dark navy and orange theme, custom layout sections, and isometric construction elements.

---

## 2. Section Hierarchy (User Flow)

The landing page layout is structured to guide a prospective B2B buyer (Construction Executive, Site Owner, or HR Director) through a logical journey:

```
┌────────────────────────────────────────────────────────┐
│ 1. Sticky Navigation Header                            │
├────────────────────────────────────────────────────────┤
│ 2. Hero Section (Headline, Sub-copy, CTAs, Dashboard)   │
├────────────────────────────────────────────────────────┤
│ 3. Social Proof / Trusted Construction Partners        │
├────────────────────────────────────────────────────────┤
│ 4. Core Value Modules (Feature Grid)                   │
├────────────────────────────────────────────────────────┤
│ 5. How It Works (Step-by-step Interactive Timeline)    │
├────────────────────────────────────────────────────────┤
│ 6. Interactive Dashboard Preview Widget                │
├────────────────────────────────────────────────────────┤
│ 7. Business Benefits ("Why Choose Us")                 │
├────────────────────────────────────────────────────────┤
│ 8. Real-time Analytics Showcase                        │
├────────────────────────────────────────────────────────┤
│ 9. Customer Testimonials & Reviews                     │
├────────────────────────────────────────────────────────┤
│ 10. Frequently Asked Questions (FAQ Accordion)         │
├────────────────────────────────────────────────────────┤
│ 11. Final Call To Action (Free Trial Offer)            │
├────────────────────────────────────────────────────────┤
│ 12. Corporate Footer                                   │
└────────────────────────────────────────────────────────┘
```

---

## 3. React Component Hierarchy

This design maps to the client structure under `client/src/modules/dashboard/pages/LandingPage.jsx`:

```text
LandingPage (Page Container)
├── StickyNavbar (Shared Component)
│   ├── Logo (SVG)
│   ├── NavigationLinks (Desktop menu / Mobile slide-out drawer)
│   └── ActionButtons (Login, Sign-up)
├── HeroSection
│   ├── HeroContent (Headline, Sub-heading, CTA Group)
│   └── HeroIllustration (Responsive isometric SVG/3D animation)
├── TrustedPartners (Horizontal marquee / grayscale logos)
├── FeatureSection
│   ├── SectionHeader (Title, Sub-title)
│   └── FeatureGrid
│       └── FeatureCard (Icon, Title, Description, Hover Effect)
├── Workflows (Connected step timeline)
│   └── WorkflowStep (Number, Graphic, Description)
├── DashboardPreview (Simulated App Shell)
│   ├── PreviewSidebar
│   ├── PreviewNavbar
│   └── PreviewGrid
│       ├── StatWidget (Mini metrics counter)
│       ├── ChartWidget (Mini Line/Bar chart mockup)
│       └── ActivityWidget (Log list)
├── BenefitsSection
│   └── BenefitCard (Benefit Icon, Title, Narrative)
├── AnalyticsShowcase
│   ├── Tabs (Attendance, Expenses, Labour)
│   └── ActiveChart (Recharts component simulating realistic trends)
├── Testimonials
│   └── TestimonialCarousel
│       └── TestimonialCard (Quote, Avatar, Rating, Role)
├── FAQAccordion
│   └── FAQItem (Toggle-able header & body details)
├── FinalCTA (Orange-to-Slate gradient banner with button)
└── Footer (Shared Component)
```

---

## 4. Suggested Directory Structure for the Homepage

To keep development clean, the home/landing page components are isolated inside the `dashboard` module:

```text
client/src/modules/dashboard/
├── components/
│   ├── HeroSection.jsx
│   ├── TrustedPartners.jsx
│   ├── FeatureGrid.jsx
│   ├── WorkflowTimeline.jsx
│   ├── PreviewDashboard.jsx
│   ├── AnalyticsShowcase.jsx
│   └── FAQSection.jsx
├── pages/
│   └── LandingPage.jsx
└── styles/
    └── landingPage.css
```

---

## 5. UI/UX Design Decisions

* **Color Palette Strategy**:
  - **Construction Orange (`#F97316`)**: Reserved exclusively for Primary Calls-to-Action (CTAs) and active status indicators. Prevents visual clutter.
  - **Slate Gray (`#334155`)**: Used for primary copy and structural containers, providing a solid contrast.
  - **Glassmorphism**: Applied on the `StickyNavbar` and floating `HeroIllustration` widgets with `backdrop-filter: blur(12px)` and subtle white borders (`border: 1px solid rgba(255,255,255,0.15)`).
* **Typography**:
  - **Headings**: `Outfit` or `Plus Jakarta Sans` for modern geometric authority.
  - **Body Copy**: `Inter` for clarity across all display resolutions.

---

## 6. Responsive Adaptive Grid Settings

* **Large Desktop (1440px+)**: Max-width container at `1280px` (`max-w-7xl mx-auto px-8`). Isometric illustration aligned side-by-side with hero copy.
* **Tablet (768px - 1024px)**: Transition blocks to `2-column` grids. The illustration scales down and stacks beneath the primary hero heading to prevent cramped text.
* **Mobile (under 768px)**: Simple `1-column` stack. Navigation switches to a full-screen slide-out mobile menu. Touch target areas for buttons are expanded to a minimum of `48px`.
