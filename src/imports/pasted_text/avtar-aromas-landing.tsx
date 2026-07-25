You are a Senior Full Stack Software Engineer, UI/UX Designer, and System Architect.

Build a COMPLETE production-ready full-stack luxury perfume e-commerce platform.

Brand Name:
AVTAR AROMAS

The website should NOT look like a generic Shopify template.
It should feel like a premium luxury perfume brand similar to Dior, Tom Ford, Jo Malone, Maison Margiela, Le Labo, Byredo, and Aesop while maintaining its own unique identity.

The perfumes sold are handmade, premium quality, artisan perfumes.

The design language should communicate:

• Luxury
• Elegance
• Sophistication
• Premium craftsmanship
• Modern minimalism
• Trust
• Exclusivity

The website should have cinematic animations, premium typography, excellent spacing, immersive scrolling, and outstanding mobile responsiveness.

Avoid clutter.

Use modern UI trends from 2026.

====================================================
TECH STACK
====================================================

Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- GSAP (only where necessary)
- Shadcn UI
- Lucide Icons
- React Hook Form
- Zod
- Zustand
- TanStack Query
- Axios

Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)

Authentication

JWT Authentication

Password hashing using bcrypt

JWT stored inside secure HttpOnly cookies

Refresh Token implementation

Role-based authorization

Roles:
- User
- Admin

Image Storage

Cloudinary

Payments

Razorpay

Email

Resend

Deployment Ready

Frontend → Vercel

Backend → Railway

Database → Supabase

====================================================
DESIGN SYSTEM
====================================================

Create a premium luxury design system.

Primary Colors

Deep Black
Charcoal
Champagne Gold
Ivory
Soft White

Accent

Luxury Gold

Typography

Elegant serif headings

Modern sans-serif body

Rounded corners

Glassmorphism only where tasteful.

Heavy use of whitespace.

Beautiful gradients.

Soft shadows.

Smooth hover animations.

Animated page transitions.

Premium cards.

Micro interactions.

====================================================
LANDING PAGE
====================================================

Generate a breathtaking landing page.

This should feel like a luxury fragrance advertisement.

Hero Section

- Fullscreen cinematic hero
- Beautiful perfume bottle
- Slow floating animations
- Luxury lighting
- Animated gradients
- Elegant typography

Headline example style

"Crafted By Hand.
Remembered Forever."

Subheading

Introduce AVTAR AROMAS as an artisan perfume house creating handcrafted fragrances inspired by timeless elegance.

Primary CTA

Shop Collection

Secondary CTA

Discover Our Story

Add subtle parallax effects.

----------------------------------------------------

Section 2

Brand Story

Explain

Handmade

Natural ingredients

Small batches

Premium oils

Craftsmanship

Elegant imagery.

----------------------------------------------------

Section 3

Featured Collection

Luxury cards.

Hover effects.

Quick View.

Add to Cart.

Wishlist.

----------------------------------------------------

Section 4

Fragrance Families

Floral

Woody

Fresh

Oriental

Aquatic

Citrus

Each category should have beautiful icons and illustrations.

----------------------------------------------------

Section 5

Best Sellers

Animated carousel.

----------------------------------------------------

Section 6

Luxury Experience

Explain

Premium ingredients

Long-lasting fragrance

Handmade

Eco-friendly

Cruelty-free

----------------------------------------------------

Section 7

Testimonials

Animated cards.

Premium design.

----------------------------------------------------

Section 8

Instagram Gallery

Luxury grid.

Hover animations.

----------------------------------------------------

Section 9

Newsletter

Elegant subscription section.

----------------------------------------------------

Footer

Premium footer.

Useful links.

Contact.

Socials.

Policies.

====================================================
SHOP PAGE
====================================================

Product grid.

Beautiful filters.

Categories.

Price filter.

Sort.

Search.

Wishlist.

Quick Add.

Pagination.

Lazy loading.

Responsive.

====================================================
PRODUCT PAGE
====================================================

