import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { audioSynth } from '../utils/audioSynth';
import { Info, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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
  const [dimensions, setDimensions] = useState({ width: 1200, height: 780 });

  // Update dimensions dynamically on window resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        const width = Math.max(clientWidth, 800);
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
        d3.select(event.currentTarget).select('circle')
          .transition()
          .duration(200)
          .attr('stroke-width', isCrazy ? 2 : 1)
          .attr('stroke', isCrazy ? (d.isTech ? '#86efac' : '#93c5fd') : '#ffffff')
          .attr('filter', isCrazy ? (d.isTech ? 'drop-shadow(0 0 8px rgba(34,197,94,0.6))' : 'drop-shadow(0 0 8px rgba(59,130,246,0.6))') : 'none');
      })
      .on('click', (event, d) => {
        onSelectCompany(d);
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
      .attr('stroke', d => {
        if (searchQuery && d.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return '#fbbf24'; // Golden search match
        }
        return isCrazy ? (d.isTech ? '#86efac' : '#93c5fd') : '#ffffff';
      })
      .attr('stroke-width', d => {
        if (searchQuery && d.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return 4;
        }
        return isCrazy ? 1.5 : 1;
      })
      .style('filter', d => {
        if (searchQuery && d.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return 'drop-shadow(0 0 14px #fbbf24)';
        }
        if (isCrazy) {
          return d.isTech 
            ? 'drop-shadow(0 0 8px rgba(34,197,94,0.5))' 
            : 'drop-shadow(0 0 8px rgba(59,130,246,0.5))';
        }
        return 'none';
      });

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
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [filteredCompanies, dimensions, clusterCenters, isCrazy, searchQuery]);

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
          : 'bg-slate-950'
      }`}>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      {/* SVG Canvas for Force Simulation */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
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
                      : 'text-slate-200'
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
          ? 'bg-slate-950/80 border-purple-900/60 shadow-purple-950/50' 
          : 'bg-slate-900/90 border-slate-800 shadow-slate-950/80'
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

          <div className="h-px bg-slate-800 my-0.5"></div>

          {/* Reference size circles */}
          <div className="flex items-end justify-between gap-3 text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full border border-slate-600 bg-slate-800/40 flex items-center justify-center"></div>
              <span className="text-[10px] font-mono text-slate-400">$1T</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-5 h-5 rounded-full border border-slate-600 bg-slate-800/40"></div>
              <span className="text-[10px] font-mono text-slate-400">$100B</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full border border-slate-600 bg-slate-800/40"></div>
              <span className="text-[10px] font-mono text-slate-400">$10B</span>
            </div>
          </div>

          <span className="text-[9px] text-slate-500 font-mono text-center">
            Bubble area ∝ Market Cap
          </span>
        </div>
      </div>

      {/* Floating Interactive Tooltip */}
      {hoveredNode && (
        <div
          style={{
            left: `${Math.min(tooltipPos.x + 16, dimensions.width - 290)}px`,
            top: `${Math.max(tooltipPos.y - 120, 20)}px`
          }}
          className={`absolute z-30 w-72 p-3.5 rounded-xl border pointer-events-none shadow-2xl transition-all ${
            isCrazy 
              ? 'bg-slate-950/95 border-purple-500/60 shadow-purple-950/80 backdrop-blur-md' 
              : 'bg-slate-900/95 border-slate-700 shadow-slate-950/90 backdrop-blur-sm'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-base font-bold text-white leading-tight">
                {hoveredNode.name}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {hoveredNode.ticker} • {hoveredNode.country}
              </div>
            </div>

            <span className={`text-xs px-2 py-0.5 rounded font-bold ${
              hoveredNode.isTech 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                : 'bg-blue-950 text-blue-300 border border-blue-800'
            }`}>
              {hoveredNode.isTech ? 'High-Tech' : 'Other'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-2.5 pt-2 border-t border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Market Cap</span>
              <span className="text-sm font-black text-amber-300">
                ${hoveredNode.marketCap >= 1000 ? `${(hoveredNode.marketCap/1000).toFixed(2)}T` : `${hoveredNode.marketCap}B`}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Founded / Age</span>
              <span className="text-sm font-semibold text-slate-200">
                {hoveredNode.foundingYear} ({2024 - hoveredNode.foundingYear}y)
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-300 border-t border-slate-800 pt-2 line-clamp-2">
            <span className="text-slate-500 font-mono uppercase text-[10px] block">Lineage & Origin</span>
            {hoveredNode.originDetails}
          </div>

          <div className="mt-2.5 text-[10px] text-purple-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Click to inspect filing dossier & data citations</span>
          </div>
        </div>
      )}
    </div>
  );
};
