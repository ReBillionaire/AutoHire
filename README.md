# AutoHire - AI-Powered Hiring Platform

Production-ready SaaS hiring platform with AI-driven candidate screening, interviews, and hiring automation.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 + shadcn/ui
- **Database**: Prisma ORM with Neon PostgreSQL
- **Authentication**: NextAuth.js v5
- **AI**: OpenAI + Anthropic APIs
- **File Uploads**: uploadthing
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Validation**: Zod
- **Analytics**: Recharts
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js >= 18.17.0
- PostgreSQL database (Neon recommended)
- API keys for:
  - OpenAI
  - Anthropic
  - uploadthing
  - Google OAuth (optional)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd AutoHire
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Setup database**:
   ```bash
   npm run db:push
   npm run db:seed  # Optional: seed with sample data
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth secret (min 32 characters)
- `NEXTAUTH_URL` - Auth callback URL
- `OPENAI_API_KEY` - For AI screening and interviews
- `ANTHROPIC_API_KEY` - Alternative AI provider
- `UPLOADTHING_SECRET` / `UPLOADTHING_APP_ID` - File uploads
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth
- `NEXT_PUBLIC_APP_URL` - Public app URL

## Project Structure

```
AutoHire/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── layout.tsx       # Root layout
│   │   ├── globals.css      # Global styles
│   │   └── (routes)/        # Page routes
│   ├── components/
│   │   ├── providers.tsx    # Auth + Query providers
│   │   ├── ui/              # shadcn/ui components
│   │   └── features/        # Feature components
│   ├── lib/
│   │   ├── utils.ts         # Utility functions
│   │   ├── auth.ts          # Auth config
│   │   └── api-clients.ts   # AI API clients
│   ├── types/               # TypeScript types
│   └── actions/             # Server actions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # DB migrations
├── public/                  # Static files
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with sample data
npm run postinstall  # Generate Prisma client
```

## Authentication

AutoHire uses NextAuth.js v5 with:
- Google OAuth (recommended for production)
- Credentials provider (development)
- Prisma adapter for session management

Configure in `src/lib/auth.ts`

## Database Schema

Managed with Prisma. Update the schema in `prisma/schema.prisma` and run:

```bash
npm run db:push
```

## AI Integration

### OpenAI
- GPT-4o for intelligent candidate screening
- Speech-to-text for interviews
- Resume parsing and analysis

### Anthropic
- Claude 3 for detailed assessments
- Fallback AI provider

See `src/lib/api-clients.ts` for integration details.

## UI Components

Built with shadcn/ui. All components are customized with AutoHire's design system.

To add a new component:
```bash
npx shadcn-ui@latest add [component]
```

## Styling

- Tailwind CSS v3 with CSS variables
- Dark mode support (class strategy)
- Responsive design out of the box
- Professional slate-based color palette

Customize theme colors in `tailwind.config.ts` and `src/app/globals.css`

## File Uploads

uploadthing integration for:
- Resume uploads
- Profile pictures
- Interview videos
- Documents

See `src/lib/uploadthing.ts` for configuration.

## Development Practices

### Testing
- Unit tests with Vitest (configure as needed)
- E2E tests with Playwright
- API testing with node-fetch

### Code Quality
- TypeScript strict mode
- ESLint configuration
- Prettier formatting (configure as needed)

### Security
- CSRF protection via NextAuth
- XSS prevention in Tailwind + Next.js
- Secure headers in next.config.mjs
- Environment variable protection

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Environment variables are set in Vercel project settings.

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Performance Optimization

- Image optimization with Next.js Image
- Code splitting via dynamic imports
- Database query optimization with Prisma
- Caching strategies via React Query
- CSS-in-JS minimization

## Monitoring & Analytics

Setup Vercel Analytics or third-party tools:
- Sentry for error tracking
- PostHog for product analytics
- Datadog for performance monitoring

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Follow TypeScript and ESLint standards
3. Test your changes
4. Submit a pull request

## License

Proprietary - AutoHire 2024

## Support

For issues and questions, please contact the development team.

---

Built with precision by the AutoHire Team | Last Updated: 2026-03-26