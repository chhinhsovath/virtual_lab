# MCP Server Integration Guide

This guide explains how to use the Model Context Protocol (MCP) server integration in the Virtual Lab project.

## Overview

The MCP server provides context-aware capabilities for AI assistants working with the Virtual Lab codebase. It includes:

- Access to project resources (CLAUDE.md, database config, auth system)
- Database query capabilities
- Student assessment data retrieval
- Simulation data access

## Setup

1. Install dependencies (already added to package.json):
   ```bash
   npm install
   ```

2. Build the MCP server:
   ```bash
   npm run mcp:build
   ```

3. Start the MCP server:
   ```bash
   npm run mcp:start
   ```

   Or use the development command to build and start:
   ```bash
   npm run mcp:dev
   ```

## Configuration

The MCP server configuration is defined in `mcp.json` at the project root. It includes:

- **Resources**: Project files that provide context (CLAUDE.md, db.ts, auth.ts)
- **Tools**: Available functions (query_database, get_student_assessment, get_simulation_data)
- **Prompts**: Context prompts for AI assistants

## API Usage

### Using the React Hook

```typescript
import { useMCP } from '@/hooks/useMCP';

function MyComponent() {
  const { 
    loading, 
    error, 
    queryDatabase, 
    getStudentAssessment,
    getSimulationData 
  } = useMCP();

  // Query database
  const result = await queryDatabase('SELECT * FROM tbl_child LIMIT 10');

  // Get student assessment
  const assessment = await getStudentAssessment('student123', 'baseline');

  // Get simulation data
  const simulation = await getSimulationData('physics', 'mechanics');
}
```

### Direct API Calls

The MCP server can be accessed via the `/api/mcp` endpoint:

```typescript
// List available tools
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'listTools' })
});

// Call a tool
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'callTool',
    params: {
      toolName: 'query_database',
      arguments: { query: 'SELECT * FROM users LIMIT 5' }
    }
  })
});
```

## Available Tools

### 1. query_database
Execute SQL queries on the Virtual Lab database.

```typescript
const result = await queryDatabase(
  'SELECT * FROM tarl_assessments WHERE student_id = $1',
  ['student123']
);
```

### 2. get_student_assessment
Retrieve assessment data for a specific student.

```typescript
const assessment = await getStudentAssessment('student123', 'baseline');
// Returns assessment data with student info
```

### 3. get_simulation_data
Get simulation resources and topics for a subject.

```typescript
const simulation = await getSimulationData('chemistry');
// Returns available topics and resources for chemistry
```

## Demo Page

Visit `/mcp-demo` to see the MCP integration in action. This page provides:

- Tool listing
- Student assessment queries
- Simulation data retrieval
- Custom database queries

## Architecture

```
src/
├── lib/
│   └── mcp-server.ts      # MCP server implementation
├── app/
│   └── api/
│       └── mcp/
│           └── route.ts   # API endpoint for MCP
├── hooks/
│   └── useMCP.ts          # React hook for MCP
└── components/
    └── mcp/
        └── MCPDemo.tsx    # Demo component
```

## Security Considerations

- Database queries are executed with the application's database credentials
- Consider implementing query validation and sanitization
- Limit query permissions based on user roles
- Monitor and log all MCP tool usage

## Troubleshooting

1. **MCP server won't start**: Ensure TypeScript compilation succeeds with `npm run mcp:build`
2. **Database connection errors**: Check DATABASE_URL in .env.local
3. **Permission errors**: Ensure the MCP server has access to required files

## Future Enhancements

- Add more context-aware tools (code generation, test creation)
- Implement caching for frequently accessed data
- Add rate limiting and usage analytics
- Integrate with more AI assistants beyond Claude