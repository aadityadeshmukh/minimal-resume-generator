// Resume Builder App with PROPERLY WORKING Download Functionality
class ResumeBuilder {
  constructor() {
    this.resumeData = {
      basics: {
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        summary: ''
      },
      work: [],
      education: [],
      skills: []
    };

    this.currentFont = 'Inter';
    this.experienceCount = 0;
    this.educationCount = 0;

    this.init();
  }

  init() {
    console.log('Initializing Resume Builder...');
    this.setupEventListeners();
    this.loadSampleData();
    this.updatePreview();
    this.setupMobileToggle();
    console.log('Resume Builder initialized successfully');
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Basic info fields
    document.getElementById('fullName').addEventListener('input', (e) => {
      this.resumeData.basics.name = e.target.value;
      this.updatePreview();
    });

    document.getElementById('email').addEventListener('input', (e) => {
      this.resumeData.basics.email = e.target.value;
      this.updatePreview();
    });

    document.getElementById('phone').addEventListener('input', (e) => {
      this.resumeData.basics.phone = e.target.value;
      this.updatePreview();
    });

    document.getElementById('linkedin').addEventListener('input', (e) => {
      this.resumeData.basics.linkedin = e.target.value;
      this.updatePreview();
    });

    document.getElementById('summary').addEventListener('input', (e) => {
      this.resumeData.basics.summary = e.target.value;
      this.updatePreview();
    });

    document.getElementById('skills').addEventListener('input', (e) => {
      const skillsText = e.target.value;
      this.resumeData.skills = skillsText ? [{
        name: 'Technical Skills',
        keywords: skillsText.split(',').map(skill => skill.trim()).filter(skill => skill)
      }] : [];
      this.updatePreview();
    });

    // Font selection
    document.getElementById('fontSelect').addEventListener('change', (e) => {
      this.currentFont = e.target.value;
      this.updateFont();
    });

    // Add buttons
    document.getElementById('addExperience').addEventListener('click', () => this.addExperience());
    document.getElementById('addEducation').addEventListener('click', () => this.addEducation());

    // FIXED: Export/Import/Download buttons with proper event handling
    this.setupDownloadButtons();

    // File input for import
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        console.log('File input change event triggered');
        this.handleFileImport(e);
      });
    }

    console.log('Event listeners setup complete');
  }

  // FIXED: Separate method to properly setup download buttons
  setupDownloadButtons() {
    // Export JSON button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      // Remove any existing listeners
      exportBtn.replaceWith(exportBtn.cloneNode(true));
      const newExportBtn = document.getElementById('exportBtn');
      
      newExportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log('Export JSON button clicked');
        this.exportJSON();
      });
      
      // Ensure button is properly styled and clickable
      newExportBtn.style.pointerEvents = 'auto';
      newExportBtn.style.zIndex = '1000';
    }

    // Import JSON button
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
      // Remove any existing listeners
      importBtn.replaceWith(importBtn.cloneNode(true));
      const newImportBtn = document.getElementById('importBtn');
      
      newImportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log('Import JSON button clicked');
        this.importJSON();
      });
      
      // Ensure button is properly styled and clickable
      newImportBtn.style.pointerEvents = 'auto';
      newImportBtn.style.zIndex = '1000';
    }

    // Download PDF button
    const downloadBtn = document.getElementById('downloadPdf');
    if (downloadBtn) {
      // Remove any existing listeners
      downloadBtn.replaceWith(downloadBtn.cloneNode(true));
      const newDownloadBtn = document.getElementById('downloadPdf');
      
      newDownloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log('Download PDF button clicked');
        this.generatePDF();
      });
      
      // Ensure button is properly styled and clickable
      newDownloadBtn.style.pointerEvents = 'auto';
      newDownloadBtn.style.zIndex = '1000';
    }
  }

  setupMobileToggle() {
    const toggleEdit = document.getElementById('toggleEdit');
    const togglePreview = document.getElementById('togglePreview');
    const formPanel = document.getElementById('formPanel');
    const previewPanel = document.getElementById('previewPanel');

    if (toggleEdit && togglePreview && formPanel && previewPanel) {
      toggleEdit.addEventListener('click', () => {
        toggleEdit.classList.add('active');
        togglePreview.classList.remove('active');
        formPanel.classList.remove('hidden');
        previewPanel.classList.add('hidden');
      });

      togglePreview.addEventListener('click', () => {
        togglePreview.classList.add('active');
        toggleEdit.classList.remove('active');
        previewPanel.classList.remove('hidden');
        formPanel.classList.add('hidden');
      });
    }
  }

  showStatusMessage(message, type = 'success', duration = 3000) {
    const statusElement = document.getElementById('statusMessage');
    if (!statusElement) return;

    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.classList.remove('hidden');

    setTimeout(() => {
      statusElement.classList.add('hidden');
    }, duration);
  }

  setButtonLoading(buttonId, loading = true) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    if (loading) {
      button.classList.add('loading');
      button.disabled = true;
      button.style.cursor = 'wait';
    } else {
      button.classList.remove('loading');
      button.disabled = false;
      button.style.cursor = 'pointer';
    }
  }

  // ENHANCED: Utility function to create and trigger file download with better cross-browser support
  triggerDownload(blob, filename) {
    try {
      console.log(`Creating download for file: ${filename}, size: ${blob.size} bytes`);
      
      // Method 1: Try the standard approach first
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // IE/Edge support
        window.navigator.msSaveOrOpenBlob(blob, filename);
        console.log('Download triggered using msSaveOrOpenBlob (IE/Edge)');
        return true;
      }
      
      // Method 2: Standard approach for modern browsers
      try {
        const url = URL.createObjectURL(blob);
        console.log('Blob URL created:', url);
        
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = filename;
        link.target = '_blank'; // Ensure it doesn't navigate away
        
        // Add to DOM temporarily
        document.body.appendChild(link);
        
        // Force click with multiple methods for better compatibility
        if (link.click) {
          link.click();
        } else if (link.dispatchEvent) {
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: false
          });
          link.dispatchEvent(clickEvent);
        }
        
        console.log('Download click triggered');
        
        // Cleanup
        document.body.removeChild(link);
        
        // Clean up blob URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
          console.log('Blob URL cleaned up');
        }, 1000);
        
        return true;
        
      } catch (linkError) {
        console.warn('Standard link method failed, trying fallback:', linkError);
        
        // Method 3: Fallback approach
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          newWindow.document.title = filename;
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 1000);
          return true;
        }
        
        throw new Error('All download methods failed');
      }
      
    } catch (error) {
      console.error('Download trigger failed:', error);
      throw new Error('Unable to trigger download: ' + error.message);
    }
  }

  loadSampleData() {
    console.log('Loading sample data...');
    const sampleData = {
      basics: {
        name: "Samiksha Mohokar",
        email: "sami.mohokar@gmail.com",
        phone: "8888873205",
        linkedin: "linkedin.com/in/samiksha-mohokar",
        summary: "Seasoned, self-motivated professional with 10 years of experience in IT industry and have hands-on experience on Oracle PL/SQL based software development and Unix.\n\n• Drove customer retention efforts by leading a team of 2-4 members.\n• Demonstrated the ability to handle multiple projects simultaneously and complete them to the highest standard within tight deadlines without compromising quality.\n• Coordinated development & support functions from onshore (UK) for multiple applications with full ownership.\n• Experienced in delivering across the software development life cycle."
      },
      work: [
        {
          position: "Senior Software Engineer",
          name: "Techmahindra PrivateLimited",
          location: "Pune",
          startDate: "May 2016",
          endDate: "Present",
          highlights: [
            "Application support role:",
            "• Worked with Telefonica O2 UK at customer location.",
            "• Introduced service improvements.",
            "• Deploying code changes.",
            "• Solved ad-hoc request from the client involving Hadoop queries.",
            "• Involved in upgrade project of the application database from Cloudera to Hortonworks.",
            "",
            "Application Development role:",
            "• Worked with Digi-Telenor (Malaysia)",
            "• Worked in agile development team delivering enhancements and quality improvements.",
            "• Analyzed new requirement and prepared technical specification documents.",
            "• Performed system testing and communicate test results to the users.",
            "• Hands on Advance PL SQL concepts(Collections ,Performance Tuning , Bulk collect ,Partitions )",
            "• Performed effective code reviews before deployment to live environments.",
            "• Performed extract, transform & load (ETL) activities during database migration.",
            "",
            "• Lead a team of 2-4 people from onshore for key customer deliveries.",
            "• Coached and mentored new and existing team members.",
            "• Presenting weekly team status reports to key stakeholders.",
            "• Used Wedo Mobileum tool for development purposes.",
            "• Jira administrator for the team."
          ]
        },
        {
          position: "Software Engineer",
          name: "Zensar Technologies",
          location: "",
          startDate: "Sep 2011",
          endDate: "May 2016",
          highlights: [
            "• Worked with Mutual & Federal (SA), CISCO (US)",
            "• Captured requirements, analyzed impact, delivered enhancements and quality improvements",
            "• Tested the product and documented new enhancements",
            "• Deployed the code using SVN, GIT and AppDB.",
            "• Generated reports in BI Publisher",
            "• Responsible for helping the company's global internal control assessment process to ensure compliance of Sarbanes-Oxley regulations through continuous improvement in internal control procedures.",
            "• Understanding of financial accounting and audit, as well as the Sarbanes Oxley Act of 2002 and Audit Standard 5.",
            "• Performing above controls by executing PL-SQL code, fetching the data from respective database and analyzing it."
          ]
        }
      ],
      education: [
        {
          institution: "Savitribai Phule Pune University",
          studyType: "Bachelor of Engineering (BEng)",
          area: "Computer Engineering",
          startDate: "2007",
          endDate: "2011"
        }
      ],
      skills: [
        {
          name: "Technical Skills",
          keywords: [
            "SQL", "PL/SQL", "Unix", "Shell Scripting", "Performance Tuning",
            "Team Leadership", "Presentation Skills", "Oracle SQL Developer",
            "Agile Methodologies", "Database Development"
          ]
        }
      ]
    };

    this.resumeData = sampleData;
    this.populateForm();
  }

  populateForm() {
    console.log('Populating form with data...');
    // Populate basic info
    document.getElementById('fullName').value = this.resumeData.basics.name || '';
    document.getElementById('email').value = this.resumeData.basics.email || '';
    document.getElementById('phone').value = this.resumeData.basics.phone || '';
    document.getElementById('linkedin').value = this.resumeData.basics.linkedin || '';
    document.getElementById('summary').value = this.resumeData.basics.summary || '';

    // Populate skills
    if (this.resumeData.skills.length > 0) {
      document.getElementById('skills').value = this.resumeData.skills[0].keywords.join(', ');
    }

    // Clear existing containers
    document.getElementById('experienceContainer').innerHTML = '';
    document.getElementById('educationContainer').innerHTML = '';
    this.experienceCount = 0;
    this.educationCount = 0;

    // Populate work experience
    this.resumeData.work.forEach(() => this.addExperience());
    
    // Populate education
    this.resumeData.education.forEach(() => this.addEducation());
  }

  addExperience(data = null) {
    const container = document.getElementById('experienceContainer');
    const index = this.experienceCount++;
    
    const experienceData = data || (this.resumeData.work[index] || {
      position: '',
      name: '',
      location: '',
      startDate: '',
      endDate: '',
      highlights: []
    });

    const experienceHTML = `
      <div class="experience-item" data-index="${index}">
        <div class="item-header">
          <h3 class="item-title">Experience #${index + 1}</h3>
          <button type="button" class="remove-item" onclick="resumeBuilder.removeExperience(${index})">Remove</button>
        </div>
        <div class="form-group">
          <label class="form-label">Job Title *</label>
          <input type="text" class="form-control experience-position" value="${experienceData.position}" placeholder="e.g. Senior Software Engineer" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Company *</label>
            <input type="text" class="form-control experience-company" value="${experienceData.name}" placeholder="Company Name" required>
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <input type="text" class="form-control experience-location" value="${experienceData.location}" placeholder="City, State">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Date *</label>
            <input type="text" class="form-control experience-start" value="${experienceData.startDate}" placeholder="e.g. Jan 2020" required>
          </div>
          <div class="form-group">
            <label class="form-label">End Date</label>
            <input type="text" class="form-control experience-end" value="${experienceData.endDate}" placeholder="e.g. Present">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Job Description</label>
          <textarea class="form-control experience-highlights" rows="8" placeholder="• Describe your responsibilities and achievements&#10;• Use bullet points for better readability&#10;• Focus on measurable results">${Array.isArray(experienceData.highlights) ? experienceData.highlights.join('\n') : ''}</textarea>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', experienceHTML);
    this.setupExperienceListeners(index);
  }

  setupExperienceListeners(index) {
    const item = document.querySelector(`[data-index="${index}"]`);
    const inputs = item.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('input', () => this.updateExperienceData(index));
    });
  }

  updateExperienceData(index) {
    const item = document.querySelector(`[data-index="${index}"]`);
    if (!item) return;

    const position = item.querySelector('.experience-position').value;
    const company = item.querySelector('.experience-company').value;
    const location = item.querySelector('.experience-location').value;
    const startDate = item.querySelector('.experience-start').value;
    const endDate = item.querySelector('.experience-end').value;
    const highlights = item.querySelector('.experience-highlights').value.split('\n').filter(line => line.trim() !== '');

    if (!this.resumeData.work[index]) {
      this.resumeData.work[index] = {};
    }

    this.resumeData.work[index] = {
      position,
      name: company,
      location,
      startDate,
      endDate,
      highlights
    };

    this.updatePreview();
  }

  removeExperience(index) {
    const item = document.querySelector(`[data-index="${index}"]`);
    if (item) {
      item.remove();
      this.resumeData.work.splice(index, 1);
      this.updatePreview();
    }
  }

  addEducation(data = null) {
    const container = document.getElementById('educationContainer');
    const index = this.educationCount++;
    
    const educationData = data || (this.resumeData.education[index] || {
      institution: '',
      studyType: '',
      area: '',
      startDate: '',
      endDate: ''
    });

    const educationHTML = `
      <div class="education-item" data-edu-index="${index}">
        <div class="item-header">
          <h3 class="item-title">Education #${index + 1}</h3>
          <button type="button" class="remove-item" onclick="resumeBuilder.removeEducation(${index})">Remove</button>
        </div>
        <div class="form-group">
          <label class="form-label">Degree *</label>
          <input type="text" class="form-control education-degree" value="${educationData.studyType}" placeholder="e.g. Bachelor of Science" required>
        </div>
        <div class="form-group">
          <label class="form-label">Field of Study</label>
          <input type="text" class="form-control education-field" value="${educationData.area}" placeholder="e.g. Computer Science">
        </div>
        <div class="form-group">
          <label class="form-label">Institution *</label>
          <input type="text" class="form-control education-school" value="${educationData.institution}" placeholder="University/College Name" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Year</label>
            <input type="text" class="form-control education-start" value="${educationData.startDate}" placeholder="e.g. 2018">
          </div>
          <div class="form-group">
            <label class="form-label">End Year</label>
            <input type="text" class="form-control education-end" value="${educationData.endDate}" placeholder="e.g. 2022">
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', educationHTML);
    this.setupEducationListeners(index);
  }

  setupEducationListeners(index) {
    const item = document.querySelector(`[data-edu-index="${index}"]`);
    const inputs = item.querySelectorAll('input');
    
    inputs.forEach(input => {
      input.addEventListener('input', () => this.updateEducationData(index));
    });
  }

  updateEducationData(index) {
    const item = document.querySelector(`[data-edu-index="${index}"]`);
    if (!item) return;

    const degree = item.querySelector('.education-degree').value;
    const field = item.querySelector('.education-field').value;
    const school = item.querySelector('.education-school').value;
    const startDate = item.querySelector('.education-start').value;
    const endDate = item.querySelector('.education-end').value;

    if (!this.resumeData.education[index]) {
      this.resumeData.education[index] = {};
    }

    this.resumeData.education[index] = {
      institution: school,
      studyType: degree,
      area: field,
      startDate,
      endDate
    };

    this.updatePreview();
  }

  removeEducation(index) {
    const item = document.querySelector(`[data-edu-index="${index}"]`);
    if (item) {
      item.remove();
      this.resumeData.education.splice(index, 1);
      this.updatePreview();
    }
  }

  updatePreview() {
    // Update basic info
    document.getElementById('previewName').textContent = this.resumeData.basics.name || 'Your Name';
    document.getElementById('previewEmail').textContent = this.resumeData.basics.email || 'email@example.com';
    document.getElementById('previewPhone').textContent = this.resumeData.basics.phone || '+1 (555) 123-4567';
    document.getElementById('previewLinkedIn').textContent = this.resumeData.basics.linkedin || 'linkedin.com/in/profile';

    // Update summary
    const summaryElement = document.getElementById('previewSummary');
    if (this.resumeData.basics.summary) {
      summaryElement.innerHTML = this.formatText(this.resumeData.basics.summary);
      document.getElementById('summarySection').style.display = 'block';
    } else {
      document.getElementById('summarySection').style.display = 'none';
    }

    // Update experience
    const experienceElement = document.getElementById('previewExperience');
    if (this.resumeData.work && this.resumeData.work.length > 0) {
      experienceElement.innerHTML = this.resumeData.work.map(job => this.formatExperience(job)).join('');
      document.getElementById('experienceSection').style.display = 'block';
    } else {
      document.getElementById('experienceSection').style.display = 'none';
    }

    // Update education
    const educationElement = document.getElementById('previewEducation');
    if (this.resumeData.education && this.resumeData.education.length > 0) {
      educationElement.innerHTML = this.resumeData.education.map(edu => this.formatEducation(edu)).join('');
      document.getElementById('educationSection').style.display = 'block';
    } else {
      document.getElementById('educationSection').style.display = 'none';
    }

    // Update skills
    const skillsElement = document.getElementById('previewSkills');
    if (this.resumeData.skills && this.resumeData.skills.length > 0 && this.resumeData.skills[0].keywords.length > 0) {
      skillsElement.innerHTML = `<div class="skills-list">${this.resumeData.skills[0].keywords.join(' • ')}</div>`;
      document.getElementById('skillsSection').style.display = 'block';
    } else {
      document.getElementById('skillsSection').style.display = 'none';
    }
  }

  formatText(text) {
    return text.replace(/\n/g, '<br>');
  }

  formatExperience(job) {
    const highlights = job.highlights ? job.highlights.map(highlight => {
      if (highlight.trim() === '') return '<br>';
      return highlight;
    }).join('<br>') : '';

    const location = job.location ? ` • ${job.location}` : '';
    const endDate = job.endDate || 'Present';
    const dateRange = `${job.startDate} - ${endDate}`;

    return `
      <div class="experience-entry">
        <div class="job-title">${job.position}</div>
        <div class="company-info">${job.name}${location}</div>
        <div class="job-dates">${dateRange}</div>
        <div class="job-highlights">${highlights}</div>
      </div>
    `;
  }

  formatEducation(edu) {
    const degree = edu.studyType || '';
    const field = edu.area ? `, ${edu.area}` : '';
    const dates = edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : '';

    return `
      <div class="education-entry">
        <div class="degree-title">${degree}${field}</div>
        <div class="school-info">${edu.institution}</div>
        <div class="education-dates">${dates}</div>
      </div>
    `;
  }

  updateFont() {
    const preview = document.getElementById('resumePreview');
    preview.className = `resume-preview font-${this.currentFont.toLowerCase().replace(/\s+/g, '-')}`;
  }

  // ENHANCED: Proper JSON export with better error handling and user feedback
  exportJSON() {
    try {
      console.log('Starting JSON export...');
      this.setButtonLoading('exportBtn', true);
      this.showStatusMessage('Preparing JSON file for download...', 'processing');

      // Validate resume data
      if (!this.resumeData || !this.resumeData.basics) {
        throw new Error('No resume data to export');
      }

      // Create formatted JSON string with validation
      const dataToExport = {
        basics: this.resumeData.basics || {},
        work: this.resumeData.work || [],
        education: this.resumeData.education || [],
        skills: this.resumeData.skills || [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(dataToExport, null, 2);
      console.log('JSON data prepared:', dataStr.length, 'characters');

      if (dataStr.length < 50) {
        throw new Error('Resume data appears to be empty or invalid');
      }

      // Create blob with proper MIME type and BOM for better compatibility
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
      const blob = new Blob([bom, dataStr], { 
        type: 'application/json;charset=utf-8' 
      });
      console.log('JSON blob created:', blob.size, 'bytes');

      // Generate meaningful filename with timestamp
      const nameForFile = this.resumeData.basics.name && 
                         this.resumeData.basics.name.trim() && 
                         this.resumeData.basics.name !== 'Your Name' 
                         ? this.resumeData.basics.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
                         : 'Resume';
      
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const fileName = `${nameForFile}_Data_${timestamp}.json`;

      console.log('Generated filename:', fileName);

      // Trigger download with enhanced error handling
      this.triggerDownload(blob, fileName);
      
      console.log('JSON export completed successfully');
      this.showStatusMessage(`✅ JSON file "${fileName}" downloaded successfully!`, 'success', 5000);
      
    } catch (error) {
      console.error('JSON export failed:', error);
      this.showStatusMessage(`❌ Failed to export JSON: ${error.message}`, 'error', 8000);
    } finally {
      this.setButtonLoading('exportBtn', false);
    }
  }

  // ENHANCED: Import JSON with better file handling
  importJSON() {
    try {
      console.log('Starting JSON import process...');
      
      const fileInput = document.getElementById('fileInput');
      if (!fileInput) {
        throw new Error('File input element not found');
      }

      this.setButtonLoading('importBtn', true);
      this.showStatusMessage('📁 Opening file picker...', 'processing');

      // Reset file input to ensure change events fire
      fileInput.value = '';
      
      // Create a promise to handle the file dialog result
      const filePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('File picker timeout'));
        }, 30000); // 30 second timeout

        const handleChange = (e) => {
          clearTimeout(timeout);
          fileInput.removeEventListener('change', handleChange);
          resolve(e.target.files[0]);
        };

        fileInput.addEventListener('change', handleChange);
      });

      // Trigger file picker
      fileInput.click();
      console.log('File picker opened');

    } catch (error) {
      console.error('Failed to open file picker:', error);
      this.showStatusMessage(`❌ Failed to open file picker: ${error.message}`, 'error');
      this.setButtonLoading('importBtn', false);
    }
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected in handleFileImport');
      this.setButtonLoading('importBtn', false);
      this.showStatusMessage('No file selected', 'error', 2000);
      return;
    }

    console.log('Processing file import:', file.name, file.size, 'bytes', file.type);
    
    // Enhanced file validation
    const isJsonFile = file.type === 'application/json' || 
                      file.name.toLowerCase().endsWith('.json') ||
                      file.type === 'text/plain'; // Some systems report JSON as text/plain

    if (!isJsonFile) {
      this.showStatusMessage('❌ Please select a valid JSON file (.json extension)', 'error');
      this.setButtonLoading('importBtn', false);
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      this.showStatusMessage('❌ File too large. Please select a file smaller than 10MB', 'error');
      this.setButtonLoading('importBtn', false);
      return;
    }

    this.showStatusMessage('📖 Reading and processing file...', 'processing');

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        console.log('File read successfully, parsing JSON...');
        const fileContent = e.target.result;
        
        if (!fileContent || fileContent.trim().length === 0) {
          throw new Error('File appears to be empty');
        }

        const importedData = JSON.parse(fileContent);
        console.log('JSON parsed successfully:', importedData);
        
        // Enhanced validation
        if (!importedData || typeof importedData !== 'object') {
          throw new Error('Invalid file format - not a valid JSON object');
        }

        // Check for resume data structure
        const hasResumeData = importedData.basics || importedData.work || 
                            importedData.education || importedData.skills;
                            
        if (!hasResumeData) {
          throw new Error('File does not contain valid resume data structure');
        }

        // Merge with current data structure, preserving existing data where import data is missing
        this.resumeData = {
          basics: {
            name: '',
            email: '',
            phone: '',
            linkedin: '',
            summary: '',
            ...this.resumeData.basics, // Keep existing
            ...importedData.basics      // Override with imported
          },
          work: Array.isArray(importedData.work) ? importedData.work : this.resumeData.work,
          education: Array.isArray(importedData.education) ? importedData.education : this.resumeData.education,
          skills: Array.isArray(importedData.skills) ? importedData.skills : this.resumeData.skills
        };
        
        console.log('Data merged successfully');
        
        // Clear and repopulate form
        this.populateForm();
        this.updatePreview();
        
        console.log('Resume data imported successfully');
        this.showStatusMessage(`✅ Resume data imported successfully from "${file.name}"!`, 'success', 5000);
        
      } catch (error) {
        console.error('JSON import failed:', error);
        let errorMessage = 'Failed to import file: ' + error.message;
        if (error.name === 'SyntaxError') {
          errorMessage = 'File contains invalid JSON format. Please check the file and try again.';
        }
        this.showStatusMessage(`❌ ${errorMessage}`, 'error', 8000);
      } finally {
        this.setButtonLoading('importBtn', false);
      }
    };

    reader.onerror = () => {
      console.error('File read error');
      this.showStatusMessage('❌ Failed to read the selected file', 'error');
      this.setButtonLoading('importBtn', false);
    };

    reader.readAsText(file, 'UTF-8'); // Specify encoding
    
    // Reset file input
    event.target.value = '';
  }

  // ENHANCED: PDF generation with better error handling and cross-browser support
  generatePDF() {
    try {
      console.log('Starting PDF generation...');
      this.setButtonLoading('downloadPdf', true);
      this.showStatusMessage('🔄 Generating PDF document...', 'processing');

      // Enhanced jsPDF availability check
      if (!window.jspdf) {
        throw new Error('PDF library not loaded. Please refresh the page and try again.');
      }

      const { jsPDF } = window.jspdf;
      if (!jsPDF) {
        throw new Error('PDF generator not available. Please refresh the page and try again.');
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      console.log('jsPDF initialized');

      let yPos = 20;
      const lineHeight = 5;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const maxWidth = 170;
      
      // Enhanced text addition with better formatting
      const addText = (text, fontSize = 10, isBold = false, isTitle = false) => {
        if (!text || text.trim() === '') return;
        
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
        
        try {
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          
          if (isTitle) {
            yPos += 3;
          }
          
          const cleanText = text.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, ''); // Remove problematic chars
          const splitText = doc.splitTextToSize(cleanText, maxWidth);
          doc.text(splitText, margin, yPos);
          yPos += splitText.length * lineHeight;
          
          if (isTitle) {
            yPos += 2;
          }
        } catch (textError) {
          console.warn('Error adding text to PDF:', textError);
          // Continue with next text block
        }
      };
      
      // Add header with validation
      const name = (this.resumeData.basics.name || 'Your Name').trim();
      console.log('Adding header:', name);
      addText(name, 18, true);
      
      const contactInfo = [
        this.resumeData.basics.email,
        this.resumeData.basics.phone,
        this.resumeData.basics.linkedin
      ].filter(item => item && item.trim()).join(' • ');
      
      if (contactInfo) {
        addText(contactInfo, 10);
      }
      yPos += 5;
      
      // Add sections with validation
      if (this.resumeData.basics.summary && this.resumeData.basics.summary.trim()) {
        console.log('Adding summary section');
        addText('SUMMARY', 12, true, true);
        addText(this.resumeData.basics.summary.replace(/\n/g, ' '), 10);
        yPos += 5;
      }
      
      if (this.resumeData.work && this.resumeData.work.length > 0) {
        console.log('Adding experience section, entries:', this.resumeData.work.length);
        addText('EXPERIENCE', 12, true, true);
        
        this.resumeData.work.forEach((job, index) => {
          if (!job || typeof job !== 'object') return;
          
          console.log(`Adding job ${index + 1}:`, job.position);
          if (job.position) {
            addText(job.position, 11, true);
          }
          
          const companyInfo = [job.name, job.location].filter(item => item && item.trim()).join(' • ');
          if (companyInfo) {
            addText(companyInfo, 10);
          }
          
          const startDate = job.startDate || '';
          const endDate = job.endDate || 'Present';
          if (startDate) {
            addText(`${startDate} - ${endDate}`, 9);
          }
          
          if (job.highlights && Array.isArray(job.highlights)) {
            const highlightsText = job.highlights
              .filter(h => h && h.trim())
              .join('\n');
            if (highlightsText) {
              addText(highlightsText, 9);
            }
          }
          yPos += 3;
        });
      }
      
      if (this.resumeData.education && this.resumeData.education.length > 0) {
        console.log('Adding education section, entries:', this.resumeData.education.length);
        addText('EDUCATION', 12, true, true);
        
        this.resumeData.education.forEach((edu, index) => {
          if (!edu || typeof edu !== 'object') return;
          
          console.log(`Adding education ${index + 1}:`, edu.studyType);
          const degreeInfo = [edu.studyType, edu.area].filter(item => item && item.trim()).join(', ');
          if (degreeInfo) {
            addText(degreeInfo, 11, true);
          }
          
          if (edu.institution && edu.institution.trim()) {
            addText(edu.institution, 10);
          }
          
          if (edu.startDate && edu.endDate) {
            addText(`${edu.startDate} - ${edu.endDate}`, 9);
          }
          yPos += 3;
        });
      }
      
      if (this.resumeData.skills && this.resumeData.skills.length > 0 && 
          this.resumeData.skills[0].keywords && this.resumeData.skills[0].keywords.length > 0) {
        console.log('Adding skills section');
        addText('SKILLS', 12, true, true);
        const skillsText = this.resumeData.skills[0].keywords.join(' • ');
        addText(skillsText, 10);
      }
      
      console.log('PDF content generation completed');

      // Generate enhanced filename with sanitization
      const nameForFile = name && name !== 'Your Name' ? 
        name.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_').substring(0, 50) : 
        'Resume';
      
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const fileName = `${nameForFile}_${timestamp}.pdf`;
      
      console.log('Generated PDF filename:', fileName);
      
      // Create PDF blob with error handling
      let pdfBlob;
      try {
        pdfBlob = doc.output('blob');
        console.log('PDF blob created:', pdfBlob.size, 'bytes');
      } catch (blobError) {
        throw new Error('Failed to generate PDF content: ' + blobError.message);
      }

      if (pdfBlob.size < 1000) {
        throw new Error('Generated PDF appears to be corrupted or empty');
      }

      // Trigger download with enhanced error handling
      this.triggerDownload(pdfBlob, fileName);
      
      console.log('PDF generation and download completed successfully');
      this.showStatusMessage(`✅ PDF "${fileName}" downloaded successfully!`, 'success', 5000);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      let errorMessage = 'Failed to generate PDF: ' + error.message;
      if (error.message.includes('jsPDF')) {
        errorMessage = 'PDF generator not available. Please refresh the page and try again.';
      }
      this.showStatusMessage(`❌ ${errorMessage}`, 'error', 8000);
    } finally {
      this.setButtonLoading('downloadPdf', false);
    }
  }
}

// Enhanced initialization with better error handling
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing Resume Builder...');
  
  // Enhanced jsPDF availability check
  const checkJsPDF = () => {
    if (window.jspdf && window.jspdf.jsPDF) {
      console.log('✅ jsPDF library loaded successfully');
      return true;
    } else {
      console.warn('⚠️ jsPDF library not found or not loaded correctly');
      return false;
    }
  };

  // Wait a bit for external libraries to load
  setTimeout(() => {
    checkJsPDF();
    
    try {
      window.resumeBuilder = new ResumeBuilder();
      console.log('✅ Resume Builder initialization completed successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Resume Builder:', error);
      
      // Show error to user
      const statusElement = document.getElementById('statusMessage');
      if (statusElement) {
        statusElement.textContent = 'Failed to initialize application. Please refresh the page.';
        statusElement.className = 'status-message error';
        statusElement.classList.remove('hidden');
      }
    }
  }, 500); // 500ms delay to ensure libraries are loaded
});