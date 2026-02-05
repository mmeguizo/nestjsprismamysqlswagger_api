# Institutional Dashboard MonitorinBackend - University Institutional Dashboard Monitorin System

A robust, scalable NestJS backend with Prisma ORM, MySQL, Fastify, and Swagger documentation.

## 🚀 Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | NestJS with Fastify |
| ORM | Prisma |
| Database | MySQL |
| Validation | class-validator |
| Documentation | Swagger/OpenAPI |
| Testing | Jest + Supertest |

## 📁 Project Structure

```
backend/
├── src/
│   ├── common/              # Shared utilities
│   │   ├── filters/         # Exception filters
│   │   ├── interceptors/    # Request/Response interceptors
│   │   ├── pipes/           # Validation pipes
│   │   └── utils/           # Helper functions
│   ├── config/              # Configuration files
│   ├── modules/             # Feature modules
│   │   └── users/           # Users CRUD module
│   │       ├── dto/         # Data Transfer Objects
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       └── users.module.ts
│   ├── prisma/              # Prisma service
│   ├── app.module.ts        # Root module
│   └── main.ts              # Application entry
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Database seeding
├── test/                    # E2E tests
├── CODING_INSTRUCTIONS.md   # Development guidelines
└── package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js >= 18
- MySQL >= 8.0
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env with your MySQL credentials
   # DATABASE_URL="mysql://username:password@localhost:3306/idm_database"
   ```

3. **Setup database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # (Optional) Seed database with sample data
   npm run prisma:seed
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

5. **Access the API**
   - API: http://localhost:3000/api/v1
   - Swagger Docs: http://localhost:3000/api/docs
   - Health Check: http://localhost:3000/api/v1/health

## 📚 API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/users | Create a new user |
| GET | /api/v1/users | Get all users (paginated) |
| GET | /api/v1/users/stats | Get user statistics |
| GET | /api/v1/users/:id | Get user by ID |
| PATCH | /api/v1/users/:id | Update user |
| DELETE | /api/v1/users/:id | Soft delete user |
| PATCH | /api/v1/users/:id/restore | Restore deleted user |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1 | API info |
| GET | /api/v1/health | Health check |

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start development server with hot-reload |
| `npm run start:prod` | Start production server |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint and fix code |
| `npm run format` | Format code with Prettier |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed database |

## 🔧 Configuration

Environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |
| API_PREFIX | API prefix | api/v1 |
| DATABASE_URL | MySQL connection string | - |
| SWAGGER_ENABLED | Enable Swagger docs | true |
| SWAGGER_PATH | Swagger UI path | api/docs |

## ✨ Features

- **High Performance**: Fastify adapter for 2x faster than Express
- **Type Safety**: Full TypeScript with Prisma's type-safe queries
- **Validation**: Request validation with class-validator
- **Documentation**: Auto-generated Swagger/OpenAPI docs
- **Error Handling**: Global exception filter with proper HTTP status codes
- **Pagination**: Built-in pagination utilities
- **Soft Delete**: Users can be soft-deleted and restored
- **Testing**: Unit and E2E test setup with Jest
- **Logging**: Request logging with slow query detection

## 📖 Development Guidelines

See [CODING_INSTRUCTIONS.md](./CODING_INSTRUCTIONS.md) for development best practices and coding standards.

## 🔜 Roadmap

- [ ] Authentication module (JWT)
- [ ] Role-based access control (RBAC)
- [ ] Password hashing with bcrypt
- [ ] Email verification
- [ ] File upload module
- [ ] Caching with Redis
- [ ] Rate limiting
- [ ] Audit logging
