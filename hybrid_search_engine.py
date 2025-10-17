"""
Hybrid Search Engine Foundation
Phase 2 AgentKit Integration

Combines vector search + keyword search for medical AI documentation.
Integrates with AgentKit for enhanced search capabilities.

Features:
- Vector search (embeddings-based semantic search)
- Keyword search (BM25 algorithm)
- Hybrid ranking (combines both scores)
- FDA/CMS/HIPAA document search
- PCCP compliance document retrieval
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
import httpx
import math
from collections import Counter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SearchType(str, Enum):
    """Search type"""
    VECTOR = "vector"
    KEYWORD = "keyword"
    HYBRID = "hybrid"


class DocumentType(str, Enum):
    """Document category"""
    FDA_GUIDANCE = "fda_guidance"
    CMS_POLICY = "cms_policy"
    HIPAA_COMPLIANCE = "hipaa_compliance"
    PCCP_TEMPLATE = "pccp_template"
    CLINICAL_TRIAL = "clinical_trial"
    TECHNICAL_SPEC = "technical_spec"


class Document(BaseModel):
    """Search document"""
    doc_id: str
    title: str
    content: str
    doc_type: DocumentType
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    
    # Search-specific fields
    embedding: Optional[List[float]] = None
    tokens: List[str] = Field(default_factory=list)


class SearchQuery(BaseModel):
    """Search query"""
    query_text: str
    search_type: SearchType = SearchType.HYBRID
    doc_type_filter: Optional[List[DocumentType]] = None
    top_k: int = 10
    min_score: float = 0.5
    
    # Hybrid search weights
    vector_weight: float = 0.7
    keyword_weight: float = 0.3


class SearchResult(BaseModel):
    """Single search result"""
    doc_id: str
    title: str
    snippet: str
    doc_type: DocumentType
    score: float
    vector_score: Optional[float] = None
    keyword_score: Optional[float] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SearchResponse(BaseModel):
    """Search response"""
    query: str
    results: List[SearchResult]
    total_results: int
    search_type: SearchType
    elapsed_ms: float


class HybridSearchEngine:
    """
    Hybrid search engine combining vector + keyword search
    
    Architecture:
    - Vector search: Embeddings-based semantic similarity
    - Keyword search: BM25 algorithm for exact matches
    - Hybrid ranking: Weighted combination of both scores
    """
    
    def __init__(
        self,
        embedding_model: str = "text-embedding-3-small",
        embedding_api_url: Optional[str] = None,
    ):
        self.embedding_model = embedding_model
        self.embedding_api_url = embedding_api_url
        self.client = httpx.AsyncClient(timeout=30)
        
        # In-memory document store (replace with vector DB in production)
        self.documents: Dict[str, Document] = {}
        
        # BM25 parameters
        self.bm25_k1 = 1.5
        self.bm25_b = 0.75
        self.avg_doc_length = 0.0
        self.idf_scores: Dict[str, float] = {}
        
        logger.info(f"Hybrid search engine initialized with model: {embedding_model}")
    
    async def index_document(self, document: Document):
        """
        Index a document for search
        
        Steps:
        1. Tokenize content
        2. Generate embedding (vector search)
        3. Update BM25 statistics (keyword search)
        4. Store document
        """
        # Step 1: Tokenize
        document.tokens = self._tokenize(document.content)
        
        # Step 2: Generate embedding
        if self.embedding_api_url:
            document.embedding = await self._generate_embedding(document.content)
        
        # Step 3: Update BM25 stats
        self._update_bm25_stats(document.tokens)
        
        # Step 4: Store
        self.documents[document.doc_id] = document
        
        logger.info(f"Indexed document: {document.doc_id} ({document.doc_type})")
    
    async def search(self, query: SearchQuery) -> SearchResponse:
        """
        Execute hybrid search
        
        Returns:
            Search results ranked by combined score
        """
        start_time = datetime.utcnow()
        
        # Filter documents by type
        filtered_docs = self.documents.values()
        if query.doc_type_filter:
            filtered_docs = [d for d in filtered_docs if d.doc_type in query.doc_type_filter]
        
        # Execute search based on type
        if query.search_type == SearchType.VECTOR:
            results = await self._vector_search(query, filtered_docs)
        
        elif query.search_type == SearchType.KEYWORD:
            results = self._keyword_search(query, filtered_docs)
        
        else:  # HYBRID
            results = await self._hybrid_search(query, filtered_docs)
        
        # Filter by min score
        results = [r for r in results if r.score >= query.min_score]
        
        # Top K
        results = results[:query.top_k]
        
        # Calculate elapsed time
        elapsed = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        response = SearchResponse(
            query=query.query_text,
            results=results,
            total_results=len(results),
            search_type=query.search_type,
            elapsed_ms=elapsed,
        )
        
        logger.info(f"Search completed: '{query.query_text}' -> {len(results)} results in {elapsed:.1f}ms")
        
        return response
    
    async def _vector_search(
        self,
        query: SearchQuery,
        documents: List[Document],
    ) -> List[SearchResult]:
        """Vector search using embeddings"""
        # Generate query embedding
        query_embedding = await self._generate_embedding(query.query_text)
        
        if not query_embedding:
            return []
        
        # Calculate cosine similarity
        results = []
        for doc in documents:
            if not doc.embedding:
                continue
            
            similarity = self._cosine_similarity(query_embedding, doc.embedding)
            
            results.append(
                SearchResult(
                    doc_id=doc.doc_id,
                    title=doc.title,
                    snippet=self._create_snippet(doc.content, query.query_text),
                    doc_type=doc.doc_type,
                    score=similarity,
                    vector_score=similarity,
                    metadata=doc.metadata,
                )
            )
        
        # Sort by score
        results.sort(key=lambda r: r.score, reverse=True)
        
        return results
    
    def _keyword_search(
        self,
        query: SearchQuery,
        documents: List[Document],
    ) -> List[SearchResult]:
        """Keyword search using BM25"""
        query_tokens = self._tokenize(query.query_text)
        
        results = []
        for doc in documents:
            bm25_score = self._calculate_bm25_score(query_tokens, doc.tokens, len(documents))
            
            results.append(
                SearchResult(
                    doc_id=doc.doc_id,
                    title=doc.title,
                    snippet=self._create_snippet(doc.content, query.query_text),
                    doc_type=doc.doc_type,
                    score=bm25_score,
                    keyword_score=bm25_score,
                    metadata=doc.metadata,
                )
            )
        
        # Sort by score
        results.sort(key=lambda r: r.score, reverse=True)
        
        return results
    
    async def _hybrid_search(
        self,
        query: SearchQuery,
        documents: List[Document],
    ) -> List[SearchResult]:
        """Hybrid search combining vector + keyword"""
        # Get vector results
        vector_results = await self._vector_search(query, documents)
        
        # Get keyword results
        keyword_results = self._keyword_search(query, documents)
        
        # Create lookup maps
        vector_map = {r.doc_id: r for r in vector_results}
        keyword_map = {r.doc_id: r for r in keyword_results}
        
        # Combine scores
        all_doc_ids = set(vector_map.keys()) | set(keyword_map.keys())
        
        hybrid_results = []
        for doc_id in all_doc_ids:
            vector_score = vector_map[doc_id].score if doc_id in vector_map else 0.0
            keyword_score = keyword_map[doc_id].score if doc_id in keyword_map else 0.0
            
            # Weighted combination
            hybrid_score = (
                query.vector_weight * vector_score +
                query.keyword_weight * keyword_score
            )
            
            # Use vector result as base (prefer semantic match)
            if doc_id in vector_map:
                result = vector_map[doc_id]
            else:
                result = keyword_map[doc_id]
            
            result.score = hybrid_score
            result.vector_score = vector_score if vector_score > 0 else None
            result.keyword_score = keyword_score if keyword_score > 0 else None
            
            hybrid_results.append(result)
        
        # Sort by hybrid score
        hybrid_results.sort(key=lambda r: r.score, reverse=True)
        
        return hybrid_results
    
    async def _generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generate text embedding"""
        if not self.embedding_api_url:
            # Mock embedding for demo
            return [0.1] * 1536  # text-embedding-3-small dimension
        
        try:
            response = await self.client.post(
                self.embedding_api_url,
                json={"model": self.embedding_model, "input": text},
            )
            response.raise_for_status()
            data = response.json()
            return data["data"][0]["embedding"]
        
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}")
            return None
    
    def _tokenize(self, text: str) -> List[str]:
        """Simple tokenization (replace with proper tokenizer)"""
        # Lowercase and split
        tokens = text.lower().split()
        
        # Remove punctuation
        tokens = [t.strip('.,;:!?()[]{}"\'-') for t in tokens]
        
        # Remove empty
        tokens = [t for t in tokens if t]
        
        return tokens
    
    def _update_bm25_stats(self, tokens: List[str]):
        """Update BM25 statistics"""
        # Update average document length
        total_docs = len(self.documents) + 1
        total_length = sum(len(d.tokens) for d in self.documents.values()) + len(tokens)
        self.avg_doc_length = total_length / total_docs
        
        # Update IDF scores
        for token in set(tokens):
            if token not in self.idf_scores:
                self.idf_scores[token] = 0.0
    
    def _calculate_bm25_score(
        self,
        query_tokens: List[str],
        doc_tokens: List[str],
        total_docs: int,
    ) -> float:
        """Calculate BM25 score"""
        score = 0.0
        doc_length = len(doc_tokens)
        doc_token_counts = Counter(doc_tokens)
        
        for token in query_tokens:
            if token not in doc_token_counts:
                continue
            
            # Term frequency
            tf = doc_token_counts[token]
            
            # Document frequency
            df = sum(1 for d in self.documents.values() if token in d.tokens)
            
            # IDF
            idf = math.log((total_docs - df + 0.5) / (df + 0.5) + 1.0)
            
            # BM25 formula
            numerator = tf * (self.bm25_k1 + 1)
            denominator = tf + self.bm25_k1 * (
                1 - self.bm25_b + self.bm25_b * (doc_length / self.avg_doc_length)
            )
            
            score += idf * (numerator / denominator)
        
        return score
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity"""
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = math.sqrt(sum(a * a for a in vec1))
        magnitude2 = math.sqrt(sum(b * b for b in vec2))
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return dot_product / (magnitude1 * magnitude2)
    
    def _create_snippet(self, content: str, query: str, max_length: int = 150) -> str:
        """Create search result snippet"""
        # Find query position
        query_lower = query.lower()
        content_lower = content.lower()
        
        pos = content_lower.find(query_lower)
        
        if pos == -1:
            # Query not found, return start of content
            return content[:max_length] + ("..." if len(content) > max_length else "")
        
        # Extract snippet around query
        start = max(0, pos - max_length // 2)
        end = min(len(content), pos + len(query) + max_length // 2)
        
        snippet = content[start:end]
        
        if start > 0:
            snippet = "..." + snippet
        if end < len(content):
            snippet = snippet + "..."
        
        return snippet
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
        logger.info("Hybrid search engine closed")


# Example usage
async def main():
    """Example: Hybrid search engine usage"""
    
    # Initialize search engine
    search_engine = HybridSearchEngine(
        embedding_model="text-embedding-3-small",
        embedding_api_url=None,  # Mock embeddings for demo
    )
    
    # Index sample documents
    logger.info("=== Indexing Documents ===")
    documents = [
        Document(
            doc_id="FDA-001",
            title="FDA 510(k) Clearance Process for AI/ML Devices",
            content="The FDA 510(k) premarket notification process is for medical devices that are substantially equivalent to a legally marketed predicate device. For AI/ML-enabled devices, manufacturers must demonstrate safety and effectiveness.",
            doc_type=DocumentType.FDA_GUIDANCE,
            metadata={"year": 2024, "category": "regulatory"},
        ),
        Document(
            doc_id="FDA-002",
            title="FDA PCCP for Adaptive AI Models",
            content="Predetermined Change Control Plan (PCCP) allows manufacturers to make modifications to AI/ML models without submitting a new 510(k). Changes must be within pre-specified bounds with appropriate validation.",
            doc_type=DocumentType.FDA_GUIDANCE,
            metadata={"year": 2025, "category": "pccp"},
        ),
        Document(
            doc_id="HIPAA-001",
            title="HIPAA Compliance for Medical AI Systems",
            content="Health Insurance Portability and Accountability Act (HIPAA) requires protected health information (PHI) to be secured. Medical AI systems must implement appropriate safeguards including encryption and access controls.",
            doc_type=DocumentType.HIPAA_COMPLIANCE,
            metadata={"year": 2023, "category": "privacy"},
        ),
    ]
    
    for doc in documents:
        await search_engine.index_document(doc)
    
    # Execute searches
    logger.info("\n=== Search 1: Vector Search for 'AI model validation' ===")
    query1 = SearchQuery(
        query_text="AI model validation",
        search_type=SearchType.VECTOR,
        top_k=5,
    )
    response1 = await search_engine.search(query1)
    
    for i, result in enumerate(response1.results, 1):
        logger.info(f"{i}. {result.title} (score: {result.score:.3f})")
        logger.info(f"   Snippet: {result.snippet[:100]}...")
    
    logger.info(f"\n=== Search 2: Keyword Search for 'PCCP' ===")
    query2 = SearchQuery(
        query_text="PCCP",
        search_type=SearchType.KEYWORD,
        top_k=5,
    )
    response2 = await search_engine.search(query2)
    
    for i, result in enumerate(response2.results, 1):
        logger.info(f"{i}. {result.title} (score: {result.score:.3f})")
    
    logger.info(f"\n=== Search 3: Hybrid Search for 'FDA clearance process' ===")
    query3 = SearchQuery(
        query_text="FDA clearance process",
        search_type=SearchType.HYBRID,
        vector_weight=0.7,
        keyword_weight=0.3,
        top_k=5,
    )
    response3 = await search_engine.search(query3)
    
    for i, result in enumerate(response3.results, 1):
        logger.info(f"{i}. {result.title} (hybrid: {result.score:.3f}, vector: {result.vector_score:.3f}, keyword: {result.keyword_score:.3f})")
    
    await search_engine.close()


if __name__ == "__main__":
    asyncio.run(main())
