# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Set Up MongoDB (Choose One)

**Option A: MongoDB Atlas (Recommended - No Installation Required)**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Click "Connect" and choose "Connect your application"
5. Copy the connection string
6. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/whiteboard
   ```

**Option B: Local MongoDB**
1. Download from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start the service

### 3. Start the Application
```bash
npm run dev
```

### 4. Open Your Browser
Navigate to [http://localhost:5173](http://localhost:5173)

### 5. Start Drawing!
1. Enter a room code (e.g., "ABC123")
2. Start drawing with your mouse or touch
3. Share the room code with others to collaborate

## 🎨 Features You Can Try

- **Drawing**: Click and drag to draw
- **Colors**: Click the colored circles to change color
- **Stroke Width**: Use the slider to adjust line thickness
- **Clear Canvas**: Click the "Clear" button to erase everything
- **Collaboration**: Open the same room code in another browser tab to see real-time collaboration
- **Cursor Tracking**: See other users' cursors in real-time

## 🔧 Troubleshooting

**"MongoDB connection error"**
- Make sure MongoDB is running (local) or your Atlas connection string is correct

**"Socket connection failed"**
- Make sure the server is running on port 5000
- Check that no firewall is blocking the connection

**"Canvas not responding"**
- Try refreshing the page
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)

## 📱 Mobile Support

The application works on tablets and mobile devices! Try opening the same room code on your phone to test cross-device collaboration.

## 🎯 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the API documentation for custom integrations
- Explore the code structure to understand how it works 