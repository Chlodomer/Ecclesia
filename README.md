# Ecclesia: A Community's Story

A single-player, choice-based narrative game that simulates the growth, struggles, and transformation of a Christian community in late antique Southern Gaul, from its founding in the 1st century to its establishment in the 5th century.

## Overview

*Ecclesia* is an educational game designed for students and independent learners interested in Late Antiquity, Early Medieval History, Church History, and Roman History. Players guide a fledgling Christian community through centuries of growth, persecution, theological debates, and cultural transformation.

### Key Features

- **Historical Accuracy**: Grounded in the specific regional character of Southern Gaul (modern-day Provence)
- **Meaningful Choices**: 2-3 options per scenario with randomized outcomes that reflect historical uncertainty
- **Dynamic Timeline**: Progress through 400+ years of history with era-specific events
- **Community Management**: Balance membership growth with cohesion while responding to Imperial policy changes
- **Educational Focus**: 30-40 minute playtime designed for classroom or focused study sessions

## Game Mechanics

### Core Stats
- **👥 Members**: Total community size (win condition: 500 members)
- **🔗 Cohesion**: Community morale and unity (0-100, loss condition: reaches 0)
- **📅 Year**: Current historical timeline position
- **🏛️ Imperial Status**: Roman Empire's disposition toward Christians

### Historical Eras
- **Apostolic Era** (c. 30-70 AD): Initial conversion and mission
- **Peaceful Coexistence** (c. 70-249 AD): Growth amid sporadic persecution
- **Empire-Wide Persecution** (c. 249-313 AD): Survival under Decius and Diocletian
- **The Great Turning** (313+ AD): Post-Constantine acceptance and growth
- **The Fading Empire** (5th Century): Rise of the church amid barbarian migrations

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and optimized builds
- Modern CSS for styling

### Development Tools
- **ESLint** for code quality
- **Prettier** for code formatting
- **Vitest** for testing with coverage reports
- **TypeScript** for type safety

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Chlodomer/Ecclesia.git
cd Ecclesia
```

2. Navigate to the webapp directory:
```bash
cd webapp
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

### Available Scripts

In the `webapp` directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Project Structure

```
Ecclesia/
├── webapp/                 # React application
│   ├── src/
│   │   ├── content/       # Game content and event definitions
│   │   ├── features/      # Game features and components
│   │   ├── lib/          # Utility functions and game logic
│   │   └── types/        # TypeScript type definitions
│   ├── public/           # Static assets
│   │   └── assets/       # Event scene images
│   └── package.json
├── images/               # Source images for reference
├── Ecclesia_PRD.md      # Product Requirements Document
└── README.md
```

## Game Content

The game features:
- 20-25 major event scenarios across three historical acts
- Custom scene artwork for key events (meals, persecution, church construction, etc.)
- Dynamically weighted event decks that shift based on Imperial status
- Multiple systems including theology, patronage, relics, and liturgical calendar

## Development

### Adding New Events

Events are defined in `webapp/src/content/eventDeck.ts`. Each event includes:
- Title and narrative text
- Scene image and description
- 2-3 player choices with weighted outcomes
- Stat modifications (Members, Cohesion)

### Testing

The project uses Vitest for unit testing. Test files use the `.test.ts` or `.test.tsx` extension.

## Educational Use

This game is designed for:
- University and high school history courses
- Seminar discussions on Late Antiquity
- Independent study of early Christianity
- Understanding historical complexity and unintended consequences

Recommended playtime: 30-40 minutes (fits within a single class period)

## Credits

**Design & Development**: Yaniv Fox & AI Assistants
**Historical Period**: Late Antique Southern Gaul (1st-5th centuries CE)
**Target Audience**: Students and learners of ancient and medieval history

## License

This project is an educational tool. Please check with the repository owner for specific licensing terms.

## Contributing

This is an educational project. If you'd like to contribute historical scenarios, bug fixes, or improvements, please open an issue or pull request.

---

*Guide a community through persecution and triumph. Your choices shape their story.*
