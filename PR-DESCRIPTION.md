## Dashboard UI Redesign

This PR implements a complete redesign of the dashboard UI to align with the new design system based on the Padeliga logo colors and aesthetic.

### Main Dashboard Improvements

1. **Layout Improvements**
   - Added geometric background with subtle patterns
   - Improved sidebar design with colored active indicators
   - Added accent border at the bottom of the layout
   - Properly integrated the Padeliga logo component

2. **New Dashboard Components**
   - Created reusable `DashboardCard` component with logo-aligned styling
   - Added `DashboardStats` component for displaying key metrics
   - Implemented consistent color scheme matching the brand palette

3. **Navigation Enhancements**
   - Updated `PadelNavigation` with vertical active indicators
   - Added color-coded icons for better visual hierarchy
   - Improved hover and active states for better feedback

4. **Content Organization**
   - Added stats summary section for quick insights
   - Added quick action buttons for common tasks
   - Reorganized dashboard cards in a more intuitive grid layout
   - Added tips section with helpful links

5. **Visual Consistency**
   - Implemented straight edges as per the design system
   - Used solid colors from the logo palette
   - Applied consistent spacing and typography
   - Enhanced visual hierarchy through color and size

### Admin Dashboard Improvements

1. **New Components for Admin UI**
   - Created reusable `AdminCard`, `AdminActionCard`, and `AdminStatCard` components
   - Added `AdminDashboardOverview` component with platform statistics
   - Implemented consistent styling across admin interfaces

2. **Better Data Visualization**
   - Added stats cards showing platform metrics
   - Integrated recent activity timeline
   - Organized admin actions in categorized sections

3. **UI Organization**
   - Added tabbed interface for easy navigation between admin features
   - Improved section headers with icon indicators
   - Created color-coded card borders matching the brand palette

4. **Visual Consistency**
   - Applied the same design principles from the main dashboard
   - Added geometric background for visual continuity
   - Used the same color scheme throughout

5. **UX Improvements**
   - Implemented a sticky tab navigation for better usability
   - Added quick access section to important admin functions
   - Improved information hierarchy and visual cues

This redesign creates a more engaging, useful, and visually cohesive dashboard that better aligns with the Padeliga brand identity while also improving usability.