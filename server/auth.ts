import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import jwt from "jsonwebtoken";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { isAdminUser } from "./adminUtils";
import { buildAuthDebug, shouldIncludeAuthDebug } from "./authDebug";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

function getJwtSecret() {
  return (
    process.env.JWT_SECRET ||
    process.env.SESSION_SECRET ||
    "dev-secret-key"
  );
}

function signAuthToken(userId: number) {
  return jwt.sign({ uid: userId }, getJwtSecret(), { expiresIn: "24h" });
}

function extractBearerToken(req: any): string | null {
  const header = req.get?.("authorization") || req.headers?.authorization;
  if (!header || typeof header !== "string") return null;
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token ? token : null;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const isProd = process.env.NODE_ENV === "production";

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: isProd, // secure cookies over https in production
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    proxy: isProd,
    name: "connect.sid",
  };

  // Needed so Express knows the original protocol and sets secure cookies correctly behind proxies (Render/Cloudflare)
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Allow stateless auth via Authorization: Bearer <jwt> as a fallback
  // (useful when third-party cookies are blocked in local dev).
  app.use(async (req: any, _res, next) => {
    if (req.user?.id) return next();

    const token = extractBearerToken(req);
    if (!token) return next();

    try {
      const payload = jwt.verify(token, getJwtSecret()) as { uid?: unknown };
      const userId = payload?.uid;
      if (typeof userId !== "number") return next();

      const user = await storage.getUserById(userId);
      if (user) req.user = user;
    } catch {
      // ignore invalid/expired tokens
    }

    next();
  });

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  // FIX: Explicitly handle the case where a user is not found.
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      // If a user is found, pass the user object to done.
      // Otherwise, pass false to indicate the user for the session is invalid.
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Auto-create basic profile for new user
      const fullName = `${req.body.firstName || ""} ${
        req.body.lastName || ""
      }`.trim();
      await storage.createProfile({
        userId: user.id,
        personalDetails: {
          fullName: fullName || req.body.email.split("@")[0], // Use email prefix if no name provided
        },
        contactDetails: {
          email: req.body.email,
        },
        otherDetails: {},
        portfolioTheme: "modern",
        isPublic: false,
      });

      // Award onboarding badges for new user registration
      try {
        await storage.checkAndAwardBadges(user.id, "achievement");
        console.log(`🏆 Checked onboarding badges for new user ${user.id}`);
      } catch (badgeError) {
        console.error("Error awarding registration badges:", badgeError);
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          token: signAuthToken(user.id),
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), async (req, res) => {
    if (req.user) {
      // Check for any missing onboarding badges on login
      try {
        await storage.checkAndAwardBadges(req.user.id, "achievement");
        console.log(`🏆 Checked login badges for user ${req.user.id}`);
      } catch (badgeError) {
        console.error("Error awarding login badges:", badgeError);
      }

      res.status(200).json({
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profileImageUrl: req.user.profileImageUrl,
        token: signAuthToken(req.user.id),
      });
    } else {
      res.status(401).json({ message: "Authentication failed" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.user?.id) {
      const debug = shouldIncludeAuthDebug(req) ? buildAuthDebug(req) : undefined;
      return res.status(401).json({ message: "Unauthorized", debug });
    }
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      profileImageUrl: req.user.profileImageUrl,
      isAdmin: isAdminUser(req.user.email),
    });
  });
}

export { hashPassword, comparePasswords };
