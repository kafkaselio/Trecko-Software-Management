import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause, Activity, FileText, CheckSquare, Sparkles } from 'lucide-react';

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  group: string;
  details: string;
  originalId?: string;
  status?: string;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
  type?: string;
}

interface InteractiveD3GraphProps {
  nodes: { id: string; label: string; group: string; details: string; originalId?: string; status?: string }[];
  links: { source: string; target: string; type?: string }[];
  selectedNode: any;
  onSelectNode: (node: any) => void;
  accentColor: string;
}

export default function InteractiveD3Graph({
  nodes,
  links,
  selectedNode,
  onSelectNode,
  accentColor
}: InteractiveD3GraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Initialize and update simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Resolve size dynamically
    const width = containerRef.current.clientWidth || 560;
    const height = 280;

    // Deep copy nodes and links since D3 mutates them in-place
    const d3Nodes: D3Node[] = nodes.map(n => ({ ...n }));
    const d3Links: D3Link[] = links.map(l => ({ ...l }));

    const svg = d3.select(svgRef.current);
    svg.selectAll('.main-group').remove(); // Clean container

    // Base layout: append transformable group
    const mainGroup = svg.append('g').attr('class', 'main-group');

    // Add coordinate background grid
    const gridPattern = mainGroup.append('g')
      .attr('class', 'graph-grid-back')
      .style('opacity', '0.04');
    
    for (let x = -width; x < width * 2; x += 30) {
      gridPattern.append('line')
        .attr('x1', x)
        .attr('y1', -height)
        .attr('x2', x)
        .attr('y2', height * 2)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5);
    }
    for (let y = -height; y < height * 2; y += 30) {
      gridPattern.append('line')
        .attr('x1', -width)
        .attr('y1', y)
        .attr('x2', width * 2)
        .attr('y2', y)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5);
    }

    // Interactive Zoom behavior setup
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
        setZoomLevel(Math.round(event.transform.k * 100) / 100);
      });

    svg.call(zoomBehavior);

    // Initial centering of zoom
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(0, 0).scale(1));

    // Force engine parameters
    const simulation = d3.forceSimulation<D3Node>(d3Nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(d3Links)
        .id((d: any) => d.id)
        .distance(n => n.type === 'cross' ? 120 : 75)
        .strength(0.7)
      )
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(32));

    simulationRef.current = simulation;

    // Draw Links
    const link = mainGroup.append('g')
      .selectAll('line')
      .data(d3Links)
      .enter()
      .append('line')
      .attr('stroke', (d: any) => d.type === 'cross' ? '#818cf8' : accentColor)
      .attr('stroke-width', (d: any) => d.type === 'cross' ? 1.0 : 1.6)
      .attr('stroke-dasharray', (d: any) => d.type === 'cross' ? '5 4' : 'none')
      .attr('opacity', (d: any) => d.type === 'cross' ? 0.22 : 0.35);

    // Node containment groups
    const node = mainGroup.append('g')
      .selectAll('g')
      .data(d3Nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group-g')
      .on('click', (event, d) => {
        event.stopPropagation();
        const found = nodes.find(n => n.id === d.id);
        if (found) onSelectNode(found);
      });

    // Add drop shadow or inner-glowing vector halos for active elements
    node.each(function(d) {
      const gEl = d3.select(this);
      const isSelected = selectedNode?.id === d.id;
      const isRoot = d.id === 'root';
      const isDone = d.status === 'Done';

      if (isRoot || isSelected || isDone) {
        gEl.append('circle')
          .attr('r', isRoot ? 17 : isSelected ? 12 : 9)
          .attr('fill', 'transparent')
          .attr('stroke', isRoot ? accentColor : isSelected ? '#a1a1aa' : '#10b981')
          .attr('stroke-width', 1.2)
          .attr('class', 'animate-ping')
          .style('opacity', 0.45)
          .style('animation-duration', '3s');
      }
    });

    // Node core circle drawing
    node.append('circle')
      .attr('r', (d: any) => d.id === 'root' ? 11 : 6.5)
      .attr('fill', (d: any) => {
        if (d.id === 'root') return accentColor;
        if (d.group === 'specifications') return '#5c3df5';
        if (d.group === 'milestones') return d.status === 'Done' ? '#10b981' : '#f59e0b';
        if (d.group === 'habits') return '#06b6d4';
        return '#27272a';
      })
      .attr('stroke', (d: any) => {
        if (d.id === 'root') return '#ffffff';
        if (d.group === 'specifications') return '#818cf8';
        if (d.group === 'milestones') return d.status === 'Done' ? '#34d399' : '#fbbf24';
        if (d.group === 'habits') return '#22d3ee';
        return accentColor;
      })
      .attr('stroke-width', (d: any) => selectedNode?.id === d.id ? 2.5 : 1.5)
      .attr('class', 'transition-all duration-300 hover:scale-130');

    // Label texts (Slight shadow backplate for contrast readability)
    node.append('text')
      .text((d: any) => d.label.length > 15 ? `${d.label.substring(0, 14)}…` : d.label)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('fill', (d: any) => selectedNode?.id === d.id ? '#ffffff' : '#b1b1b6')
      .attr('font-weight', (d: any) => selectedNode?.id === d.id ? '700' : '500')
      .attr('font-size', '8px')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('class', 'select-none pointer-events-none drop-shadow-md tracking-tight uppercase');

    // Drag-and-drop capability mapping
    const dragHandler = d3.drag<SVGGElement, D3Node>()
      .on('start', (event, d) => {
        if (isFrozen) return;
        if (!event.active) simulation.alphaTarget(0.2).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        if (isFrozen) return;
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (isFrozen) return;
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(dragHandler as any);

    // Frame tick updates
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });

    if (isFrozen) {
      simulation.stop();
    }

    // Clean simulation on components unmount
    return () => {
      simulation.stop();
    };
  }, [nodes, links, accentColor, selectedNode, isFrozen]);

  // Handle manual visual zoom actions
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    
    if (direction === 'reset') {
      svg.transition().duration(400).call(
        d3.zoom().transform as any, 
        d3.zoomIdentity.translate(0, 0).scale(1)
      );
    } else {
      const zoomFactor = direction === 'in' ? 1.3 : 1 / 1.3;
      svg.transition().duration(300).call(
        d3.zoom().scaleBy as any, 
        zoomFactor
      );
    }
  };

  return (
    <div ref={containerRef} className="w-full relative flex flex-col justify-end">
      {/* SVG Canvas Container */}
      <div className="relative w-full h-[280px] bg-black/60 rounded-2xl border border-white/5 overflow-hidden">
        <svg 
          ref={svgRef}
          className="w-full h-full"
        />

        {/* Constellation controls overlay */}
        <div className="absolute bottom-3 left-3 bg-zinc-950/90 border border-white/10 rounded-xl px-2 py-1.5 flex items-center space-x-2.5 z-10 shadow-lg backdrop-blur-md">
          <div className="flex items-center space-x-1 border-r border-white/10 pr-2">
            <button
              onClick={() => handleZoom('in')}
              className="p-1 text-zinc-400 hover:text-white rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="p-1 text-zinc-400 hover:text-white rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom('reset')}
              className="p-1 text-zinc-400 hover:text-white rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsFrozen(!isFrozen)}
            className={`p-1.5 rounded text-[9.5px] font-mono uppercase font-bold flex items-center space-x-1 cursor-pointer transition-all ${
              isFrozen 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
            title={isFrozen ? "Unlock force physics simulation" : "Lock force physics positions"}
          >
            {isFrozen ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
            <span>{isFrozen ? "FREEZE: ON" : "FREEZE: OFF"}</span>
          </button>

          <span className="text-[8.5px] font-mono text-zinc-600 block pl-0.5 select-none">
            Scale: {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* Legend Panel overlay */}
        <div className="absolute top-3 right-3 bg-zinc-950/80 border border-white/5 rounded-xl p-2 z-10 hidden sm:block text-[8.5px] text-zinc-400 font-mono space-y-1 backdrop-blur-md">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
            <span>Center Locus (Workspace)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5c3df5]" />
            <span>Specifications (Doc)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span>Milestones (Task)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
            <span>Habit Routine (Metric)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
