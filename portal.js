// Portal Authentication and Dashboard System

// Demo user database
const users = {
    'student123': {
        password: 'password',
        type: 'student',
        section: 'primary',
        name: 'John Doe',
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
        data: {
            totalStudents: 500,
            teachers: 50,
            classes: 35,
            sections: 3
        }
    }
};

// Handle login form
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
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;
        const section = document.getElementById('section').value;
        
        // Validate credentials
        const user = users[username];
        
        if (user && user.password === password && user.type === userType) {
            // Store user session
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: username,
                type: user.type,
                name: user.name,
                section: section || user.section,
                data: user.data
            }));
            
            // Redirect to appropriate dashboard
            window.location.href = `dashboard-${user.type}.html`;
        } else {
            alert('Invalid credentials. Please check your username, password, and user type.');
        }
    });
}

// Dashboard functionality
function initDashboard() {
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
    
    return currentUser;
}

// Logout functionality
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'portal.html';
}

// Add logout event listener if logout button exists
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

// Navigation active state
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        // If it's a real link (not #), let it navigate
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
        animateValue(card, 0, targetValue, 1500);
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

// Sample data for different dashboards
const dashboardData = {
    student: {
        assignments: [
            { name: 'Math Homework', due: 'Tomorrow', status: 'pending' },
            { name: 'Science Project', due: 'Next Week', status: 'in-progress' },
            { name: 'English Essay', due: 'Today', status: 'completed' }
        ],
        grades: [
            { subject: 'Mathematics', grade: 'A', percentage: 92 },
            { subject: 'English', grade: 'B+', percentage: 87 },
            { subject: 'Science', grade: 'A-', percentage: 90 },
            { subject: 'History', grade: 'B', percentage: 85 }
        ],
        announcements: [
            { title: 'Sports Day', date: 'Feb 20, 2026' },
            { title: 'Parent Meeting', date: 'Feb 22, 2026' },
            { title: 'Mid-term Exams', date: 'Mar 1, 2026' }
        ]
    },
    teacher: {
        classes: [
            { name: 'Grade 4A - Math', students: 25, time: '9:00 AM' },
            { name: 'Grade 4B - Math', students: 23, time: '11:00 AM' },
            { name: 'Grade 5A - Math', students: 28, time: '2:00 PM' }
        ],
        pending: [
            { task: 'Grade assignments', count: 45 },
            { task: 'Lesson plans', count: 3 },
            { task: 'Parent meetings', count: 2 }
        ]
    },
    parent: {
        children: [
            { name: 'Emma Smith', grade: 'Nursery 2', teacher: 'Mrs. Brown' },
            { name: 'Oliver Smith', grade: 'Primary 1', teacher: 'Mr. Wilson' }
        ],
        payments: [
            { description: 'Tuition - Term 2', amount: '$500', status: 'paid' },
            { description: 'Books & Materials', amount: '$150', status: 'pending' }
        ]
    },
    admin: {
        stats: {
            students: 500,
            teachers: 50,
            classes: 35,
            staff: 75
        },
        recentActivity: [
            { action: 'New enrollment', user: 'John Doe', time: '2 hours ago' },
            { action: 'Teacher assigned', user: 'Mrs. Johnson', time: '5 hours ago' },
            { action: 'Payment received', user: 'Parent #123', time: '1 day ago' }
        ]
    }
};

// Export functions for use in dashboard pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDashboard,
        logout,
        dashboardData,
        toggleSidebar
    };
}
