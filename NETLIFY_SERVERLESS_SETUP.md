# 🚀 Netlify Serverless Backend Setup - COMPLETE GUIDE

## ✅ What I Just Set Up For You

I've converted your Express.js backend to **Netlify Serverless Functions** so EVERYTHING (frontend + backend) runs on Netlify!

### Files Created/Modified:

1. ✅ `netlify.toml` - Netlify configuration
2. ✅ `netlify/functions/api.js` - Serverless wrapper for your Express app
3. ✅ Installed backend dependencies in root package.json

---

## 🔧 Setup Instructions (5 Minutes)

### Step 1: Configure Environment Variables in Netlify

Go to: **Netlify Dashboard** → **Site Settings** → **Environment Variables**

Add these variables:

| Variable Name   | Value                                | Example                                                      |
| --------------- | ------------------------------------ | ------------------------------------------------------------ |
| **MONGODB_URI** | Your MongoDB Atlas connection string | `mongodb+srv://username:password@cluster.mongodb.net/dbname` |
| **JWT_SECRET**  | Any random secret string             | `my-super-secret-jwt-key-12345`                              |
| **NODE_ENV**    | `production`                         | `production`                                                 |

#### How to Get MongoDB Atlas URI:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click your cluster → **Connect** → **Connect your application**
3. Copy the connection string (looks like `mongodb+srv://...`)
4. Replace `<password>` with your actual database password
5. Replace `<dbname>` with your database name (e.g., `student-task-tracker`)

**Example MongoDB URI:**

```
mongodb+srv://devesh:mypassword123@cluster0.mongodb.net/student-task-tracker?retryWrites=true&w=majority
```

### Step 2: Update Your Local Environment (Optional)

If you want to test locally with the Netlify setup, create/update `.env.local`:

```env
VITE_API_URL=/api
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Step 3: Commit and Push

```bash
git add .
git commit -m "feat: add Netlify serverless functions for backend"
git push origin main
```

Netlify will automatically:

1. Build your React app
2. Deploy serverless functions
3. Connect everything together

---

## 🎯 How It Works

### Before (2 Separate Deployments):

```
User → Netlify (Frontend) → External Server (Backend) → MongoDB
```

### Now (1 Deployment):

```
User → Netlify (Frontend + Serverless Backend) → MongoDB Atlas
```

### URL Structure:

- **Frontend**: `https://studenttasky.netlify.app/`
- **Backend API**: `https://studenttasky.netlify.app/api/*`
- **Example**: `https://studenttasky.netlify.app/api/auth/login`

The `netlify.toml` file redirects all `/api/*` requests to your serverless function!

---

## 🧪 Testing After Deployment

### 1. Check Health Endpoint

Visit: `https://studenttasky.netlify.app/api/health`

Should show:

```json
{
  "status": "ok",
  "mongodb": "connected",
  "timestamp": "2026-01-29T..."
}
```

### 2. Test Registration

1. Go to: `https://studenttasky.netlify.app/`
2. Click **Register**
3. Create an account
4. It should work! ✅

### 3. Test Login

1. Login with your credentials
2. Create a task
3. Refresh page - task should persist

---

## 🐛 Troubleshooting

### Issue: "MongoDB connection error"

**Check:**

- ✅ `MONGODB_URI` is set in Netlify env variables
- ✅ MongoDB Atlas allows connections from anywhere (IP whitelist: `0.0.0.0/0`)
- ✅ Username/password in connection string are correct

**How to Fix IP Whitelist:**

1. MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (or add `0.0.0.0/0`)

### Issue: "JWT is not defined"

**Check:**

- ✅ `JWT_SECRET` is set in Netlify env variables

### Issue: "Function timeout"

**Cause:** Cold start (first request takes longer)  
**Solution:** This is normal. Subsequent requests will be fast.

### Issue: "API endpoints return 404"

**Check:**

- ✅ `netlify.toml` is in the root directory
- ✅ Rebuild the site in Netlify
- ✅ Check Netlify function logs

---

## 📊 Advantages of This Setup

### ✅ Pros:

- **Single Deployment**: Everything in one place
- **Free Tier**: Netlify Functions has generous free tier
- **Auto-scaling**: Handles traffic automatically
- **HTTPS**: Built-in SSL certificate
- **CI/CD**: Auto-deploy on git push

### ⚠️ Limitations:

- **Cold Starts**: First request after inactivity may be slow (~2-3 seconds)
- **Timeout**: Functions timeout after 10 seconds (Netlify free tier)
- **Memory**: 1GB RAM limit per function

For 99% of student projects, these limitations are fine!

---

## 🔐 MongoDB Atlas Setup Checklist

Make sure your MongoDB Atlas is configured:

- [ ] Cluster created
- [ ] Database user created (with password)
- [ ] IP Whitelist allows `0.0.0.0/0` (all IPs)
- [ ] Database name matches your connection string
- [ ] Connection string copied to Netlify env

---

## 📝 Environment Variables Checklist

In Netlify Dashboard → Environment Variables:

- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Random secret key
- [ ] `NODE_ENV` - Set to `production`

---

## 🚀 Final Steps

1. **Add Environment Variables** (see Step 1 above)
2. **Commit and Push** (see Step 3 above)
3. **Wait for Deploy** (~2-3 minutes)
4. **Test the app** (see Testing section)

---

## ✨ What's Different Now?

### Local Development (No Change):

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm start
```

### Production (Now Everything on Netlify):

- Just push to GitHub
- Netlify handles everything automatically
- No separate backend deployment needed!

---

## 🎉 Success!

Once you add the MongoDB URI and push to GitHub, your ENTIRE app will be running on Netlify!

Visit: **https://studenttasky.netlify.app/**

Everything should work:

- ✅ Registration
- ✅ Login
- ✅ Create/Edit/Delete tasks
- ✅ Guest mode
- ✅ AI features (if API key configured)

---

## 📚 Additional Resources

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Serverless HTTP Package](https://www.npmjs.com/package/serverless-http)

---

**You're all set! 🎉 Just add those environment variables in Netlify and push to GitHub!**
