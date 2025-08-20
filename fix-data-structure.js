// Script to fix the data structure by adding IDs to nested objects
import { randomUUID } from "crypto";
import { db } from "./server/db.js";
import { profiles } from "./shared/schema.js";

async function fixDataStructure() {
  console.log("Starting data structure fix...");
  
  try {
    // Get all profiles with other_details data
    const allProfiles = await db.select().from(profiles);
    
    for (const profile of allProfiles) {
      const otherDetails = profile.otherDetails;
      if (!otherDetails) continue;
      
      let hasChanges = false;
      const updatedOtherDetails = { ...otherDetails };
      
      // Fix education data - add IDs if missing
      if (otherDetails.education && Array.isArray(otherDetails.education)) {
        updatedOtherDetails.education = otherDetails.education.map(edu => ({
          ...edu,
          id: edu.id || randomUUID()
        }));
        hasChanges = true;
        console.log(`Fixed ${updatedOtherDetails.education.length} education records for user ${profile.userId}`);
      }
      
      // Fix work experience data - add IDs if missing
      if (otherDetails.workExperience && Array.isArray(otherDetails.workExperience)) {
        updatedOtherDetails.workExperience = otherDetails.workExperience.map(work => ({
          ...work,
          id: work.id || randomUUID()
        }));
        hasChanges = true;
        console.log(`Fixed ${updatedOtherDetails.workExperience.length} work experience records for user ${profile.userId}`);
      }
      
      // Fix projects data - add IDs if missing
      if (otherDetails.projects && Array.isArray(otherDetails.projects)) {
        updatedOtherDetails.projects = otherDetails.projects.map(project => ({
          ...project,
          id: project.id || randomUUID()
        }));
        hasChanges = true;
        console.log(`Fixed ${updatedOtherDetails.projects.length} project records for user ${profile.userId}`);
      }
      
      // Fix certifications data - add IDs if missing
      if (otherDetails.certifications && Array.isArray(otherDetails.certifications)) {
        updatedOtherDetails.certifications = otherDetails.certifications.map(cert => ({
          ...cert,
          id: cert.id || randomUUID()
        }));
        hasChanges = true;
        console.log(`Fixed ${updatedOtherDetails.certifications.length} certification records for user ${profile.userId}`);
      }
      
      // Fix organizations data - add IDs if missing
      if (otherDetails.organizations && Array.isArray(otherDetails.organizations)) {
        updatedOtherDetails.organizations = otherDetails.organizations.map(org => ({
          ...org,
          id: org.id || randomUUID()
        }));
        hasChanges = true;
        console.log(`Fixed ${updatedOtherDetails.organizations.length} organization records for user ${profile.userId}`);
      }
      
      // Fix achievements data - add IDs if missing
      if (otherDetails.achievements && Array.isArray(otherDetails.achievements)) {
        updatedOtherDetails.achievements = otherDetails.achievements.map(achievement => ({
          id: randomUUID(),
          title: achievement,
          description: achievement,
          year: new Date().getFullYear()
        }));
        hasChanges = true;
        console.log(`Fixed ${updatedOtherDetails.achievements.length} achievement records for user ${profile.userId}`);
      }
      
      // Update the profile if there were changes
      if (hasChanges) {
        await db
          .update(profiles)
          .set({ otherDetails: updatedOtherDetails })
          .where(eq(profiles.id, profile.id));
        console.log(`Updated profile for user ${profile.userId}`);
      }
    }
    
    console.log("Data structure fix completed successfully!");
  } catch (error) {
    console.error("Error fixing data structure:", error);
  }
}

fixDataStructure();