# 02_tickets_and_processes.md

## Purpose
Define the issue / task management workflow using **GitHub Issues** for the *LYNQ* project.

### 1. Issue template
```
### Title
[BUG] / [FEATURE] / [TASK] <short summary>

### Description
Concise explanation of the problem or requirement.

### Context
- Affected service: API / Normalizer / Frontend / Infra
- Version or tag:
- Environment: dev / staging / prod
- Business/Location affected (if applicable):

### Steps to reproduce (BUG only)
1. ...
2. ...
3. ...

### Expected result
...

### Actual result
...

### Relevant logs
<paste here>

### Priority
low / medium / high / critical

### Checklist
- [ ] Added tests
- [ ] Updated documentation
- [ ] Followed conventional commits
- [ ] Updated Prisma schema if needed
- [ ] Verified role-based access controls
```

### 2. Workflow
1. **Creation** by developer, QA, or business client.
2. **Triage** every morning:  
   * Label by component (api, normalizer, frontend, infra)
   * Label by business impact
   * Assign owner  
   * Estimate effort (story points)
3. **Status flow:** `Open → In Progress → Review → Done → Released`
4. **Mandatory PR** must reference the issue (`Fixes #123`).

### 3. Conventional commits
```
feat(api): add business management endpoints
fix(normalizer): handle Xovis sensor disconnection
chore(infra): update docker-compose configuration
feat(frontend): add multi-business dashboard support
```

### 4. Branching strategy
* `main`: production
* `develop`: continuous integration
* `feature/<id>-<short-desc>`
* SemVer tags `vX.Y.Z`

### 5. Component-specific SLAs (production)
| Component | Severity | Response | Resolution |
|-----------|----------|----------|------------|
| API       | Critical | ≤ 1 h    | ≤ 4 h      |
| Normalizer| Critical | ≤ 2 h    | ≤ 8 h      |
| Frontend  | High     | ≤ 4 h    | ≤ 24 h     |
| Infra     | Critical | ≤ 30 min | ≤ 2 h      |

### 6. Multi-tenancy considerations
* Issues affecting multiple businesses are highest priority
* Business-specific issues should include business ID in labels
* User permission issues require immediate attention
* Data isolation bugs are treated as critical security issues
