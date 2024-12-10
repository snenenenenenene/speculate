# Speculate Action Plan

## Overview
This document outlines the strategic plan for improving and maintaining the Speculate application, focusing on technical debt reduction, testing infrastructure, and feature enhancements.

## 1. Component Library Migration (shadcn/ui)

### Priority Components
1. **Buttons & Interactive Elements**
   - Primary/Secondary buttons
   - Icon buttons
   - Menu items
   - Toggle switches
   
2. **Form Components**
   - Input fields
   - Select dropdowns
   - Checkboxes
   - Radio buttons
   
3. **Layout Components**
   - Cards
   - Modals/Dialogs
   - Navigation bars
   - Sidebars

### Migration Process
1. **Setup Phase**
   ```bash
   npx shadcn-ui@latest init
   ```
   
2. **Component Installation**
   ```bash
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add input
   # Add other components as needed
   ```

3. **Migration Strategy**
   - Create parallel implementations
   - Test in isolation
   - Gradually replace existing components
   - Update styling to match current theme

### Files to Update
- `/components/ui/*`
- `/components/dashboard/*`
- `/app/**/*.tsx`

## 2. Testing Infrastructure

### End-to-End Testing
1. **Core Flows**
   - Project creation/deletion
   - Flow creation and editing
   - Node drag-and-drop operations
   - Import/export functionality
   
2. **Authentication Flows**
   - Sign up
   - Sign in
   - Password reset
   
3. **Data Operations**
   - Save/load flows
   - Version control operations
   - Data migration processes

### Component Testing
1. **UI Components**
   - Button behaviors
   - Form validations
   - Modal interactions
   - Navigation flows

2. **Flow Editor Components**
   - Node creation
   - Edge connections
   - Property panels
   - Tool interactions

### API Testing
1. **Authentication Endpoints**
2. **Project Management**
3. **Flow Operations**
4. **Payment Processing**

## 3. Data Safety Implementation

### Version Control System
1. **Flow Versioning**
   - Implement version history
   - Add rollback capability
   - Track changes with metadata

2. **Backup System**
   - Automatic backups
   - Manual backup points
   - Restore functionality

### Data Validation
1. **Input Validation**
   - Form data validation
   - API payload validation
   - File upload validation

2. **Output Validation**
   - Response data validation
   - Export data validation
   - Migration data validation

### Migration Strategy
1. **Schema Versioning**
   - Version tracking
   - Migration scripts
   - Rollback procedures

2. **Data Transformation**
   - Format conversion
   - Data normalization
   - Integrity checks

## 4. Code Cleanup

### File Consolidation
1. **Components**
   - Merge similar components
   - Remove unused components
   - Standardize component structure

2. **API Routes**
   - Consolidate similar endpoints
   - Remove deprecated routes
   - Standardize error handling

### Code Organization
1. **Directory Structure**
   ```
   /app
     /api
     /components
       /ui
       /dashboard
       /flow
     /hooks
     /lib
     /types
   ```

2. **File Naming Conventions**
   - Component files: PascalCase
   - Utility files: camelCase
   - Type files: PascalCase.types.ts

### Style Standardization
1. **CSS Organization**
   - Move to CSS modules
   - Standardize Tailwind usage
   - Remove duplicate styles

2. **Theme Management**
   - Centralize color schemes
   - Standardize spacing
   - Maintain consistency

## Code Cleanup Strategy

### Phase 1: Component Audit
1. **Identify Component Usage**
   - Use VSCode's "Find All References" feature for each component
   - Create a spreadsheet tracking:
     - Component name
     - Number of imports
     - Last modified date
     - Dependencies
     - Proposed action (keep/consolidate/remove)

2. **Categorize Components**
   ```
   A. Active Components
   - Imported multiple times
   - Recently modified
   - Core functionality
   
   B. Consolidation Candidates
   - Imported once
   - Simple functionality
   - Could be merged into parent
   
   C. Removal Candidates
   - No imports
   - Deprecated functionality
   - Duplicate functionality
   ```

### Phase 2: API Route Cleanup
1. **Route Analysis**
   - Map all API routes to their consumers
   - Identify unused endpoints
   - Document API dependencies

2. **Consolidation Strategy**
   ```
   A. Route Categories
   - Core routes (keep separate)
   - Helper routes (consolidate)
   - Deprecated routes (remove)
   
   B. Consolidation Rules
   - Merge related functionality
   - Keep routes with multiple consumers separate
   - Inline single-use utilities
   ```

