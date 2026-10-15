# 🛍️ ShopKart — Full-Stack E-Commerce Application

ShopKart is a modern, responsive, and secure full-stack e-commerce web application built using the **MERN stack** (MongoDB, Express, React, Node.js), **Redux Toolkit**, and **Razorpay Payment Gateway**.

It features an end-to-end shopping experience: browsing products, managing wishlists, dynamic cart state management with derived values, checkout form validation, secure backend order creation, cryptographic payment verification, and order history tracking.

---

## 🌟 Key Features

### 🛒 Cart & State Management
- **Persistent Cart**: User cart is stored in MongoDB and synchronized with global **Redux Toolkit** state.
- **Derived State**: Subtotals, item counts, and total units are calculated dynamically from cart state without storing redundant duplicate counts in the database.
- **Reactive Navbar Integration**: Cart count in the navigation bar (`Cart (3)`) updates in real time on item addition, removal, and quantity adjustments without page refresh.
- **Quantity Guardrails**: Increment/decrement controls enforce minimum quantity (1) and prevent exceeding available stock.

### 💳 Secure Checkout & Razorpay Integration
- **Strict Client-Side Validation**: Validates full name, 10-digit phone number, address, city, state, and 6-digit Indian pincode prior to calling the backend.
- **Zero-Trust Backend Architecture**: The frontend sends only the shipping address. The backend calculates total prices directly from database product models, ignoring any client-sent prices.
- **Real-Time Stock Check**: Live stock is verified immediately before order creation to prevent race conditions and overselling.
- **HMAC-SHA256 Signature Verification**: Digital payment signatures (`order_id|payment_id`) are cryptographically verified on the backend using the merchant secret before updating orders.
- **Safe Cart Lifecycle**: The cart is **never** cleared upon simply opening checkout or if a payment fails. It is cleared in MongoDB (`user.cart = []`) and Redux only after successful cryptographic verification.

### 📦 Order Management
- **Historical Snapshots**: Orders store full immutable snapshots (product name, snapshot price, quantity, image, and delivery address) so future catalog price changes or product deletions never alter past receipts.
- **Order Confirmation Screen** (`/order-success/:id` & `/orders/:id`): Displays order status (`PLACED`), unique order ID, total amount, and item breakdown.
- **My Orders Page** (`/orders`): Lists all past orders belonging exclusively to the authenticated user, sorted newest first with detailed receipt views.

### 🔐 Authentication & Security
- **JWT Authentication**: User authentication via secure cookies.
- **Password Hashing**: Passwords stored using `bcryptjs`.
- **IDOR Protection**: Order retrieval strictly verifies ownership (`find({ _id, user: req.customer._id })`), preventing users from viewing other customers' orders.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Redux Toolkit, React Router v6, Axios, Tailwind CSS |
| **Backend** | Node.js, Express.js (v5), Mongoose, JSON Web Tokens (JWT), Cookie-Parser |
| **Payment Gateway** | Razorpay Node.js SDK & Razorpay Checkout.js |
| **Database** | MongoDB Atlas |

---

## 📁 Project Structure

```
ShopKart App/
├── client/                     # Frontend React (Vite) Application
│   ├── public/                 # Static assets (favicons, SVGs)
│   ├── src/
│   │   ├── components/         # Navbar, ProductCard, WishlistCard
│   │   ├── config/             # Axios instance & API baseURL
│   │   ├── context/            # AuthContext & CartContext
│   │   ├── pages/              # Cart, Checkout, Home, Orders, OrderSuccess, etc.
│   │   ├── redux/              # Redux store, cartSlice, useCart hook
│   │   ├── routes/             # ProtectedRoute & PublicRoute
│   │   ├── App.jsx             # React Router route definitions
│   │   └── main.jsx            # Application entry point
│   ├── index.html              # HTML shell with Razorpay SDK
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Node.js / Express Application
│   ├── controllers/            # cart, customer, order, product, wishlist
│   ├── middlewares/            # JWT authentication middleware
│   ├── models/                 # Customer, Order, Product Mongoose models
│   ├── routes/                 # Express API routes
│   ├── utils/                  # Token generation helpers
│   ├── .env.example            # Environment variables template
│   ├── index.js                # Server entry point & Express configuration
│   ├── package.json
│   └── seed.js                 # Sample product seeder script
│
├── .gitignore                  # Git ignore rules (protects credentials)
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **MongoDB Atlas** account or local MongoDB instance

---

### 2. Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure the environment variables in `server/.env`:
   ```env
   uri=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopkart?retryWrites=true&w=majority
   jwt_secret=your_super_secret_jwt_key
   user_name=your_db_username
   password=your_db_password
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

5. (Optional) Seed initial products:
   ```bash
   node seed.js
   ```

6. Start the backend server:
   ```bash
   npm run dev
   # Server runs on http://localhost:8004
   ```

---

### 3. Frontend Setup

1. Navigate to the `client` directory:
   ```bash
   cd ../client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   # Client runs on http://localhost:5173
   ```

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/customer`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/customer/register` | Register a new user |
| `POST` | `/customer/login` | Log in and receive JWT authentication cookie |
| `POST` | `/customer/logout` | Clear authentication cookie |
| `GET` | `/customer/profile` | Retrieve authenticated customer details |

### 📦 Products & Wishlist
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/products` | Get list of all products |
| `GET` | `/products/:id` | Get single product details |
| `GET` | `/wishlist` | Retrieve authenticated user's wishlist |
| `POST` | `/wishlist/:productId`| Add/remove product from wishlist |

### 🛒 Cart (`/cart`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/cart` | Retrieve user cart items |
| `POST` | `/cart/:productId` | Add item to cart |
| `PATCH`| `/cart/:productId` | Update item quantity |
| `DELETE`| `/cart/:productId`| Remove item from cart |

### 💳 Orders & Payments (`/orders`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/orders/create-payment-order` | Validate stock, compute totals, create pending order & Razorpay order |
| `POST` | `/orders/verify-payment` | Verify HMAC signature, set status to `PLACED`, clear cart, decrement stock |
| `GET` | `/orders` | Retrieve authenticated user's orders (newest first) |
| `GET` | `/orders/:orderId` | Get single order receipt by ID |

---

## 🔄 Payment & Order Workflow

```text
[ Cart Page ]
      │ (Proceed to Checkout)
      ▼
[ /checkout ]
      │ (Validate Form: Name, Phone, 6-digit Pincode)
      ▼
POST /orders/create-payment-order
      │ (Server recalculates total from DB & checks stock)
      ▼
[ Razorpay Checkout Modal ]
      │
      ├── Payment Cancelled/Closed ───► Cart preserved intact!
      │
      ▼ (Payment Success)
POST /orders/verify-payment
      │ (HMAC-SHA256 signature verification)
      ├── Invalid Signature ──────────► 400 Bad Request (Cart untouched)
      ▼ (Valid Signature)
Order Status = "PLACED"
      ├── DB Cart Cleared: user.cart = []
      ├── Product Inventory Decremented
      ├── Redux Cart State Cleared (Navbar becomes Cart (0))
      ▼
Navigate to [ /order-success/:id ]
```

---

## 📤 How to Push to GitHub

If you have already created a repository on GitHub (e.g. `https://github.com/<your-username>/shopkart.git`):

```bash
# 1. Add your GitHub repository as the remote
git remote add origin https://github.com/<your-username>/shopkart.git

# 2. Rename the branch to main (if not already main)
git branch -M main

# 3. Push your code to GitHub
git push -u origin main
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
