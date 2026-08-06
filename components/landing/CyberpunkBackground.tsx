
import React, { useEffect, useRef } from 'react';

const CyberpunkBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId: number;

        // Configuration - Palantir/Enterprise Style
        const config = {
            particleCount: 500,
            connectionDistance: 90,
            baseSpeed: 0.2, // Slower, more calculated movement
            colors: {
                primary: '200, 200, 200', // Silver/White
                secondary: '56, 189, 248', // Sky Blue (Subtle accent)
                bg: '#030303' // Deep Black
            }
        };

        // Mouse State
        const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);

        const handleMouseMove = (e: MouseEvent) => {
            mouse.targetX = e.clientX;
            mouse.targetY = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // --- 3D Vector Logic ---
        interface Point3D { x: number; y: number; z: number; }
        
        const rotateX = (p: Point3D, angle: number): Point3D => ({
            x: p.x,
            y: p.y * Math.cos(angle) - p.z * Math.sin(angle),
            z: p.y * Math.sin(angle) + p.z * Math.cos(angle)
        });

        const rotateY = (p: Point3D, angle: number): Point3D => ({
            x: p.x * Math.cos(angle) - p.z * Math.sin(angle),
            y: p.y,
            z: p.x * Math.sin(angle) + p.z * Math.cos(angle)
        });

        const project = (p: Point3D, fov: number = 600): { x: number; y: number; scale: number } => {
            const denominator = fov + p.z;
            if (denominator <= 0.1) return { x: 0, y: 0, scale: -1 }; 
            const scale = fov / denominator;
            return {
                x: p.x * scale + width / 2,
                y: p.y * scale + height / 2,
                scale
            };
        };

        // --- Particles ---
        class Particle {
            pos: Point3D;
            color: string;
            size: number;
            
            constructor() {
                // Spawn in a flatter, wider field (more like a map)
                const r = Math.random() * 900 + 200; 
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                
                this.pos = {
                    x: r * Math.sin(phi) * Math.cos(theta),
                    y: (r * Math.sin(phi) * Math.sin(theta)) * 0.4, // Flattened Y
                    z: r * Math.cos(phi)
                };

                this.color = Math.random() > 0.8 ? config.colors.secondary : config.colors.primary;
                this.size = Math.random() * 1.2 + 0.3; // Smaller particles
            }

            update() {
                const angle = 0.0005; 
                this.pos = rotateY(this.pos, angle);
            }
        }

        const particles: Particle[] = Array.from({ length: config.particleCount }, () => new Particle());

        // --- Render Loop ---
        const render = () => {
            mouse.x += (mouse.targetX - mouse.x) * 0.05;
            mouse.y += (mouse.targetY - mouse.y) * 0.05;

            const mouseOffset = { 
                x: mouse.x - width / 2, 
                y: mouse.y - height / 2 
            };

            // Clear Screen
            ctx.fillStyle = config.colors.bg;
            ctx.fillRect(0, 0, width, height);

            // Draw Particles & Connections
            particles.forEach((p, i) => {
                p.update();
                
                // Subtle camera rotation based on mouse
                let pos = rotateY(p.pos, mouseOffset.x * 0.00005);
                pos = rotateX(pos, mouseOffset.y * 0.00005);

                const proj = project({ ...pos, z: pos.z + 400 });
                
                if (proj.scale <= 0) return;
                
                // Depth fog
                const alpha = Math.max(0, Math.min(1, (1400 - pos.z) / 1400));
                
                ctx.fillStyle = `rgba(${p.color}, ${alpha * 0.8})`;
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, Math.max(0, p.size * proj.scale), 0, Math.PI * 2);
                ctx.fill();

                // Connections (The Network)
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    // Only check some neighbors for perf
                    if (Math.abs(p.pos.x - p2.pos.x) > 150) continue;

                    let pos2 = rotateY(p2.pos, mouseOffset.x * 0.00005);
                    pos2 = rotateX(pos2, mouseOffset.y * 0.00005);
                    
                    const dist = Math.sqrt(
                        Math.pow(pos.x - pos2.x, 2) + 
                        Math.pow(pos.y - pos2.y, 2) + 
                        Math.pow(pos.z - pos2.z, 2)
                    );

                    if (dist < config.connectionDistance) {
                        const proj2 = project({ ...pos2, z: pos2.z + 400 });
                        if (proj2.scale > 0) {
                            const lineAlpha = (1 - dist / config.connectionDistance) * 0.15 * alpha;
                            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.moveTo(proj.x, proj.y);
                            ctx.lineTo(proj2.x, proj2.y);
                            ctx.stroke();
                        }
                    }
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        }
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

export default CyberpunkBackground;
