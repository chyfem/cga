// Firebase Configuration and Setup
// This file integrates Firebase database with your Chyfem Academy portal

// ============================================
// STEP 1: Add this to your HTML files (before closing </body> tag)
// ============================================
/*
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="firebase-config.js"></script>
*/

// ============================================
// STEP 2: Get your Firebase config from Firebase Console
// ============================================
// Go to: console.firebase.google.com
// Project Settings > Your apps > Config
// Replace the values below with your actual Firebase config

const firebaseConfig = {
    apiKey: "AIzaSyArSZ4NDciNlmeYDcgA-ToA41plT7PRIDs",
    authDomain: "chyfem-academy.firebaseapp.com",
    projectId: "chyfem-academy",
    storageBucket: "chyfem-academy.firebasestorage.app",
    messagingSenderId: "739397071976",
    appId: "1:739397071976:web:d48c49dc78f4f7b9f1f7dd",
    measurementId: "G-3B73XZ8061"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// Register new user
async function registerUser(email, password, userData) {
  try {
    // Create authentication account
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Store additional user data in Firestore
    await db.collection('users').doc(user.uid).set({
      email: email,
      name: userData.name,
      role: userData.role, // 'student', 'teacher', 'parent', 'admin'
      section: userData.section,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      ...userData
    });
    
    console.log('User registered successfully:', user.uid);
    return { success: true, userId: user.uid };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

// Login user
async function loginUser(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    // Store in session
    sessionStorage.setItem('currentUser', JSON.stringify({
      uid: user.uid,
      email: user.email,
      ...userData
    }));
    
    console.log('Login successful');
    return { success: true, userData };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Logout user
async function logoutUser() {
  try {
    await auth.signOut();
    sessionStorage.removeItem('currentUser');
    window.location.href = 'portal.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Check if user is logged in
function checkAuth() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        resolve({ loggedIn: true, userData: userDoc.data() });
      } else {
        resolve({ loggedIn: false });
      }
    });
  });
}

// ============================================
// DATABASE OPERATIONS - STUDENTS
// ============================================

// Create student record
async function createStudent(studentData) {
  try {
    const docRef = await db.collection('students').add({
      name: studentData.name,
      grade: studentData.grade,
      section: studentData.section,
      class: studentData.class,
      parentId: studentData.parentId,
      attendance: 0,
      averageGrade: 0,
      enrollmentDate: firebase.firestore.FieldValue.serverTimestamp(),
      ...studentData
    });
    
    console.log('Student created:', docRef.id);
    return { success: true, studentId: docRef.id };
  } catch (error) {
    console.error('Error creating student:', error);
    return { success: false, error: error.message };
  }
}

// Get student data
async function getStudent(studentId) {
  try {
    const doc = await db.collection('students').doc(studentId).get();
    if (doc.exists) {
      return { success: true, data: doc.data() };
    } else {
      return { success: false, error: 'Student not found' };
    }
  } catch (error) {
    console.error('Error getting student:', error);
    return { success: false, error: error.message };
  }
}

