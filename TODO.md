# Backend Fix Plan - TeamFlow
Current working directory: backend/

## Steps to complete:

### 1. Fix Entities & Typos (High Priority)
- Rename `src/card/card.entites.ts` → `src/card/card.entities.ts`
- Update all imports referencing old path
- Standardize fields: Card primary key 'id' (not task_id), add timestamps
- Fix user.entities.ts import & relations (tasks: Card[])

### 2. Security & Config (High Priority - DB/Auth)
- Create `backend/.env` with DB_URL, JWT_SECRET
- Add @nestjs/config to app.module.ts & modules (TypeOrm/JWT async)
- Sanitize user responses (no password/verification codes)

### 3. Authentication Module (Critical - @CurrentUser broken)
- Create `src/auth/` module, jwt.strategy.ts, jwt.guard.ts
- Protect controllers with @UseGuards(JwtAuthGuard)
- Fix hardcoded JWT secrets

### 4. Controllers & Routes (Consistency)
- UsersController: @Controller('api/users'), consistent endpoints (/signup, /login, /profile/:id)
- CardController: @Controller('api/tasks')
- Add auth guards to protected routes

### 5. Main & Global Setup
- main.ts: Pipes/Helmet/Swagger before listen()
- app.module.ts: Import AuthModule, ConfigModule, remove dups

### 6. Services Improvements
- Use QueryBuilder for team relations (efficient)
- CardService: Fix types/return values, remove unused

### 7. Dependencies & Test
- Update package.json, `npm i`
- Test: npm run start:dev, Postman (register/login/tasks/team)

## Progress Tracking
- [ ] Step 1
- [ ] Step 2
- [ ] ...

*Next: Start with entities (safest).*
