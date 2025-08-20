// Seed script to create user and profile data based on provided information
import { randomUUID } from "crypto";
import bcryptjs from "bcryptjs";
import { db } from "./server/db.js";
import { users, profiles } from "./shared/schema.js";

async function seedUserData() {
  console.log("Seeding user data...");
  
  try {
    // Create the user first
    const hashedPassword = await bcryptjs.hash("password123", 10);
    
    const [user] = await db
      .insert(users)
      .values({
        email: "admin2@email.com",
        password: hashedPassword,
        firstName: "Akash",
        lastName: "K",
      })
      .returning();
      
    console.log("Created user:", user);
    
    // Create the comprehensive profile with the provided data
    const profileData = {
      userId: user.id,
      personalDetails: {
        fullName: "akash k",
        dob: "1990-01-15",
        gender: "Male",
        location: {
          city: "Mumbai",
          state: "Maharashtra", 
          country: "India",
          pincode: "400001"
        },
        roleOrTitle: "Software Engineer",
        summary: "Experienced developer with expertise in web technologies",
        languagesKnown: ["English", "Hindi"],
        nationality: "Indian"
      },
      contactDetails: {
        email: "admin2@email.com",
        phone: "+91-9876543210",
        website: "https://akashk.dev",
        linkedin: "https://linkedin.com/in/akashk",
        githubOrPortfolio: "https://github.com/akashk"
      },
      otherDetails: {
        education: [{
          id: randomUUID(),
          level: "Undergraduate",
          degree: "Bachelor of Computer Science", 
          institution: "Mumbai University",
          yearOfPassing: 2020,
          gradeOrScore: "8.5 CGPA"
        }],
        workExperience: [{
          id: randomUUID(),
          organization: "Tech Solutions Inc",
          roleOrPosition: "Software Engineer",
          startDate: "2020-07",
          endDate: null,
          responsibilities: ["Developed web applications", "Led frontend team"],
          skillsOrToolsUsed: ["React", "Node.js", "PostgreSQL"]
        }],
        skills: {
          technical: ["JavaScript", "React", "Node.js", "PostgreSQL"],
          soft: ["Team Leadership", "Problem Solving"],
          tools: ["Git", "VS Code", "Docker"]
        },
        achievements: [{
          id: randomUUID(),
          title: "Employee of the Month - March 2022",
          description: "Employee of the Month - March 2022",
          year: 2022
        }],
        projects: [],
        certifications: [],
        organizations: []
      },
      theme: "modern",
      isPublic: false
    };
    
    const [profile] = await db
      .insert(profiles)
      .values(profileData)
      .returning();
      
    console.log("Created profile:", profile.id);
    console.log("User data seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

seedUserData();