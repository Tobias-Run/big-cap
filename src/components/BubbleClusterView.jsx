import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { audioSynth } from '../utils/audioSynth';
import { CURRENT_YEAR } from '../utils/dateConstants';
import { Sparkles, X, ArrowRight } from 'lucide-react';

// Shared by the initial bubble render, the mouseleave restore handler, and
// the dedicated search-highlight effect below, so all three agree on what a
// bubble's "resting" (non-hovered) stroke should look like.
function restingBubbleStroke(d, isCrazy, searchQuery) {
  const isMatch = searchQuery && d.name.toLowerCase().includes(searchQuery.toLowerCase());
  if (isMatch) {
    return { stroke: '#fbbf24', strokeWidth: 4, filter: 'drop-shadow(0 0 14px #fbbf24)' };
  }
  if (isCrazy) {
    return {
      stroke: d.isTech ? '#86efac' : '#93c5fd',
      strokeWidth: 1.5,
      filter: d.isTech
        ? 'drop-shadow(0 0 8px rgba(34,197,94,0.5))'
        : 'drop-shadow(0 0 8px rgba(59,130,246,0.5))'
    };
  }
  return { stroke: '#ffffff', strokeWidth: 1, filter: 'none' };
}

export const BubbleClusterView = ({
  filteredCompanies,
  selectedRegions,
  mode,
  searchQuery,
  onSelectCompany,
  supernovaTrigger
}) => {
  const isCrazy = mode === 'crazy';
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  // Click opens a small, non-modal quick-view card anchored to the click
  // position (see "Floating Quick-View Card" below). Its own "More Details"
  // button is what opens the full CompanyDetailModal via onSelectCompany.
  const [quickViewCompany, setQuickViewCompany] = useState(null);
  const [quickViewPos, setQuickViewPos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 1200, height: 780 });

  // The mouseleave handler below is created once per simulation run (see the
  // main D3 effect) and closes over whatever `searchQuery` was at that time.
  // Since searchQuery is intentionally no longer a dependency of that effect
  // (see comment there), the handler reads this ref instead so it always
  // restores the *current* search-match color instead of a stale one.
  const searchQueryRef = useRef(searchQuery);
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // Close the quick-view card on Escape, same as the app's modals.
  useEffect(() => {
    if (!quickViewCompany) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setQuickViewCompany(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewCompany]);

  // Update dimensions dynamically on window resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        // Floor only guards against a transient 0px measurement before first
        // layout; it no longer forces desktop-sized (800px) force-sim
        // coordinates onto a narrower container. The SVG's viewBox (below)
        // is what keeps the chart entirely visible at any width.
        const width = Math.max(clientWidth, 320);
        // Height proportional to width and number of selected regions
        const height = selectedRegions.length > 3 ? 840 : 740;
        setDimensions({ width, height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [selectedRegions.length]);

  // Compute cluster center positions depending on which regions are active
  const clusterCenters = useMemo(() => {
    const { width, height } = dimensions;
    const active = selectedRegions;
    const count = active.length;

    const centers = {};

    if (count === 1) {
      centers[active[0]] = { x: width * 0.5, y: height * 0.5 };
    } else if (count === 2) {
      // Direct comparison mode: US on left (big), EU on right (as in the tweet!)
      if (active.includes('US') && active.includes('EU')) {
        centers['US'] = { x: width * 0.42, y: height * 0.52 };
        centers['EU'] = { x: width * 0.82, y: height * 0.52 };
      } else {
        centers[active[0]] = { x: width * 0.35, y: height * 0.5 };
        centers[active[1]] = { x: width * 0.72, y: height * 0.5 };
      }
    } else if (count === 3) {
      // Triangle layout
      centers[active[0]] = { x: width * 0.36, y: height * 0.42 };
      centers[active[1]] = { x: width * 0.76, y: height * 0.38 };
      centers[active[2]] = { x: width * 0.55, y: height * 0.75 };
    } else if (count === 4) {
      // 2x2 grid
      centers[active[0]] = { x: width * 0.35, y: height * 0.35 };
      centers[active[1]] = { x: width * 0.75, y: height * 0.35 };
      centers[active[2]] = { x: width * 0.35, y: height * 0.75 };
      centers[active[3]] = { x: width * 0.75, y: height * 0.75 };
    } else {
      // 5 regions: US center-left, EU top-right, China top-center, Asia bottom-center, ROW bottom-right
      centers['US'] = { x: width * 0.34, y: height * 0.46 };
      centers['EU'] = { x: width * 0.84, y: height * 0.32 };
      centers['CHINA'] = { x: width * 0.65, y: height * 0.30 };
      centers['ASIA_EX_CHINA'] = { x: width * 0.60, y: height * 0.72 };
      centers['ROW'] = { x: width * 0.85, y: height * 0.72 };
    }

    return centers;
  }, [dimensions, selectedRegions]);

  // Run D3 force simulation
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    // Radius scale: area is proportional to marketCap
    // Maximum cap (Apple/Nvidia) is ~3400, minimum cap is ~10
    const maxCap = d3.max(filteredCompanies, d => d.marketCap) || 3000;
    const rScale = d3.scaleSqrt()
      .domain([0, 3500])
      .range([3, isCrazy ? 82 : 78]);

    // Prepare node objects for simulation
    const nodes = filteredCompanies.map(c => {
      const regionTarget = c.region === 'EUROPE_NON_EU' ? 'EU' : c.region;
      const targetCenter = clusterCenters[regionTarget] || { x: width / 2, y: height / 2 };
      
      return {
        ...c,
        r: rScale(c.marketCap),
        targetX: targetCenter.x,
        targetY: targetCenter.y,
        // Start near target center with small random jitter
        x: targetCenter.x + (Math.random() - 0.5) * 80,
        y: targetCenter.y + (Math.random() - 0.5) * 80
      };
    });

    // Create D3 force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('x', d3.forceX(d => d.targetX).strength(0.14))
      .force('y', d3.forceY(d => d.targetY).strength(0.14))
      .force('collide', d3.forceCollide(d => d.r + (isCrazy ? 3.5 : 2)).strength(0.85).iterations(2))
      .force('charge', d3.forceManyBody().strength(isCrazy ? -14 : -8))
      .alphaDecay(0.025);

    // Render nodes
    const nodeGroup = svg.select('.nodes-layer');
    nodeGroup.selectAll('*').remove();

    // In crazy mode, draw background supply chain constellation lines
    const linesGroup = svg.select('.constellation-layer');
    linesGroup.selectAll('*').remove();

    // Map for fast node lookup
    const nodeMap = new Map();
    nodes.forEach(n => nodeMap.set(n.id, n));

    // Supply-chain titan pairings for crazy mode (e.g. ASML lithography -> TSMC foundry -> Nvidia GPU -> Apple device)
    const supplyChainPairs = [
      ['asml', 'tsmc'],
      ['tsmc', 'nvda'],
      ['tsmc', 'aapl'],
      ['nvda', 'msft'],
      ['nvda', 'meta'],
      ['asml', 'sap']
    ];

    const activePairs = supplyChainPairs.filter(([id1, id2]) => nodeMap.has(id1) && nodeMap.has(id2));

    let constellationLines = null;
    if (isCrazy && activePairs.length > 0) {
      constellationLines = linesGroup.selectAll('line')
        .data(activePairs)
        .enter()
        .append('line')
        .attr('stroke', '#a855f7')
        .attr('stroke-opacity', 0.45)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 4')
        .style('filter', 'drop-shadow(0 0 6px #c084fc)');
    }

    // Issue #4: shade + "lasso" outline around the non-EU-Europe companies
    // (ARM, AstraZeneca, Linde, Wise) that sit inside the EU cluster when
    // "Broad Europe" is on, so their non-EU status reads at a glance instead
    // of requiring a click on each bubble. Created once here and its `d`
    // attribute is recomputed every simulation tick below, same pattern as
    // the constellation lines above (never re-appended, just re-positioned).
    const nonEuLassoGroup = svg.select('.non-eu-lasso-layer');
    nonEuLassoGroup.selectAll('*').remove();
    const nonEuLassoPath = nonEuLassoGroup.append('path')
      .attr('fill', isCrazy ? 'rgba(168,85,247,0.12)' : 'rgba(251,191,36,0.09)')
      .attr('stroke', isCrazy ? '#c084fc' : '#fbbf24')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5 5')
      .attr('stroke-opacity', 0.75)
      .style('display', 'none')
      .style('pointer-events', 'none');
    const nonEuLassoLabel = nonEuLassoGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('letter-spacing', '0.04em')
      .attr('fill', isCrazy ? '#e9d5ff' : '#fde68a')
      .style('text-transform', 'uppercase')
      .style('display', 'none')
      .style('pointer-events', 'none');
    const nonEuHullLine = d3.line().curve(d3.curveCatmullRomClosed.alpha(0.6));
    // Generates points around a node's circle (not just its center) so the
    // resulting hull hugs the bubbles' edges with a bit of breathing room,
    // instead of a hull through bare center-points that would cut corners
    // off the outermost circles.
    function nonEuHullBoundaryPoints(euNonEuNodes) {
      const pad = 12;
      const segments = 10;
      const pts = [];
      euNonEuNodes.forEach(n => {
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * 2 * Math.PI;
          pts.push([n.x + Math.cos(angle) * (n.r + pad), n.y + Math.sin(angle) * (n.r + pad)]);
        }
      });
      return pts;
    }

    // Append company bubble groups
    const bubbles = nodeGroup.selectAll('.bubble')
      .data(nodes, d => d.id)
      .enter()
      .append('g')
      .attr('class', 'bubble cursor-pointer')
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        audioSynth.playHover(d.marketCap);
        
        // Highlight bubble
        d3.select(event.currentTarget).select('circle')
          .transition()
          .duration(150)
          .attr('stroke-width', 3)
          .attr('stroke', '#ffffff')
          .attr('filter', isCrazy ? 'drop-shadow(0 0 12px #f472b6)' : 'none');
      })
      .on('mousemove', (event) => {
        const bounds = containerRef.current?.getBoundingClientRect();
        if (bounds) {
          setTooltipPos({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top
          });
        }
      })
      .on('mouseleave', (event, d) => {
        setHoveredNode(null);
        // Read the ref (not the `searchQuery` prop closed over when this
        // handler was created) so a search typed while hovering a bubble
        // isn't wiped out the moment the mouse leaves it.
        const resting = restingBubbleStroke(d, isCrazy, searchQueryRef.current);
        d3.select(event.currentTarget).select('circle')
          .transition()
          .duration(200)
          .attr('stroke-width', resting.strokeWidth)
          .attr('stroke', resting.stroke)
          .attr('filter', resting.filter);
      })
      .on('click', (event, d) => {
        const bounds = containerRef.current?.getBoundingClientRect();
        if (bounds) {
          setQuickViewPos({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top
          });
        }
        setHoveredNode(null);
        setQuickViewCompany(d);
      });

    // Drag behavior for interactive exploration
    const drag = d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    bubbles.call(drag);

    // Circles
    bubbles.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => {
        if (d.isTech) {
          return isCrazy ? '#16a34a' : '#22c55e'; // Green: high-tech
        } else {
          return isCrazy ? '#2563eb' : '#3b82f6'; // Blue: other
        }
      })
      .attr('fill-opacity', isCrazy ? 0.92 : 0.88)
      // Initial stroke uses whatever searchQuery is current right now (via
      // the ref, since searchQuery isn't a dependency of this effect — see
      // the dedicated search-highlight effect below, which re-applies this
      // on every keystroke without re-running the simulation).
      .attr('stroke', d => restingBubbleStroke(d, isCrazy, searchQueryRef.current).stroke)
      .attr('stroke-width', d => restingBubbleStroke(d, isCrazy, searchQueryRef.current).strokeWidth)
      .style('filter', d => restingBubbleStroke(d, isCrazy, searchQueryRef.current).filter);

    // Text labels for large enough bubbles (r >= 17)
    bubbles.filter(d => d.r >= 16)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => (d.r >= 35 ? '-0.25em' : '0.35em'))
      .attr('font-size', d => {
        if (d.r >= 55) return '13px';
        if (d.r >= 35) return '11px';
        if (d.r >= 24) return '9.5px';
        return '8px';
      })
      .attr('font-weight', '600')
      .attr('fill', '#ffffff')
      .attr('pointer-events', 'none')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.85)')
      .text(d => d.name);

    // Subtitle valuation label for mega bubbles (r >= 35)
    bubbles.filter(d => d.r >= 35)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.1em')
      .attr('font-size', d => (d.r >= 55 ? '11px' : '9px'))
      .attr('font-family', 'monospace')
      .attr('fill', '#f1f5f9')
      .attr('opacity', 0.9)
      .attr('pointer-events', 'none')
      .text(d => `$${d.marketCap >= 1000 ? `${(d.marketCap/1000).toFixed(1)}T` : `${d.marketCap}B`}`);

    // Simulation tick update
    simulation.on('tick', () => {
      bubbles.attr('transform', d => `translate(${d.x},${d.y})`);

      if (constellationLines) {
        constellationLines
          .attr('x1', ([id1]) => nodeMap.get(id1)?.x || 0)
          .attr('y1', ([id1]) => nodeMap.get(id1)?.y || 0)
          .attr('x2', ([, id2]) => nodeMap.get(id2)?.x || 0)
          .attr('y2', ([, id2]) => nodeMap.get(id2)?.y || 0);
      }

      // Issue #4: non-EU-Europe lasso, recomputed every tick since the
      // force simulation keeps moving these nodes.
      const nonEuNodes = nodes.filter(n => n.region === 'EUROPE_NON_EU');
      const hullPoints = nonEuNodes.length > 0
        ? d3.polygonHull(nonEuHullBoundaryPoints(nonEuNodes))
        : null;
      if (hullPoints) {
        nonEuLassoPath.attr('d', nonEuHullLine(hullPoints)).style('display', null);
        const topY = Math.min(...nonEuNodes.map(n => n.y - n.r));
        const centerX = nonEuNodes.reduce((sum, n) => sum + n.x, 0) / nonEuNodes.length;
        nonEuLassoLabel
          .attr('x', centerX)
          .attr('y', topY - 22)
          .text('Non-EU Europe')
          .style('display', null);
      } else {
        nonEuLassoPath.style('display', 'none');
        nonEuLassoLabel.style('display', 'none');
      }
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
    // searchQuery intentionally excluded: highlighting a match must not
    // restart the force simulation (which reseeds every bubble's position
    // with a fresh random jitter, see `x`/`y` above and makes the whole
    // cluster jump on every keystroke). See the dedicated effect below.
  }, [filteredCompanies, dimensions, clusterCenters, isCrazy]);

  // Re-applies the search-match highlight to already-rendered bubbles
  // in-place, without touching the simulation or node positions above.
  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .selectAll('.nodes-layer .bubble')
      .each(function (d) {
        const resting = restingBubbleStroke(d, isCrazy, searchQuery);
        d3.select(this).select('circle')
          .attr('stroke', resting.stroke)
          .attr('stroke-width', resting.strokeWidth)
          .style('filter', resting.filter);
      });
  }, [searchQuery, isCrazy, filteredCompanies]);

  // Handle supernova shockwave burst effect
  useEffect(() => {
    if (supernovaTrigger && isCrazy && svgRef.current) {
      audioSynth.playSupernova();
      const svg = d3.select(svgRef.current);
      
      // Shockwave pulse ring animation
      svg.append('circle')
        .attr('cx', dimensions.width / 2)
        .attr('cy', dimensions.height / 2)
        .attr('r', 10)
        .attr('fill', 'none')
        .attr('stroke', '#ec4899')
        .attr('stroke-width', 6)
        .attr('opacity', 0.9)
        .style('filter', 'drop-shadow(0 0 20px #a855f7)')
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr('r', dimensions.width * 0.75)
        .attr('stroke-width', 0.5)
        .attr('opacity', 0)
        .remove();
    }
  }, [supernovaTrigger, isCrazy, dimensions]);

  const regionNames = {
    US: { label: 'US', flag: '🇺🇸' },
    EU: { label: 'EU', flag: '🇪🇺' },
    CHINA: { label: 'China', flag: '🇨🇳' },
    ASIA_EX_CHINA: { label: 'Asia ex-China', flag: '🌏' },
    ROW: { label: 'Rest of World', flag: '🌐' }
  };

  return (
    <div className="relative w-full overflow-hidden select-none" ref={containerRef}>
      {/* Background aesthetics */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
        isCrazy 
          ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/40 via-slate-950 to-slate-950' 
          : 'bg-[var(--surf-0)]'
      }`}>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      {/* SVG Canvas for Force Simulation */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="relative z-10 w-full overflow-visible"
      >
        <defs>
          {/* Neon Glow Filters for Crazy Mode */}
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Layer 1: Constellation supply-chain connections */}
        <g className="constellation-layer" />

        {/* Layer 1.5: Non-EU Europe shade/lasso (issue #4) — sits behind
            the bubbles and their labels, ahead of nothing but the grid. */}
        <g className="non-eu-lasso-layer pointer-events-none" />

        {/* Layer 2: Regional Island Labels */}
        <g className="labels-layer pointer-events-none">
          {selectedRegions.map(regionKey => {
            const center = clusterCenters[regionKey];
            if (!center) return null;
            const meta = regionNames[regionKey] || { label: regionKey, flag: '📍' };

            return (
              <g key={regionKey} transform={`translate(${center.x}, ${center.y - 190})`}>
                <text
                  textAnchor="middle"
                  className={`font-black tracking-wider transition-colors ${
                    isCrazy 
                      ? 'text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]' 
                      : 'text-[var(--text-1)]'
                  }`}
                  fontSize={isCrazy ? '26px' : '22px'}
                  fill="currentColor"
                >
                  {meta.label}
                </text>
              </g>
            );
          })}
        </g>

        {/* Layer 3: Interactive Bubbles */}
        <g className="nodes-layer" />
      </svg>

      {/* Bottom Right Scale & Legend (Direct recreation of Andrew McAfee's chart legend!) */}
      <div className={`absolute bottom-4 right-4 z-20 p-3.5 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
        isCrazy 
          ? 'bg-[var(--surf-0)]/80 border-purple-900/60 shadow-purple-950/50' 
          : 'bg-[var(--surf-1)]/90 border-[var(--border-1)] shadow-slate-950/80'
      }`}>
        <div className="flex flex-col gap-2.5">
          {/* Color legend */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              <span className="text-emerald-400 italic">Green: high-tech</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
              <span className="text-blue-400 italic">Blue: other</span>
            </div>
          </div>

          <div className="h-px bg-[var(--surf-2)] my-0.5"></div>

          {/* Reference size circles */}
          <div className="flex items-end justify-between gap-3 text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full border border-[var(--border-3)] bg-[var(--surf-2)]/40 flex items-center justify-center"></div>
              <span className="text-[10px] font-mono text-[var(--text-3)]">$1T</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-5 h-5 rounded-full border border-[var(--border-3)] bg-[var(--surf-2)]/40"></div>
              <span className="text-[10px] font-mono text-[var(--text-3)]">$100B</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full border border-[var(--border-3)] bg-[var(--surf-2)]/40"></div>
              <span className="text-[10px] font-mono text-[var(--text-3)]">$10B</span>
            </div>
          </div>

          <span className="text-[9px] text-[var(--text-4)] font-mono text-center">
            Bubble area ∝ Market Cap
          </span>
        </div>
      </div>

      {/* Minimal Hover Tooltip: name, market cap, founding year only.
          Suppressed while the click quick-view card (below) is open so the
          two don't stack. Re-mounts (and therefore re-plays its fade-in)
          on every new hover target because it's keyed on the company id. */}
      {hoveredNode && !quickViewCompany && (
        <div
          key={hoveredNode.id}
          style={{
            left: `${Math.min(tooltipPos.x + 16, dimensions.width - 190)}px`,
            top: `${Math.max(tooltipPos.y - 60, 20)}px`
          }}
          className={`absolute z-30 w-44 px-3 py-2 rounded-lg border pointer-events-none shadow-xl animate-fade-in ${
            isCrazy
              ? 'bg-[var(--surf-0)]/90 border-purple-500/50 backdrop-blur-md'
              : 'bg-[var(--surf-1)]/90 border-[var(--border-2)] backdrop-blur-sm'
          }`}
        >
          <div className="text-sm font-bold text-[var(--text-0)] leading-tight truncate">
            {hoveredNode.name}
          </div>
          <div className="flex items-baseline justify-between mt-1 text-xs">
            <span className="font-mono font-bold text-amber-300">
              ${hoveredNode.marketCap >= 1000 ? `${(hoveredNode.marketCap/1000).toFixed(2)}T` : `${hoveredNode.marketCap}B`}
            </span>
            <span className="text-[var(--text-3)]">
              Founded {hoveredNode.foundingYear}
            </span>
          </div>
        </div>
      )}

      {/* Click Quick-View Card: the richer summary that used to show on
          hover. Stays open (unlike the tooltip above) until dismissed, and
          its own "More Details" button is what opens the full company
          dossier modal. A transparent backdrop lets an outside click close
          it too. */}
      {quickViewCompany && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setQuickViewCompany(null)}
            aria-hidden="true"
          />
          <div
            style={{
              left: `${Math.min(Math.max(quickViewPos.x - 144, 8), dimensions.width - 296)}px`,
              top: `${Math.max(quickViewPos.y - 120, 20)}px`
            }}
            className={`absolute z-40 w-72 p-3.5 rounded-xl border shadow-2xl animate-fade-in ${
              isCrazy
                ? 'bg-[var(--surf-0)]/95 border-purple-500/60 shadow-purple-950/80 backdrop-blur-md'
                : 'bg-[var(--surf-1)]/95 border-[var(--border-2)] shadow-slate-950/90 backdrop-blur-sm'
            }`}
          >
            <button
              type="button"
              onClick={() => setQuickViewCompany(null)}
              className="absolute top-2.5 right-2.5 p-1 rounded-md text-[var(--text-3)] hover:text-[var(--text-0)] hover:bg-[var(--surf-2)] transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start justify-between gap-2 pr-5">
              <div>
                <div className="text-base font-bold text-[var(--text-0)] leading-tight">
                  {quickViewCompany.name}
                </div>
                <div className="text-xs text-[var(--text-3)] font-mono">
                  {quickViewCompany.ticker} • {quickViewCompany.country}
                </div>
              </div>

              <span className={`text-xs px-2 py-0.5 rounded font-bold flex-shrink-0 ${
                quickViewCompany.isTech
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-blue-950 text-blue-300 border border-blue-800'
              }`}>
                {quickViewCompany.isTech ? 'High-Tech' : 'Other'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2.5 pt-2 border-t border-[var(--border-1)]">
              <div>
                <span className="text-[10px] uppercase font-mono text-[var(--text-4)] block">Market Cap</span>
                <span className="text-sm font-black text-amber-300">
                  ${quickViewCompany.marketCap >= 1000 ? `${(quickViewCompany.marketCap/1000).toFixed(2)}T` : `${quickViewCompany.marketCap}B`}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-[var(--text-4)] block">Founded / Age</span>
                <span className="text-sm font-semibold text-[var(--text-1)]">
                  {quickViewCompany.foundingYear} ({CURRENT_YEAR - quickViewCompany.foundingYear}y)
                </span>
              </div>
            </div>

            <div className="text-xs text-[var(--text-2)] border-t border-[var(--border-1)] pt-2 line-clamp-2">
              <span className="text-[var(--text-4)] font-mono uppercase text-[10px] block">Lineage & Origin</span>
              {quickViewCompany.originDetails}
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectCompany(quickViewCompany);
                setQuickViewCompany(null);
              }}
              className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>More Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
