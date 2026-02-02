# MyDrive - Cloud Storage for Files and Photos

MyDrive is a cloud drive application designed to securely store and manage your files and photos. It provides an easy-to-use interface for uploading, viewing, and organizing your data in the cloud. Built using React for the frontend and Node.js/Express for the backend, MyDrive offers a simple and scalable solution for personal cloud storage.

**Features**

- User Authentication: Secure login to access your files.
- File Upload & Download: Upload and download your documents and photos with ease.
- Folder Organization: Organize your files and photos into folders.
- Responsive Design: Optimized for both desktop and mobile devices.
- Fast & Scalable Backend: Built with Node.js and Express for a solid backend infrastructure.

**Tech Stack**

- Frontend: React, Vite, SCSS
- Backend: Node.js, Express
- Database: MySQL via AWS RDS (For user data and file storage)
- File storage: EC2 local disk - planned migration to S3
- Deployment: AWS EC2, nginx, PM2

## Getting Started

**Prerequisites**
Node.js: Make sure you have Node.js installed on your machine.

1. Clone the Repository
   First, clone the repository to your local machine:
   git clone https://github.com/your-username/mydrive.git
   cd mydrive

2. Install Dependencies
   Install the dependencies for both the frontend and backend:

For Frontend:
cd client
npm install
For Backend:
cd backend
npm install

3. Set Up Environment Variables
   For the backend, create a .env file in the backend directory and define necessary variables (e.g., PORT).

Example .env for backend:
PORT=5000

4. Run the Project Locally
   Open two terminal windows (or use a tool like concurrently):

Frontend:
cd client
npm run dev

Backend:
cd backend
npm run dev
The frontend will be available at http://localhost:5173, and the backend will run on http://localhost:5000.

**Contributing**
Feel free to fork this repository and submit pull requests. Contributions are welcome!
