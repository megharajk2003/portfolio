// PDF export functionality using browser's print API
// In a real implementation, you might want to use react-pdf or similar

export interface ProfileData {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

export interface ResumeData {
  profile: ProfileData;
  workExperience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate?: string;
  }>;
  skills: Array<{
    name: string;
    level: number;
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications: Array<{
    title: string;
    issuer: string;
    date: string;
  }>;
}

export function generatePDFResume(data: ResumeData) {
  // Create a new window with the resume content
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Unable to open print window. Please check your popup blocker.');
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.profile.name} - Resume</title>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #4F46E5;
        }
        
        .header h1 {
          font-size: 2.5em;
          color: #1a1a1a;
          margin-bottom: 10px;
        }
        
        .header .role {
          font-size: 1.3em;
          color: #4F46E5;
          margin-bottom: 15px;
        }
        
        .contact-info {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 0.9em;
          color: #666;
        }
        
        .section {
          margin-bottom: 35px;
        }
        
        .section h2 {
          font-size: 1.4em;
          color: #1a1a1a;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .summary {
          font-size: 1em;
          line-height: 1.7;
          text-align: justify;
        }
        
        .experience-item, .education-item, .project-item {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .experience-item:last-child,
        .education-item:last-child,
        .project-item:last-child {
          border-bottom: none;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .item-title {
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .item-company, .item-institution {
          color: #4F46E5;
          font-weight: 500;
        }
        
        .item-date {
          color: #666;
          font-size: 0.9em;
          white-space: nowrap;
        }
        
        .item-description {
          margin-top: 8px;
          color: #555;
        }
        
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .skill-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }
        
        .skill-name {
          font-weight: 500;
        }
        
        .skill-level {
          color: #4F46E5;
          font-weight: 600;
        }
        
        .technologies {
          margin-top: 8px;
        }
        
        .tech-tag {
          display: inline-block;
          background: #f0f0f0;
          color: #555;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          margin-right: 8px;
          margin-bottom: 4px;
        }
        
        .certifications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
        }
        
        .cert-item {
          padding: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
        }
        
        .cert-title {
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .cert-issuer {
          color: #4F46E5;
          margin-top: 4px;
        }
        
        .cert-date {
          color: #666;
          font-size: 0.9em;
          margin-top: 4px;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .section {
            break-inside: avoid;
          }
          
          .experience-item,
          .education-item,
          .project-item {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.profile.name}</h1>
        <div class="role">${data.profile.role}</div>
        <div class="contact-info">
          <span>${data.profile.email}</span>
          <span>${data.profile.phone}</span>
          <span>${data.profile.location}</span>
        </div>
      </div>

      ${data.profile.summary ? `
      <div class="section">
        <h2>Professional Summary</h2>
        <div class="summary">${data.profile.summary}</div>
      </div>
      ` : ''}

      ${data.workExperience.length > 0 ? `
      <div class="section">
        <h2>Work Experience</h2>
        ${data.workExperience.map(exp => `
          <div class="experience-item">
            <div class="item-header">
              <div>
                <div class="item-title">${exp.title}</div>
                <div class="item-company">${exp.company}</div>
              </div>
              <div class="item-date">${exp.startDate} - ${exp.endDate || 'Present'}</div>
            </div>
            ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${data.skills.length > 0 ? `
      <div class="section">
        <h2>Skills</h2>
        <div class="skills-grid">
          ${data.skills.map(skill => `
            <div class="skill-item">
              <span class="skill-name">${skill.name}</span>
              <span class="skill-level">${skill.level}%</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${data.projects.length > 0 ? `
      <div class="section">
        <h2>Projects</h2>
        ${data.projects.map(project => `
          <div class="project-item">
            <div class="item-title">${project.title}</div>
            ${project.description ? `<div class="item-description">${project.description}</div>` : ''}
            ${project.technologies.length > 0 ? `
              <div class="technologies">
                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${data.education.length > 0 ? `
      <div class="section">
        <h2>Education</h2>
        ${data.education.map(edu => `
          <div class="education-item">
            <div class="item-header">
              <div>
                <div class="item-title">${edu.degree}</div>
                <div class="item-institution">${edu.institution}</div>
              </div>
              <div class="item-date">${edu.startDate} - ${edu.endDate || 'Present'}</div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${data.certifications.length > 0 ? `
      <div class="section">
        <h2>Certifications</h2>
        <div class="certifications-grid">
          ${data.certifications.map(cert => `
            <div class="cert-item">
              <div class="cert-title">${cert.title}</div>
              <div class="cert-issuer">${cert.issuer}</div>
              <div class="cert-date">${cert.date}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
}

export async function exportResumeAsPDF(userId: string) {
  try {
    // Fetch all resume data
    const [profileRes, workRes, educationRes, skillsRes, projectsRes, certificationsRes] = await Promise.all([
      fetch(`/api/profile/${userId}`),
      fetch(`/api/work-experience/${userId}`),
      fetch(`/api/education/${userId}`),
      fetch(`/api/skills/${userId}`),
      fetch(`/api/projects/${userId}`),
      fetch(`/api/certifications/${userId}`),
    ]);

    const profile = await profileRes.json();
    const workExperience = await workRes.json();
    const education = await educationRes.json();
    const skills = await skillsRes.json();
    const projects = await projectsRes.json();
    const certifications = await certificationsRes.json();

    const resumeData: ResumeData = {
      profile: {
        name: profile.name || 'Your Name',
        role: profile.role || 'Your Role',
        email: profile.email || 'your.email@example.com',
        phone: profile.phone || 'Your Phone',
        location: profile.location || 'Your Location',
        summary: profile.summary || '',
      },
      workExperience: workExperience.filter((exp: any) => exp.isVisible),
      education: education.filter((edu: any) => edu.isVisible),
      skills: skills.filter((skill: any) => skill.isVisible),
      projects: projects.filter((project: any) => project.isVisible),
      certifications: certifications.filter((cert: any) => cert.isVisible),
    };

    generatePDFResume(resumeData);
  } catch (error) {
    console.error('Error exporting resume:', error);
    throw new Error('Failed to export resume. Please try again.');
  }
}