### Phase 3: Implementation Plan

1. **Component Consolidation**
   ```bash
   # For each consolidation candidate:
   1. Move component code to parent file
   2. Update imports
   3. Add "// remove file from codebase" comment
   4. Test functionality
   ```

2. **API Route Consolidation**
   ```bash
   # For each route:
   1. Identify all consumers
   2. Move route logic to consumer if single use
   3. Mark original file for removal
   4. Update API documentation
   ```

3. **File Removal Process**
   ```bash
   # After consolidation:
   1. List all files marked for removal
   2. Create backup branch
   3. Remove files in batches
   4. Test after each batch
   5. Document removed files
   ```

### Phase 4: Verification

1. **Testing Strategy**
   - Run full test suite after each consolidation
   - Manual testing of affected features
   - Performance benchmarking

2. **Documentation**
   - Update component documentation
   - Remove deprecated API references
   - Update import paths in README

### Cleanup Checklist

#### Components to Review
- [ ] Base components in `/components/ui/base`
- [ ] One-off modal components
- [ ] Utility components
- [ ] Layout components

#### API Routes to Review
- [ ] Authentication endpoints
- [ ] Data manipulation endpoints
- [ ] Utility endpoints
- [ ] Deprecated endpoints

#### Success Metrics
- Reduced file count
- Simplified import structure
- Improved build time
- Reduced bundle size
- Maintained functionality

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up shadcn/ui
- [ ] Create testing infrastructure
- [ ] Implement basic data versioning

### Phase 2: Migration (Weeks 3-4)
- [ ] Migrate core components
- [ ] Write initial tests
- [ ] Implement backup system

### Phase 3: Enhancement (Weeks 5-6)
- [ ] Complete component migration
- [ ] Expand test coverage
- [ ] Implement advanced versioning

### Phase 4: Cleanup (Weeks 7-8)
- [ ] Code consolidation
- [ ] Remove unused files
- [ ] Documentation updates

## Progress Tracking

### Weekly Reviews
- Code quality metrics
- Test coverage reports
- Performance benchmarks

### Success Metrics
- Component migration completion
- Test coverage percentage
- Reduced bug reports
- Improved performance metrics

## Maintenance Guidelines

### Code Standards
- Use TypeScript strictly
- Follow ESLint rules
- Maintain consistent formatting
- Document complex logic

### Review Process
- Code review requirements
- Testing requirements
- Documentation requirements
- Performance requirements

## Future Considerations

### Scalability
- Performance optimization
- Database optimization
- Caching strategies
- Load balancing

### Security
- Regular security audits
- Dependency updates
- Access control review
- Data encryption review

### Monitoring
- Error tracking
- Performance monitoring
- Usage analytics
- User feedback collection

## Completed Actions 
1. Migrated UI components to shadcn/ui:
   - Replaced custom Button with shadcn/ui Button
   - Replaced custom Input with shadcn/ui Input
   - Replaced custom Dialog with shadcn/ui Dialog
   - Replaced custom Checkbox with shadcn/ui Checkbox
   - Replaced custom Card with shadcn/ui Card
   - Replaced custom Dropdown Menu with shadcn/ui Dropdown Menu

2. Removed deprecated components and files:
   - Removed `components/ui/base/index.tsx` (replaced by shadcn/ui components)
   - Removed `components/ui/Dialog.tsx` (replaced by shadcn/ui dialog)
   - Removed `components/dashboard/ImportChoiceDialog.tsx` (consolidated into ImportExportModal)
   - Removed old chart implementation:
     - `app/api/ai/generate-chart/route.ts`
     - `app/api/save-chart/route.ts`
     - `app/api/load-chart/route.ts`
     - `app/api/charts/route.ts`
   - Removed unused API routes:
     - `app/api/payments/history/route.ts`
     - `app/api/deductCredit/route.ts`

## Remaining Tasks 
1. Remove remaining deprecated files:
   - [ ] `components/ui/base/LoadingSpinner.tsx` (to be replaced by lucide-react's Loader2)

2. Code Quality and Testing:
   - [ ] Update imports in any files that might still reference removed components
   - [ ] Run comprehensive tests to ensure no regressions
   - [ ] Update documentation to reflect new component usage

3. Future Improvements:
   - [ ] Consider migrating more components to shadcn/ui where applicable
   - [ ] Implement proper error handling for API routes
   - [ ] Add proper TypeScript types for all components
