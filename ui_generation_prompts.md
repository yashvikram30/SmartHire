# SmartHire Platform - Low-Fidelity UI Generation Prompts

This document contains a comprehensive set of prompts designed for AI UI generators (like v0, Figma AI, Uizard, or Midjourney) to generate low-fidelity wireframes for the **SmartHire** internship platform. 

You can use the **Main Global Prompt** to set the context for the AI, and then use the **Page-Specific Prompts** to generate individual wireframes.

---

## 1. Main Global Context Prompt
*Copy and paste this first to set the context and constraints for the AI.*

> **System Prompt:**
> "Act as an expert UX/UI designer. I need you to generate low-fidelity wireframes for a modern, dual-sided internship hiring platform called 'SmartHire'. The platform connects university students with startups and corporate recruiters, featuring a clean, minimalist, and professional layout. 
> 
> **Design Constraints for Low-Fidelity:**
> - Use a monochrome or grayscale color palette (shades of gray, white, and black) to focus on layout and structure rather than visual design.
> - Use placeholder text (Lorem Ipsum), simple geometric shapes for images/avatars (circles for profiles, rectangles for banners), and standard iconography.
> - Ensure high contrast, clear visual hierarchy, and accessible typography.
> - The design must look like a structured wireframe, omitting complex imagery, brand colors, or detailed illustrations.
> 
> The platform has 3 main user roles: Job Seeker (Student), Recruiter, and Admin. Please acknowledge this context, and I will prompt you for specific pages to generate."

---

## 2. Page-Specific Prompts

### A. Public Pages

**1. Landing Page**
> **Prompt:** "Generate a low-fidelity wireframe for the Landing Page of the SmartHire internship platform. Include the following sections:
> - A top navigation bar with 'Home', 'Jobs', 'About', 'Contact', 'Login', and 'Sign Up' buttons.
> - A hero section with a bold placeholder headline, a short subtext, a 'Search Internships' input bar, and a primary CTA button ('Get Started').
> - A 'Trusted By' section showing 4-5 gray placeholder rectangles for company logos.
> - A 'Features' section highlighting 3 columns with a simple icon, a heading, and a short description for each.
> - A footer with generic links to Privacy, Terms, and Social Media icons. Keep styling minimal and structural."

**2. Authentication (Login/Register)**
> **Prompt:** "Generate a low-fidelity wireframe for a side-by-side Login / Sign Up screen. 
> - The left side should feature a large placeholder graphic or illustration placeholder (a simple gray box with a diagonal line).
> - The right side should have the authentication form card. The card needs: a title, 'Continue with Google/GitHub' placeholder buttons, email and password input fields, a 'Remember me' checkbox, a 'Forgot Password' link, and a main 'Log In / Sign Up' CTA button.
> - Below the button, add a toggle text: 'Don't have an account? Sign up'."

---

### B. Job Seeker (Student) Pages

**3. Job Seeker Dashboard**
> **Prompt:** "Generate a low-fidelity wireframe for the Job Seeker Dashboard. 
> - Include a sidebar navigation with: Dashboard, My Profile, Applications, Saved Jobs, Settings.
> - A top header with a breadcrumb, a notification bell icon, and a user avatar circle.
> - The main content area should have a 'Welcome back' heading.
> - Below the heading, include 3 summary statistic cards (e.g., Active Applications, Saved Jobs, Profile Views).
> - Below that, a two-column layout: The left column showing a list of 'Recent Applications' (with company logo placeholders, job title, and application status tag), and the right column showing 'Recommended Internships' as small cards."

**4. Job Listings & Search**
> **Prompt:** "Generate a low-fidelity wireframe for the Job Search page.
> - Top Navigation bar as standard.
> - A dedicated search header with an input field for 'Job Title/Skill', a 'Location' dropdown, and a 'Search' button.
> - A left sidebar for filters (Checkboxes for Internship Type, Remote/On-site, Stipend Range, Duration).
> - The main right area should display a list of Job Cards. Each card should have a company logo placeholder, Job Title, Company Name, Location, Stipend, and a 'Save' (bookmark) icon. Include simple pagination at the bottom."

---

### C. Recruiter Pages

**5. Recruiter Dashboard**
> **Prompt:** "Generate a low-fidelity wireframe for the Recruiter Dashboard.
> - Sidebar navigation with: Dashboard, Post Job, My Jobs, Applications, Candidate Search, Analytics, Settings.
> - Top header with user avatar and search bar.
> - Main content: A row of 4 KPI cards (Active Listings, Total Applicants, Unreviewed Applications, Interviews Scheduled).
> - Below KPIs, a wide table structue showing 'Recent Job Postings' with columns for Job Title, Date Posted, Status (Active/Closed), and Applicant Count.
> - Quick Action buttons at the top right of the table (e.g., 'Post New Internship')."

**6. Candidate Profile / Application Review View**
> **Prompt:** "Generate a low-fidelity wireframe for a Recruiter viewing a Candidate's Application Detail.
> - Include a 'Back to Applications' link at the top.
> - Left panel (1/3 width): Candidate overview card with avatar, name, university, skills tags, and 'Resume' download button. Additionally, include action buttons: 'Shortlist', 'Reject', 'Message'.
> - Right panel (2/3 width): A tabbed interface (Tabs: Cover Letter, Assessment Results, Experience). Show the content of the default tab as structured text blocks.
> - Ensure the layout looks purely functional, using boxes and lines to represent data."

---

### D. Admin Pages

**7. Admin Dashboard**
> **Prompt:** "Generate a low-fidelity wireframe for a System Admin Dashboard.
> - Sidebar: Dashboard, User Management, Recruiter Verification, Job Moderation, System Settings.
> - Provide a high-level overview interface. 
> - Top section: System Health and Metric Cards (Total Users, Pending Approvals, Reported Jobs).
> - Middle Section: Two placeholder charts (e.g., a bar chart box for 'User Growth' and a pie chart box for 'User Roles').
> - Bottom Section: A 'Pending Actions' list with lines representing unverified recruiters requesting approval, accompanied by 'Approve' and 'Reject' button squares."
