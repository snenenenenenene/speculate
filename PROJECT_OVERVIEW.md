# Speculate - Flow-Based Questionnaire Builder

## Overview
Speculate is a powerful, visual flow-based questionnaire builder that allows users to create complex, branching surveys and questionnaires with a drag-and-drop interface. The application enables users to design interactive questionnaires that can adapt based on user responses, making it ideal for surveys, assessments, and decision trees.

## Core Features

### Flow Editor
- Visual node-based editor using React Flow
- Drag-and-drop interface for creating questionnaires
- Real-time preview of questionnaire flow
- Dark mode support for better visibility
- Customizable node styling and themes

### Node Types
1. **Start Node**
   - Entry point for questionnaires
   - Customizable welcome messages
   - Support for rich text and images

2. **End Node**
   - Terminal points for questionnaires
   - Ability to redirect to other flows
   - Customizable exit messages

3. **Yes/No Node**
   - Binary choice questions
   - Customizable labels and values
   - Branching logic based on response

4. **Single Choice Node**
   - Multiple options with single selection
   - Support for images in options
   - Flexible layout options

5. **Multiple Choice Node**
   - Multiple options with multiple selections
   - Min/max selection limits
   - Grid layout support

6. **Function Node**
   - Complex branching logic
   - Variable operations
   - Conditional routing

7. **Weight Node**
   - Score calculation
   - Global and local weight management
   - Custom formulas

### Project Management
- Project organization and hierarchy
- Flow versioning system
- Publishing and activation controls
- Activity logging and audit trails

### Collaboration Features
- Team-based access control
- Version history tracking
- Shared project spaces

## MVP Requirements

### Essential Features for Launch

1. **Authentication & Authorization**
   - [x] User registration and login
   - [x] Basic role management
   - [ ] Password reset functionality

2. **Project Management**
   - [x] Create/edit/delete projects
   - [x] Project organization
   - [x] Basic project settings
   - [x] Flow versioning
   - [x] Publishing system

3. **Flow Editor**
   - [x] Basic node types (Start, End, Yes/No, Single Choice)
   - [x] Node connections and routing
   - [x] Visual editor interface
   - [x] Dark mode support
   - [ ] Undo/redo functionality
   - [ ] Copy/paste nodes

4. **Node Features**
   - [x] Rich text editing
   - [x] Image support
   - [x] Basic styling options
   - [ ] Input validation
   - [ ] Error handling

5. **Flow Execution**
   - [ ] Public flow URLs
   - [ ] Response collection
   - [ ] Basic analytics
   - [ ] Export functionality

6. **API Integration**
   - [ ] REST API documentation
   - [ ] API authentication
   - [ ] Rate limiting
   - [ ] Webhook support

### Next Phase Features

1. **Advanced Flow Features**
   - Custom CSS/styling
   - Advanced branching logic
   - Custom JavaScript functions
   - Flow templates

2. **Collaboration Tools**
   - Team workspaces
   - Commenting system
   - Change tracking
   - Access control lists

3. **Analytics & Reporting**
   - Response analytics
   - Flow performance metrics
   - Custom reports
   - Data visualization

4. **Integration & Extensions**
   - Third-party integrations
   - Plugin system
   - Custom node types
   - API marketplace

## Technical Stack

- **Frontend**: Next.js, React Flow, TailwindCSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS with custom theming
- **State Management**: Zustand

## Immediate Development Priorities

1. Complete the flow execution engine
2. Implement response collection system
3. Add basic analytics dashboard
4. Create public flow viewer
5. Improve error handling and validation
6. Add undo/redo functionality
7. Implement copy/paste for nodes
8. Create API documentation

## Long-term Vision

Speculate aims to become the go-to platform for creating interactive, branching questionnaires and surveys. The platform will support everything from simple surveys to complex decision trees and interactive assessments. Future development will focus on:

1. AI-powered flow suggestions
2. Advanced analytics and insights
3. Integration marketplace
4. Mobile app support
5. Enterprise features
6. White-labeling options
7. Advanced collaboration tools
8. Custom branding options 