# WSD Care Tracker 🐕

A mobile-friendly web application for **The Welfare of Stray Dogs (WSD)** NGO in Mumbai to track and manage care tasks for approximately 50 stray dogs. The app helps rotating volunteers ensure no activity is missed, delayed, or duplicated.

## ✨ Features

### 🐶 Dog Profiles
- **Complete dog management** with editable profiles
- **Photo uploads** for easy identification
- **Unique ID/Tag numbers** for tracking
- **Health & behavior notes** for proper care
- **Volunteer assignments** for responsibility tracking
- **Search and filtering** capabilities
- **Deactivation** for adopted dogs

### ✅ Task Management
- **Pre-configured tasks**: Walk (daily), Bath (bi-weekly), Vaccination (scheduled), Feeding, Medication
- **Custom task creation** with flexible scheduling
- **Task frequency options**: Daily, Weekly, Every X days, Fixed dates
- **Task completion tracking** with notes and volunteer attribution
- **Automatic status calculation**: Done ✅, Overdue 🔴, Not Due ⏳

### 📅 Dashboard
- **Daily task overview** with checklist format
- **Real-time status indicators** with color coding
- **Summary statistics**: Active dogs, completion rates, overdue tasks
- **Advanced filtering**: By volunteer, task status, search terms
- **Mobile-optimized interface** for on-the-go use

### 👥 Volunteer Management
- **Volunteer profiles** with contact information
- **Dog assignment tracking**
- **Task completion attribution**

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wsd-care-tracker
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
wsd-care-tracker/
├── client/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Dashboard/  # Dashboard components
│   │   │   ├── Dogs/       # Dog management pages
│   │   │   ├── Volunteers/ # Volunteer management
│   │   │   └── Layout/     # App layout & navigation
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript type definitions
│   │   └── App.tsx         # Main app component
│   └── public/             # Static assets
├── server/                 # Node.js Express backend
│   ├── routes/             # API route handlers
│   │   ├── dogs.js         # Dog CRUD operations
│   │   ├── tasks.js        # Task management
│   │   └── volunteers.js   # Volunteer operations
│   ├── database.js         # SQLite database setup
│   ├── uploads/            # Uploaded dog photos
│   └── index.js            # Server entry point
└── package.json            # Root package configuration
```

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Styled Components** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Date-fns** for date formatting

### Backend
- **Node.js** with Express
- **SQLite** database with better-sqlite3
- **Multer** for file uploads
- **CORS** for cross-origin requests
- **Helmet** for security
- **Compression** for performance

## 📱 Mobile Optimization

The application is designed with mobile-first principles:
- **Responsive design** that works on all screen sizes
- **Touch-friendly interface** with large tap targets
- **Progressive Web App** capabilities
- **Optimized for slow networks** with image compression
- **Intuitive navigation** with hamburger menu on mobile

## 🔧 API Endpoints

### Dogs
- `GET /api/dogs` - Get all dogs with filters
- `POST /api/dogs` - Create new dog (with photo upload)
- `GET /api/dogs/:id` - Get single dog
- `PUT /api/dogs/:id` - Update dog
- `PATCH /api/dogs/:id/deactivate` - Deactivate dog

### Tasks
- `GET /api/tasks/dashboard` - Get dashboard data
- `GET /api/tasks/dog/:dogId` - Get tasks for a dog
- `POST /api/tasks/:taskId/complete` - Mark task as complete
- `GET /api/tasks/types` - Get available task types

### Volunteers
- `GET /api/volunteers` - Get all volunteers
- `POST /api/volunteers` - Create new volunteer
- `PUT /api/volunteers/:id` - Update volunteer
- `DELETE /api/volunteers/:id` - Delete volunteer

## 🗄 Database Schema

### Dogs Table
- Basic info: name, photo, tag_number, gender, age
- Care notes: health_notes, behavior_notes
- Assignment: assigned_volunteer_id
- Status: is_active for deactivated dogs

### Tasks System
- **task_types**: Reusable task definitions
- **dog_tasks**: Task assignments per dog
- **task_completions**: Completion history with notes

### Volunteers Table
- Contact info: name, email, phone
- Timestamps: created_at

## 🚀 Deployment

### Production Build

1. **Build the client**
   ```bash
   cd client && npm run build
   ```

2. **Start production server**
   ```bash
   cd server && NODE_ENV=production npm start
   ```

### Environment Variables
```bash
NODE_ENV=production
PORT=5000
```

## 📄 Usage Guide

### Adding a New Dog
1. Navigate to Dogs → Add Dog
2. Fill in basic information (name is required)
3. Upload a photo for easy identification
4. Add health and behavior notes
5. Assign to a volunteer (optional)
6. Default tasks (Walk, Bath, Feeding) are automatically created

### Daily Task Management
1. Open the Dashboard for daily overview
2. Use filters to focus on specific volunteers or task statuses
3. Click ✓ buttons to mark tasks complete
4. Add notes when completing tasks (e.g., "Dog refused bath")
5. View completion rates and overdue tasks at a glance

### Managing Volunteers
1. Add volunteers with contact information
2. Assign dogs to volunteers for responsibility tracking
3. View volunteer workload and task completion history

## 🎯 Key Benefits

- **No missed tasks**: Visual indicators prevent oversight
- **Volunteer coordination**: Clear assignments and handoffs
- **Historical tracking**: Complete care history for each dog
- **Mobile accessibility**: Works on smartphones and tablets
- **Offline capability**: Core features work without internet
- **Scalable**: Easily handles growth beyond 50 dogs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile and desktop
5. Submit a pull request

## 📞 Support

For technical support or feature requests, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for The Welfare of Stray Dogs, Mumbai**

*Helping ensure every dog gets the care they deserve through better organization and tracking.*