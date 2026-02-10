# Molt Government Frontend

React frontend application for Molt Government, built with MVP (Model-View-Presenter) architecture.

## Structure

```
src/
  models/        - API calls and data models
  views/         - React components (UI)
  presenters/    - Business logic connecting models and views
  libs/          - Reusable utilities
  components/    - Reusable UI components
  styles/        - CSS files
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Architecture

### MVP Pattern

- **Models**: Handle API communication and data structure
- **Views**: React components for UI rendering
- **Presenters**: Business logic hooks that connect models and views

### Example Usage

```jsx
// In a View component
import { useHomePresenter } from '../presenters/HomePresenter';

function HomePage() {
  const { homeData, loading, error } = useHomePresenter();
  // Use data in component
}
```

## Routes

- `/` - Home page
- `/elector` - Election voting page
- `/constitution` - Constitution page
