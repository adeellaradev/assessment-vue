## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher recommended)
- **npm** or **yarn** package manager

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd assessment-frontend
```

### 2. Install Dependencies

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and configure your backend API and Pusher credentials:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_PUSHER_APP_KEY=your_pusher_app_key
VITE_PUSHER_APP_CLUSTER=your_pusher_cluster
```

Replace the values with your actual backend API URL and Pusher credentials.

### 4. Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### 5. Build for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### 6. Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
src/
├── assets/          # Static assets and styles
├── components/      # Reusable Vue components
│   ├── LimitOrderForm.vue
│   ├── Navbar.vue
│   ├── Orderbook.vue
│   ├── OrdersList.vue
│   └── WalletBalance.vue
├── composables/     # Vue composition functions
│   ├── useAuth.js
│   ├── useOrderbook.js
│   ├── useOrders.js
│   ├── useProfile.js
│   └── useRealtime.js
├── pages/           # Page components
│   ├── Dashboard.vue
│   ├── Login.vue
│   └── Signup.vue
├── router/          # Vue Router configuration
│   └── index.js
├── services/        # API and service layers
│   ├── api.js
│   └── echo.js
├── App.vue          # Root component
└── main.js          # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Development Guidelines

### Component Development

This project uses Vue 3 `<script setup>` syntax. Learn more in the [Vue 3 Script Setup docs](https://vuejs.org/api/sfc-script-setup.html).

### Styling

Tailwind CSS is configured for styling. Utility classes can be used directly in components.

### API Integration

API calls are centralized in `src/services/api.js`. Authentication tokens are managed automatically.

### Real-time Updates

Real-time functionality is implemented using Laravel Echo and Pusher. Configuration is in `src/services/echo.js`.

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. You can also specify a custom port:

```bash
npm run dev -- --port 3000
```

### Build Errors

If you encounter build errors, try:

1. Delete `node_modules/` and `package-lock.json`
2. Run `npm install` again
3. Clear Vite cache: `rm -rf node_modules/.vite`

### WebSocket Connection Issues

Ensure your Pusher credentials are correctly configured in the `.env` file and the backend is running.

## IDE Setup

For the best development experience, we recommend:

- [VS Code](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension
- Disable Vetur if installed (conflicts with Volar)

Learn more about IDE support in the [Vue Docs Scaling Up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
