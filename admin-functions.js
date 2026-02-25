// Admin Dashboard Functions with Real-Time Firebase Integration
// Chyfem Great Academy - Admin Panel

// Initialize Firebase references
const auth = firebase.auth();
const db = firebase.firestore();

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated and is admin
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            alert('Please login first');
            window.location.href = 'portal.html';
            return;
        }
        
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'portal.html';
            return;
        }
        
        // User is admin, initialize dashboard
        initAdminDashboard();
    });
});

// Initialize admin dashboard
function initAdminDashboard() {
    console.log('Admin dashboard initialized');
    
    // Load real-time statistics
    loadRealTimeStats();
    
    // Setup navigation
    setupNavigation();
    
    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Load recent activity
    loadRecentActivity();
}

// Setup navigation between sections
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = {
        'overview': document.getElementById('overviewSection'),
        'students': document.getElementById('studentsSection'),
        'teachers': document.getElementById('teachersSection'),
        'classes': document.getElementById('classesSection'),
        'announcements': document.getElementById('announcementsSection')
    };
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = item.getAttribute('data-section');
            
            // Hide all sections
            Object.values(sections).forEach(section => {
                if (section) section.style.display = 'none';
            });
            
            // Show selected section
            if (sections[sectionName]) {
                sections[sectionName].style.display = 'block';
                
                // Load data for section
                loadSectionData(sectionName);
            }
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Load section-specific data
function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'students':
            loadStudentsTable();
            break;
        case 'teachers':
            loadTeachersTable();
            break;
        case 'classes':
            loadClassesTable();
            break;
        case 'announcements':
            loadAnnouncementsTable();
            break;
    }
}

// Load real-time statistics
function loadRealTimeStats() {
    // Listen to students collection
    db.collection('students').onSnapshot((snapshot) => {
        document.getElementById('totalStudents').textContent = snapshot.size;
    });
    
    // Listen to teachers collection
    db.collection('teachers').onSnapshot((snapshot) => {
        document.getElementById('totalTeachers').textContent = snapshot.size;
    });
    
    // Listen to classes collection
    db.collection('classes').onSnapshot((snapshot) => {
        document.getElementById('totalClasses').textContent = snapshot.size;
    });
    
    // Listen to announcements collection
    db.collection('announcements').onSnapshot((snapshot) => {
        document.getElementById('totalAnnouncements').textContent = snapshot.size;
    });
}

// Load recent activity
function loadRecentActivity() {
    const activityList = document.getElementById('recentActivityList');
    
    // Combine multiple collections for activity feed
    const activities = [];
    
    // Get recent students (last 5)
    db.collection('students')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .onSnapshot((snapshot) => {
            activityList.innerHTML = '';
            
            if (snapshot.empty) {
                activityList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No recent activity</p>';
                return;
            }
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const time = data.createdAt ? formatTimeAgo(data.createdAt.toDate()) : 'Recently';
                
                activityList.innerHTML += `
                    <div class="list-item">
                        <div>
                            <div style="font-weight: 600;">New Student Enrolled</div>
                            <div style="color: var(--text-light); font-size: 0.9rem;">${data.name} - ${data.section} section</div>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-light);">${time}</div>
                    </div>
                `;
            });
        });
}

// ==================== STUDENTS ====================

// Load students table
function loadStudentsTable() {
    const container = document.getElementById('studentsTableContainer');
    container.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading students...</p>';
    
    db.collection('students')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            if (snapshot.empty) {
                container.innerHTML = '<p style="text-align: center; padding: 2rem;">No students yet. Click "Add Student" to get started.</p>';
                return;
            }
            
            let tableHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Section</th>
                            <th>Grade</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            snapshot.forEach((doc) => {
                const student = doc.data();
                tableHTML += `
                    <tr>
                        <td>${student.name}</td>
                        <td>${student.email}</td>
                        <td>${capitalizeFirst(student.section)}</td>
                        <td>${student.grade}</td>
                        <td><span class="badge badge-success">Active</span></td>
                        <td class="action-buttons">
                            <button class="btn-small btn-edit" onclick="editStudent('${doc.id}')">Edit</button>
                            <button class="btn-small btn-delete" onclick="deleteStudent('${doc.id}', '${student.name}')">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            tableHTML += '</tbody></table>';
            container.innerHTML = tableHTML;
        });
}

// Handle add student form
async function handleAddStudent(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = document.getElementById('submitStudentBtn');
    const messageDiv = document.getElementById('studentFormMessage');
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Creating student...';
    
    // Get form data
    const formData = new FormData(form);
    const studentData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        section: formData.get('section'),
        grade: formData.get('grade'),
        dateOfBirth: formData.get('dateOfBirth') || null,
        parentEmail: formData.get('parentEmail') || null
    };
    
    try {
        // Create Firebase authentication account
        const userCredential = await auth.createUserWithEmailAndPassword(
            studentData.email,
            studentData.password
        );
        
        const user = userCredential.user;
        
        // Add to users collection
        await db.collection('users').doc(user.uid).set({
            email: studentData.email,
            name: studentData.name,
            role: 'student',
            section: studentData.section,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Add to students collection
        await db.collection('students').doc(user.uid).set({
            name: studentData.name,
            email: studentData.email,
            section: studentData.section,
            grade: studentData.grade,
            dateOfBirth: studentData.dateOfBirth,
            parentEmail: studentData.parentEmail,
            attendance: 0,
            averageGrade: 0,
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Show success message
        messageDiv.innerHTML = '<div class="success-message">✅ Student added successfully!</div>';
        form.reset();
        
        // Close modal after 2 seconds
        setTimeout(() => {
            closeModal('addStudentModal');
            messageDiv.innerHTML = '';
        }, 2000);
        
    } catch (error) {
        console.error('Error adding student:', error);
        messageDiv.innerHTML = `<div class="error-message">❌ Error: ${error.message}</div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Add Student';
    }
}

// Delete student
async function deleteStudent(studentId, studentName) {
    if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
        return;
    }
    
    try {
        // Delete from students collection
        await db.collection('students').doc(studentId).delete();
        
        // Delete from users collection
        await db.collection('users').doc(studentId).delete();
        
        // Note: Firebase Auth user deletion requires admin SDK on backend
        // For now, we'll just disable the account data
        
        alert('Student deleted successfully!');
    } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student: ' + error.message);
    }
}

