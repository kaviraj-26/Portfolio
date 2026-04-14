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

// Admin login - Direct Fingerprint Authentication on Logo Click (Static Demo)
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

    // Also allow manual clicking as backup
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
        const isAuthenticated = await simulateFingerprintScan();

        if (isAuthenticated) {
            status.textContent = '✓ Authentication successful!';
            status.classList.add('success');
            circle.classList.remove('scanning');

            // Wait for success message, then proceed
            setTimeout(() => {
                document.getElementById('admin-modal').style.display = 'none';
                document.getElementById('upload-modal').style.display = 'block';
                alert('Fingerprint authentication successful! Welcome to admin dashboard.\n\nNote: This is a static demo. In the full version with backend, projects would be uploaded to your Google Drive folder:\nhttps://drive.google.com/drive/folders/1gRDgoO11jtwfMKGFu-wgS9Pvx6sXurV0\n\nEach project creates its own subfolder automatically.');
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
    // Simulate network delay and processing (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 90% success rate for demo purposes
    return Math.random() > 0.1;
}

// Project upload form (static demo)
document.getElementById('project-upload-form').addEventListener('submit', (e) => {
    e.preventDefault();

    alert('Project upload simulated successfully!\n\nIn the full version, this would:\n- Upload files to Google Drive\n- Save project data to database\n- Auto-post to LinkedIn, ArtStation, and YouTube\n\nTo use the full functionality, run the Node.js server with: npm start');
    document.getElementById('upload-modal').style.display = 'none';
    e.target.reset();
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

// Contact form submission (static demo)
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();

    alert('Thank you for your message! I will get back to you soon.\n\nNote: This is a static demo. In the full version, messages would be sent to the backend server.');
    e.target.reset();
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
});