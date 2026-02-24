// Enhanced Portal Authentication with Firebase Integration
// This replaces the demo authentication with real Firebase authentication

// Handle login form with Firebase
const loginForm = document.getElementById('loginForm');
const userTypeSelect = document.getElementById('userType');
const sectionGroup = document.getElementById('sectionGroup');

if (userTypeSelect) {
    userTypeSelect.addEventListener('change', function() {
        if (this.value === 'student' || this.value === 'parent') {
            sectionGroup.style.display = 'block';
            document.getElementById('section').required = true;
        } else {
            sectionGroup.style.display = 'none';
            document.getElementById('section').required = false;
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;
        const section = document.getElementById('section').value;
        
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;
        
        try {
            // If Firebase is available, use it
            if (typeof firebase !== 'undefined' && typeof loginUser === 'function') {
                // Assume username is email for Firebase
                const email = username.includes('@') ? username : `${username}@chyfemacademy.edu`;
                const result = await loginUser(email, password);
                
                if (result.success) {
                    // Check if user type matches
                    if (result.userData.role === userType) {
                        // Store user session
                        sessionStorage.setItem('currentUser', JSON.stringify({
                            username: username,
                            email: email,
                            type: result.userData.role,
                            name: result.userData.name,
                            section: result.userData.section || section,
                            data: result.userData
                        }));
                        
                        // Redirect to appropriate dashboard
                        window.location.href = `dashboard-${result.userData.role}.html`;
                    } else {
                        alert(`Invalid user type. This account is registered as ${result.userData.role}.`);
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }
                } else {
                    alert('Login failed: ' + result.error);
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } else {
                // Fallback to demo authentication if Firebase not loaded
                useDemoAuthentication(username, password, userType, section);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Demo authentication (fallback when Firebase is not available)
function useDemoAuthentication(username, password, userType, section) {
    const users = {
        'student123': {
            password: 'password',
            type: 'student',
            section: 'primary',
            name: 'John Doe',
            email: 'student123@chyfemacademy.edu',
            data: {
                grade: '4th',
                class: 'A',
                avgScore: 85,
                attendance: 95,
                assignments: 12,
                pending: 3
            }
        },
        'teacher123': {
            password: 'password',
            type: 'teacher',
            section: 'primary',
            name: 'Mrs. Sarah Johnson',
            email: 'teacher123@chyfemacademy.edu',
            data: {
                subject: 'Mathematics',
                classes: 5,
                students: 120,
                lessons: 8
            }
        },
        'parent123': {
            password: 'password',
            type: 'parent',
            section: 'nursery',
            name: 'Mr. David Smith',
            email: 'parent123@chyfemacademy.edu',
            data: {
                children: 2,
                meetings: 3,
                messages: 5
            }
        },
        'admin': {
            password: 'password',
            type: 'admin',
            section: 'all',
            name: 'Admin User',
            email: 'admin@chyfemacademy.edu',
            data: {
                totalStudents: 500,
                teachers: 50,
                classes: 35,
                sections: 3
            }
        }
    };
    
    const user = users[username];
    
    if (user && user.password === password && user.type === userType) {
        sessionStorage.setItem('currentUser', JSON.stringify({
            username: username,
            email: user.email,
            type: user.type,
            name: user.name,
            section: section || user.section,
            data: user.data
        }));
        
        window.location.href = `dashboard-${user.type}.html`;
    } else {
        alert('Invalid credentials. Please check your username, password, and user type.');
    }
}

// Dashboard initialization
async function initDashboard() {
    // Check if user is authenticated
    if (typeof checkAuth === 'function') {
        const authStatus = await checkAuth();
        if (!authStatus.loggedIn) {
            window.location.href = 'portal.html';
            return;
        }
    }
    
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'portal.html';
        return;
    }
    
    // Update welcome message
    const welcomeName = document.getElementById('welcomeName');
    const userName = document.getElementById('userName');
    
    if (welcomeName) {
        welcomeName.textContent = currentUser.name;
    }
    
    if (userName) {
        userName.textContent = currentUser.name;
    }
    
    // Update user avatar
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.textContent = currentUser.name.charAt(0);
    }
    
    // Load user-specific data from Firebase
    if (typeof getCurrentUser === 'function' && currentUser.uid) {
        await loadUserDashboardData(currentUser);
    }
    
    return currentUser;
}

// Load dashboard data from Firebase
async function loadUserDashboardData(user) {
    try {
        switch(user.type) {
            case 'student':
                await loadStudentData(user.uid);
                break;
            case 'teacher':
                await loadTeacherData(user.uid);
                break;
            case 'parent':
                await loadParentData(user.uid);
                break;
            case 'admin':
                await loadAdminData();
                break;
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load student-specific data
async function loadStudentData(studentId) {
    if (typeof getStudent === 'function') {
        const result = await getStudent(studentId);
        if (result.success) {
            updateStudentDashboard(result.data);
        }
    }
    
    // Load announcements
    if (typeof getAnnouncements === 'function') {
        const announcements = await getAnnouncements('students');
        if (announcements.success) {
            updateAnnouncementsSection(announcements.announcements);
        }
    }
}

// Load teacher-specific data
async function loadTeacherData(teacherId) {
    // Load teacher's classes and students
    // Implementation depends on your database structure
    console.log('Loading teacher data...');
}

// Load parent-specific data
async function loadParentData(parentId) {
    // Load children's information
    // Implementation depends on your database structure
    console.log('Loading parent data...');
}

// Load admin dashboard data
async function loadAdminData() {
    // Load school-wide statistics
    console.log('Loading admin data...');
}

// Update student dashboard with real data
function updateStudentDashboard(studentData) {
    // Update average score
    const avgScoreElement = document.querySelector('.card-value');
    if (avgScoreElement && studentData.averageGrade) {
        avgScoreElement.textContent = studentData.averageGrade;
    }
    
    // Update attendance
    const attendanceElements = document.querySelectorAll('.card-value');
    if (attendanceElements[2] && studentData.attendance) {
        attendanceElements[2].textContent = studentData.attendance;
    }
    
    // Update other dashboard elements as needed
}

// Update announcements section
function updateAnnouncementsSection(announcements) {
    const announcementsContainer = document.querySelector('.announcements-list');
    if (!announcementsContainer) return;
    
    announcementsContainer.innerHTML = '';
    
    announcements.forEach(announcement => {
        const announcementElement = document.createElement('div');
        announcementElement.style.marginBottom = '1.5rem';
        announcementElement.innerHTML = `
            <div style="font-weight: 600; color: var(--primary);">${announcement.title}</div>
            <div style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.3rem;">
                ${formatDate(announcement.createdAt)}
            </div>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">${announcement.content}</p>
        `;
        announcementsContainer.appendChild(announcementElement);
    });
}

// Logout functionality
async function logout() {
    if (typeof logoutUser === 'function') {
        await logoutUser();
    } else {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'portal.html';
    }
}

// Add logout event listener
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

// Navigation active state
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#') {
            e.preventDefault();
        }
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

// Animate numbers on page load
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Animate progress bars
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        setTimeout(() => {
            bar.style.width = width + '%';
        }, 100);
    });
}

// Initialize animations when dashboard loads
window.addEventListener('load', () => {
    // Animate card values
    const cardValues = document.querySelectorAll('.card-value');
    cardValues.forEach(card => {
        const targetValue = parseInt(card.textContent);
        if (!isNaN(targetValue)) {
            animateValue(card, 0, targetValue, 1500);
        }
    });
    
    // Animate progress bars
    animateProgressBars();
});

// Mobile sidebar toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Handle form submissions
document.addEventListener('submit', async function(e) {
    if (e.target.classList.contains('firebase-form')) {
        e.preventDefault();
        // Handle Firebase form submissions
        console.log('Firebase form submitted');
    }
});

// Real-time updates (if Firebase is available)
function setupRealTimeUpdates() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Subscribe to announcements
    if (typeof subscribeToAnnouncements === 'function') {
        subscribeToAnnouncements(currentUser.type, (result) => {
            if (result.success) {
                updateAnnouncementsSection(result.announcements);
            }
        });
    }
    
    // Subscribe to student updates (if student)
    if (currentUser.type === 'student' && typeof subscribeToStudentUpdates === 'function') {
        subscribeToStudentUpdates(currentUser.uid, (result) => {
            if (result.success) {
                updateStudentDashboard(result.data);
            }
        });
    }
}

// Initialize real-time updates after page load
if (typeof firebase !== 'undefined') {
    window.addEventListener('load', setupRealTimeUpdates);
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDashboard,
        logout,
        toggleSidebar,
        getCurrentUser
    };
}
