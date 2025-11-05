# SlotSwapper

SlotSwapper is a peer-to-peer time-slot scheduling application that allows users to swap their calendar slots with others.

## Features

- User authentication with JWT
- Calendar management (Create, Read, Update, Delete events)
- Mark slots as swappable
- Browse available slots from other users
- Request and manage slot swaps
- Real-time status updates
- Clean, modern UI with Material-UI

## Technology Stack

- **Frontend**: React (Vite), Material-UI, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Authentication**: JWT
- **Containerization**: Docker & Docker Compose

## Project Structure

```
slotswapper/
├─ backend/           # Node.js + Express backend
├─ frontend/          # React frontend
└─ docker-compose.yml # Docker composition
```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register a new user
- POST `/api/auth/login` - Login user

### Events
- GET `/api/events/my-events` - Get user's events
- POST `/api/events` - Create new event
- PATCH `/api/events/:id/status` - Update event status
- DELETE `/api/events/:id` - Delete event

### Swaps
- GET `/api/swaps/swappable-slots` - Get all swappable slots
- POST `/api/swaps/swap-request` - Request a swap
- POST `/api/swaps/swap-response/:requestId` - Respond to swap request
- GET `/api/swaps/incoming-requests` - Get incoming swap requests
- GET `/api/swaps/outgoing-requests` - Get outgoing swap requests

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

### Running with Docker

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd slotswapper
   ```

2. Start the application:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Local Development Setup

1. Backend:
   ```bash
   cd backend
   npm install
   # Create .env file with required variables
   npm run dev
   ```

2. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/slotswapper
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h
CORS_ORIGIN=http://localhost:5173
```

## Testing

Run backend tests:
```bash
cd backend
npm test
```

## Design Decisions

1. **MongoDB**: Chosen for its flexibility with event documents and atomic transactions for swap operations.
2. **JWT Authentication**: Provides stateless authentication with good security.
3. **Material-UI**: Offers a complete set of pre-built components for rapid UI development.
4. **Docker**: Ensures consistent development and deployment environments.

## Security Considerations

1. JWT tokens are used for authentication
2. Passwords are hashed using bcrypt
3. MongoDB transactions ensure data consistency during swaps
4. CORS is configured for security
5. Environment variables for sensitive data

## Future Improvements

1. Real-time notifications using WebSockets
2. Email notifications for swap requests
3. Calendar integration (Google Calendar, Outlook)
4. Recurring events support
5. Advanced conflict detection
6. User timezone support