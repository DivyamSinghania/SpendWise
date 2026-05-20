# SpendWise - MVC Architecture Refactoring

## Overview
The SpendWise project has been successfully refactored from a monolithic architecture to a proper **Model-View-Controller (MVC)** architecture. All functionality remains identical - only the code organization has improved.

---

## Backend Architecture (Server)

### Project Structure
```
server/
├── config/
│   └── database.js              # MongoDB connection setup
├── middleware/
│   └── auth.js                  # JWT authentication middleware
├── models/
│   ├── User.js                  # User schema and model
│   ├── Expense.js               # Expense schema and model
│   └── Budget.js                # Budget schema and model
├── controllers/
│   ├── authController.js        # Authentication business logic
│   ├── expenseController.js     # Expense management logic
│   ├── budgetController.js      # Budget management logic
│   └── summaryController.js     # Dashboard summary logic
├── routes/
│   ├── authRoutes.js            # Auth API endpoints
│   ├── expenseRoutes.js         # Expense API endpoints
│   ├── budgetRoutes.js          # Budget API endpoints
│   └── summaryRoutes.js         # Summary API endpoints
├── utils/
│   ├── helpers.js               # Utility functions (hash, token, sanitize)
│   ├── upload.js                # File upload configuration
│   └── passport.js              # Google OAuth strategy
├── .env                         # Environment variables
├── server.js                    # Main application entry point
└── package.json                 # Dependencies
```

### Component Descriptions

#### **Models** (`server/models/`)
- **User.js**: Defines the user data schema with authentication method support (local/Google)
- **Expense.js**: Defines the expense data schema with category, date, and notes
- **Budget.js**: Defines the monthly budget schema per user

#### **Controllers** (`server/controllers/`)
- **authController.js**: Handles signup, login, logout, getCurrentUser, and Google OAuth callback
- **expenseController.js**: Handles CRUD operations for expenses (getExpenses, createExpense, deleteExpense)
- **budgetController.js**: Handles budget retrieval and updates
- **summaryController.js**: Calculates and returns dashboard summary data

#### **Routes** (`server/routes/`)
- **authRoutes.js**: Maps auth endpoints to authController
- **expenseRoutes.js**: Maps expense endpoints to expenseController  
- **budgetRoutes.js**: Maps budget endpoints to budgetController
- **summaryRoutes.js**: Maps summary endpoints to summaryController

#### **Middleware** (`server/middleware/`)
- **auth.js**: JWT verification middleware for protected routes

#### **Utilities** (`server/utils/`)
- **helpers.js**: Password hashing, JWT token generation, user sanitization
- **upload.js**: Multer configuration for profile picture uploads
- **passport.js**: Google OAuth 2.0 strategy setup

#### **Config** (`server/config/`)
- **database.js**: MongoDB connection initialization

---

## Frontend Architecture (Client)

### Project Structure
```
client/src/
├── models/
│   └── api.js                   # API service layer (axios instances)
├── views/
│   ├── Dashboard.js             # Dashboard UI component
│   ├── ExpenseList.js           # Expense list UI component
│   ├── AddExpense.js            # Add expense form UI component
│   ├── BudgetSettings.js        # Budget settings UI component
│   └── AccountPage.js           # Account/auth UI component
├── controllers/
│   └── (Logic in App.js)        # Main app controller
├── components/                  # Original components (deprecated)
├── App.js                       # Main controller - state management & business logic
├── index.js                     # React entry point
└── App.css                      # Styling
```

### Component Descriptions

#### **Models** (`client/src/models/`)
- **api.js**: Centralized API service layer with axios configuration
  - `authAPI`: Login, signup, logout, getCurrentUser
  - `expenseAPI`: Get, add, delete expenses
  - `budgetAPI`: Get, update budget
  - `summaryAPI`: Get dashboard summary

