# Kaviraj 3D Portfolio Website

A modern, interactive 3D portfolio website for Senior 3D Artist Kaviraj featuring admin dashboard, Google Drive integration, and automatic social media posting.

## Features

- **3D Interactive Logo**: Coin logo with Three.js that spins on hover
- **Admin Dashboard**: Fingerprint biometric authentication for secure admin access
- **Project Management**: Upload, edit, and filter projects by category
- **Google Drive Integration**: Store project files in Google Drive
- **Social Media Integration**: Auto-post projects to LinkedIn, ArtStation, and YouTube
- **Responsive Design**: Mobile-friendly layout
- **Contact Form**: Allow visitors to send messages

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Console account (for Google Drive API)
- Social media API keys (LinkedIn, ArtStation, YouTube)

### Installation

1. **Install Node.js**:
   - Download and install Node.js from https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - This will also install npm (Node Package Manager)

2. Clone or download the project files

3. Navigate to the project directory in terminal/command prompt:
   ```bash
   cd "d:\Kaviraj\Web page Creation\Layout_1"
   ```

4. **Quick Setup (Recommended)**:
   - Double-click `setup-drive.bat` to run the automated setup script
   - Follow the on-screen instructions to set up Google Drive integration
   - The script will guide you through credential setup and dependency installation

5. **Manual Setup** (Alternative):
   - Install dependencies manually:
     ```bash
     npm install
     ```
   - Set up Google Drive credentials as described in the Google Drive Integration section below

6. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   PORT=3000
   ADMIN_PASSWORD=your_secure_admin_password
   GOOGLE_DRIVE_FOLDER_ID=1gRDgoO11jtwfMKGFu-wgS9Pvx6sXurV0
   LINKEDIN_ACCESS_TOKEN=your_linkedin_token
   ARTSTATION_API_KEY=your_artstation_key
   YOUTUBE_API_KEY=your_youtube_key
   ```

## Google Drive Integration

### Folder Structure
- **Main Folder**: `1gRDgoO11jtwfMKGFu-wgS9Pvx6sXurV0` (Your specified Google Drive folder)
- **Project Folders**: Each project creates its own subfolder with format: `ProjectName_Timestamp`
- **File Organization**: All project files are stored within their respective project folders

### Features
- **Automatic Folder Creation**: Each uploaded project gets its own dedicated folder
- **Public Sharing**: Folders and files are automatically made publicly accessible
- **Organized Storage**: Clean folder structure prevents file conflicts
- **Direct Links**: Each project includes a direct link to its Google Drive folder

### Setup Requirements
1. **Service Account**: Create a Google Cloud service account
2. **API Credentials**: Download `credentials.json` and place in project root
3. **Folder Access**: Grant the service account access to your Google Drive folder
4. **Permissions**: The service account needs `Editor` access to create folders and upload files

### Step-by-Step Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name (e.g., "portfolio-uploader")
   - Grant it "Editor" role
5. Create a Key:
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key" > "JSON"
   - Download the file and rename it to `credentials.json`
   - Place it in your project root directory
6. Grant Folder Access:
   - Open your Google Drive folder: https://drive.google.com/drive/folders/1gRDgoO11jtwfMKGFu-wgS9Pvx6sXurV0
   - Right-click > "Share"
   - Paste the service account email from `credentials.json`
   - Give it "Editor" access
   - Click "Send"

### Folder Access URL
Your projects will be stored in: https://drive.google.com/drive/folders/1gRDgoO11jtwfMKGFu-wgS9Pvx6sXurV0

7. Start the server:
   ```bash
   npm start
   ```

8. Open your browser and navigate to `http://localhost:3000`

## Usage

### For Visitors
- Browse projects with filtering options
- View artist information and experience
- Contact the artist via the contact form

### For Admin (Kaviraj)
1. Click the 3D coin logo in the top-right corner
2. Fingerprint authentication begins automatically
3. Wait for biometric verification (2-3 seconds)
4. Access the upload form to add new projects
5. Projects are automatically uploaded to Google Drive and posted to social media

**Authentication Note**: The system uses automatic fingerprint biometric authentication. Simply click the logo and place your finger on your device's biometric scanner.

## Authentication Methods

### Primary: Fingerprint Biometric Authentication
- Uses Web Authentication API (WebAuthn)
- Requires biometric hardware (fingerprint reader)
- Must be served over HTTPS
- Supported browsers: Chrome, Firefox, Safari, Edge

### Fallback: Password Authentication
- Available for development and testing
- Can be disabled in production
- Uses JWT tokens for session management

### Setup for Production Biometric Auth:
1. Ensure HTTPS certificate is installed
2. Register biometric credentials for admin user
3. Configure WebAuthn relying party settings
4. Test with actual biometric hardware

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # Frontend JavaScript
├── server.js           # Express server
├── package.json        # Node.js dependencies
├── credentials.json    # Google API credentials (create this)
├── .env               # Environment variables (create this)
├── uploads/           # Temporary upload directory
├── projects.json      # Project data storage
└── profile.json       # Profile data storage
```

## API Endpoints

- `GET /` - Serve main page
- `POST /api/admin/login` - Admin authentication
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Upload new project (admin only)
- `GET /api/profile` - Get profile data
- `PUT /api/profile` - Update profile data (admin only)
- `POST /api/contact` - Submit contact form

## Security Notes

- Change the default admin password in the `.env` file
- Use HTTPS in production
- Implement proper session management
- Validate file uploads on the server
- Use environment variables for all sensitive data

## Customization

- Update profile information in `profile.json`
- Modify the 3D logo appearance in `script.js`
- Customize styling in `styles.css`
- Add more project categories in the upload form

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript, Three.js
- **Backend**: Node.js, Express.js
- **Storage**: Google Drive API
- **Authentication**: JWT tokens
- **File Upload**: Multer

## License

This project is for personal use. Please respect copyright and intellectual property rights.