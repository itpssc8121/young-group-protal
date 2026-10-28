# Young Group Portal — Vercel + Neon starter

## এই প্যাকেজে কী আছে
- `index.html`: আপনার দেওয়া মূল HTML অপরিবর্তিত কপি।
- `api/health.js`: Vercel serverless function দিয়ে Neon connection test.
- `database/schema.sql`: Portal data ও user permissions-এর প্রাথমিক টেবিল।
- `package.json`, `vercel.json`: Vercel function configuration.

## গুরুত্বপূর্ণ সীমাবদ্ধতা
এই প্রথম ধাপটি শুধু project structure ও database connection test প্রস্তুত করে। মূল HTML-এর সব `localStorage`/পুরোনো Supabase call এখনো Neon API-তে migrate করা হয়নি। তাই এখনই live site-এ সব PC-তে shared data হবে—এমন দাবি করা যাবে না। User login/permission API তৈরি ও HTML-এর প্রতিটি module-কে migrate করে test করতে হবে।

## Vercel Drop-এ সরাসরি আপলোডের বদলে Git Repository ব্যবহার করুন
1. ZIP extract করুন।
2. GitHub-এ নতুন private repository বানিয়ে এই ফাইলগুলো upload করুন।
3. Vercel → Add New → Project → ওই repository Import → Deploy.
4. Vercel Project → Settings → Environment Variables-এ `DATABASE_URL` যোগ করুন। Value হবে Neon-এর PostgreSQL connection string; password কাউকে পাঠাবেন না।
5. Redeploy করুন।
6. Deploy হওয়ার পর `https://YOUR-DOMAIN/api/health` খুলুন। `{ "ok": true, "database": "connected" }` এলে connection test সফল।
7. Neon SQL Editor-এ `database/schema.sql`-এর SQL চালান।

## Security
`DATABASE_URL` কখনো `index.html` বা browser JavaScript-এ রাখবেন না। `api/health.js` কেবল connection test করে; এতে এখনো login বা data read/write endpoint নেই। সেগুলো যোগ করার আগে authentication/authorization লাগবে।
