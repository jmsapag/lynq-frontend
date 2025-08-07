# 07_secure_development_mcp.md

## MCP — Managed Code Pipeline

MCP represents the set of policies and automations that guarantee all code reaching production meets security and quality requirements for the LYNQ multi-tenant platform.

### 1. Controls on every PR
- **Lint + Tests:** ESLint and Jest must pass for all services.
- **TypeScript:** Strict type checking across API, Frontend, and Normalizer.
- **SCA:** `npm audit --audit-level=high` with zero critical findings.
- **SAST:** Static analysis for security vulnerabilities.
- **Prisma Schema:** Database migration validation.
- **Role-based Access:** Verification of permission controls.

### 2. Dependencies
- Automated dependency updates via Renovate or Dependabot.
- Security vulnerability scanning for all packages.
- Regular audit of third-party libraries.

### 3. Secret management
- `.env` files never committed to version control.
- Environment variables for all configuration.
- JWT secrets generated with high entropy.
- Database credentials rotated regularly.
- MQTT authentication credentials secured.

### 4. Multi-tenant security
- **Data Isolation:** Business-level data separation enforced.
- **Role Validation:** LYNQ_TEAM, ADMIN, STANDARD permissions verified.
- **Location Access:** STANDARD users restricted to assigned locations only.
- **API Endpoints:** All routes protected with authentication guards.
- **Database Queries:** Business ID filtering on all data access.

### 5. Database security
- **Prisma ORM:** Prevents SQL injection attacks.
- **Connection Pooling:** Secure database connection management.
- **Audit Trail:** User actions logged with timestamps.
- **Data Validation:** Input sanitization and validation.
- **Migration Safety:** All schema changes reviewed and tested.

### 6. Container hardening
- **Non-root User:** All containers run as unprivileged users.
- **Minimal Base Images:** Alpine Linux for smaller attack surface.
- **Read-only Filesystem:** Where possible, containers use read-only mode.
- **Resource Limits:** CPU and memory limits defined.
- **Health Checks:** Container health monitoring enabled.

### 7. API security
- **JWT Validation:** All protected routes verify token validity.
- **Rate Limiting:** Protection against brute force attacks.
- **Input Validation:** class-validator for all DTOs.
- **HTTPS Ready:** SSL/TLS support configured.
- **CORS Policy:** Cross-origin request restrictions.
- **Swagger Security:** API documentation includes auth schemes.

### 8. Frontend security
- **Token Storage:** Secure cookie-based JWT storage.
- **Route Protection:** Private routes require authentication.
- **Role-based UI:** Interface elements shown based on permissions.
- **XSS Prevention:** Input sanitization and output encoding.
- **CSP Headers:** Content Security Policy implementation.

### 9. MQTT security
- **Authentication:** Username/password for MQTT connections.
- **Topic Restrictions:** Sensor-specific topic patterns.
- **Message Validation:** Payload structure verification.
- **Connection Monitoring:** Client connection logging.

### 10. Logging & audit trail
- **Structured Logging:** Winston with JSON format.
- **User Actions:** All CRUD operations logged with user context.
- **Security Events:** Failed logins, permission violations tracked.
- **Business Context:** Logs include business and location IDs.
- **Error Handling:** Sensitive information excluded from error messages.

### 11. Development practices
- **Code Reviews:** All changes require peer review.
- **Feature Branches:** No direct commits to main branch.
- **Test Coverage:** Minimum coverage requirements.
- **Security Testing:** Regular penetration testing.
- **Documentation:** Security procedures documented and updated.

### 12. Compliance requirements
- **Data Privacy:** User data handling according to regulations.
- **Business Isolation:** Complete separation of business data.
- **Audit Logs:** Comprehensive activity tracking.
- **Access Controls:** Principle of least privilege.
- **Incident Response:** Security incident procedures defined.

### 13. Monitoring & alerting
- **Failed Authentication:** Multiple failed login attempts.
- **Permission Violations:** Unauthorized access attempts.
- **Data Anomalies:** Unusual business data access patterns.
- **Service Health:** Application and infrastructure monitoring.
- **Performance Metrics:** Response time and error rate tracking.

### 14. Backup & recovery
- **Database Backups:** Regular automated backups with encryption.
- **Configuration Backup:** Infrastructure as code versioning.
- **Disaster Recovery:** Business continuity procedures.
- **Data Retention:** Compliance with data retention policies.
