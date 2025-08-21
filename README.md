# Aegis Onboarding

**AI-powered client onboarding automation using Portia's controllable agent framework - AgentHack 2024 submission**

![Aegis Onboarding Demo](https://img.shields.io/badge/Status-Demo%20Ready-success)
![Tech Stack](https://img.shields.io/badge/Tech-FastAPI%20%2B%20Next.js-blue)
![AI Powered](https://img.shields.io/badge/AI-Portia%20Framework-purple)

## 🚀 Overview

Aegis Onboarding is a comprehensive AI-powered solution that automates the entire client onboarding process for freelancers and agencies. Built with Portia's controllable agent framework, it handles everything from contract generation to project setup automatically, while maintaining human oversight for critical decisions.

### ✨ Key Features

- **🤖 Full Automation**: Complete onboarding workflow from start to finish
- **👥 Human-in-the-Loop**: Strategic approval checkpoints for quality control
- **⚡ Real-time Updates**: Live progress tracking via WebSocket connections
- **🎨 Beautiful UI**: Modern, responsive interface with smooth animations
- **🔒 Secure**: Enterprise-grade security with comprehensive error handling
- **🔄 Multi-step Workflow**: 8 automated onboarding steps including:
  - Google Drive folder creation
  - Contract generation and approval
  - Communication channel setup (Slack/Discord)
  - GitHub repository creation
  - Notion project board setup
  - Welcome email with calendar invite
  - Stripe billing and invoicing

## 🏗️ Architecture

### Backend (FastAPI + Portia)
- **FastAPI**: High-performance Python web framework
- **Portia Integration**: AI agent orchestration (simulated)
- **WebSocket**: Real-time client-server communication
- **Pydantic**: Data validation and serialization
- **Professional Error Handling**: Comprehensive error management

### Frontend (Next.js + TypeScript)
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **React Hook Form + Zod**: Form handling and validation
- **Socket Integration**: Real-time updates

## 📁 Project Structure

```
aegis-onboarding/
├── backend/                    # Python FastAPI backend
│   ├── main.py                # Application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   ├── agents/               # Portia agent logic
│   │   ├── __init__.py
│   │   └── onboarding_agent.py
│   ├── models/               # Data models
│   │   ├── __init__.py
│   │   ├── client.py         # Client data models
│   │   └── responses.py      # API response models
│   ├── routes/               # API endpoints
│   │   ├── __init__.py
│   │   └── onboarding.py     # Onboarding routes
│   └── utils/                # Utilities
│       ├── __init__.py
│       └── websocket.py      # WebSocket management
├── frontend/                  # Next.js frontend
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── app/              # App Router pages
│       │   ├── layout.tsx    # Root layout
│       │   ├── page.tsx      # Main page
│       │   └── globals.css   # Global styles
│       ├── components/       # React components
│       │   ├── ui/           # Reusable UI components
│       │   ├── ClientForm.tsx
│       │   ├── StatusDashboard.tsx
│       │   ├── ProgressStep.tsx
│       │   └── ApprovalModal.tsx
│       ├── hooks/            # Custom hooks
│       │   └── useWebSocket.ts
│       ├── types/            # TypeScript types
│       │   └── index.ts
│       └── utils/            # Utility functions
│           └── api.ts        # API client
├── docker-compose.yml        # Development environment
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 🚦 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.8+ and pip
- **Git** for version control

### 1. Clone the Repository

```bash
git clone https://github.com/ravixalgorithm/aegis-onboarding.git
cd aegis-onboarding
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your API keys (optional for demo)
# nano .env

# Start the backend server
python main.py
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Using Docker (Alternative)

```bash
# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 🎯 Usage

### Starting an Onboarding Process

1. **Fill out the client form** with:
   - Personal information (name, email, company, phone)
   - Project details (type, scope, budget, timeline)
   - Additional notes

2. **Submit the form** to start the automated workflow

3. **Monitor progress** in real-time on the status dashboard

4. **Approve critical steps** when prompted (e.g., contract review)

5. **Celebrate completion** when all steps are finished!

### Onboarding Workflow Steps

1. **📁 Create Google Drive Folder** - Dedicated project workspace
2. **📄 Draft Contract** - Auto-generated service agreement
3. **✅ Human Approval** - Contract review and approval
4. **💬 Setup Communication** - Slack/Discord channel creation
5. **👨‍💻 Create GitHub Repository** - Code repository with permissions
6. **📋 Setup Project Board** - Notion workspace configuration
7. **📧 Send Welcome Email** - Welcome message with calendar invite
8. **💳 Setup Billing** - Stripe customer and invoice creation

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Portia Configuration
PORTIA_API_KEY=your_portia_api_key_here

# Google APIs
GOOGLE_DRIVE_API_KEY=your_google_drive_api_key
GOOGLE_DOCS_API_KEY=your_google_docs_api_key

# Communication Platforms
SLACK_BOT_TOKEN=your_slack_bot_token
DISCORD_BOT_TOKEN=your_discord_bot_token

# Development Tools
GITHUB_TOKEN=your_github_token
NOTION_API_KEY=your_notion_api_key

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key

# Billing
STRIPE_API_KEY=your_stripe_api_key

# Application Settings
APP_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Note**: The application works in simulation mode without actual API keys for demonstration purposes.

## 📡 API Documentation

### Endpoints

- **POST `/api/v1/onboarding/start`** - Start onboarding process
- **GET `/api/v1/onboarding/status/{client_id}`** - Get onboarding status
- **POST `/api/v1/onboarding/approve/{client_id}/{step_id}`** - Approve/reject step
- **GET `/api/v1/onboarding/clients`** - List all clients
- **WebSocket `/ws/{client_id}`** - Real-time updates

Full API documentation is available at `http://localhost:8000/docs` when running the backend.

## 🛠️ Development

### Backend Development

```bash
cd backend

# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
python main.py

# Run tests (if available)
pytest

# Format code
black .
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Lint code
npm run lint
```

## 🎨 Design System

### Color Palette
- **Primary**: #6366f1 (Indigo) - Main brand color
- **Secondary**: #10b981 (Emerald) - Success states
- **Background**: Clean white/gray gradient
- **Typography**: Inter font family

### Animations
- **Framer Motion** for smooth page transitions
- **Progress indicators** with real-time updates
- **Celebration effects** on completion
- **Loading states** with spinners and pulses

### Responsive Design
- **Mobile-first** approach
- **Tailwind CSS** utility classes
- **Flexible grid layouts**
- **Touch-friendly interactions**

## 🚀 Deployment

### Production Build

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm run build
npm start
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build
```

### Environment Setup

1. Set production environment variables
2. Configure SSL certificates
3. Setup reverse proxy (nginx)
4. Configure monitoring and logging

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript/Python best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 AgentHack 2024

This project was built for AgentHack 2024, showcasing the power of AI agents in automating complex business processes while maintaining human oversight and control.

### Key Innovations

- **Human-AI Collaboration**: Perfect balance between automation and human judgment
- **Real-time Orchestration**: Live updates and status tracking
- **Production-Ready**: Enterprise-grade error handling and security
- **Beautiful UX**: Focus on user experience and visual design
- **Scalable Architecture**: Modular design for easy extension

## 🙏 Acknowledgments

- **Portia Team** for the amazing AI agent framework
- **AgentHack 2024** organizers for the opportunity
- **Open Source Community** for the incredible tools and libraries

## 📞 Support

For questions, issues, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/ravixalgorithm/aegis-onboarding/issues)
- **Email**: support@aegis-onboarding.com
- **Documentation**: Available in the `/docs` folder

---

**Built with ❤️ by the Aegis team for AgentHack 2024**
