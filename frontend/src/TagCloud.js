import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * TagCloud - D3.js word cloud visualization for tags.
 * Props:
 *   tags: array of { tag: string, count: number }
 *   onTagClick: function(tag)
 */
function TagCloud({ tags, onTagClick }) {
  const ref = useRef();

  useEffect(() => {
    if (!tags || tags.length === 0) return;
    const width = 400, height = 200;
    d3.select(ref.current).selectAll('*').remove();
    const svg = d3.select(ref.current)
      .attr('width', width)
      .attr('height', height);
    const maxCount = d3.max(tags, d => d.count) || 1;
    const fontScale = d3.scaleLinear().domain([1, maxCount]).range([12, 38]);
    // Simple grid layout (for clarity & reactivity)
    const cols = Math.ceil(Math.sqrt(tags.length));
    const rows = Math.ceil(tags.length / cols);
    const cellW = width / cols;
    const cellH = height / rows;
    tags.sort((a, b) => b.count - a.count);
    svg.selectAll('text')
      .data(tags)
      .enter()
      .append('text')
      .attr('x', (d, i) => (i % cols) * cellW + cellW/2)
      .attr('y', (d, i) => Math.floor(i / cols) * cellH + cellH/2)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => fontScale(d.count))
      .attr('fill', '#1976d2')
      .attr('style', 'cursor:pointer;')
      .text(d => d.tag)
      .on('click', (e, d) => onTagClick && onTagClick(d.tag));
  }, [tags, onTagClick]);

  return (
    <svg ref={ref} style={{ width: '100%', height: 200, display: 'block', margin: 'auto' }} />
  );
}

export default TagCloud;
