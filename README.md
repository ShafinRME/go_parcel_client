# 📦 GO Parcel — Client Side

> **"Delivering trust, one parcel at a time."**

GO Parcel is a full-stack parcel delivery management system that connects users, riders, and admins on a single platform. It features role-based access control, real-time parcel tracking, and a secure online payment system — making the delivery experience seamless for everyone involved.

🌐 **Live Site:** [https://e-commerce1-9c516.web.app](https://e-commerce1-9c516.web.app)
🔗 **Backend Repo:** [https://github.com/ShafinRME/go_parcel_server](https://github.com/ShafinRME/go_parcel_server)

---

## 🚀 Features

### 👤 User
- Register via Email/Password or Google Sign-In
- Send parcels with sender & receiver details, parcel type, and service area
- Pay securely via **Stripe** payment gateway
- View parcel history, payment records, and real-time tracking
- Apply to become a rider via application form

### 🛵 Rider
- Rider status granted by Admin upon approval
- View assigned deliveries and monitor delivery status
- Cash out delivery earnings instantly after successful delivery

### 🛠️ Admin
- Review and approve or reject rider applications
- Assign riders to parcels based on destination
- Update parcel delivery status
- View active and pending rider lists
- Promote any user to Admin role

### 🗺️ General
- Role-based protected routing (User / Rider / Admin panels)
- Interactive map showing service outlet locations with search filter
- Coverage, Pricing, and Dashboard pages are login-protected

---

## 🧰 Tech Stack

### Frontend
| Technology | Link |
|---|---|
| React | [react.dev](https://react.dev) |
| React Router v7 | [reactrouter.com](https://reactrouter.com) |
| Tailwind CSS v4 | [tailwindcss.com](https://tailwindcss.com) |
| DaisyUI | [daisyui.com](https://daisyui.com) |
| Framer Motion | [framer.com/motion](https://www.framer.com/motion) |
| Axios | [axios-http.com](https://axios-http.com) |
| TanStack React Query | [tanstack.com/query](https://tanstack.com/query) |
| Recharts | [recharts.org](https://recharts.org) |
| Leaflet & React Leaflet | [leafletjs.com](https://leafletjs.com) |
| Stripe.js | [stripe.com/docs](https://stripe.com/docs) |
| React Hook Form | [react-hook-form.com](https://react-hook-form.com) |
| Swiper | [swiperjs.com](https://swiperjs.com) |

### Backend
| Technology | Link |
|---|---|
| Node.js | [nodejs.org](https://nodejs.org) |
| Express.js | [expressjs.com](https://expressjs.com) |

### Database
| Technology | Link |
|---|---|
| MongoDB Atlas | [mongodb.com](https://www.mongodb.com) |

### Others
| Technology | Link |
|---|---|
| Firebase Auth | [firebase.google.com](https://firebase.google.com) |
| Stripe API | [stripe.com](https://stripe.com) |
| Firebase Hosting | [firebase.google.com](https://firebase.google.com) |
| Vercel | [vercel.com](https://vercel.com) |

---

## ⚙️ Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/ShafinRME/go_parcel_client.git
cd go_parcel_client
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:
```env
VITE_BASE_URL=http://localhost:5000

VITE_apiKey=your_firebase_api_key
VITE_authDomain=your_firebase_auth_domain
VITE_projectId=your_firebase_project_id
VITE_storageBucket=your_firebase_storage_bucket
VITE_messagingSenderId=your_firebase_messaging_sender_id
VITE_appId=your_firebase_app_id

VITE_payment_Key=your_stripe_publishable_key
VITE_image_upload_key=your_image_upload_key
```

### 4. Start the development server
```bash
npm run dev
```

The app will run at `http://localhost:5173`

---

## 🔮 Future Improvements

- User profile update functionality
- Integration with Bangladeshi payment gateways (bKash, Nagad)
- OTP-based user verification
- Password change and forgot password functionality
- Rider real-time location tracking on map
- Push notifications for parcel status updates

---

## 👨‍💻 Author

**Md. Shafin Ahmed**
- GitHub: [@ShafinRME](https://github.com/ShafinRME)
