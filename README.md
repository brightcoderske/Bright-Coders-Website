# 🎓 BrightCoders Academy

BrightCoders Academy is a platform designed to introduce **kids and beginners to coding in a fun and engaging way**.
The goal of the project is to make programming **easy, interactive, and accessible** for young learners.

The website provides information about coding programs, learning paths, and how students can start their journey in technology.

---

## 🌍 Live Website

Visit the website here:

🔗 https://www.brightcoderske.co.ke

---

## 🚀 Features

* 👶 Beginner-friendly coding programs for kids
* 📚 Structured learning paths
* 💻 Interactive and modern website design
* 📱 Responsive design (works on mobile and desktop)
* 🎯 Focus on practical coding skills

---

## 🛠️ Technologies Used

This project was built using:

* **HTML5** – Website structure
* **CSS3** – Styling and layout
* **JavaScript** – Interactive functionality
* **React** – Frontend user interface
* **Vite** – Fast development environment

---

## 🔧 Technical Challenges & Solutions

### 1. Secure Asset Delivery
**Challenge:** Delivering private receipts without making them public on the web.  
**Solution:** Implemented **Signed URLs via Cloudinary**, ensuring that links expire after a set time and are only accessible to authorized users.

### 2. Database Scaling
**Challenge:** Moving from local development to a production-grade serverless DB.  
**Solution:** Successfully migrated to **Neon PostgreSQL**, implementing connection pooling to handle concurrent user requests efficiently.

## 📂 Project Structure

```
Bright-Coders-Website/
├── Admin/                   # Backend/Admin management
├── Backend/                 # Server-side logic
├── frontend/
│   └── brightcoders-frontend/
│       ├── public/          # Static files (index.html, sitemaps)
│       ├── src/
│       │   ├── assets/      # Images and media
│       │   ├── components/  # Reusable UI elements
│       │   ├── Css/         # Global styles
│       │   ├── Layout/      # Wrappers (Navbar, Footer)
│       │   ├── pages/       # Route components (Home, About)
│       │   ├── Utils/       # Helper functions
│       │   ├── App.jsx      # Main component logic
│       │   └── main.jsx     # Entry point
│       ├── package.json     # Dependencies
│       ├── vercel.json      # Deployment config
│       └── vite.config.js   # Build tool config
└── README.md                # Project documentation
```

---

## ⚙️ Installation & Setup

To run this project locally:

1. Clone the repository

```
git clone https://github.com/isaacmugwimi/Bright-Coders-Website.git
```

2. Navigate into the project

```
cd \Bright Coders Website\
```

3. Install dependencies

```
npm install
```

4. Start the development server

```
npm run dev
```

The project will run on:

```
http://localhost:5173
```

---

## 🎯 Purpose of the Project

The aim of BrightCoders Academy is to:

* Introduce kids to **computer programming**
* Build **problem-solving skills**
* Encourage **creativity through technology**
* Prepare students for the **future digital world**

---

## 🤝 Contributing

Contributions are welcome.

If you would like to improve the project:

1. Fork the repository
2. Create a new branch
3. Submit a pull request

---

## 👨‍💻 Author

**Isaac Mugwimi**

Full-Stack Developer passionate about building educational technology and real-world applications.

GitHub:
https://github.com/isaacmugwimi

---

## ⭐ Support

If you like this project, consider **starring the repository** to support the project.

---

## Production Upgrade Notes

### Public caching
The public frontend caches live courses, blogs, testimonials, and student work in the browser. Cached data renders quickly, then the app refreshes from the backend periodically in the background.

### Module graduation
Registrations support linked module history. When a fully paid student is graduated to the next module, the system creates a new module registration, keeps the student admission identity connected, sends the parent an invoice-style email, and preserves the module history for certificate verification.

### M-Pesa Express / STK Push
M-Pesa Express is optional. If the credentials below are missing, the existing manual payment and Pay Later flow stays available.

Backend environment variables:

```
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PARTY_B=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=https://your-api-domain.com/api/payments/mpesa/callback
MPESA_TRANSACTION_TYPE=CustomerPayBillOnline
```

For production, set `MPESA_ENV=production` and use live Daraja credentials from Safaricom. The callback URL must be public HTTPS.

### Student work showcase
Admins can publish student projects under Scratch, Web Development, AI, and Graphics Design. Scratch, Web, and AI projects use project links; Graphics Design projects can use uploaded images. Published work appears on `/student-work`.
