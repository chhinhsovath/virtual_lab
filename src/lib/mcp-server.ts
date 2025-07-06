import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { pool } from './db';
import fs from 'fs/promises';
import path from 'path';

const server = new Server(
  {
    name: 'virtual-lab-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Handle resource listing
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'file:///Users/user/Desktop/apps/virtual_lab/CLAUDE.md',
        name: 'Project Guidelines',
        description: 'Claude.md file with project-specific guidelines and architecture',
        mimeType: 'text/markdown',
      },
      {
        uri: 'file:///Users/user/Desktop/apps/virtual_lab/src/lib/db.ts',
        name: 'Database Configuration',
        description: 'Database connection and configuration',
        mimeType: 'text/typescript',
      },
      {
        uri: 'file:///Users/user/Desktop/apps/virtual_lab/src/lib/auth.ts',
        name: 'Authentication System',
        description: 'Authentication and authorization logic',
        mimeType: 'text/typescript',
      },
    ],
  };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (!uri.startsWith('file://')) {
    throw new Error('Only file:// URIs are supported');
  }
  
  const filePath = uri.replace('file://', '');
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      contents: [
        {
          uri,
          mimeType: uri.endsWith('.md') ? 'text/markdown' : 'text/typescript',
          text: content,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to read resource: ${error}`);
  }
});

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query_database',
        description: 'Query the Virtual Lab PostgreSQL database',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL query to execute',
            },
            params: {
              type: 'array',
              description: 'Query parameters for prepared statements',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_student_assessment',
        description: 'Get assessment data for a specific student',
        inputSchema: {
          type: 'object',
          properties: {
            studentId: {
              type: 'string',
              description: 'Student ID',
            },
            cycle: {
              type: 'string',
              enum: ['baseline', 'midline', 'endline'],
              description: 'Assessment cycle',
            },
          },
          required: ['studentId'],
        },
      },
      {
        name: 'get_simulation_data',
        description: 'Get simulation data and resources',
        inputSchema: {
          type: 'object',
          properties: {
            subject: {
              type: 'string',
              enum: ['physics', 'chemistry', 'biology', 'stem'],
              description: 'Subject area for simulation',
            },
            topic: {
              type: 'string',
              description: 'Specific topic within the subject',
            },
          },
          required: ['subject'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'query_database': {
      const { query, params = [] } = args as { query: string; params?: any[] };
      
      const client = await pool.connect();
      try {
        const result = await client.query(query, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.rows, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Database query error: ${error}`,
            },
          ],
        };
      } finally {
        client.release();
      }
    }
    
    case 'get_student_assessment': {
      const { studentId, cycle = 'baseline' } = args as {
        studentId: string;
        cycle?: string;
      };
      
      const client = await pool.connect();
      try {
        const query = `
          SELECT 
            ta.*,
            c.name as student_name,
            c.grade
          FROM tarl_assessments ta
          JOIN tbl_child c ON ta.student_id = c.child_id
          WHERE ta.student_id = $1 AND ta.cycle = $2
        `;
        const result = await client.query(query, [studentId, cycle]);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.rows, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get student assessment: ${error}`,
            },
          ],
        };
      } finally {
        client.release();
      }
    }
    
    case 'get_simulation_data': {
      const { subject, topic } = args as { subject: string; topic?: string };
      
      // This is a mock implementation - in a real scenario, this would fetch actual simulation data
      const simulations = {
        physics: {
          topics: ['mechanics', 'thermodynamics', 'electricity', 'optics'],
          resources: ['interactive-labs', 'video-tutorials', 'practice-problems'],
        },
        chemistry: {
          topics: ['periodic-table', 'chemical-reactions', 'organic-chemistry', 'lab-safety'],
          resources: ['virtual-lab', 'molecular-models', 'reaction-simulations'],
        },
        biology: {
          topics: ['cell-biology', 'genetics', 'ecology', 'human-anatomy'],
          resources: ['microscope-simulator', '3d-models', 'dissection-tools'],
        },
        stem: {
          topics: ['coding', 'robotics', 'engineering-design', 'data-science'],
          resources: ['code-editor', 'circuit-simulator', 'project-templates'],
        },
      };
      
      const subjectData = simulations[subject as keyof typeof simulations];
      
      if (!subjectData) {
        return {
          content: [
            {
              type: 'text',
              text: `No simulation data available for subject: ${subject}`,
            },
          ],
        };
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                subject,
                topic: topic || 'all',
                available_topics: subjectData.topics,
                resources: subjectData.resources,
              },
              null,
              2
            ),
          },
        ],
      };
    }
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Virtual Lab MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});