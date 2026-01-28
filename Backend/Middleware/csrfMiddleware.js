import csrf from "csurf";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // secure: false,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // REQUIRED for Vercel + Render
  maxAge: 60 * 60 * 1000, // 1 hour
};

export const csrfProtection = csrf({
     // csrf - Cross-Site Request Forgery
      //  CSRF protects cookie-based, authenticated, state-changing actions.
      // We should NEVER protect public routes, login, OTP, or file downloads.
  cookie: COOKIE_OPTIONS,
});
