# TikCrop - AI-Powered TikTok Meme Cropper

<div align="center">
  <img src="public/icon-192.svg" alt="TikCrop Logo" width="128" height="128">
  <h3>Smart AI-powered app for cropping TikTok meme screenshots with authentic styling</h3>
  
  [![PWA](https://img.shields.io/badge/PWA-Ready-blue)](https://web.dev/progressive-web-apps/)
  [![React](https://img.shields.io/badge/React-19.1.1-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.3.5-purple)](https://vitejs.dev/)
</div>

## 🚀 Features

- **🤖 AI-Powered Smart Cropping** - Automatically identifies memes within TikTok comment screenshots
- **📱 Mobile-First PWA** - Install as a native app on your phone
- **📷 Camera Integration** - Direct camera capture for TikTok screenshots
- **🎨 TikTok-Style Fonts** - Authentic visual resemblance with proper styling
- **⚡ Batch Processing** - Process multiple screenshots simultaneously
- **🌙 Dark/Light Theme** - Matches your system preferences
- **📤 Native Sharing** - Share cropped memes directly to social media
- **🔒 Privacy-Focused** - All processing happens on your device

## 📱 Mobile App Installation

### Option 1: GitHub Pages (Recommended)
1. Visit: `https://your-username.github.io/tikcrop`
2. Tap "Add to Home Screen" when prompted
3. Launch from your home screen like a native app

### Option 2: Local Development
1. Connect your phone to the same WiFi as your computer
2. Find your computer's IP address (`ipconfig` on Windows)
3. Visit `http://[YOUR_IP]:5173/` on your phone
4. Install the PWA when prompted

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/tikcrop.git
cd tikcrop

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 🏗️ Build & Deploy

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages
1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select "Deploy from a branch" → "main" → "/ (root)"
4. Your app will be available at `https://username.github.io/tikcrop`

### Deploy to Netlify
1. Drag and drop the `dist` folder to [netlify.com](https://netlify.com)
2. Get instant HTTPS deployment

## 🎯 How It Works

1. **Upload/Capture** - Take screenshots or upload from gallery
2. **AI Analysis** - Google Gemini AI identifies meme content
3. **Smart Cropping** - Automatically crops around memes, excluding UI
4. **Manual Adjustment** - Fine-tune crop areas with touch controls
5. **Export & Share** - Download or share directly to social media

## 🛡️ Privacy & Security

- **On-Device Processing** - All AI and image processing happens locally
- **No Data Collection** - Your images never leave your device
- **Secure API** - Only sends images to Google Gemini for crop suggestions
- **Open Source** - Full transparency in code and data handling

## 🎨 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.5 Flash
- **PWA**: Service Worker + Web App Manifest
- **File Handling**: JSZip for batch exports
- **Icons**: Custom SVG icons

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-username/tikcrop/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/your-username/tikcrop/discussions)
- 📧 **Contact**: [Your Email]

---

<div align="center">
  Made with ❤️ for the TikTok meme community
</div>