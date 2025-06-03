#!/bin/bash

# Wait for Neo4j to be ready
until wget -q --spider http://localhost:7474; do
  echo "Waiting for Neo4j to be available..."
  sleep 5
done

echo "Neo4j is ready, initializing database..."

# Wait a bit more to ensure Neo4j is fully started
sleep 10

# Initialize the database with APOC and GDS settings
cypher-shell -u neo4j -p stockpulse_neo4j_password \
  "CALL dbms.listProcedures() YIELD name WHERE name STARTS WITH 'apoc.' OR name STARTS WITH 'gds.'
   RETURN name;" || true

echo "Neo4j initialization complete!"
