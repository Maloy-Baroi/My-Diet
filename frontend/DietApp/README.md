# Smart Diet Recommendation Mobile App

A React Native mobile application built with Expo for intelligent diet planning and nutrition tracking.

## Features

### Authentication & Onboarding
- User registration and login
- Password reset functionality
- Comprehensive onboarding flow for new users
- Profile setup with health information

### Dashboard
- Comprehensive overview of daily nutrition
- Progress tracking widgets
- Quick action buttons
- Recent achievements display

### Diet Planning
- AI-powered diet plan generation
- Meal planning and scheduling
- Food database search
- Barcode scanning (planned)

### Nutrition Tracking
- Calorie and macro tracking
- Water intake monitoring
- Progress visualization
- Food logging

### Progress Monitoring
- Weight tracking
- Achievement system
- Progress analytics
- Goal tracking

### Additional Features
- Push notifications
- Settings and preferences
- Profile management
- Offline support (planned)

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios
- **Date Handling**: Moment.js
- **UI Components**: Custom components with React Native Elements
- **Secure Storage**: Expo SecureStore
- **Charts**: React Native Chart Kit

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── navigation/         # Navigation configuration
├── screens/           # Screen components
│   ├── auth/          # Authentication screens
│   ├── dashboard/     # Dashboard screens
│   ├── diet/          # Diet planning screens
│   ├── nutrition/     # Nutrition tracking screens
│   ├── progress/      # Progress monitoring screens
│   ├── profile/       # Profile management screens
│   ├── notifications/ # Notification screens
│   └── settings/      # Settings screens
├── services/          # API service layers
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Navigate to the app directory**
   ```bash
   cd frontend/DietApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update the API base URL in `src/services/apiService.ts`
   - For Android emulator: `http://10.0.2.2:8000/api`
   - For iOS simulator: `http://localhost:8000/api`
   - For physical device: Replace with your backend server IP

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/emulator**
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   
   # For web
   npm run web
   ```

## Backend Integration

The app is designed to work with the Django REST API backend. Key integration points:

- **Authentication**: JWT token-based authentication
- **API Endpoints**: RESTful API calls for all data operations
- **Real-time Updates**: Planned WebSocket integration for notifications
- **Offline Support**: Planned local storage for offline functionality

## Configuration

### API Configuration
Update the base URL in `src/services/apiService.ts`:

```typescript
const BASE_URL = 'YOUR_BACKEND_URL/api';
```

### Environment Variables
Create a `.env` file in the project root:

```
EXPO_PUBLIC_API_URL=your_backend_url
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## Development Notes

### Code Organization
- **Services**: All API calls are centralized in service files
- **Types**: TypeScript interfaces match backend models
- **Utils**: Helper functions for formatting, validation, and calculations
- **Components**: Reusable UI components with consistent styling

### Styling
- Custom design system with consistent colors and typography
- Responsive design for various screen sizes
- iOS and Android platform-specific adjustments

### State Management
- React Context for global state (auth, dashboard data)
- Local state for component-specific data
- Service layer for API communication

## Known Issues & Limitations

1. **Charts**: Some chart features require additional configuration
2. **Camera**: Image recognition features are planned for future release
3. **Offline Mode**: Currently requires internet connection
4. **Notifications**: Push notifications need backend integration

## Future Enhancements

- [ ] Offline data synchronization
- [ ] Photo-based food recognition
- [ ] Social features and community
- [ ] Integration with fitness trackers
- [ ] Advanced analytics and reporting
- [ ] Multiple language support
- [ ] Dark mode theme

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for type safety
3. Add proper error handling for all API calls
4. Test on both iOS and Android platforms
5. Follow React Native best practices

## License

This project is part of the Smart Diet Recommendation System.
