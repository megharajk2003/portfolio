import { GoogleGenerativeAI } from "@google/generative-ai";

// Using Google AI (Gemini) instead of OpenAI
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface UserProfileData {
  personalDetails?: any;
  contactDetails?: any;
  education?: any[];
  workExperience?: any[];
  skills?: any[];
  projects?: any[];
  certifications?: any[];
  achievements?: any[];
  learningProgress?: any;
}

export class AICareerService {
  
  static async generateCareerAdvice(userData: UserProfileData, targetRole?: string): Promise<{
    advice: string;
    recommendations: string[];
    skillGaps: string[];
    nextSteps: string[];
    currentLevel: string;
  }> {
    try {
      console.log('🤖 [AI-SERVICE] Starting career advice generation');
      console.log('🤖 [AI-SERVICE] User data received:', JSON.stringify(userData, null, 2));
      console.log('🤖 [AI-SERVICE] Target role:', targetRole);
      const prompt = `
        Analyze this user's career profile and provide personalized career advice.
        
        User Profile:
        - Personal Details: ${JSON.stringify(userData.personalDetails)}
        - Work Experience: ${JSON.stringify(userData.workExperience)}
        - Education: ${JSON.stringify(userData.education)}
        - Skills: ${JSON.stringify(userData.skills)}
        - Projects: ${JSON.stringify(userData.projects)}
        - Certifications: ${JSON.stringify(userData.certifications)}
        ${targetRole ? `- Target Role: ${targetRole}` : ''}
        
        Provide comprehensive career advice including:
        1. Overall career advice (2-3 paragraphs)
        2. Specific recommendations (3-5 items)
        3. Skill gaps to address (if target role provided)
        4. Next actionable steps (3-5 items)
        5. Current career level assessment (entry/mid/senior/executive)
        
        Respond with JSON in this format:
        {
          "advice": "detailed career advice text",
          "recommendations": ["recommendation 1", "recommendation 2"],
          "skillGaps": ["skill gap 1", "skill gap 2"],
          "nextSteps": ["next step 1", "next step 2"],
          "currentLevel": "entry|mid|senior|executive"
        }
      `;

      console.log('🤖 [AI-SERVICE] Sending request to Google AI for career advice');
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const response = await model.generateContent(prompt);
      console.log('🤖 [AI-SERVICE] Google AI response received:', response.response.text());
      const result = JSON.parse(response.response.text() || '{}');
      console.log('✅ [AI-SERVICE] Career advice generated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [AI-SERVICE] Error generating career advice:', error);
      throw new Error('Failed to generate career advice');
    }
  }

  static async generateCareerTimeline(userData: UserProfileData, targetRole: string): Promise<{
    title: string;
    timeline: Array<{
      phase: string;
      duration: string;
      milestones: string[];
      skills: string[];
      description: string;
    }>;
    estimatedDuration: string;
  }> {
    try {
      console.log('🤖 [AI-SERVICE] Starting career timeline generation');
      console.log('🤖 [AI-SERVICE] Timeline user data:', JSON.stringify(userData, null, 2));
      console.log('🤖 [AI-SERVICE] Timeline target role:', targetRole);
      const prompt = `
        Create a detailed career progression timeline for this user to reach their target role.
        
        Current Profile:
        - Work Experience: ${JSON.stringify(userData.workExperience)}
        - Education: ${JSON.stringify(userData.education)}
        - Skills: ${JSON.stringify(userData.skills)}
        - Projects: ${JSON.stringify(userData.projects)}
        - Learning Progress: ${JSON.stringify(userData.learningProgress)}
        
        Target Role: ${targetRole}
        
        Create a phased timeline with:
        1. Timeline title
        2. 3-5 career phases from current state to target role
        3. Each phase should have: phase name, duration, key milestones, skills to develop, description
        4. Total estimated duration
        
        Respond with JSON in this format:
        {
          "title": "Career Path to [Target Role]",
          "timeline": [
            {
              "phase": "Phase 1: Foundation Building",
              "duration": "6-12 months",
              "milestones": ["milestone 1", "milestone 2"],
              "skills": ["skill 1", "skill 2"],
              "description": "detailed phase description"
            }
          ],
          "estimatedDuration": "2-3 years"
        }
      `;

      console.log('🤖 [AI-SERVICE] Sending timeline request to Google AI');
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const response = await model.generateContent(prompt);
      console.log('🤖 [AI-SERVICE] Timeline Google AI response:', response.response.text());
      const result = JSON.parse(response.response.text() || '{}');
      console.log('✅ [AI-SERVICE] Timeline generated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [AI-SERVICE] Error generating career timeline:', error);
      throw new Error('Failed to generate career timeline');
    }
  }

