# Fabrio Hardware - Enterprise ERP Platform

A comprehensive B2B enterprise resource planning system for industrial hardware distribution, featuring a complete e-commerce platform, admin dashboard, and ERP capabilities.

## Features

### Public E-Commerce Platform
- **Product Catalog**: Browse 1000+ industrial hardware products across multiple categories
- **Smart Shopping Cart**: Persistent cart with Zustand state management
- **Customer Accounts**: User registration and authentication with Better Auth
- **Order Management**: Complete order tracking and history
- **Wishlist**: Save favorite products for later
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Admin Dashboard
- **Dashboard Overview**: Real-time statistics and KPIs
- **Product Management**: Full CRUD operations for product inventory
- **Order Management**: Track and manage all customer orders with status updates
- **Quotation System**: Create, send, and manage quotations for bulk orders
- **Customer Management**: Complete customer database with credit management
- **Inventory Tracking**: Multi-warehouse inventory management with low-stock alerts

### Business Features
- **Multi-Warehouse Support**: Manage inventory across 3+ warehouse locations
- **Supplier Management**: Track suppliers and lead times
- **Customer Tiers**: Support for different customer types (retail, wholesale, enterprise)
- **Bulk Pricing**: Wholesale pricing tiers based on volume
- **Payment Processing**: Stripe integration for secure payments
- **Invoice Management**: Automated invoice generation
- **Analytics**: Sales metrics and business intelligence

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management for cart
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

### Backend & Database
- **PostgreSQL** (Neon) - Primary database
- **Prisma** - ORM and schema management
- **Better Auth** - Authentication system
- **Node.js/Next.js API Routes** - RESTful backend

### Payments & External Services
- **Stripe** - Payment processing with webhook support
- **Vercel** - Deployment platform

## Database Schema

The system includes 17+ interconnected entities:

- **Users & Authentication**: `User`, `Account`, `Session`, `Verification`
- **E-Commerce**: `Customer`, `Product`, `Category`, `Order`, `OrderItem`, `Wishlist`
- **Business**: `Quotation`, `QuotationItem`, `Invoice`, `Payment`
- **Supply Chain**: `Supplier`, `PurchaseOrder`
- **Inventory**: `Warehouse`, `Inventory`

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── admin/                 # Admin dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Dashboard overview
│   │   ├── products/
│   │   ├── orders/
│   │   ├── quotations/
│   │   └── customers/
│   ├── auth/
│   │   ├── login/            # Login page
│   │   └── signup/           # Registration page
│   ├── api/                  # API routes
│   │   ├── auth/[...auth]/
│   │   ├── orders/
│   │   ├── quotations/
│   │   ├── customers/
│   │   ├── inventory/
│   │   └── webhooks/stripe/
│   ├── products/             # Product catalog
│   ├── cart/                 # Shopping cart
│   ├── checkout/             # Checkout flow
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/
│   ├── navbar.tsx            # Navigation
│   ├── footer.tsx            # Footer
│   └── products/
│       └── product-grid.tsx
├── lib/
│   ├── auth.ts               # Better Auth config
│   ├── auth-client.ts        # Auth client utilities
│   ├── db.ts                 # Prisma client
│   └── store/
│       └── cart.ts           # Zustand cart store
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.js               # Sample data seeding
└── package.json              # Dependencies
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon)
- Stripe account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure `.env.local`:
   ```
   DATABASE_URL=postgresql://...
   NEON_AUTH_COOKIE_SECRET=<generated-secret>
   STRIPE_SECRET_KEY=sk_...
   STRIPE_PUBLISHABLE_KEY=pk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Seed sample data (optional):
   ```bash
   node prisma/seed.js
   ```

7. Start the development server:
   ```bash
   pnpm dev
   ```

8. Open http://localhost:3000 in your browser

## Demo Credentials

**Admin Account:**
- Email: `admin@fabrio.com`
- Password: `admin123`

**Customer Account:**
- Email: `john@company.com`
- Password: `customer`

## Key Features Implementation

### Authentication
- Email/password authentication via Better Auth
- Session-based authentication
- Role-based access control (admin/customer)

### Shopping Experience
- Product browsing with category filtering
- Add to cart with persistent storage
- Wishlist functionality
- Checkout with address validation
- Stripe payment integration

### Admin Operations
- Real-time dashboard with KPIs
- Product inventory management
- Order status tracking
- Quotation generation for bulk orders
- Multi-warehouse inventory tracking
- Customer credit management

### API Endpoints

**Authentication**
- `POST /api/auth/[...auth]` - Better Auth endpoints

**Orders**
- `POST /api/orders` - Create new order with Stripe payment

**Quotations**
- `POST /api/quotations` - Create quotation
- `PUT /api/quotations` - Update quotation status

**Inventory**
- `GET /api/inventory` - Get inventory levels
- `PUT /api/inventory` - Update stock quantities

**Customers**
- `GET /api/customers` - Get customer profile
- `PUT /api/customers` - Update customer info

**Payments**
- `POST /api/webhooks/stripe` - Handle payment webhooks

## Deployment

Deploy to Vercel with one click:

```bash
vercel deploy
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Security Features

- ✓ Password hashing with Better Auth
- ✓ CSRF protection with Next.js
- ✓ Secure session management
- ✓ SQL injection prevention via Prisma
- ✓ PCI compliance via Stripe
- ✓ Environment variable management
- ✓ API rate limiting ready
- ✓ Input validation on all forms

## Performance Optimizations

- Server-side rendering for fast page loads
- Database query optimization with Prisma
- Client-side cart state management
- Lazy loading of images and components
- CSS minification with Tailwind

## Future Enhancements

- Real-time order tracking with WebSockets
- Advanced analytics and reporting
- EDI integration for large customers
- Automated purchase order generation
- Inventory forecasting with ML
- Multi-language support
- Advanced search with Elasticsearch
- Mobile app with React Native

## Support

For issues or questions, please open a GitHub issue or contact support@fabrio.com

## License

Proprietary - Fabrio Hardware Corporation

---

**Built with Vercel, Next.js, and Prisma**
