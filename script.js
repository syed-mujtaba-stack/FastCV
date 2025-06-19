let skills = [];
let profilePicSrc = 'assets/sample-profile.jpg';
let accentColor = '#007bff';
let showQRCode = false;
let qrCodeInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupEventListeners();
    makeSortable();
    generateResumeContent();
});

function setupEventListeners() {
    document.querySelectorAll('.form-section input, .form-section textarea').forEach(input => {
        input.addEventListener('input', () => {
            validateField(input);
            generateResumeContent();
            saveToLocalStorage();
        });
    });

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('change', () => {
        document.body.dataset.theme = themeToggle.checked ? 'dark' : 'light';
        saveToLocalStorage();
    });

    const skillsInput = document.getElementById('skills-input');
    skillsInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && this.value.trim() !== '') {
            event.preventDefault();
            addSkill(this.value.trim());
            this.value = '';
        }
    });

    const colorPicker = document.getElementById('color-picker');
    colorPicker.addEventListener('input', (event) => {
        accentColor = event.target.value;
        document.documentElement.style.setProperty('--accent-color', accentColor);
        generateResumeContent();
        saveToLocalStorage();
    });

    const qrToggle = document.getElementById('qr-toggle');
    qrToggle.addEventListener('change', (event) => {
        showQRCode = event.target.checked;
        generateResumeContent();
        saveToLocalStorage();
    });
}