#### **Views** (`client/src/views/`)
- **Dashboard.js**: Displays dashboard with stats, charts, and recent transactions
- **ExpenseList.js**: Displays filterable expense table
- **AddExpense.js**: Form to add new expenses
- **BudgetSettings.js**: Form to set and display monthly budget
- **AccountPage.js**: Login/signup forms and user profile

#### **Controller** (`App.js`)
- Manages global application state
- Handles all API calls through the models layer
- Passes data to views as props
- Handles user interactions and updates state accordingly
- Manages authentication, data fetching, and user feedback

---

## Key Improvements

### 1. **Separation of Concerns**
- **Models**: Pure data handling and API communication
- **Views**: UI presentation and user interaction only
- **Controllers**: Business logic and state management

### 2. **Reusability**
- API functions can be imported and used in any component
- Views are simple, stateless components focused on rendering
- Controllers can be extended without affecting views

### 3. **Maintainability**
- Easy to locate specific functionality
- Changes to API logic don't require view modifications
- Clear file structure makes debugging easier

### 4. **Testability**
- Each controller function can be tested independently
- API calls are isolated in the models layer
- Views are pure components that render based on props

### 5. **Scalability**
- Easy to add new features (models + controllers + views)
- Growing codebase remains organized
- New developers can understand the structure quickly

---

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /auth/google` - Google OAuth redirect
- `GET /auth/google/callback` - Google OAuth callback

### Expenses
- `GET /api/expenses` - Get expenses (with filters)
- `POST /api/expenses` - Create new expense
- `DELETE /api/expenses/:id` - Delete expense

### Budget
- `GET /api/budget` - Get user's budget
- `PUT /api/budget` - Update user's budget

### Summary
- `GET /api/summary` - Get dashboard summary

---

## Functionality Preserved

✅ User authentication (local & Google OAuth)  
✅ Expense CRUD operations  
✅ Budget management  
✅ Dashboard with analytics  
✅ Expense filtering and search  
✅ Profile picture uploads  
✅ Budget tracking and alerts  
✅ Spending trends visualization  
✅ Category-wise expense breakdown  
✅ Recent transactions display  

---

## Running the Application

### Backend
```bash
cd server
npm install
npm run dev  # or npm start
```

### Frontend
```bash
cd client
npm install
npm start
```

---

## Environment Variables

### Server (.env)
```
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/spendwise
JWT_SECRET=spendwise-secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CALLBACK_URL=http://localhost:5001/auth/google/callback
```

---

## Technology Stack

### Backend
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Passport.js
- **File Upload**: Multer
- **Security**: bcrypt/crypto for passwords

### Frontend
- **Framework**: React 18
- **HTTP Client**: Axios
- **Charts**: Recharts
- **State Management**: React Hooks

---

## Next Steps for Enhancement

1. Add unit tests for controllers and API functions
2. Implement error handling middleware on backend
3. Add input validation on both client and server
4. Create a separate services layer for business logic
5. Implement Redux for complex state management
6. Add API rate limiting and request throttling
7. Create a dashboard for admin users
8. Add expense categories customization

---

## File Migration Summary

### Backend Files Created
- 1 config file (database.js)
- 1 middleware file (auth.js)
- 3 model files (User.js, Expense.js, Budget.js)
- 4 controller files (authController, expenseController, budgetController, summaryController)
- 4 route files (authRoutes, expenseRoutes, budgetRoutes, summaryRoutes)
- 3 utility files (helpers.js, upload.js, passport.js)
- **Refactored**: server.js (reduced from 600+ lines to 70 lines)

### Frontend Files Created
- 1 API model file (api.js)
- 5 view components (Dashboard, ExpenseList, AddExpense, BudgetSettings, AccountPage)
- **Refactored**: App.js (now acts as main controller with clear sections)
- Old components folder preserved for reference (can be deleted)

---

## Notes

- All original functionality is preserved
- No features were added or removed
- The architecture is now scalable and maintainable
- Original component files still exist but are superseded by the views
- All API calls now go through the centralized api.js model

---

**Refactoring completed on**: May 21, 2026
