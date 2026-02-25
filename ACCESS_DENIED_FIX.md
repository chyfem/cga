# FIX: "Access denied. This is an admin dashboard."

## The Problem
You're logged in successfully, but the system thinks you're not an admin.

## The Cause
Your user account in Firestore database is missing the "role" field or it's set to the wrong value.

---

## SOLUTION 1: Fix Your User Role in Firebase (Recommended)

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com
2. Open your **chyfem-academy** project

### Step 2: Find Your User
1. Click **Authentication** (left menu)
2. Find your email: `admin@chyfemacademy.edu`
3. **COPY the UID** (long string like: `DxJ8kLmN9pQ2rS3tU4vW5x`)

### Step 3: Update Firestore
1. Click **Firestore Database** (left menu)
2. Click on **users** collection
3. Find the document with your UID
4. Click to edit it
5. Make sure it has this field:
   - Field name: `role`
   - Type: `string`
   - Value: `admin`
6. Click **Update** or **Save**

### Step 4: Clear Session and Login Again
1. Open your website
2. Go to: `your-website-url/debug.html`
3. Click "Clear Session"
4. Go back to login page
5. Login again with: `admin@chyfemacademy.edu`

**Should work now!** ✅

---

## SOLUTION 2: Use the Debug Page

I've created a debug page to help you find the exact problem:

1. Upload the new `debug.html` file to your website
2. Open: `your-website-url/debug.html`
3. It will show you EXACTLY what's wrong
4. Follow the instructions on that page

---

## SOLUTION 3: Create New Admin User (If Above Doesn't Work)

### In Firebase Console:

**Step 1: Create Authentication User**
1. Go to **Authentication**
2. Click "Add user"
3. Email: `admin@chyfemacademy.edu`
4. Password: `YourNewPassword123!`
5. Click "Add user"
6. **COPY THE UID**

**Step 2: Create Firestore Document**
1. Go to **Firestore Database**
2. Click "users" collection (create if doesn't exist)
3. Click "Add document"
4. Document ID: **Paste the UID**
5. Add these fields EXACTLY:

| Field    | Type   | Value                   |
|----------|--------|-------------------------|
| email    | string | admin@chyfemacademy.edu |
| name     | string | Administrator           |
| role     | string | admin                   |
| section  | string | all                     |

6. Click "Save"

**Step 3: Test**
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Go to portal.html
3. Login with new credentials
4. Should work!

---

## Quick Check: Is Your Firestore Document Correct?

Your Firestore `users/[uid]` document should look like this:

```json
{
  "email": "admin@chyfemacademy.edu",
  "name": "Administrator",
  "role": "admin",        ← THIS MUST BE "admin"
  "section": "all"
}
```

**Common Mistakes:**
- ❌ `"role": "administrator"` - WRONG (should be "admin")
- ❌ `"type": "admin"` - WRONG (field name should be "role")
- ❌ Role field missing - WRONG (must have role field)

---

## Still Not Working?

### Method A: Check Browser Console
1. Press **F12** on your keyboard
2. Click **Console** tab
3. Try logging in
4. Look for error messages
5. Send me a screenshot

### Method B: Use Debug Page
1. Upload `debug.html` to your website
2. Open it in browser: `your-url/debug.html`
3. It will tell you EXACTLY what's wrong
4. Screenshot the page and send to me

### Method C: Check These Files
Make sure these files are uploaded to your website:
- ✅ portal.html
- ✅ portal-firebase.js
- ✅ firebase-config.js (with YOUR config)
- ✅ dashboard-admin.html
- ✅ All Firebase SDK scripts loaded

---

## Understanding the Error Message

When you see: **"Access denied. This is an admin dashboard."**

It means:
1. ✅ Login worked (Firebase authenticated you)
2. ✅ Session created (you're logged in)
3. ❌ Role check failed (your role isn't "admin")

The system is checking:
```javascript
if (user.type !== 'admin' && user.role !== 'admin') {
    alert('Access denied');
}
```

So your Firestore document needs `role: "admin"` field!

---

## Need Help?

Send me:
1. Screenshot of Firebase Authentication (your user)
2. Screenshot of Firestore users collection (your document)
3. Screenshot of browser console (F12 → Console)
4. Screenshot of debug.html page

I'll fix it immediately!