  static async generateResume(userData: UserProfileData, targetRole?: string): Promise<{
    personalInfo: any;
    summary: string;
    experience: any[];
    education: any[];
    skills: any[];
    projects: any[];
    certifications: any[];
  }> {
    try {
      const prompt = `
        Generate a professional resume based on this user's profile data.
        
        User Data:
        - Personal Details: ${JSON.stringify(userData.personalDetails)}
        - Contact Details: ${JSON.stringify(userData.contactDetails)}
        - Work Experience: ${JSON.stringify(userData.workExperience)}
        - Education: ${JSON.stringify(userData.education)}
        - Skills: ${JSON.stringify(userData.skills)}
        - Projects: ${JSON.stringify(userData.projects)}
        - Certifications: ${JSON.stringify(userData.certifications)}
        ${targetRole ? `- Target Role: ${targetRole}` : ''}
        
        Create a well-structured resume with:
        1. Personal information section
        2. Professional summary (2-3 sentences tailored to target role if provided)
        3. Organized work experience with bullet points
        4. Education section
        5. Skills categorized properly
        6. Notable projects with descriptions
        7. Relevant certifications
        
        Respond with JSON in this format:
        {
          "personalInfo": {
            "name": "Full Name",
            "email": "email",
            "phone": "phone",
            "location": "location",
            "linkedin": "linkedin",
            "website": "website"
          },
          "summary": "Professional summary text",
          "experience": [
            {
              "company": "Company Name",
              "position": "Job Title",
              "duration": "Start - End",
              "location": "Location",
              "responsibilities": ["responsibility 1", "responsibility 2"]
            }
          ],
          "education": [
            {
              "institution": "School Name",
              "degree": "Degree",
              "year": "Year",
              "grade": "Grade"
            }
          ],
          "skills": [
            {
              "category": "Technical Skills",
              "items": ["skill1", "skill2"]
            }
          ],
          "projects": [
            {
              "title": "Project Name",
              "description": "Project description",
              "technologies": ["tech1", "tech2"],
              "url": "project url if available"
            }
          ],
          "certifications": [
            {
              "title": "Certification Name",
              "organization": "Issuing Organization",
              "year": "Year"
            }
          ]
        }
      `;

      console.log('🤖 [AI-SERVICE] Sending resume request to Google AI');
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const response = await model.generateContent(prompt);
      console.log('🤖 [AI-SERVICE] Resume Google AI response:', response.response.text());
      const result = JSON.parse(response.response.text() || '{}');
      console.log('✅ [AI-SERVICE] Resume generated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [AI-SERVICE] Error generating resume:', error);
      throw new Error('Failed to generate resume');
    }
  }

  static async generateChatResponse(messages: Array<{ role: string; content: string }>, userContext?: UserProfileData): Promise<string> {
    try {
      const systemPrompt = `You are a professional career advisor AI assistant. Help users with career guidance, job search advice, skill development, and professional growth.
      
      ${userContext ? `User Context: 
      - Work Experience: ${JSON.stringify(userContext.workExperience)}
      - Education: ${JSON.stringify(userContext.education)}
      - Skills: ${JSON.stringify(userContext.skills)}
      - Projects: ${JSON.stringify(userContext.projects)}
      - Learning Progress: ${JSON.stringify(userContext.learningProgress)}
      ` : ''}
      
      Provide helpful, actionable career advice. Be encouraging, professional, and specific when possible.`;

      console.log('🤖 [AI-SERVICE] Sending chat request to Google AI');
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt,
      });

      const lastMessage = messages[messages.length - 1];
      const response = await model.generateContent(lastMessage.content);
      console.log('🤖 [AI-SERVICE] Chat Google AI response:', response.response.text());
      return response.response.text() || 'I apologize, but I could not generate a response at this time.';
    } catch (error) {
      console.error('❌ [AI-SERVICE] Error generating chat response:', error);
      throw new Error('Failed to generate chat response');
    }
  }
}