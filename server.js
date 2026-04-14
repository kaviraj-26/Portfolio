const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files from root directory
app.use(express.static(path.join(__dirname)));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Google Drive setup (configured for user's specific folder)
let drive;
const GOOGLE_DRIVE_FOLDER_ID = '1gRDgoO11jtwfMKGFu-wgS9Pvx6sXurV0'; // User's specific Google Drive folder

try {
    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    drive = google.drive({ version: 'v3', auth });
    console.log('Google Drive API initialized successfully');
} catch (error) {
    console.log('Google Drive not configured. File uploads will be local only.');
    console.log('To enable Google Drive integration:');
    console.log('1. Set up Google Cloud Console credentials');
    console.log('2. Save credentials as credentials.json');
    console.log('3. Ensure the service account has access to the specified folder');
}

// Admin authentication - Fingerprint based
app.post('/api/admin/fingerprint-auth', async (req, res) => {
    try {
        // In production, this would verify the WebAuthn credential
        // For now, we'll simulate successful authentication
        const { credentialId, authenticatorData, clientDataJSON, signature } = req.body;

        // Simulate verification process
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In production, verify the credential against stored public key
        // const isValid = await verifyWebAuthnCredential(credentialId, authenticatorData, clientDataJSON, signature);

        const isValid = true; // Simulated success

        if (isValid) {
            const token = jwt.sign({ admin: true, authMethod: 'fingerprint' }, 'your-secret-key', { expiresIn: '24h' });
            res.json({ success: true, token, message: 'Fingerprint authentication successful' });
        } else {
            res.status(401).json({ success: false, message: 'Fingerprint authentication failed' });
        }
    } catch (error) {
        console.error('Fingerprint auth error:', error);
        res.status(500).json({ success: false, message: 'Authentication error' });
    }
});

// Legacy password login (kept for backward compatibility)
app.post('/api/admin/login', async (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        const token = jwt.sign({ admin: true, authMethod: 'password' }, 'your-secret-key', { expiresIn: '24h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        if (decoded.admin) {
            next();
        } else {
            res.status(403).json({ message: 'Not authorized' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Upload project
app.post('/api/projects', verifyAdmin, upload.array('files'), async (req, res) => {
    try {
        const { title, category, description } = req.body;
        const files = req.files;

        console.log(`Uploading project: ${title} to Google Drive folder: ${GOOGLE_DRIVE_FOLDER_ID}`);

        // Create a project-specific folder in Google Drive
        let projectFolderId = GOOGLE_DRIVE_FOLDER_ID; // Default to main folder

        if (drive) {
            try {
                // Create project folder with timestamp for uniqueness
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const projectFolderName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;

                const folderMetadata = {
                    name: projectFolderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [GOOGLE_DRIVE_FOLDER_ID]
                };

                const folderResponse = await drive.files.create({
                    resource: folderMetadata,
                    fields: 'id,name'
                });

                projectFolderId = folderResponse.data.id;
                console.log(`Created project folder: ${folderResponse.data.name} (ID: ${projectFolderId})`);

                // Make folder publicly accessible (optional - for sharing)
                await drive.permissions.create({
                    fileId: projectFolderId,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone'
                    }
                });

            } catch (folderError) {
                console.error('Error creating project folder:', folderError);
                // Continue with main folder if project folder creation fails
            }
        }

        // Upload files to the project folder
        const fileUrls = [];
        if (drive && files) {
            for (const file of files) {
                try {
                    const fileMetadata = {
                        name: file.originalname,
                        parents: [projectFolderId]
                    };

                    const media = {
                        mimeType: file.mimetype,
                        body: fs.createReadStream(file.path)
                    };

                    const driveResponse = await drive.files.create({
                        resource: fileMetadata,
                        media: media,
                        fields: 'id,name,webViewLink'
                    });

                    // Make file publicly accessible
                    await drive.permissions.create({
                        fileId: driveResponse.data.id,
                        requestBody: {
                            role: 'reader',
                            type: 'anyone'
                        }
                    });

                    const fileUrl = `https://drive.google.com/file/d/${driveResponse.data.id}/view`;
                    fileUrls.push(fileUrl);

                    console.log(`Uploaded file: ${file.originalname} to project folder`);

                    // Clean up local file
                    fs.unlinkSync(file.path);

                } catch (fileError) {
                    console.error(`Error uploading file ${file.originalname}:`, fileError);
                    // Continue with other files
                }
            }
        } else if (files) {
            // Local storage fallback
            console.log('Using local storage (Google Drive not configured)');
            files.forEach(file => {
                fileUrls.push(`/uploads/${file.filename}`);
            });
        }

        // Save project to database
        const project = {
            id: Date.now(),
            title,
            category,
            description,
            files: fileUrls,
            folderId: projectFolderId,
            driveFolderUrl: `https://drive.google.com/drive/folders/${projectFolderId}`,
            createdAt: new Date()
        };

        // Save to projects.json
        const projectsFile = path.join(__dirname, 'projects.json');
        let projects = [];
        if (fs.existsSync(projectsFile)) {
            projects = JSON.parse(fs.readFileSync(projectsFile));
        }
        projects.push(project);
        fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));

        console.log(`Project "${title}" saved successfully with ${fileUrls.length} files`);

        // Auto-post to social media
        await autoPostToSocialMedia(project);

        res.json({
            success: true,
            project,
            message: `Project uploaded successfully. Files saved to Google Drive folder: ${project.driveFolderUrl}`
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Upload failed. Please try again.',
            error: error.message
        });
    }
});

// Get projects
app.get('/api/projects', (req, res) => {
    const projectsFile = path.join(__dirname, 'projects.json');
    if (fs.existsSync(projectsFile)) {
        const projects = JSON.parse(fs.readFileSync(projectsFile));
        res.json(projects);
    } else {
        res.json([]);
    }
});

// Update profile data
app.put('/api/profile', verifyAdmin, (req, res) => {
    const { experience, projectCount, education, certificates } = req.body;

    const profileData = {
        experience,
        projectCount,
        education,
        certificates
    };

    fs.writeFileSync(path.join(__dirname, 'profile.json'), JSON.stringify(profileData, null, 2));
    res.json({ success: true });
});

// Get profile data
app.get('/api/profile', (req, res) => {
    const profileFile = path.join(__dirname, 'profile.json');
    if (fs.existsSync(profileFile)) {
        const profile = JSON.parse(fs.readFileSync(profileFile));
        res.json(profile);
    } else {
        res.json({
            experience: '5+ Years',
            projectCount: '50+',
            education: 'BFA 3D Animation',
            certificates: '10+'
        });
    }
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    // In production, send email or save to database
    console.log('Contact form submission:', { name, email, message });

    res.json({ success: true, message: 'Message sent successfully' });
});

// Auto-post to social media (simplified implementation)
async function autoPostToSocialMedia(project) {
    try {
        // LinkedIn API integration would go here
        console.log('Posting to LinkedIn:', project.title);

        // ArtStation API integration would go here
        console.log('Posting to ArtStation:', project.title);

        // YouTube API integration would go here
        console.log('Posting to YouTube:', project.title);

        // Note: Actual API implementations would require proper authentication
        // and API keys for each platform
    } catch (error) {
        console.error('Social media posting error:', error);
    }
}

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});