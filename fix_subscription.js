const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'server/storage.ts');
const content = fs.readFileSync(filePath, 'utf8');

const updatedContent = content
  // Fix getSubscription return type
  .replace(
    /return {\s+id: sub\.id,\s+userId: sub\.user_id,\s+tier: sub\.tier,\s+startDate: sub\.start_date,\s+endDate: sub\.end_date,\s+stripeCustomerId: sub\.stripe_customer_id,\s+stripeSubscriptionId: sub\.stripe_subscription_id,\s+active: sub\.status === "active",\s+createdAt: sub\.created_at,\s+updatedAt: sub\.updated_at\s+} as Subscription;/g,
    `return {
        id: sub.id,
        userId: sub.user_id,
        tier: sub.tier,
        status: sub.status,
        listingLimit: sub.listing_limit,
        startDate: sub.start_date,
        endDate: sub.end_date,
        stripeCustomerId: sub.stripe_customer_id,
        stripeSubscriptionId: sub.stripe_subscription_id,
        createdAt: sub.created_at
      };`
  );

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('File updated successfully');