// ==================== TEACHERS ====================

// Load teachers table
function loadTeachersTable() {
    const container = document.getElementById('teachersTableContainer');
    container.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading teachers...</p>';
    
    db.collection('teachers')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            if (snapshot.empty) {
                container.innerHTML = '<p style="text-align: center; padding: 2rem;">No teachers yet. Click "Add Teacher" to get started.</p>';
                return;
            }
            
            let tableHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Subject</th>
                            <th>Section</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            snapshot.forEach((doc) => {
                const teacher = doc.data();
                tableHTML += `
                    <tr>
                        <td>${teacher.name}</td>
                        <td>${teacher.email}</td>
                        <td>${teacher.subject}</td>
                        <td>${capitalizeFirst(teacher.section)}</td>
                        <td><span class="badge badge-success">Active</span></td>
                        <td class="action-buttons">
                            <button class="btn-small btn-edit" onclick="editTeacher('${doc.id}')">Edit</button>
                            <button class="btn-small btn-delete" onclick="deleteTeacher('${doc.id}', '${teacher.name}')">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            tableHTML += '</tbody></table>';
            container.innerHTML = tableHTML;
        });
}

// Handle add teacher form
async function handleAddTeacher(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = document.getElementById('submitTeacherBtn');
    const messageDiv = document.getElementById('teacherFormMessage');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Creating teacher...';
    
    const formData = new FormData(form);
    const teacherData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        subject: formData.get('subject'),
        section: formData.get('section'),
        phone: formData.get('phone') || null
    };
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(
            teacherData.email,
            teacherData.password
        );
        
        const user = userCredential.user;
        
        await db.collection('users').doc(user.uid).set({
            email: teacherData.email,
            name: teacherData.name,
            role: 'teacher',
            section: teacherData.section,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('teachers').doc(user.uid).set({
            name: teacherData.name,
            email: teacherData.email,
            subject: teacherData.subject,
            section: teacherData.section,
            phone: teacherData.phone,
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        messageDiv.innerHTML = '<div class="success-message">✅ Teacher added successfully!</div>';
        form.reset();
        
        setTimeout(() => {
            closeModal('addTeacherModal');
            messageDiv.innerHTML = '';
        }, 2000);
        
    } catch (error) {
        console.error('Error adding teacher:', error);
        messageDiv.innerHTML = `<div class="error-message">❌ Error: ${error.message}</div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Add Teacher';
    }
}

// Delete teacher
async function deleteTeacher(teacherId, teacherName) {
    if (!confirm(`Are you sure you want to delete ${teacherName}?`)) {
        return;
    }
    
    try {
        await db.collection('teachers').doc(teacherId).delete();
        await db.collection('users').doc(teacherId).delete();
        alert('Teacher deleted successfully!');
    } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('Error deleting teacher: ' + error.message);
    }
}

// ==================== CLASSES ====================

