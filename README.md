# Adopt-a-Pet Backend Challenge

A comprehensive backend system for a pet adoption platform, built with modern web technologies. This project implements a RESTful API that handles user authentication, pet listings, adoption requests, and image uploads, following best practices in software development and architecture.

## 🚀 Key Features

- **User Management**: Registration, authentication, and role-based access control
- **Pet Listings**: Create, read, update, and delete pet listings with detailed information
- **Adoption System**: Track adoption requests and statuses
- **Image Handling**: Upload and serve pet images with proper storage management
- **API Documentation**: Comprehensive OpenAPI/Swagger documentation
- **Testing**: Unit, integration, and end-to-end testing
- **Containerization**: Docker support for consistent development and deployment

## 🛠️ Technologies Used

### Core Technologies
- **Node.js**: JavaScript runtime for building scalable network applications
- **TypeScript**: For type safety and better development experience
- **Express.js**: Web application framework for building RESTful APIs
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: Elegant MongoDB object modeling for Node.js

### Development & Deployment
- **Docker**: Containerization for consistent environments
- **Docker Compose**: For multi-container Docker applications
- **CircleCI**: Continuous Integration and Deployment
- **ESLint & Prettier**: Code quality and formatting
- **Mocha/Chai/Sinon**: Testing framework and assertion libraries

### API & Documentation
- **Swagger/OpenAPI**: API documentation and testing
- **JWT**: JSON Web Tokens for authentication
- **Multer**: Middleware for handling file uploads
- **Winston**: Logging library

### Quality Assurance
- **c8**: Code coverage tool
- **Coveralls**: Track and display test coverage
- **SuperTest**: HTTP assertions for testing API endpoints

## Technical Decisions

### Architecture
- **Modular Architecture**: The application follows a modular structure to ensure maintainability and scalability as the project grows.
- **Layered Architecture**: Clear separation of concerns with distinct layers for routes, controllers, services, and data access.

### Database
- **MongoDB with Mongoose**: Chosen for its flexibility with unstructured data, which is ideal for a pet adoption platform where pet attributes might vary. Mongoose provides a straightforward schema-based solution to model application data.

### API Development
- **Express.js**: Selected for its minimal and flexible approach, allowing for rapid development of robust APIs.
- **TypeScript**: Implemented for type safety, better developer experience, and improved code maintainability.

### Testing
- **Mocha/Chai/Sinon**: These testing tools were chosen for their reliability and widespread adoption in the Node.js ecosystem.
- **End-to-End Testing**: Focused on testing critical user flows to ensure the application works as expected from the user's perspective.

### Development & Deployment
- **Docker**: Containerization is used to ensure consistent environments across development, testing, and production.
- **CircleCI**: Implemented for continuous integration to automate the testing and deployment process.
- **Environment Variables**: Configuration is managed through environment variables with a `.env.example` file provided as a template.

### Documentation
- **Swagger/OpenAPI**: Integrated for comprehensive API documentation, making it easier for frontend developers to understand and consume the API.

### Code Quality
- **ESLint & Prettier**: Enforced code style consistency and identified potential issues early in the development process.
- **TypeScript**: Added type safety to catch errors during development rather than at runtime.

## Badges

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/AgustinNRios/adopt-a-pet-backend-challenge/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/AgustinNRios/adopt-a-pet-backend-challenge/tree/main)

This badge represents that the project has passed the Circle CI pipelines, and the tests were run on a remote server.

[![Coverage Status](https://coveralls.io/repos/github/AgustinNRios/adopt-a-pet-backend-challenge/badge.svg?branch=main)](https://coveralls.io/github/AgustinNRios/adopt-a-pet-backend-challenge?branch=main)

This badge shows the code coverage percentage of the project's tests, indicating how much of the codebase is covered by automated tests.


## How to run the APP
### in bash / Git-bash
```
chmod 711 ./up_dev.sh
./up_dev.sh
```
### in powershell
```
docker-compose -f docker-compose.dev.yml up --build --force-recreate
```

### in cmd
```
up_dev.bat
```

## How to run the tests 
### in bash / Git-bash
```
chmod 711 ./up_test.sh
./up_test.sh
```
### in powershell
```
docker-compose -f docker-compose.test.yml up --build --force-recreate test
```

### in cmd
```
up_test.bat
```

## Accessing the Application

Once the application is running, you can access:

- API: http://localhost:8080
- Swagger Documentation: http://localhost:8080/api-docs

## Future Improvements

This project has several opportunities for enhancement. Here are some planned improvements:

### CI/CD Pipeline
- **Linting and TypeScript Checking**: Integrate ESLint and TypeScript type checking into the CircleCI pipeline to ensure code quality and type safety in every build.
- **Build Step**: Add a TypeScript compilation step in the CI/CD pipeline to verify that the application can be built successfully.

### Testing
- **Test Cleanup**: Implement proper cleanup of test artifacts, particularly for pet images created during testing, to maintain a clean test environment.
- **Test Coverage**: Expand test coverage to include edge cases and error scenarios.

### Architecture
- **External Provider Layer**: Implement a client layer for external service providers to improve code organization and maintainability.
- **ORM Schema Migrations**: Implement a proper ORM-based migration system to version and manage database schema changes. This would allow for:
  - Tracking and applying incremental schema changes
  - Rolling back to previous schema versions if needed
  - Maintaining consistency across different environments
  - Automating schema updates during deployment

### Development Experience
- **Database Seeding**: Implement a database seeding mechanism to facilitate local development and testing with consistent data.
- **Deployment Automation**: Streamline the deployment process with automated deployment configurations for different environments.

### Code Quality
- **Static Analysis**: Integrate additional static code analysis tools to identify potential issues early in the development cycle.
- **Dependency Updates**: Implement automated dependency updates to keep all packages current and secure.
