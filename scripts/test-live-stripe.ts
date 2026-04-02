
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function verifyLiveConnections() {
    console.log("--- FICO Geek Live Connectivity Audit ---");
    
    // 1. STRTIPE AUDIT
    console.log("\n[Stripe] Checking Connectivity...");
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
            apiVersion: '2024-04-10' as any,
        });

        const account = await stripe.accounts.retrieve();
        console.log(`✅ Stripe Secret Key Verified: ${account.email} (${account.id})`);

        // Check Price IDs
        const premiumPrice = await stripe.prices.retrieve(process.env.STRIPE_PREMIUM_PRICE_ID!);
        console.log(`✅ Premium Price ID Found: ${premiumPrice.id} (${(premiumPrice.unit_amount! / 100).toFixed(2)} ${premiumPrice.currency.toUpperCase()})`);

        const proPrice = await stripe.prices.retrieve(process.env.STRIPE_PRO_PRICE_ID!);
        console.log(`✅ Pro Price ID Found: ${proPrice.id} (${(proPrice.unit_amount! / 100).toFixed(2)} ${proPrice.currency.toUpperCase()})`);

    } catch (err: any) {
        console.error(`❌ Stripe Error: ${err.message}`);
    }

    // 2. FIREBASE ADMIN AUDIT
    console.log("\n[Firebase] Checking Admin SDK...");
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_SERVER_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        }
        
        const db = admin.firestore();
        const profilesCount = (await db.collection('profiles').limit(1).get()).size;
        console.log(`✅ Firebase Admin Verified. Accessible profiles found: ${profilesCount > 0 ? 'Yes' : 'No (empty collection)'}`);

    } catch (err: any) {
        console.error(`❌ Firebase Admin Error: ${err.message}`);
    }

    console.log("\n--- Audit Complete ---");
}

verifyLiveConnections().catch(console.error);
