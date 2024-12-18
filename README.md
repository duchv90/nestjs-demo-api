# Identity Management System (API)

## Introduction

The Identity Management System (IMS) provides functionalities to manage user identity information, authenticate users, and control access to resources within the application. This system enhances security and access control for organizations.

## Description

- **User Management**: Create, edit, and delete user information.
- **User Authentication**: Ensure that users are who they claim to be.
- **Authorization**: Provide access rights based on user roles.




---

## Prerequisites

Before running this project, ensure you have the following installed:

- Node.js (>= 20.x)
- npm or Yarn
- Docker (optional, for containerized development)
- PostgreSQL, MySQL, or any supported Prisma database

---




## Getting Started

### 1. **Clone Repository**:

```bash
$ git clone https://github.com/duchv90/nestjs-demo-api.git
$ cd nestjs-demo-api
```

### 2. **Install Dependencies**:

```bash
$ npm install
```

### 3. **Configuration**:

Create a .env file and configure the necessary environment variables.
Example: .env.sample

### 4. **Database**:

#### **Run Migrations**:

```bash
$ npx prisma migrate dev --name init
```

#### **Generate Prisma Client**:

```bash
$ npx prisma migrate dev --name init
```

#### **Seeding**:

```bash
$ npx prisma db seed
```

### 5. Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### 6. Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Project Structure

```plaintext
src/
├── app.module.ts           # Root application module
├── main.ts                 # Application entry point
├── common/                 # Shared resources (pipes, guards, interceptors, decorators)
├── modules/                # Feature modules
├── core/                   # Core module (global services, global interceptors, etc.)
├── shared/                 # Shared modules and reusable components
├── utils/                  # Utility functions/helpers
├── interfaces/             # Shared TypeScript interfaces/types
├── constants/              # Application-wide constants
└── assets/                 # Static files or templates
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).
- Prisma [Prisma Documentation](https://www.prisma.io/docs)

## Stay in touch

- Author - [Hoàng Việt Đức](https://hvduc.com)

## License

This project is licensed under the [MIT Licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