function addEducation(edu = { degree: '', institute: '', year: '' }) {
    const container = document.getElementById('education-fields');
    const entryId = `edu-${Date.now()}`;
    const newEntry = document.createElement('div');
    newEntry.className = 'sortable-item';
    newEntry.id = entryId;
    newEntry.draggable = true;
    newEntry.innerHTML = `
        <i class="fas fa-grip-vertical drag-handle"></i>
        <input type="text" class="degree" placeholder="Degree" value="${edu.degree}" required>
        <input type="text" class="institute" placeholder="Institute" value="${edu.institute}" required>
        <input type="number" class="edu-year" placeholder="Year" value="${edu.year}" required>
        <button type="button" class="remove-btn" onclick="removeEntry('${entryId}')"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(newEntry);
    addInputListeners(newEntry);
}

function addExperience(exp = { company: '', role: '', duration: '', desc: '' }) {
    const container = document.getElementById('experience-fields');
    const entryId = `exp-${Date.now()}`;
    const newEntry = document.createElement('div');
    newEntry.className = 'sortable-item';
    newEntry.id = entryId;
    newEntry.draggable = true;
    newEntry.innerHTML = `
        <i class="fas fa-grip-vertical drag-handle"></i>
        <input type="text" class="company" placeholder="Company" value="${exp.company}" required>
        <input type="text" class="role" placeholder="Role" value="${exp.role}" required>
        <input type="text" class="duration" placeholder="Duration" value="${exp.duration}" required>
        <textarea class="work-desc" placeholder="Job Description">${exp.desc}</textarea>
        <div class="button-group">
            <button type="button" class="remove-btn" onclick="removeEntry('${entryId}')"><i class="fas fa-trash"></i></button>
            <button type="button" class="ai-btn" onclick="getAISuggestions('${entryId}')"><i class="fas fa-lightbulb"></i> AI Suggest</button>
        </div>
    `;
    container.appendChild(newEntry);
    addInputListeners(newEntry);
}

function addInputListeners(element) {
    element.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            generateResumeContent();
            saveToLocalStorage();
        });
    });
}

function removeEntry(entryId) {
    document.getElementById(entryId).remove();
    generateResumeContent();
    saveToLocalStorage();
}

function addSkill(skill) {
    if (skill && !skills.includes(skill)) {
        skills.push(skill);
        renderSkills();
        generateResumeContent();
        saveToLocalStorage();
    }
}

function removeSkill(skillToRemove) {
    skills = skills.filter(skill => skill !== skillToRemove);
    renderSkills();
    generateResumeContent();
    saveToLocalStorage();
}

function renderSkills() {
    const tagsContainer = document.getElementById('skills-tags');
    tagsContainer.innerHTML = '';
    skills.forEach(skill => {
        const tag = document.createElement('div');
        tag.classList.add('skill-tag');
        tag.innerHTML = `${skill} <span onclick="removeSkill('${skill}')">&times;</span>`;
        tagsContainer.appendChild(tag);
    });
}

function previewProfilePic(event) {
    const reader = new FileReader();
    reader.onload = function(){
        profilePicSrc = reader.result;
        document.getElementById('profile-pic-preview').src = profilePicSrc;
        generateResumeContent();
        saveToLocalStorage();
    };
    reader.readAsDataURL(event.target.files[0]);
}

function changeTemplate(templateName) {
    document.querySelectorAll('.template-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const resumeTemplate = document.getElementById('resume-template');
    resumeTemplate.className = `resume-${templateName}`;
    generateResumeContent();
    saveToLocalStorage();
}

function generateResumeContent() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const linkedin = document.getElementById('linkedin').value;
    const educationEntries = Array.from(document.querySelectorAll('#education-fields .sortable-item')).map(entry => ({
        degree: entry.querySelector('.degree').value,
        institute: entry.querySelector('.institute').value,
        year: entry.querySelector('.edu-year').value
    }));
    const experienceEntries = Array.from(document.querySelectorAll('#experience-fields .sortable-item')).map(entry => ({
        company: entry.querySelector('.company').value,
        role: entry.querySelector('.role').value,
        duration: entry.querySelector('.duration').value,
        desc: entry.querySelector('.work-desc').value
    }));

    let qrCodeHTML = '';
    if (showQRCode && linkedin) {
        qrCodeHTML = `<div id="qr-code-container" class="qr-code"></div>`;
    }

    let resumeHTML = `
        <style>:root { --accent-color: ${accentColor}; }</style>
        ${qrCodeHTML}
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${profilePicSrc}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--accent-color);">
            <h3>${name}</h3>
            <p>${email} | ${phone} | ${address}${linkedin ? ` | <a href="${linkedin}" target="_blank">LinkedIn</a>` : ''}</p>
        </div>
        <div>
            <h4>Education</h4>
            ${educationEntries.map(edu => `<p><strong>${edu.degree}</strong>, ${edu.institute} (${edu.year})</p>`).join('')}
        </div>
        <div>
            <h4>Work Experience</h4>
            ${experienceEntries.map(exp => `
                <p><strong>${exp.role}</strong> at ${exp.company} (${exp.duration})</p>
                <div style="margin-left: 20px;">${exp.desc.replace(/\n/g, '<br>')}</div>
            `).join('')}
        </div>
        <div>
            <h4>Skills</h4>
            <ul style="list-style-type: disc; padding-left: 20px;">
                ${skills.map(skill => `<li>${skill}</li>`).join('')}
            </ul>
        </div>
    `;
    document.getElementById('resume-template').innerHTML = resumeHTML;

    if (showQRCode && linkedin) {
        if (qrCodeInstance) {
            qrCodeInstance.clear();
            qrCodeInstance.makeCode(linkedin);
        } else {
            qrCodeInstance = new QRCode(document.getElementById("qr-code-container"), {
                text: linkedin,
                width: 80,
                height: 80,
            });
        }
    }
}

function downloadPDF() {
    const resumeContent = document.getElementById('resume-template-wrapper');
    const originalBg = resumeContent.style.backgroundColor;
    resumeContent.style.backgroundColor = 'white';

    html2canvas(resumeContent, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = canvas.width / canvas.height;
        let width = pdfWidth - 20;
        let height = width / ratio;
        if (height > pdfHeight - 20) {
            height = pdfHeight - 20;
            width = height * ratio;
        }
        pdf.addImage(imgData, 'PNG', 10, 10, width, height);
        pdf.save('resume.pdf');
        resumeContent.style.backgroundColor = originalBg;
    });
}

function validateField(input) {
    const errorSpan = input.parentElement.querySelector('.error-message');
    if (!errorSpan) return;
    if (input.required && input.value.trim() === '') {
        errorSpan.textContent = `${input.placeholder} is required.`;
        input.classList.add('invalid');
    } else if (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(input.value)) {
        errorSpan.textContent = 'Please enter a valid email address.';
        input.classList.add('invalid');
    } else {
        errorSpan.textContent = '';
        input.classList.remove('invalid');
    }
}

function getAISuggestions(entryId) {
    const entry = document.getElementById(entryId);
    const role = entry.querySelector('.role').value;
    const company = entry.querySelector('.company').value;
    const descTextarea = entry.querySelector('.work-desc');

    if (!role) {
        alert("Please enter a role first to get AI suggestions.");
        return;
    }

    // This is a mock AI response. In a real application, you would make an API call.
    const suggestions = [
        `Spearheaded the development of [Project Name] at ${company}, resulting in a X% increase in user engagement.`,
        `Collaborated with cross-functional teams to design and implement new features for the ${company} platform.`,
        `Managed the full project lifecycle for [Product], from initial concept to successful launch.`,
        `Mentored junior developers and improved team productivity by X%.`
    ];
    
    const currentDesc = descTextarea.value;
    const newSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    descTextarea.value = currentDesc ? `${currentDesc}\n- ${newSuggestion}` : `- ${newSuggestion}`;
    
    generateResumeContent();
    saveToLocalStorage();
}

function makeSortable() {
    const sortableLists = document.querySelectorAll('.sortable-list');
    sortableLists.forEach(list => {
        let draggingEle;
        list.addEventListener('dragstart', (e) => {
            draggingEle = e.target;
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        list.addEventListener('dragend', (e) => {
            draggingEle.classList.remove('dragging');
            generateResumeContent();
            saveToLocalStorage();
        });
        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(list, e.clientY);
            if (afterElement == null) {
                list.appendChild(draggingEle);
            } else {
                list.insertBefore(draggingEle, afterElement);
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Local Storage & LinkedIn Import
function saveToLocalStorage() {
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        linkedin: document.getElementById('linkedin').value,
        education: Array.from(document.querySelectorAll('#education-fields .sortable-item')).map(entry => ({
            degree: entry.querySelector('.degree').value,
            institute: entry.querySelector('.institute').value,
            year: entry.querySelector('.edu-year').value
        })),
        experience: Array.from(document.querySelectorAll('#experience-fields .sortable-item')).map(entry => ({
            company: entry.querySelector('.company').value,
            role: entry.querySelector('.role').value,
            duration: entry.querySelector('.duration').value,
            desc: entry.querySelector('.work-desc').value
        })),
        skills: skills,
        profilePic: profilePicSrc,
        theme: document.body.dataset.theme,
        accentColor: accentColor,
        showQRCode: showQRCode,
        template: document.getElementById('resume-template').className
    };
    localStorage.setItem('fastCVData', JSON.stringify(formData));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('fastCVData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('name').value = data.name || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('phone').value = data.phone || '';
        document.getElementById('address').value = data.address || '';
        document.getElementById('linkedin').value = data.linkedin || '';
        
        document.getElementById('education-fields').innerHTML = '';
        if (data.education) data.education.forEach(addEducation);
        
        document.getElementById('experience-fields').innerHTML = '';
        if (data.experience) data.experience.forEach(addExperience);
        
        skills = data.skills || [];
        renderSkills();
        
        profilePicSrc = data.profilePic || 'assets/sample-profile.jpg';
        document.getElementById('profile-pic-preview').src = profilePicSrc;
        
        if (data.theme === 'dark') {
            document.getElementById('theme-toggle').checked = true;
            document.body.dataset.theme = 'dark';
        }
        
        accentColor = data.accentColor || '#007bff';
        document.getElementById('color-picker').value = accentColor;
        document.documentElement.style.setProperty('--accent-color', accentColor);

        showQRCode = data.showQRCode || false;
        document.getElementById('qr-toggle').checked = showQRCode;

        if(data.template) {
            const templateName = data.template.replace('resume-', '');
            document.querySelectorAll('.template-btn').forEach(btn => {
                btn.classList.remove('active');
                if(btn.innerText.toLowerCase() === templateName) btn.classList.add('active');
            });
            document.getElementById('resume-template').className = data.template;
        }
    }
}

async function handleLinkedInImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const zip = await JSZip.loadAsync(file);
    
    document.getElementById('education-fields').innerHTML = '';
    document.getElementById('experience-fields').innerHTML = '';
    skills = [];

    const profile = JSON.parse(await zip.file('Profile.json').async('string'));
    document.getElementById('name').value = `${profile.firstName} ${profile.lastName}`;
    document.getElementById('address').value = profile.geo;

    const emails = JSON.parse(await zip.file('Email Addresses.json').async('string'));
    if(emails.length > 0) document.getElementById('email').value = emails[0]['Email Address'];

    const education = JSON.parse(await zip.file('Education.json').async('string'));
    education.forEach(edu => addEducation({
        degree: edu.Degree,
        institute: edu['School Name'],
        year: edu['End Date'] ? new Date(edu['End Date']).getFullYear() : ''
    }));

    const positions = JSON.parse(await zip.file('Positions.json').async('string'));
    positions.forEach(pos => addExperience({
        company: pos['Company Name'],
        role: pos.Title,
        duration: `${new Date(pos['Started On']).getFullYear()} - ${pos['Finished On'] ? new Date(pos['Finished On']).getFullYear() : 'Present'}`,
        desc: pos.Description
    }));

    const skillsData = JSON.parse(await zip.file('Skills.json').async('string'));
    skillsData.forEach(skill => addSkill(skill.Name));
    
    generateResumeContent();
    saveToLocalStorage();
    alert('LinkedIn data imported successfully!');
}