import { NextRequest, NextResponse } from 'next/server';
import { context7, type Context7Document } from '@/lib/context7';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, params } = body;

    switch (action) {
      case 'index': {
        const { document } = params as { document: Context7Document };
        await context7.indexDocument(document);
        return NextResponse.json({ success: true });
      }

      case 'indexBatch': {
        const { documents } = params as { documents: Context7Document[] };
        await context7.indexDocuments(documents);
        return NextResponse.json({ success: true });
      }

      case 'search': {
        const { query, options } = params as {
          query: string;
          options?: {
            topK?: number;
            filter?: Record<string, any>;
            includeMetadata?: boolean;
          };
        };
        const results = await context7.search(query, options);
        return NextResponse.json({ success: true, data: results });
      }

      case 'getDocument': {
        const { id } = params as { id: string };
        const document = await context7.getDocument(id);
        return NextResponse.json({ success: true, data: document });
      }

      case 'deleteDocument': {
        const { id } = params as { id: string };
        await context7.deleteDocument(id);
        return NextResponse.json({ success: true });
      }

      case 'updateMetadata': {
        const { id, metadata } = params as { id: string; metadata: Record<string, any> };
        await context7.updateMetadata(id, metadata);
        return NextResponse.json({ success: true });
      }

      case 'indexStudent': {
        const { student } = params;
        await context7.indexStudentData(student);
        return NextResponse.json({ success: true });
      }

      case 'indexAssessment': {
        const { assessment } = params;
        await context7.indexAssessmentData(assessment);
        return NextResponse.json({ success: true });
      }

      case 'indexSimulation': {
        const { simulation } = params;
        await context7.indexSimulationContent(simulation);
        return NextResponse.json({ success: true });
      }

      case 'getRecommendations': {
        const { studentId, subject } = params as { studentId: string; subject?: string };
        const recommendations = await context7.getStudentRecommendations(studentId, subject);
        return NextResponse.json({ success: true, data: recommendations });
      }

      case 'findSimilarStudents': {
        const { studentId, limit } = params as { studentId: string; limit?: number };
        const similarStudents = await context7.findSimilarStudents(studentId, limit);
        return NextResponse.json({ success: true, data: similarStudents });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Context7 API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}