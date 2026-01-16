const logger = require('./logger');

function validateRoadmapStructure(roadmapData) {
  const errors = [];
  const warnings = [];
  const stats = {
    totalNodes: 0,
    topicNodes: 0,
    subtopicNodes: 0,
    totalEdges: 0
  };

  if (typeof roadmapData !== 'object' || roadmapData === null) {
    errors.push('Roadmap data must be a valid object');
    return { valid: false, errors, warnings, stats };
  }

  if (!Array.isArray(roadmapData.nodes)) {
    errors.push('Roadmap must have a "nodes" array');
    return { valid: false, errors, warnings, stats };
  }

  if (roadmapData.nodes.length === 0) {
    errors.push('Roadmap must contain at least one node');
    return { valid: false, errors, warnings, stats };
  }

  if (!Array.isArray(roadmapData.edges)) {
    errors.push('Roadmap must have an "edges" array');
    return { valid: false, errors, warnings, stats };
  }

  const nodeIds = new Set();
  const nodeTypes = new Set();

  roadmapData.nodes.forEach((node, index) => {
    if (!node.id) {
      errors.push(`Node at index ${index} is missing required "id" field`);
      return;
    }

    if (!node.type) {
      errors.push(`Node "${node.id}" is missing required "type" field`);
      return;
    }

    nodeTypes.add(node.type);

    if (['topic', 'subtopic'].includes(node.type)) {
      if (!node.data || !node.data.label) {
        errors.push(`Node "${node.id}" (type: ${node.type}) is missing "data.label"`);
      } else {
        if (node.type === 'topic') stats.topicNodes++;
        if (node.type === 'subtopic') stats.subtopicNodes++;
      }
    }

    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node ID found: "${node.id}"`);
    }
    nodeIds.add(node.id);
    stats.totalNodes++;
  });

  roadmapData.edges.forEach((edge, index) => {
    if (!edge.id) {
      warnings.push(`Edge at index ${index} is missing "id" field`);
    }

    if (!edge.source) {
      errors.push(`Edge at index ${index} is missing "source" field`);
      return;
    }

    if (!edge.target) {
      errors.push(`Edge at index ${index} is missing "target" field`);
      return;
    }

    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge "${edge.id}" references non-existent source node: "${edge.source}"`);
    }

    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge "${edge.id}" references non-existent target node: "${edge.target}"`);
    }

    stats.totalEdges++;
  });

  if (stats.topicNodes === 0) {
    warnings.push('No topic nodes found. Roadmap should contain at least one topic.');
  }

  if (stats.totalEdges === 0 && stats.totalNodes > 1) {
    warnings.push('No edges found. Nodes should be connected via edges.');
  }

  logger.info(`Validation complete: ${errors.length} errors, ${warnings.length} warnings`);
  logger.info(`Stats: ${stats.totalNodes} nodes (${stats.topicNodes} topics, ${stats.subtopicNodes} subtopics), ${stats.totalEdges} edges`);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats
  };
}

module.exports = {
  validateRoadmapStructure
};
