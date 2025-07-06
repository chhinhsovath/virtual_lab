import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import path from 'path';

// MCP client instance
let mcpClient: Client | null = null;

async function getMCPClient() {
  if (mcpClient) {
    return mcpClient;
  }

  // Start the MCP server process
  const serverPath = path.join(process.cwd(), 'dist/lib/mcp-server.js');
  const serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  // Create transport
  const transport = new StdioClientTransport({
    command: 'node',
    args: [serverPath],
  });

  // Create and connect client
  mcpClient = new Client(
    {
      name: 'virtual-lab-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  await mcpClient.connect(transport);
  
  return mcpClient;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    const client = await getMCPClient();

    switch (action) {
      case 'listTools': {
        const response = await client.listTools();
        return NextResponse.json({
          success: true,
          data: response.tools,
        });
      }

      case 'callTool': {
        const { toolName, arguments: toolArgs } = params;
        const response = await client.callTool({
          name: toolName,
          arguments: toolArgs,
        });
        
        return NextResponse.json({
          success: true,
          data: response.content,
        });
      }

      case 'listResources': {
        const response = await client.listResources();
        return NextResponse.json({
          success: true,
          data: response.resources,
        });
      }

      case 'readResource': {
        const { uri } = params;
        const response = await client.readResource({ uri });
        
        return NextResponse.json({
          success: true,
          data: response.contents,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('MCP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    if (mcpClient) {
      mcpClient.close().catch(console.error);
    }
  });
}