// Load classes table
function loadClassesTable() {
    const container = document.getElementById('classesTableContainer');
    container.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading classes...</p>';
    
    db.collection('classes')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            if (snapshot.empty) {
                container.innerHTML = '<p style="text-align: center; padding: 2rem;">No classes yet. Click "Create Class" to get started.</p>';
                return;
            }
            
            let tableHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Class Name</th>
                            <th>Section</th>
                            <th>Grade</th>
                            <th>Room</th>
                            <th>Capacity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            snapshot.forEach((doc) => {
                const classData = doc.data();
                tableHTML += `
                    <tr>
                        <td>${classData.name}</td>
                        <td>${capitalizeFirst(classData.section)}</td>
                        <td>${classData.grade}</td>
                        <td>${classData.room || 'N/A'}</td>
                        <td>${classData.capacity || 'N/A'}</td>
                        <td class="action-buttons">
                            <button class="btn-small btn-edit" onclick="editClass('${doc.id}')">Edit</button>
                            <button class="btn-small btn-delete" onclick="deleteClass('${doc.id}', '${classData.name}')">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            tableHTML += '</tbody></table>';
            container.innerHTML = tableHTML;
        });
}

// Handle add class form
async function handleAddClass(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = document.getElementById('submitClassBtn');
    const messageDiv = document.getElementById('classFormMessage');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Creating class...';
    
    const formData = new FormData(form);
    const classData = {
        name: formData.get('name'),
        section: formData.get('section'),
        grade: formData.get('grade'),
        room: formData.get('room') || null,
        capacity: formData.get('capacity') ? parseInt(formData.get('capacity')) : null,
        students: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('classes').add(classData);
        
        messageDiv.innerHTML = '<div class="success-message">✅ Class created successfully!</div>';
        form.reset();
        
        setTimeout(() => {
            closeModal('addClassModal');
            messageDiv.innerHTML = '';
        }, 2000);
        
    } catch (error) {
        console.error('Error creating class:', error);
        messageDiv.innerHTML = `<div class="error-message">❌ Error: ${error.message}</div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Class';
    }
}

// Delete class
async function deleteClass(classId, className) {
    if (!confirm(`Are you sure you want to delete ${className}?`)) {
        return;
    }
    
    try {
        await db.collection('classes').doc(classId).delete();
        alert('Class deleted successfully!');
    } catch (error) {
        console.error('Error deleting class:', error);
        alert('Error deleting class: ' + error.message);
    }
}

// ==================== ANNOUNCEMENTS ====================

// Load announcements table
function loadAnnouncementsTable() {
    const container = document.getElementById('announcementsTableContainer');
    container.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading announcements...</p>';
    
    db.collection('announcements')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            if (snapshot.empty) {
                container.innerHTML = '<p style="text-align: center; padding: 2rem;">No announcements yet. Click "New Announcement" to get started.</p>';
                return;
            }
            
            let tableHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Target</th>
                            <th>Section</th>
                            <th>Priority</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            snapshot.forEach((doc) => {
                const announcement = doc.data();
                const date = announcement.createdAt ? announcement.createdAt.toDate().toLocaleDateString() : 'N/A';
                const priorityBadge = announcement.priority === 'urgent' ? 'badge-danger' : 
                                     announcement.priority === 'high' ? 'badge-warning' : 'badge-info';
                
                tableHTML += `
                    <tr>
                        <td>${announcement.title}</td>
                        <td>${capitalizeFirst(announcement.targetAudience)}</td>
                        <td>${capitalizeFirst(announcement.section || 'all')}</td>
                        <td><span class="badge ${priorityBadge}">${capitalizeFirst(announcement.priority || 'normal')}</span></td>
                        <td>${date}</td>
                        <td class="action-buttons">
                            <button class="btn-small btn-delete" onclick="deleteAnnouncement('${doc.id}', '${announcement.title}')">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            tableHTML += '</tbody></table>';
            container.innerHTML = tableHTML;
        });
}

// Handle add announcement form
async function handleAddAnnouncement(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = document.getElementById('submitAnnouncementBtn');
    const messageDiv = document.getElementById('announcementFormMessage');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Posting...';
    
    const formData = new FormData(form);
    const announcementData = {
        title: formData.get('title'),
        content: formData.get('content'),
        targetAudience: formData.get('targetAudience'),
        section: formData.get('section'),
        priority: formData.get('priority'),
        createdBy: auth.currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('announcements').add(announcementData);
        
        messageDiv.innerHTML = '<div class="success-message">✅ Announcement posted successfully!</div>';
        form.reset();
        
        setTimeout(() => {
            closeModal('addAnnouncementModal');
            messageDiv.innerHTML = '';
        }, 2000);
        
    } catch (error) {
        console.error('Error posting announcement:', error);
        messageDiv.innerHTML = `<div class="error-message">❌ Error: ${error.message}</div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Post Announcement';
    }
}

// Delete announcement
async function deleteAnnouncement(announcementId, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
        return;
    }
    
    try {
        await db.collection('announcements').doc(announcementId).delete();
        alert('Announcement deleted successfully!');
    } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Error deleting announcement: ' + error.message);
    }
}

// ==================== MODAL FUNCTIONS ====================

function openAddStudentModal() {
    document.getElementById('addStudentModal').classList.add('active');
}

function openAddTeacherModal() {
    document.getElementById('addTeacherModal').classList.add('active');
}

function openAddClassModal() {
    document.getElementById('addClassModal').classList.add('active');
}

function openAddAnnouncementModal() {
    document.getElementById('addAnnouncementModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});

// ==================== UTILITY FUNCTIONS ====================

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return "Just now";
}

async function logout() {
    try {
        await auth.signOut();
        window.location.href = 'portal.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out: ' + error.message);
    }
}

// Placeholder functions for edit operations (can be implemented later)
function editStudent(studentId) {
    alert('Edit student feature - Coming soon! Student ID: ' + studentId);
}

function editTeacher(teacherId) {
    alert('Edit teacher feature - Coming soon! Teacher ID: ' + teacherId);
}

function editClass(classId) {
    alert('Edit class feature - Coming soon! Class ID: ' + classId);
}
