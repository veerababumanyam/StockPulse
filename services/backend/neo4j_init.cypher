// Neo4j Initialization for StockPulse Knowledge Graph
// This creates the initial schema and constraints for the knowledge graph

// Create constraints for unique identifiers
CREATE CONSTRAINT company_symbol_unique IF NOT EXISTS FOR (c:Company) REQUIRE c.symbol IS UNIQUE;
CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT document_id_unique IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT news_id_unique IF NOT EXISTS FOR (n:News) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT filing_id_unique IF NOT EXISTS FOR (f:Filing) REQUIRE f.id IS UNIQUE;

// Create indexes for better performance
CREATE INDEX company_name_index IF NOT EXISTS FOR (c:Company) ON (c.name);
CREATE INDEX document_type_index IF NOT EXISTS FOR (d:Document) ON (d.type);
CREATE INDEX news_published_index IF NOT EXISTS FOR (n:News) ON (n.published_at);
CREATE INDEX filing_date_index IF NOT EXISTS FOR (f:Filing) ON (f.filing_date);

// Create basic node types with properties

// Company nodes
CREATE (aapl:Company {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  sector: 'Technology',
  industry: 'Consumer Electronics',
  market_cap: 3000000000000,
  created_at: datetime(),
  updated_at: datetime()
});

CREATE (msft:Company {
  symbol: 'MSFT', 
  name: 'Microsoft Corporation',
  sector: 'Technology',
  industry: 'Software',
  market_cap: 2800000000000,
  created_at: datetime(),
  updated_at: datetime()
});

CREATE (googl:Company {
  symbol: 'GOOGL',
  name: 'Alphabet Inc.',
  sector: 'Technology', 
  industry: 'Internet Services',
  market_cap: 1700000000000,
  created_at: datetime(),
  updated_at: datetime()
});

// Document type nodes for categorization
CREATE (news_type:DocumentType {
  name: 'News Article',
  description: 'Financial news and market updates'
});

CREATE (filing_type:DocumentType {
  name: 'SEC Filing',
  description: 'Company regulatory filings'
});

CREATE (research_type:DocumentType {
  name: 'Research Report',
  description: 'Analyst research and recommendations'
});

// Sector and Industry nodes for better organization
CREATE (tech_sector:Sector {
  name: 'Technology',
  description: 'Technology companies and services'
});

CREATE (consumer_electronics:Industry {
  name: 'Consumer Electronics',
  sector: 'Technology'
});

CREATE (software:Industry {
  name: 'Software',
  sector: 'Technology'
});

CREATE (internet_services:Industry {
  name: 'Internet Services',
  sector: 'Technology'
});

// Create relationships
MATCH (c:Company), (s:Sector)
WHERE c.sector = s.name
CREATE (c)-[:BELONGS_TO_SECTOR]->(s);

MATCH (c:Company), (i:Industry)
WHERE c.industry = i.name
CREATE (c)-[:OPERATES_IN_INDUSTRY]->(i);

MATCH (i:Industry), (s:Sector)
WHERE i.sector = s.name
CREATE (i)-[:PART_OF_SECTOR]->(s);

// Create some sample knowledge graph structures

// Market relationship between companies (competitors)
MATCH (aapl:Company {symbol: 'AAPL'}), (msft:Company {symbol: 'MSFT'})
CREATE (aapl)-[:COMPETES_WITH {market: 'Personal Computing', strength: 0.7}]->(msft);

MATCH (msft:Company {symbol: 'MSFT'}), (googl:Company {symbol: 'GOOGL'})
CREATE (msft)-[:COMPETES_WITH {market: 'Cloud Services', strength: 0.9}]->(googl);

// Create example document nodes that will be populated by the application
CREATE (sample_news:News {
  id: 'news_001',
  title: 'Sample News Article',
  content: 'This is a sample news article for testing.',
  published_at: datetime(),
  source: 'Sample Source',
  sentiment_score: 0.1,
  embedding_generated: false
});

CREATE (sample_filing:Filing {
  id: 'filing_001',
  filing_type: '10-K',
  filing_date: date(),
  company_symbol: 'AAPL',
  processed: false,
  embedding_generated: false
});

// Link sample documents to companies
MATCH (n:News {id: 'news_001'}), (c:Company {symbol: 'AAPL'})
CREATE (n)-[:MENTIONS {relevance: 0.8}]->(c);

MATCH (f:Filing {id: 'filing_001'}), (c:Company {symbol: 'AAPL'})
CREATE (f)-[:FILED_BY]->(c);

// Create embedding vector placeholders (actual embeddings will be stored in Qdrant)
CREATE (news_embedding:Embedding {
  id: 'emb_news_001',
  document_id: 'news_001',
  model: 'sentence-transformers/all-MiniLM-L6-v2',
  vector_id: 'qdrant_vec_001',
  created_at: datetime()
});

MATCH (n:News {id: 'news_001'}), (e:Embedding {id: 'emb_news_001'})
CREATE (n)-[:HAS_EMBEDDING]->(e);

// Log successful initialization
CREATE (init_log:SystemLog {
  event: 'neo4j_initialization',
  timestamp: datetime(),
  message: 'Neo4j knowledge graph initialized successfully',
  version: '1.0'
});

// Return summary of created nodes
MATCH (n) 
RETURN labels(n) as NodeType, count(n) as Count
ORDER BY NodeType; 