import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Card from '../common/Card';
import { ShieldCheckIcon, ThreatIcon } from '../Icons';

interface Node extends d3.SimulationNodeDatum {
    id: string;
    group: number;
    radius: number;
    risk: 'high' | 'medium' | 'low';
}

interface Link extends d3.SimulationLinkDatum<Node> {
    value: number;
}

const D3ThreatMap: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        const width = canvas.width;
        const height = canvas.height;

        // Generate synthetic Tornado Cash / Phishing data
        const nodes: Node[] = Array.from({ length: 150 }, (_, i) => ({
            id: `node-${i}`,
            group: i % 5,
            radius: Math.random() * 4 + 2,
            risk: Math.random() > 0.85 ? 'high' : (Math.random() > 0.6 ? 'medium' : 'low'),
            x: Math.random() * width,
            y: Math.random() * height
        }));

        // Force one main Tornado Cash cluster
        const links: Link[] = [];
        for (let i = 0; i < 200; i++) {
            const source = Math.floor(Math.random() * nodes.length);
            let target = Math.floor(Math.random() * nodes.length);
            if (nodes[source].risk === 'high') {
                target = Math.floor(Math.random() * 20); // cluster towards first 20 nodes
            }
            if (source !== target) {
                links.push({ source: nodes[source].id, target: nodes[target].id, value: Math.random() });
            }
        }

        const simulation = d3.forceSimulation<Node>(nodes)
            .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(30).strength(0.1))
            .force("charge", d3.forceManyBody().strength(-30))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(d => (d as Node).radius + 2).iterations(2))
            .on("tick", ticked);

        d3.select(canvas).call(
            d3.drag<HTMLCanvasElement, any>()
                .subject((event) => simulation.find(event.x, event.y))
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        );

        function ticked() {
            if (!context) return;
            context.clearRect(0, 0, width, height);

            context.beginPath();
            links.forEach((d: any) => {
                context.moveTo(d.source.x, d.source.y);
                context.lineTo(d.target.x, d.target.y);
            });
            context.strokeStyle = "rgba(100, 116, 139, 0.2)"; // Slate 500 with low opacity
            context.lineWidth = 0.5;
            context.stroke();

            nodes.forEach(d => {
                context.beginPath();
                context.moveTo(d.x! + d.radius, d.y!);
                context.arc(d.x!, d.y!, d.radius, 0, 2 * Math.PI);
                
                if (d.risk === 'high') {
                    context.fillStyle = "#EF4444"; // Red 500
                    context.shadowColor = "#EF4444";
                    context.shadowBlur = 10;
                } else if (d.risk === 'medium') {
                    context.fillStyle = "#EAB308"; // Yellow 500
                    context.shadowBlur = 0;
                } else {
                    context.fillStyle = "#3B82F6"; // Blue 500
                    context.shadowBlur = 0;
                }
                
                context.fill();
            });
        }

        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return () => {
            simulation.stop();
        };
    }, []);

    return (
        <Card className="p-0 overflow-hidden bg-[#050505] border-white/10 relative">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <ThreatIcon className="w-4 h-4 text-red-500" />
                    Threat Map: Real-Time Laundering Topologies
                </h3>
                <p className="text-[9px] text-gray-500 font-mono mt-1">Powered by D3.js Force-Directed Canvas (Tornado Cash Pattern)</p>
            </div>
            
            <div className="absolute bottom-4 right-4 z-10 pointer-events-none flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]"></div>
                    <span className="text-[9px] text-gray-400 font-mono">High Risk (Mixer)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[9px] text-gray-400 font-mono">Nominal User</span>
                 </div>
            </div>

            <canvas 
                ref={canvasRef} 
                width={800} 
                height={500} 
                className="w-full h-full cursor-crosshair mix-blend-screen"
                style={{ background: 'radial-gradient(circle at center, #0a0a0a 0%, #000000 100%)' }}
            />
        </Card>
    );
};

export default D3ThreatMap;