// Update student data
async function updateStudent(studentId, updates) {
  try {
    await db.collection('students').doc(studentId).update(updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating student:', error);
    return { success: false, error: error.message };
  }
}

// Get all students in a section
async function getStudentsBySection(section) {
  try {
    const snapshot = await db.collection('students')
      .where('section', '==', section)
      .get();
    
    const students = [];
    snapshot.forEach(doc => {
      students.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, students };
  } catch (error) {
    console.error('Error getting students:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// DATABASE OPERATIONS - ASSIGNMENTS
// ============================================

// Create assignment
async function createAssignment(assignmentData) {
  try {
    const docRef = await db.collection('assignments').add({
      title: assignmentData.title,
      description: assignmentData.description,
      subject: assignmentData.subject,
      class: assignmentData.class,
      teacherId: assignmentData.teacherId,
      dueDate: assignmentData.dueDate,
      maxScore: assignmentData.maxScore,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    });
    
    return { success: true, assignmentId: docRef.id };
  } catch (error) {
    console.error('Error creating assignment:', error);
    return { success: false, error: error.message };
  }
}

// Submit assignment
async function submitAssignment(assignmentId, studentId, submissionData) {
  try {
    await db.collection('submissions').add({
      assignmentId: assignmentId,
      studentId: studentId,
      content: submissionData.content,
      attachments: submissionData.attachments || [],
      submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'submitted',
      grade: null
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return { success: false, error: error.message };
  }
}

// Grade assignment
async function gradeAssignment(submissionId, grade, feedback) {
  try {
    await db.collection('submissions').doc(submissionId).update({
      grade: grade,
      feedback: feedback,
      gradedAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'graded'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error grading assignment:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// DATABASE OPERATIONS - ATTENDANCE
// ============================================

// Mark attendance
async function markAttendance(classId, date, attendanceData) {
  try {
    await db.collection('attendance').add({
      classId: classId,
      date: date,
      records: attendanceData, // Array of {studentId, status: 'present'|'absent'|'late'}
      markedBy: auth.currentUser.uid,
      markedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { success: false, error: error.message };
  }
}

// Get attendance for student
async function getStudentAttendance(studentId, startDate, endDate) {
  try {
    const snapshot = await db.collection('attendance')
      .where('records', 'array-contains', { studentId: studentId })
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();
    
    const attendance = [];
    snapshot.forEach(doc => {
      attendance.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, attendance };
  } catch (error) {
    console.error('Error getting attendance:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// DATABASE OPERATIONS - PAYMENTS
// ============================================

// Record payment
async function recordPayment(paymentData) {
  try {
    const docRef = await db.collection('payments').add({
      parentId: paymentData.parentId,
      studentId: paymentData.studentId,
      amount: paymentData.amount,
      description: paymentData.description,
      paymentMethod: paymentData.paymentMethod,
      status: 'completed',
      paidAt: firebase.firestore.FieldValue.serverTimestamp(),
      receiptNumber: paymentData.receiptNumber
    });
    
    return { success: true, paymentId: docRef.id };
  } catch (error) {
    console.error('Error recording payment:', error);
    return { success: false, error: error.message };
  }
}

// Get payment history
async function getPaymentHistory(parentId) {
  try {
    const snapshot = await db.collection('payments')
      .where('parentId', '==', parentId)
      .orderBy('paidAt', 'desc')
      .get();
    
    const payments = [];
    snapshot.forEach(doc => {
      payments.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, payments };
  } catch (error) {
    console.error('Error getting payment history:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// DATABASE OPERATIONS - ANNOUNCEMENTS
// ============================================

// Create announcement
async function createAnnouncement(announcementData) {
  try {
    const docRef = await db.collection('announcements').add({
      title: announcementData.title,
      content: announcementData.content,
      targetAudience: announcementData.targetAudience, // 'all', 'students', 'teachers', 'parents'
      section: announcementData.section || 'all',
      priority: announcementData.priority || 'normal',
      createdBy: auth.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, announcementId: docRef.id };
  } catch (error) {
    console.error('Error creating announcement:', error);
    return { success: false, error: error.message };
  }
}

// Get announcements
async function getAnnouncements(targetAudience, section = 'all') {
  try {
    let query = db.collection('announcements')
      .where('targetAudience', 'in', ['all', targetAudience])
      .orderBy('createdAt', 'desc')
      .limit(10);
    
    const snapshot = await query.get();
    const announcements = [];
    snapshot.forEach(doc => {
      announcements.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, announcements };
  } catch (error) {
    console.error('Error getting announcements:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// REAL-TIME UPDATES (OPTIONAL)
// ============================================

// Listen to student data changes
function subscribeToStudentUpdates(studentId, callback) {
  return db.collection('students').doc(studentId)
    .onSnapshot((doc) => {
      if (doc.exists) {
        callback({ success: true, data: doc.data() });
      }
    }, (error) => {
      callback({ success: false, error: error.message });
    });
}

// Listen to announcements
function subscribeToAnnouncements(targetAudience, callback) {
  return db.collection('announcements')
    .where('targetAudience', 'in', ['all', targetAudience])
    .orderBy('createdAt', 'desc')
    .limit(5)
    .onSnapshot((snapshot) => {
      const announcements = [];
      snapshot.forEach(doc => {
        announcements.push({ id: doc.id, ...doc.data() });
      });
      callback({ success: true, announcements });
    }, (error) => {
      callback({ success: false, error: error.message });
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get current user
function getCurrentUser() {
  const userJson = sessionStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}

// Format date
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
}

// Calculate attendance percentage
function calculateAttendancePercentage(presentDays, totalDays) {
  if (totalDays === 0) return 0;
  return Math.round((presentDays / totalDays) * 100);
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Auth
    registerUser,
    loginUser,
    logoutUser,
    checkAuth,
    // Students
    createStudent,
    getStudent,
    updateStudent,
    getStudentsBySection,
    // Assignments
    createAssignment,
    submitAssignment,
    gradeAssignment,
    // Attendance
    markAttendance,
    getStudentAttendance,
    // Payments
    recordPayment,
    getPaymentHistory,
    // Announcements
    createAnnouncement,
    getAnnouncements,
    // Real-time
    subscribeToStudentUpdates,
    subscribeToAnnouncements,
    // Utilities
    getCurrentUser,
    formatDate,
    calculateAttendancePercentage
  };
}
