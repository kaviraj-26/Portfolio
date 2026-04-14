// Three.js 3D Coin Logo
let scene, camera, renderer, coin, isHovered = false;

function init3DLogo() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    const logoContainer = document.getElementById('coin-logo');
    renderer.setSize(40, 40);
    logoContainer.appendChild(renderer.domElement);

    // Create coin geometry
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0xff6b6b,
        shininess: 100,
        specular: 0x111111
    });
    coin = new THREE.Mesh(geometry, material);

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    scene.add(coin);
    camera.position.z = 2;

    // Hide the renderer initially
    renderer.domElement.style.display = 'none';

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (isHovered) {
        coin.rotation.y += 0.05;
    }

    renderer.render(scene, camera);
}

// API helper functions
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(endpoint, options);
    return await response.json();
}

// Load profile data
async function loadProfileData() {
    try {
        const profile = await apiRequest('/api/profile');
        document.getElementById('experience').textContent = profile.experience;
        document.getElementById('project-count').textContent = profile.projectCount;
        document.getElementById('education').textContent = profile.education;
        document.getElementById('certificates').textContent = profile.certificates;
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

// Load projects
async function loadProjects() {
    try {
        const projects = await apiRequest('/api/projects');
        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.innerHTML = '';

        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.setAttribute('data-category', project.category);
            projectCard.innerHTML = `
                <img src="${project.files[0] || 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Project'}" alt="${project.title}">
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                </div>
            `;
            projectsGrid.appendChild(projectCard);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Event listeners for coin logo
document.getElementById('coin-logo').addEventListener('mouseenter', () => {
    isHovered = true;
    renderer.domElement.style.display = 'block';
});

document.getElementById('coin-logo').addEventListener('mouseleave', () => {
    isHovered = false;
    setTimeout(() => {
        if (!isHovered) {
            renderer.domElement.style.display = 'none';
        }
    }, 1000);
});

document.getElementById('coin-logo').addEventListener('click', () => {
    document.getElementById('admin-modal').style.display = 'block';
});

// Modal functionality
const modals = document.querySelectorAll('.modal');
const closeButtons = document.querySelectorAll('.close');

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        modals.forEach(modal => modal.style.display = 'none');
    });
});

window.addEventListener('click', (event) => {
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Admin login - Direct Fingerprint Authentication on Logo Click
document.getElementById('coin-logo').addEventListener('click', () => {
    // Show modal immediately
    document.getElementById('admin-modal').style.display = 'block';

    // Initialize and start fingerprint authentication automatically
    setTimeout(() => {
        initializeFingerprintAuth(true); // true = auto-start scanning
    }, 500); // Small delay for modal animation
});

function initializeFingerprintAuth(autoStart = false) {
    const fingerprintBtn = document.getElementById('fingerprint-btn');
    const fingerprintCircle = document.querySelector('.fingerprint-circle');
    const statusDiv = document.getElementById('fingerprint-status');

    // If auto-start is enabled, begin authentication immediately
    if (autoStart) {
        authenticateFingerprint(fingerprintCircle, statusDiv);
    }

    // Also allow manual clicking
    fingerprintBtn.addEventListener('click', async () => {
        await authenticateFingerprint(fingerprintCircle, statusDiv);
    });
}

async function authenticateFingerprint(circle, status) {
    // Reset status
    status.textContent = 'Initializing scanner...';
    status.className = 'fingerprint-status';
    circle.classList.remove('scanning');

    // Small delay for initialization message
    await new Promise(resolve => setTimeout(resolve, 800));

    // Start scanning animation
    circle.classList.add('scanning');
    status.textContent = 'Scanning fingerprint...';
    status.classList.add('scanning');

    try {
        // Simulate fingerprint authentication
        // In production, this would use WebAuthn API
        const isAuthenticated = await simulateFingerprintScan();

        if (isAuthenticated) {
            status.textContent = '✓ Authentication successful!';
            status.classList.add('success');
            circle.classList.remove('scanning');

            // Wait for success message, then proceed
            setTimeout(() => {
                document.getElementById('admin-modal').style.display = 'none';
                document.getElementById('upload-modal').style.display = 'block';
                alert('Fingerprint authentication successful! Welcome to admin dashboard.');
            }, 1500);
        } else {
            throw new Error('Fingerprint not recognized');
        }
    } catch (error) {
        status.textContent = '✗ Authentication failed. Please try again.';
        status.classList.add('error');
        circle.classList.remove('scanning');

        // Reset after error
        setTimeout(() => {
            status.textContent = 'Click scanner to retry...';
            status.className = 'fingerprint-status';
        }, 3000);
    }
}

async function simulateFingerprintScan() {
    // Simulate network delay and processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 90% success rate for demo
    return Math.random() > 0.1;
}

// WebAuthn implementation for production (commented out for demo)
/*
async function authenticateWithWebAuthn() {
    try {
        const credential = await navigator.credentials.get({
            publicKey: {
                challenge: new Uint8Array(32),
                allowCredentials: [{
                    type: 'public-key',
                    id: Uint8Array.from(window.atob('registered-credential-id'), c => c.charCodeAt(0))
                }],
                userVerification: 'required'
            }
        });

        // Verify credential with server
        const response = await fetch('/api/admin/fingerprint-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                credentialId: credential.id,
                authenticatorData: credential.authenticatorData,
                clientDataJSON: credential.clientDataJSON,
                signature: credential.signature
            })
        });

        return await response.json();
    } catch (error) {
        console.error('WebAuthn authentication failed:', error);
        throw error;
    }
}
*/

// Project upload form
document.getElementById('project-upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('adminToken');
    if (!token) {
        alert('Please login first.');
        return;
    }

    const formData = new FormData(e.target);

    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert(`Project uploaded successfully! Files saved to Google Drive.\n\nView project folder: ${result.project.driveFolderUrl}\n\nIt will be automatically shared to your social media accounts.`);
            document.getElementById('upload-modal').style.display = 'none';
            e.target.reset();
            loadProjects(); // Reload projects
        } else {
            alert('Upload failed. Please try again.');
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
    }
});

// Project filtering
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');
        const projectCards = document.querySelectorAll('.project-card');

        projectCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Contact form submission
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await apiRequest('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.success) {
            alert('Thank you for your message! I will get back to you soon.');
            e.target.reset();
        } else {
            alert('Failed to send message. Please try again.');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        alert('Failed to send message. Please try again.');
    }
});

// Smooth scrolling for navigation
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        targetSection.scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    init3DLogo();
    loadProfileData();
    loadProjects();
});

// Social media links (in production, these would be dynamically loaded)
document.getElementById('linkedin-link').href = 'https://linkedin.com/in/kaviraj';
document.getElementById('artstation-link').href = 'https://artstation.com/kaviraj';
document.getElementById('youtube-link').href = 'https://youtube.com/@kaviraj3d';