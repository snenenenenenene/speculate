# Speculate - Interactive Flow Builder

## Overview
Speculate is a powerful flow-building application that allows users to create, manage, and share complex questionnaires and decision flows. Built with modern web technologies and designed for scalability.

## Core Technologies
- **Frontend**: Next.js 13+ (App Router), React, TypeScript
- **UI Components**: Moving to shadcn/ui (in progress)
- **Styling**: Tailwind CSS
- **Flow Management**: React Flow
- **Database**: Prisma ORM
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI
- **Payments**: Stripe

## Current Features
- Drag-and-drop flow builder
- Real-time collaboration
- AI-powered flow generation
- User authentication and authorization
- Project management system
- Flow versioning and history
- Export and import capabilities

## Roadmap

### Phase 1: Technical Debt Reduction (Current)
- [ ] Migrate to shadcn/ui component library
- [ ] Implement comprehensive testing suite
  - End-to-end testing for core flows
  - Component testing
  - API route testing
- [ ] Data migration and backup system
- [ ] Code cleanup and consolidation

### Phase 2: Enhanced Features
- [ ] Advanced flow templates
- [ ] Collaborative editing improvements
- [ ] Enhanced AI capabilities
- [ ] Advanced analytics dashboard
- [ ] Custom theming system

### Phase 3: Enterprise Features
- [ ] Team management
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Enterprise SSO integration
- [ ] Advanced security features

## Testing Strategy
1. **Core Functionality Tests**
   - Project creation/deletion
   - Flow creation and editing
   - Node drag-and-drop operations
   - Data persistence
   - Import/export functionality

2. **Integration Tests**
   - Authentication flows
   - Payment processing
   - AI integration
   - Real-time collaboration

3. **Performance Tests**
   - Large flow handling
   - Concurrent user operations
   - Data migration processes

## Data Safety
- Implementing versioning for all user data
- Automatic backups
- Data migration scripts
- Validation layers for data integrity
- Rollback capabilities

## Component Library Migration (shadcn/ui)
1. **Priority Components**
   - Buttons
   - Input fields
   - Modals
   - Dropdowns
   - Cards

2. **Migration Process**
   - Component inventory
   - Gradual replacement
   - Parallel implementation
   - Testing and validation

## Development Guidelines
- Use TypeScript for all new code
- Follow Prettier/ESLint configurations
- Write tests for new features
- Document API changes
- Use conventional commits

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Contributing
1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License
[License Type] - See LICENSE file for details
