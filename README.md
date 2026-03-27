# FertiMax - AI-Powered Fertilizer Recommendation Platform

A full-stack agricultural technology platform that uses AI to provide personalized fertilizer recommendations for modern farmers.

```
     🌾🌾🌾
    🌾 FertiMax 🌾
     🌾🌾🌾
```

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Database Setup](#database-setup)
- [Contributing](#contributing)

## 📁 Project Structure

```
bloom-ai-advisor-94-main/
├── Frontend/                    # React Vite application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── lib/                # Utilities and API clients
│   │   ├── config/             # Configuration files
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env.local
│
├── Backend/                     # Node.js Express API
│   ├── config/                 # Database configuration
│   ├── controllers/            # Business logic
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Auth, validation, error handling
│   ├── utils/                  # Helper functions
│   ├── constants/              # Application constants
│   ├── server.js               # Main server file
│   ├── package.json
│   └── .env
│
└── docker-compose.yml          # Docker setup

```

## ✨ Features

### Frontend

- 🎨 Modern React UI with Tailwind CSS
- 📱 Responsive design
- 🔍 Advanced product search and filtering
- 🤖 AI crop advisor
- 🐛 Disease detection
- 📊 Dosage calculator
- ⭐ Product reviews and ratings
- 🛒 Shopping cart (Future)
- 👤 User profiles

### Backend

- 🛡️ JWT authentication
- 📦 Product management
- 🤖 AI recommendation engine
- 📋 Order management
- ⭐ Review system
- 📊 Analytics (Future)
- 📧 Email notifications (Future)
- 💳 Payment integration (Future)

## 💻 Tech Stack

### Frontend

- **Framework**: React 18.3 + Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: TanStack React Query
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Testing**: Vitest + Playwright

### Backend

- **Runtime**: Node.js
- **Framework**: Express 4.18
- **Database**: MongoDB 7.5
- **Authentication**: JWT
- **Validation**: Joi
- **Security**: bcryptjs, CORS
- **Logging**: Custom logger

### DevOps

- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Package Manager**: npm/bun

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **MongoDB Atlas** ([Create Cluster](https://www.mongodb.com/cloud/atlas))
- **MongoDB Compass** (Optional, for viewing Atlas data)
- **Docker** & **Docker Compose** (Optional for containerization)
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bloom-ai-advisor-94-main
```

### 2. Setup Backend

```bash
cd Backend
npm install
```

Create `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/fertimax?retryWrites=true&w=majority&appName=<cluster-name>
NODE_ENV=development
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:8080
```

### 3. Setup Frontend

```bash
cd Frontend
npm install
```

Create `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=FertiMax
VITE_APP_VERSION=1.0.0
```

## ▶️ Running the Project

### Option 1: Manual Setup (Recommended for Development)

**Terminal 1 - MongoDB**

```bash
mongod
```

**Terminal 2 - Backend**

```bash
cd Backend
npm run dev
```

Backend URL: `http://localhost:5000`

**Terminal 3 - Frontend**

```bash
cd Frontend
npm run dev
```

Frontend URL: `http://localhost:8080`

### Option 2: Docker Setup

```bash
# From root directory
docker-compose up
```

This will start:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5000`
- MongoDB: Internal container

### Option 3: Production Build

```bash
# Backend
cd Backend
npm start

# Frontend
cd Frontend
npm run build
npm run preview
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Products

```
GET    /products              - Get all products
GET    /products/:id          - Get single product
GET    /products/search?q=    - Search products
POST   /products              - Create product (Admin)
PUT    /products/:id          - Update product (Admin)
DELETE /products/:id          - Delete product (Admin)
```

### Recommendations

```
POST   /recommendations       - Get AI recommendation
GET    /recommendations/user  - Get user recommendations
POST   /recommendations/dosage/calculate - Calculate dosage
```

### Users

```
POST   /users/register        - Register user
GET    /users/profile         - Get user profile
PUT    /users/profile         - Update user profile
```

### Orders

```
POST   /orders                - Create order
GET    /orders                - Get user orders
GET    /orders/:id            - Get order details
PUT    /orders/:id/cancel     - Cancel order
PUT    /orders/:id/status     - Update order status (Admin)
```

### Reviews

```
POST   /reviews               - Create review
GET    /reviews/product/:id   - Get product reviews
PUT    /reviews/:id           - Update review
DELETE /reviews/:id           - Delete review
```

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster

Create a cluster at: https://www.mongodb.com/cloud/atlas

### 2. Connect to Database

- Use your Atlas SRV connection string in `MONGODB_URI`
- Optional: connect MongoDB Compass using the same SRV string

### 3. Collections

```
fertimax
├── users
├── products
├── orders
├── reviews
└── recommendations
```

### 4. Sample Data

```json
{
  "name": "OrganoPro Max",
  "description": "Premium organic fertilizer",
  "category": "Organic",
  "price": 45,
  "stockQuantity": 100,
  "rating": 4.8
}
```

## 🔗 Frontend-Backend Integration

### Making API Calls

```javascript
import { productAPI } from "@/lib/api";

// Get all products
const products = await productAPI.getAll({
  category: "Organic",
  limit: 12,
});

// Get recommendation
const recommendation = await recommendationAPI.getRecommendation({
  cropType: "Rice",
  soilType: "Loam",
  farmSize: 5,
});
```

## 🔐 Authentication

### Register

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Using Token

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Development Workflow

### Adding a New Feature

1. **Create Backend Endpoint**
   - Add route in `Backend/routes/`
   - Add logic in `Backend/controllers/`
   - Update `Backend/server.js`

2. **Create Frontend Page/Component**
   - Create component in `Frontend/src/components/` or `pages/`
   - Add route in `Frontend/src/App.jsx`
   - Use API client from `Frontend/src/lib/api.js`

3. **Test**

   ```bash
   # Backend
   npm test

   # Frontend
   npm run test
   ```

## 🐛 Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongod

# Or use MongoDB Atlas
# Update .env MONGODB_URI
```

### Port Already in Use

```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or change port in .env
```

### CORS Error

Update `Backend/.env`:

```env
FRONTEND_URL=http://localhost:8080
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📝 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/fertimax?retryWrites=true&w=majority&appName=<cluster-name>
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:8080
```

### Frontend (.env.local)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=FertiMax
VITE_APP_VERSION=1.0.0
```

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd Frontend
npm run build
# Deploy build folder to Vercel
```

### Backend (Render/Railway)

```bash
cd Backend
git push heroku main
```

### Database (MongoDB Atlas)

1. Create cluster on MongoDB Atlas
2. Update MONGODB_URI in .env
3. Whitelist IP address

## 📚 Learning Resources

- [Express.js Docs](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose ODM](https://mongoosejs.com/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📞 Support

For issues and questions:

- Create an issue on GitHub
- Email: balaagroservices@gmail.com
- Documentation: [Wiki]()

## 🙏 Acknowledgments

- Tailwind CSS team
- shadcn/ui components
- MongoDB community
- All contributors

---

**Made with ❤️ by FertiMax Team**

**Happy Farming! 🌾**
