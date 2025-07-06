import { Index } from '@upstash/vector';
import OpenAI from 'openai';

// Initialize OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize Upstash Vector index
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export interface Context7Document {
  id: string;
  content: string;
  metadata: {
    type: 'student' | 'assessment' | 'simulation' | 'lesson' | 'resource';
    title?: string;
    studentId?: string;
    teacherId?: string;
    schoolId?: string;
    subject?: string;
    grade?: string;
    cycle?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export class Context7Manager {
  private static instance: Context7Manager;
  
  private constructor() {}
  
  static getInstance(): Context7Manager {
    if (!Context7Manager.instance) {
      Context7Manager.instance = new Context7Manager();
    }
    return Context7Manager.instance;
  }

  /**
   * Generate embeddings for text using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Index a document into Context7
   */
  async indexDocument(doc: Context7Document): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(doc.content);
      
      await index.upsert({
        id: doc.id,
        vector: embedding,
        metadata: {
          ...doc.metadata,
          content: doc.content,
          indexedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error indexing document:', error);
      throw new Error('Failed to index document');
    }
  }

  /**
   * Index multiple documents in batch
   */
  async indexDocuments(docs: Context7Document[]): Promise<void> {
    try {
      const vectors = await Promise.all(
        docs.map(async (doc) => ({
          id: doc.id,
          vector: await this.generateEmbedding(doc.content),
          metadata: {
            ...doc.metadata,
            content: doc.content,
            indexedAt: new Date().toISOString(),
          },
        }))
      );
      
      await index.upsert(vectors);
    } catch (error) {
      console.error('Error indexing documents:', error);
      throw new Error('Failed to index documents');
    }
  }

  /**
   * Search for similar documents
   */
  async search(query: string, options?: {
    topK?: number;
    filter?: Record<string, any>;
    includeMetadata?: boolean;
  }): Promise<any[]> {
    try {
      const embedding = await this.generateEmbedding(query);
      
      const results = await index.query({
        vector: embedding,
        topK: options?.topK || 5,
        filter: options?.filter,
        includeMetadata: options?.includeMetadata ?? true,
      });
      
      return results;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Failed to search documents');
    }
  }

  /**
   * Get a specific document by ID
   */
  async getDocument(id: string): Promise<any> {
    try {
      const result = await index.fetch([id], { includeMetadata: true });
      return result[0];
    } catch (error) {
      console.error('Error fetching document:', error);
      throw new Error('Failed to fetch document');
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      await index.delete(id);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }

  /**
   * Update document metadata
   */
  async updateMetadata(id: string, metadata: Record<string, any>): Promise<void> {
    try {
      await index.update({
        id,
        metadata,
      });
    } catch (error) {
      console.error('Error updating metadata:', error);
      throw new Error('Failed to update metadata');
    }
  }

  /**
   * Index student data for context
   */
  async indexStudentData(student: {
    id: string;
    name: string;
    grade: string;
    schoolId: string;
    assessments?: any[];
  }): Promise<void> {
    const content = `Student: ${student.name}, Grade: ${student.grade}, 
      Recent assessments: ${student.assessments?.map(a => `${a.subject}: ${a.level}`).join(', ') || 'None'}`;
    
    await this.indexDocument({
      id: `student-${student.id}`,
      content,
      metadata: {
        type: 'student',
        studentId: student.id,
        title: student.name,
        grade: student.grade,
        schoolId: student.schoolId,
      },
    });
  }

  /**
   * Index assessment data for context
   */
  async indexAssessmentData(assessment: {
    id: string;
    studentId: string;
    subject: string;
    cycle: string;
    level: string;
    score?: number;
    date: string;
  }): Promise<void> {
    const content = `Assessment for student ${assessment.studentId}: 
      Subject: ${assessment.subject}, Cycle: ${assessment.cycle}, 
      Level: ${assessment.level}, Score: ${assessment.score || 'N/A'}`;
    
    await this.indexDocument({
      id: `assessment-${assessment.id}`,
      content,
      metadata: {
        type: 'assessment',
        studentId: assessment.studentId,
        subject: assessment.subject,
        cycle: assessment.cycle,
        level: assessment.level,
        score: assessment.score,
        timestamp: assessment.date,
      },
    });
  }

  /**
   * Index simulation/lesson content
   */
  async indexSimulationContent(simulation: {
    id: string;
    title: string;
    subject: string;
    topic: string;
    description: string;
    grade?: string;
    difficulty?: string;
  }): Promise<void> {
    const content = `${simulation.title}: ${simulation.description}. 
      Subject: ${simulation.subject}, Topic: ${simulation.topic}`;
    
    await this.indexDocument({
      id: `simulation-${simulation.id}`,
      content,
      metadata: {
        type: 'simulation',
        title: simulation.title,
        subject: simulation.subject,
        topic: simulation.topic,
        grade: simulation.grade,
        difficulty: simulation.difficulty,
      },
    });
  }

  /**
   * Get contextual recommendations for a student
   */
  async getStudentRecommendations(studentId: string, subject?: string): Promise<any[]> {
    const student = await this.getDocument(`student-${studentId}`);
    if (!student) {
      throw new Error('Student not found');
    }
    
    const query = `Recommended content for ${student.metadata.title} in grade ${student.metadata.grade}${subject ? ` for ${subject}` : ''}`;
    
    const results = await this.search(query, {
      topK: 10,
      filter: {
        type: { $in: ['simulation', 'lesson', 'resource'] },
        ...(subject && { subject }),
      },
    });
    
    return results;
  }

  /**
   * Find similar students based on performance
   */
  async findSimilarStudents(studentId: string, limit: number = 5): Promise<any[]> {
    const student = await this.getDocument(`student-${studentId}`);
    if (!student) {
      throw new Error('Student not found');
    }
    
    const results = await this.search(student.metadata.content, {
      topK: limit + 1, // +1 to exclude self
      filter: {
        type: 'student',
        studentId: { $ne: studentId }, // Exclude self
      },
    });
    
    return results.slice(0, limit);
  }
}

// Export singleton instance
export const context7 = Context7Manager.getInstance();