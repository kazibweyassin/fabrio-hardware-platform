# Deployment Guide - Fabrio Hardware Platform

## Production Deployment on Vercel

This guide covers deploying the Fabrio Hardware Platform to Vercel for production use.

### Prerequisites

- GitHub repository connected to Vercel
- Neon PostgreSQL database configured
- Stripe account with API keys
- Environment variables set up

### Step 1: Environment Variables

Set the following environment variables in Vercel project settings:

```
DATABASE_URL=postgresql://user:password@host/dbname
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=production
```

### Step 2: Database Migration

Run migrations on production database:

```bash
npx prisma migrate deploy
```

### Step 3: Build & Deploy

Vercel will automatically:
1. Install dependencies
2. Run build process
3. Deploy to production
4. Set up SSL certificates

### Step 4: Configure Stripe Webhook

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook signing secret to Vercel env vars

### Step 5: Verify Deployment

1. Test homepage loads correctly
2. Test signup/login flow
3. Test add to cart functionality
4. Process test payment with Stripe test card
5. Check admin dashboard access

## Performance Optimization

- Images are optimized via Next.js Image component
- Database queries are indexed for common filters
- API routes use caching headers
- Static assets are cached by CDN

## Monitoring

- Check Vercel Analytics for performance metrics
- Monitor database connection pool
- Set up Stripe webhook failure alerts
- Use Vercel's real-time logs for debugging

## Maintenance

### Database Backups

Neon provides automated backups. Verify in Neon dashboard.

### Security

- Enable HTTPS (automatic on Vercel)
- Review CORS settings if using external APIs
- Rotate Stripe API keys periodically
- Keep dependencies updated

### Updates

To deploy updates:
1. Push to main branch
2. Vercel automatically builds and deploys
3. Run migrations if schema changed: `npx prisma migrate deploy`

## Troubleshooting

**Database connection fails:**
- Verify DATABASE_URL is correct in Vercel env
- Check Neon IP whitelist settings
- Ensure migrations ran successfully

**Stripe payments not processing:**
- Verify STRIPE_SECRET_KEY is set
- Check webhook signing secret
- Review Stripe dashboard for errors

**Slow API responses:**
- Check database query performance
- Review Vercel Analytics
- Consider adding indexes to frequently queried fields
