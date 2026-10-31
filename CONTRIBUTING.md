# Contributing to VOTA

Thank you for your interest in contributing to VOTA (Real-Time Storage, ADB Telemetry & Security Engine)!

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/vota.git
   cd vota
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the local development server**:
   ```bash
   npm run dev
   ```

## Development Guidelines

- **Code Quality**: Ensure TypeScript types are strictly maintained (`npm run build`).
- **Telemetry Integrity**: Never mock or fake telemetry values when real device APIs are available. Follow the Zero-Mock Telemetry principle.
- **Cross-Platform**: Support both Android ADB (Termux / Wireless ADB / USB) and PC Desktop (Windows / Linux / macOS).

## Submitting Pull Requests

1. Create a feature branch: `git checkout -b feature/my-new-feature`
2. Commit your changes: `git commit -m 'feat: add amazing feature'`
3. Push to your branch: `git push origin feature/my-new-feature`
4. Open a Pull Request on GitHub.
