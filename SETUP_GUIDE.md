# Step-by-Step Firebase Setup Guide

Follow these exact steps to get your Chyfem Academy website online with a working database.

## Phase 1: Set Up Firebase (15 minutes)

### Step 1: Create Firebase Account
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name it: **chyfem-academy**
4. Disable Google Analytics (not needed for now)
5. Click "Create project"

### Step 2: Add Web App
1. In your Firebase project, click the **</>** (web) icon
2. Register app name: **Chyfem Academy Portal**
3. Click "Register app"
4. **IMPORTANT**: Copy the firebaseConfig code that appears
5. Keep this page open - you'll need this code

### Step 3: Enable Authentication
1. In Firebase console, click **Authentication** in left menu
2. Click "Get started"
3. Click "Email/Password" under Sign-in method
4. Toggle "Enable"
5. Click "Save"

### Step 4: Create Firestore Database
1. Click **Firestore Database** in left menu
2. Click "Create database"
3. Select "Start in test mode" (we'll secure it later)
4. Choose location: **europe-west** (closest to Nigeria)
5. Click "Enable"

### Step 5: Add Security Rules
1. In Firestore, click "Rules" tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Students can read their own data
    match /students/{studentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher'];
    }
    
    // Everyone can read announcements
    match /announcements/{announcementId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher'];
    }
    
    // Teachers and admins can manage assignments
    match /assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher'];
    }
    
    // All authenticated users can read/write their submissions
    match /submissions/{submissionId} {
      allow read, write: if request.auth != null;
    }
    
    // Payments readable by related users
    match /payments/{paymentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin'];
    }
  }
}
```

3. Click "Publish"

---

## Phase 2: Update Your Website Files (10 minutes)

### Step 6: Update firebase-config.js

1. Open the `firebase-config.js` file
2. Find this section at the top:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Replace with YOUR config from Step 2 (Firebase gave you this)
4. Save the file

### Step 7: Update HTML Files

Add these lines **before the closing `</body>` tag** in these files:
- portal.html
- dashboard-student.html
- dashboard-teacher.html
- dashboard-parent.html
- dashboard-admin.html

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

<!-- Firebase Config -->
<script src="firebase-config.js"></script>

<!-- Replace portal.js with portal-firebase.js -->
<script src="portal-firebase.js"></script>
```

**Note**: Remove the old `<script src="portal.js"></script>` line and replace with the above.

---

## Phase 3: Create First Users (5 minutes)

### Step 8: Add Admin User via Firebase Console

1. In Firebase Console, go to **Authentication**
2. Click "Add user"
3. Email: `admin@chyfemacademy.edu`
4. Password: `Admin123!` (change this later!)
5. Click "Add user"
6. **Copy the User UID** (long string like: abc123def456...)

### Step 9: Add Admin Data to Firestore

1. Go to **Firestore Database**
2. Click "Start collection"
3. Collection ID: `users`
4. Click "Next"
5. Document ID: **Paste the User UID from Step 8**
6. Add fields:
   - `email` (string): `admin@chyfemacademy.edu`
   - `name` (string): `Admin User`
   - `role` (string): `admin`
   - `section` (string): `all`
7. Click "Save"

### Step 10: Test Your Admin Login

1. Open `portal.html` in browser
2. Select "Administrator" from dropdown
3. Username: `admin@chyfemacademy.edu`
4. Password: `Admin123!`
5. Click "Sign In"
6. You should see the admin dashboard!

---

## Phase 4: Deploy to Internet (10 minutes)

### Option A: Deploy with Netlify (Recommended - FREE)

1. **Create Netlify Account**
   - Go to https://netlify.com
   - Click "Sign up"
   - Use GitHub/Email

2. **Deploy Your Site**
   - Click "Add new site"
   - Choose "Deploy manually"
   - Drag and drop your entire folder
   - Wait 30 seconds
   - Done! You'll get a URL like: `https://chyfem-academy-abc123.netlify.app`

3. **Add Custom Domain (Optional)**
   - Buy domain from Namecheap/GoDaddy (~$10/year)
   - In Netlify, go to Domain settings
   - Add custom domain
   - Update DNS records as instructed

