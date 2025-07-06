# Context7 Integration Guide

This guide explains how to use the Upstash Context7 vector database integration in the Virtual Lab project for semantic search and intelligent context management.

## Overview

Context7 provides vector-based semantic search capabilities using Upstash Vector Database and OpenAI embeddings. This enables:

- Semantic search across students, assessments, and learning resources
- Intelligent content recommendations based on student performance
- Finding similar students for peer learning opportunities
- Context-aware search that understands meaning, not just keywords

## Prerequisites

1. **Upstash Account**: Create an account at [upstash.com](https://upstash.com)
2. **Vector Database**: Create a new Vector database in Upstash console
3. **OpenAI API Key**: Get an API key from [platform.openai.com](https://platform.openai.com)

## Setup

1. Add environment variables to your `.env.local`:
   ```env
   # Upstash Vector Database
   UPSTASH_VECTOR_REST_URL=https://your-vector-url.upstash.io
   UPSTASH_VECTOR_REST_TOKEN=your-upstash-vector-token
   
   # OpenAI (for embeddings)
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

2. Install dependencies (already added to package.json):
   ```bash
   npm install
   ```

## Architecture

```
src/
├── lib/
│   └── context7.ts         # Core Context7 manager class
├── app/
│   └── api/
│       └── context7/
│           └── route.ts    # API endpoints for Context7
├── hooks/
│   └── useContext7.ts      # React hook for Context7
└── components/
    └── context7/
        └── Context7Demo.tsx # Demo component
```

## Usage

### Using the React Hook

```typescript
import { useContext7 } from '@/hooks/useContext7';

function MyComponent() {
  const {
    loading,
    error,
    search,
    indexStudent,
    indexAssessment,
    indexSimulation,
    getStudentRecommendations,
    findSimilarStudents
  } = useContext7();

  // Search for content
  const results = await search('physics experiments for grade 7');

  // Index a student
  await indexStudent({
    id: 'student123',
    name: 'John Doe',
    grade: '7',
    schoolId: 'school001',
    assessments: [
      { subject: 'math', level: 'intermediate' },
      { subject: 'khmer', level: 'advanced' }
    ]
  });

  // Get personalized recommendations
  const recommendations = await getStudentRecommendations('student123', 'physics');

  // Find similar students
  const similarStudents = await findSimilarStudents('student123', 5);
}
```

### Document Types

Context7 supports indexing different types of documents:

1. **Students**: Profile information, grades, and assessment summaries
2. **Assessments**: Detailed assessment results with scores and levels
3. **Simulations**: Learning resources, experiments, and educational content
4. **Lessons**: Educational materials and curriculum content
5. **Resources**: Additional learning materials and references

### API Endpoints

The Context7 API is available at `/api/context7` with the following actions:

- `index`: Index a single document
- `indexBatch`: Index multiple documents
- `search`: Semantic search with filters
- `getDocument`: Retrieve a specific document
- `deleteDocument`: Remove a document
- `updateMetadata`: Update document metadata
- `indexStudent`: Index student data
- `indexAssessment`: Index assessment results
- `indexSimulation`: Index simulation content
- `getRecommendations`: Get personalized recommendations
- `findSimilarStudents`: Find students with similar profiles

## Demo Page

Visit `/context7-demo` to interact with all Context7 features:

- Test semantic search
- Index different types of documents
- Get student recommendations
- Find similar students

## Best Practices

### 1. Document Structure
```typescript
const document: Context7Document = {
  id: 'unique-id',
  content: 'Descriptive text for semantic search',
  metadata: {
    type: 'student',
    // Additional structured data
  }
};
```

### 2. Search Optimization
- Use descriptive content for better semantic matching
- Include relevant keywords naturally in content
- Use metadata filters to narrow results

### 3. Batch Operations
```typescript
// Index multiple documents at once for better performance
await indexDocuments([doc1, doc2, doc3]);
```

### 4. Filtering Results
```typescript
const results = await search('physics', {
  topK: 10,
  filter: {
    type: 'simulation',
    grade: '7',
    subject: 'physics'
  }
});
```

## Use Cases

### 1. Student Performance Analysis
- Index student assessments across cycles
- Find students with similar learning patterns
- Identify students who need additional support

### 2. Content Recommendation
- Recommend simulations based on student level
- Suggest appropriate learning resources
- Match content to student interests and abilities

### 3. Teacher Support
- Find relevant teaching materials
- Identify successful learning patterns
- Group students with similar needs

### 4. Parent Engagement
- Show progress compared to similar students
- Recommend activities for home support
- Provide context for student performance

## Security Considerations

- API routes require authentication
- Sensitive student data should be anonymized
- Use metadata for filtering without exposing PII
- Monitor API usage for unusual patterns

## Performance Tips

1. **Embedding Cache**: Consider caching frequently used embeddings
2. **Batch Processing**: Use batch operations for bulk imports
3. **Metadata Indexing**: Use metadata for fast filtering
4. **Result Limits**: Set appropriate `topK` values

## Troubleshooting

### Common Issues

1. **API Key Errors**: Verify environment variables are set correctly
2. **Rate Limits**: OpenAI has rate limits for embedding generation
3. **Vector Dimension Mismatch**: Ensure consistent embedding models
4. **Search Quality**: Improve content descriptions for better results

### Debug Mode

Enable debug logging:
```typescript
const results = await search(query, {
  includeMetadata: true // See full document metadata
});
```

## Future Enhancements

- Multi-language support for Khmer content
- Real-time indexing of new assessments
- Advanced analytics on search patterns
- Integration with recommendation engine
- Automatic content tagging
- Performance optimization with caching