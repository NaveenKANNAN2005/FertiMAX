# FertiMax Backend API

An AI-powered fertilizer recommendation backend for modern agriculture. Built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Product Management**: Browse, search, and manage fertilizer products
- **AI Recommendations**: Get personalized fertilizer recommendations based on crop type, soil, and farm size
- **Disease Detection**: AI-powered disease detection and treatment recommendations
- **Dosage Calculator**: Calculate perfect fertilizer amounts for your farm
- **Order Management**: Complete order processing and tracking
- **User Profiles**: Farmer profiles with farm details and crop information

## 📋 Prerequisites

- Node.js 16+ and npm
- MongoDB Atlas connection
- MongoDB Compass (for Atlas database visualization) - Optional

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the Backend folder:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/fertimax?retryWrites=true&w=majority&appName=<cluster-name>
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
```

### 3. MongoDB Atlas

Create your cluster and database user in Atlas, then paste the SRV URI into `.env`.

## 🏃 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server will run on `http://localhost:5000`

## 📚 API Endpoints

### Products

- `GET /api/products` - Get all products (with filtering, sorting, pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/search?q=query` - Search products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Recommendations

- `POST /api/recommendations` - Get AI recommendation
  ```json
  {
    "cropType": "Rice",
    "soilType": "Loam",
    "farmSize": 5,
    "diseaseDetected": "optional"
  }
  ```
- `GET /api/recommendations/user` - Get user's recommendations
- `POST /api/recommendations/dosage/calculate` - Calculate dosage
  ```json
  {
    "productId": "672a...",
    "farmSize": 5,
    "cropType": "Rice"
  }
  ```

### Health Check

- `GET /api/health` - Server status

## 🗄️ MongoDB Setup with Compass

### 1. Install MongoDB Compass

Download from: https://www.mongodb.com/products/compass

### 2. Connect to Database

- Paste your Atlas SRV URI in Compass
- Or use the same SRV URI in `.env` as `MONGODB_URI`

### 3. View Collections

Once connected, you'll see:

- `users` - User profiles
- `products` - Fertilizer products
- `recommendations` - AI recommendations
- `orders` - Customer orders
- `reviews` - Product reviews

## 📊 Sample Data

To add sample products, send a POST request:

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OrganoPro Max",
    "description": "Premium organic fertilizer",
    "category": "Organic",
    "price": 45,
    "stockQuantity": 100,
    "unit": "kg",
    "composition": {
      "nitrogen": 5,
      "phosphorus": 3,
      "potassium": 2
    },
    "bestFor": ["Vegetables", "Fruits"],
    "rating": 4.8
  }'
```

## 🔗 Frontend Integration

The frontend can connect to this backend using the API base URL:

```javascript
const API_BASE_URL = "http://localhost:5000/api";

// Example fetch
const products = await fetch(`${API_BASE_URL}/products`).then((res) =>
  res.json(),
);
```

## 📁 Project Structure

```
Backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── productController.js  # Product logic
│   └── recommendationController.js
├── models/
│   ├── User.js              # User schema
│   ├── Product.js           # Product schema
│   ├── Recommendation.js    # Recommendation schema
│   ├── Order.js             # Order schema
│   └── Review.js            # Review schema
├── routes/
│   ├── productRoutes.js
│   └── recommendationRoutes.js
├── middleware/
│   └── (auth, validation middleware)
├── .env                     # Environment configuration
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
└── server.js               # Main server file
```

## 🔐 Security Notes

- **NEVER commit `.env` file** to version control
- Change `JWT_SECRET` in production
- Add authentication middleware before deploying
- Validate all user inputs with schemas (Joi is installed)
- Use HTTPS in production

## 🐛 Troubleshooting

**MongoDB Connection Error:**

- Check Atlas connection string in `.env`
- Ensure Atlas IP access includes your server/client IP
- Verify database user credentials and password encoding

**Port Already in Use:**

```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

**Module Not Found:**

```bash
npm install
npm run dev
```

## 📝 Next Steps

1. ✅ Backend API setup complete
2. ⏳ Connect frontend to backend
3. ⏳ Add authentication (JWT)
4. ⏳ Implement real AI recommendation engine
5. ⏳ Add payment integration
6. ⏳ Deploy to production

## 🤝 Contributing

To add new features:

1. Create endpoints in routes
2. Add logic in controllers
3. Define models if needed
4. Test with Postman or curl

## 📞 Support

For issues or questions, refer to:

- MongoDB Docs: https://docs.mongodb.com
- Express Docs: https://expressjs.com
- Mongoose Docs: https://mongoosejs.com

---

**Happy Farming! 🌾**