### Option B: Deploy with Firebase Hosting

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login and Initialize**
```bash
firebase login
firebase init hosting
```

3. **Select Options**
   - Select your Firebase project
   - Public directory: `.` (current directory)
   - Single-page app: `No`
   - Automatic builds: `No`

4. **Deploy**
```bash
firebase deploy
```

5. **Your site is live!**
   - URL: `https://chyfem-academy.web.app`
   - Or: `https://chyfem-academy.firebaseapp.com`

---

## Phase 5: Add More Users

### For Each User Type:

#### Add Student:
1. Firebase Console → Authentication → Add user
   - Email: `student@chyfemacademy.edu`
   - Password: `Student123!`
2. Copy User UID
3. Firestore → `users` collection → Add document:
   - Document ID: (the UID)
   - Fields:
     ```
     email: student@chyfemacademy.edu
     name: John Doe
     role: student
     section: primary
     grade: Grade 4
     class: A
     ```

#### Add Teacher:
1. Firebase Console → Authentication → Add user
   - Email: `teacher@chyfemacademy.edu`
   - Password: `Teacher123!`
2. Copy User UID
3. Firestore → `users` collection → Add document:
   - Document ID: (the UID)
   - Fields:
     ```
     email: teacher@chyfemacademy.edu
     name: Sarah Johnson
     role: teacher
     section: primary
     subject: Mathematics
     ```

#### Add Parent:
1. Firebase Console → Authentication → Add user
   - Email: `parent@chyfemacademy.edu`
   - Password: `Parent123!`
2. Copy User UID
3. Firestore → `users` collection → Add document:
   - Document ID: (the UID)
   - Fields:
     ```
     email: parent@chyfemacademy.edu
     name: David Smith
     role: parent
     section: nursery
     ```

---

## Phase 6: Bulk User Import (Optional)

### Using Firebase Admin SDK

Create a file `import-users.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const users = [
  {
    email: 'student1@chyfemacademy.edu',
    password: 'Student123!',
    name: 'John Doe',
    role: 'student',
    section: 'primary',
    grade: 'Grade 4'
  },
  // Add more users...
];

async function importUsers() {
  for (const user of users) {
    try {
      // Create auth user
      const userRecord = await admin.auth().createUser({
        email: user.email,
        password: user.password,
        displayName: user.name
      });
      
      // Add to Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: user.email,
        name: user.name,
        role: user.role,
        section: user.section,
        grade: user.grade || null
      });
      
      console.log('Created user:', user.email);
    } catch (error) {
      console.error('Error creating user:', user.email, error);
    }
  }
}

importUsers();
```

Run: `node import-users.js`

---

## Troubleshooting

### Issue: "Firebase is not defined"
**Solution**: Make sure Firebase SDK scripts are loaded BEFORE firebase-config.js

### Issue: "Permission denied"
**Solution**: Check Firestore security rules. In test mode, use:
```javascript
allow read, write: if true;
```

### Issue: Login not working
**Solution**: 
1. Check browser console for errors
2. Verify firebaseConfig is correct
3. Check Authentication is enabled in Firebase

### Issue: Data not showing
**Solution**:
1. Check Firestore has data in correct collections
2. Verify user role matches dashboard type
3. Check browser console for errors

---

## Next Steps

✅ Your website is now live with working database!

**Recommended Actions:**
1. Change all default passwords
2. Add SSL certificate (auto-enabled on Netlify/Firebase)
3. Set up custom domain
4. Add more students, teachers, parents
5. Create announcements
6. Test all features

**For Support:**
- Firebase Docs: https://firebase.google.com/docs
- Netlify Docs: https://docs.netlify.com
- Email: support@chyfemacademy.edu

---

## Costs

### FREE TIER (Covers ~500 students)
- Firebase: 50,000 reads/day, 20,000 writes/day, 1GB storage
- Netlify: 100GB bandwidth/month, unlimited sites
- **Total: $0/month**

### If You Need More:
- Firebase Blaze: Pay-as-you-go (~$5-25/month)
- Netlify Pro: $19/month
- Custom Domain: $10-15/year

**Typical school usage stays FREE! 🎉**
