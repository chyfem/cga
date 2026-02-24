# Chyfem Great Academy Website

A comprehensive, fully functional school website with a complete portal system for managing students, teachers, parents, and administrators across Nursery, Primary, and College sections.

## Features

### Main Website (`index.html`)
- **Modern, Professional Design**: Elegant typography with Playfair Display and Work Sans fonts
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Hero Section**: Eye-catching welcome section with call-to-action buttons
- **About Section**: Mission, Vision, and Values presentation
- **Sections Overview**: Detailed information about Nursery, Primary, and College divisions
- **Statistics**: Animated counters showing key metrics
- **Admissions**: Application process and inquiry form
- **Contact Information**: Complete contact details with map placeholder
- **Smooth Animations**: Fade-in effects, parallax scrolling, and interactive elements

### Portal System (`portal.html`)
Complete authentication system with role-based access control:

#### Login Credentials (Demo)
- **Student**: `student123` / `password`
- **Teacher**: `teacher123` / `password`
- **Parent**: `parent123` / `password`
- **Admin**: `admin` / `password`

### Dashboards

#### Student Dashboard (`dashboard-student.html`)
- Academic performance overview
- Assignment tracking with status indicators
- Grade reports by subject
- Attendance monitoring
- Achievement badges
- School announcements
- Progress visualization

#### Teacher Dashboard (`dashboard-teacher.html`)
- Class management (120 students across 5 classes)
- Daily schedule overview
- Assignment grading queue
- Student performance tracking by class
- Lesson planning tools
- Parent communication tracking
- Class average performance metrics

#### Parent Dashboard (`dashboard-parent.html`)
- Multiple children management
- Individual child progress reports
- Academic performance tracking
- Attendance monitoring
- Payment status and history
- Teacher communication
- School event calendar
- Fee payment system

#### Admin Dashboard (`dashboard-admin.html`)
- Complete school overview
- Student, teacher, and class statistics
- Section distribution (Nursery, Primary, College)
- Financial metrics and revenue tracking
- Recent activity monitoring
- Quick action buttons for common tasks
- Performance metrics across all areas
- Alerts and notifications system
- Upcoming tasks management

## File Structure

```
chyfem-academy/
│
├── index.html              # Main website homepage
├── styles.css              # Main website styles
├── script.js               # Main website JavaScript
│
├── portal.html             # Portal login page
├── portal-styles.css       # Portal and dashboard styles
├── portal.js               # Authentication and dashboard logic
│
├── dashboard-student.html  # Student dashboard
├── dashboard-teacher.html  # Teacher dashboard
├── dashboard-parent.html   # Parent dashboard
└── dashboard-admin.html    # Administrator dashboard
```

## Setup Instructions

### Option 1: Simple Setup (Recommended)
1. Download all files to a folder
2. Open `index.html` in any modern web browser
3. Navigate through the website
4. Click "Portal Login" to access the portal system
5. Use demo credentials to test different user types

### Option 2: Local Server Setup
For the best experience, run with a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with variables, flexbox, and grid
- **JavaScript**: Vanilla JS for interactivity (no dependencies)
- **Fonts**: Google Fonts (Playfair Display & Work Sans)
- **Icons**: Unicode emoji characters (no external icon library needed)

## Key Features by Section

### Nursery Section (Ages 2-5)
- 120 students, 8 classes
- Play-based learning approach
- Early literacy and numeracy
- Social skills development
- Creative arts and music

### Primary Section (Ages 6-11)
- 230 students, 15 classes
- Core academic subjects
- STEM programs
- Sports and athletics
- Technology integration

### College Section (Ages 12-18)
- 150 students, 12 classes
- Advanced academics
- Exam preparation
- Career guidance
- University placement support

## Portal Features

### Authentication System
- Session-based authentication
- Role-based access control
- Secure credential validation
- Automatic dashboard routing
- Remember me functionality

### Data Visualization
- Animated progress bars
- Dynamic statistics counters
- Performance metrics
- Attendance tracking
- Grade visualization

### Responsive Design
- Mobile-friendly navigation
- Collapsible sidebar on mobile
- Touch-optimized interactions
- Adaptive layouts
- Optimized for all screen sizes

## Customization

### Changing Colors
Edit the CSS variables in `styles.css` and `portal-styles.css`:

```css
:root {
    --primary: #1a4d2e;      /* Main school color */
    --secondary: #f4a460;    /* Accent color */
    --accent: #d4af37;       /* Gold accent */
    /* ... more colors ... */
}
```

### Adding Users
Edit the `users` object in `portal.js`:

```javascript
const users = {
    'username': {
        password: 'password',
        type: 'student|teacher|parent|admin',
        section: 'nursery|primary|college',
        name: 'Full Name',
        data: { /* user-specific data */ }
    }
};
```

### Modifying Content
- Edit HTML files directly to change text content
- Update contact information in `index.html`
- Modify dashboard data in each dashboard HTML file
- Change school statistics in the stats section

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

## Performance

- Lightweight (no heavy frameworks)
- Fast loading times
- Smooth animations
- Optimized images (placeholders for demo)
- Minimal dependencies

## Future Enhancements

Potential additions for a production system:
- Backend API integration
- Database connectivity
- Real-time notifications
- File upload functionality
- Email integration
- SMS notifications
- Payment gateway integration
- Advanced reporting tools
- Calendar integration
- Video conferencing integration

## Security Notes

⚠️ **Important**: This is a demo system with hardcoded credentials. For production use:
- Implement proper backend authentication
- Use secure password hashing
- Add HTTPS/SSL encryption
- Implement CSRF protection
- Add input validation and sanitization
- Use environment variables for sensitive data
- Implement rate limiting
- Add proper session management

## License

This is a demonstration project created for Chyfem Great Academy.

## Support

For questions or support, contact the school administration:
- Email: info@chyfemacademy.edu
- Phone: +234 800 123 4567

---

**Chyfem Great Academy** - Nurturing Excellence Since 2011