Large gallery.

Image zoom.

Multiple images.

Fragrance Notes

Top Notes

Heart Notes

Base Notes

Ingredients.

Description.

How to use.

Reviews.

Ratings.

Related Products.

Frequently Bought Together.

Quantity selector.

Wishlist.

Add to Cart.

Buy Now.

Sticky purchase card.

====================================================
CART PAGE
====================================================

Luxury shopping cart.

Coupon.

Gift wrap.

Delivery estimate.

Tax.

Subtotal.

Checkout button.

Suggested products.

====================================================
CHECKOUT FLOW
====================================================

Address

Shipping

Order Summary

Coupon

Payment

Order Confirmation

====================================================
AUTHENTICATION
====================================================

Login

Signup

Forgot Password

Reset Password

Verify Email

Profile

Saved Addresses

Order History

Wishlist

====================================================
ADMIN PANEL
====================================================

Separate admin dashboard.

Dashboard Analytics.

Product CRUD.

Inventory.

Orders.

Coupons.

Banner Management.

Review Moderation.

Customers.

Sales Analytics.

====================================================
DATABASE
====================================================

Use Prisma.

Tables

Users

Products

Categories

Orders

OrderItems

Wishlist

Cart

Addresses

Coupons

Reviews

RefreshTokens

====================================================
BACKEND
====================================================

Architecture

src/

config/

controllers/

routes/

services/

middlewares/

repositories/

validators/

utils/

prisma/

types/

interfaces/

Use Service Layer Architecture.

Use Repository Pattern.

Use Dependency Injection where appropriate.

====================================================
API
====================================================

RESTful APIs

/api/auth

/api/products

/api/categories

/api/orders

/api/cart

/api/wishlist

/api/payment

/api/reviews

/api/admin

====================================================
SECURITY
====================================================

Use production-grade security.

Helmet

CORS

Rate Limiting

Compression

Morgan

XSS Protection

Sanitize Inputs

Prevent SQL Injection

Prevent NoSQL Injection

CSRF Protection where applicable

JWT Authentication

Refresh Tokens

Secure HttpOnly Cookies

Environment Variables

Password Hashing

Role-Based Access

Request Validation using Zod

Global Error Handler

Centralized Logging

API Versioning

Secure File Upload Validation

Maximum Upload Limits

Cloudinary Upload Validation

====================================================
PERFORMANCE
====================================================

Code Splitting

Lazy Loading

Image Optimization

Caching

Pagination

Debounced Search

Compression

Optimized Prisma Queries

====================================================
SEO
====================================================

Dynamic Metadata

OpenGraph

Twitter Cards

JSON-LD

Sitemap

robots.txt

Canonical URLs

====================================================
RESPONSIVENESS
====================================================

Desktop

Laptop

Tablet

Mobile

Everything must be pixel-perfect.

====================================================
ANIMATIONS
====================================================

Use Framer Motion extensively.

Elegant entrance animations.

Fade.

Scale.

Parallax.

Scroll Reveal.

Hover interactions.

Animated buttons.

Animated cards.

Page transitions.

Loading skeletons.

====================================================
CODE QUALITY
====================================================

Use TypeScript everywhere.

Strict typing.

Reusable components.

Reusable hooks.

Proper folder structure.

No duplicated code.

ESLint.

Prettier.

Production-ready code.

====================================================
PROJECT STRUCTURE
====================================================

Generate BOTH frontend and backend in separate folders.

/
frontend

/backend

Include:

README

Installation Guide

Environment Variables

Database Setup

Prisma Schema

Migration Commands

Seed Script

API Documentation

Deployment Instructions

Folder Structure Documentation

====================================================
DELIVERABLE
====================================================

Generate a complete production-ready application with clean architecture, scalable code, modern UI, secure APIs, and a luxury user experience. Do not generate placeholder implementations where real implementations are expected. Build the project incrementally with proper commits or milestones so that every feature is functional and integrated before moving to the next.