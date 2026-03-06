import React, { useEffect, useRef } from 'react';
import '../index.css';

const CursorEffect: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Set canvas size
        const setSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setSize();

        // Mouse position
        const mouse = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };

        // Particle class
        class Particle {
            baseX: number;
            baseY: number;
            x: number;
            y: number;
            size: number;
            density: number;
            distance: number;

            constructor(x: number, y: number) {
                this.baseX = x;
                this.baseY = y;
                this.x = x;
                this.y = y;
                this.size = 3;
                this.density = (Math.random() * 30) + 1;
                this.distance = 0;
            }

            draw() {
                // Calculate distance from mouse
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                this.distance = Math.sqrt(dx * dx + dy * dy);

                // Move particle based on distance
                const forceDirectionX = dx / this.distance;
                const forceDirectionY = dy / this.distance;
                const maxDistance = 150;
                const force = (maxDistance - this.distance) / maxDistance;
                const directionX = forceDirectionX * force * this.density;
                const directionY = forceDirectionY * force * this.density;

                if (this.distance < maxDistance) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Return to base position
                    if (this.x !== this.baseX) {
                        const rdx = this.x - this.baseX;
                        this.x -= rdx / 10;
                    }
                    if (this.y !== this.baseY) {
                        const rdy = this.y - this.baseY;
                        this.y -= rdy / 10;
                    }
                }

                // Draw particle with glow effect
                ctx!.beginPath();

                // Glow
                if (this.distance < maxDistance) {
                    const opacity = 1 - (this.distance / maxDistance);
                    ctx!.shadowBlur = 15;
                    ctx!.shadowColor = `rgba(0, 255, 255, ${opacity})`;
                }

                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);

                // Color based on distance
                if (this.distance < maxDistance) {
                    const hue = (this.distance / maxDistance) * 180 + 180;
                    ctx!.fillStyle = `hsl(${hue}, 100%, 50%)`;
                } else {
                    ctx!.fillStyle = 'rgba(255, 255, 255, 0.5)';
                }

                ctx!.fill();
                ctx!.shadowBlur = 0;
            }
        }

        // Create particle grid
        const particlesArray: Particle[] = [];
        const gridSpacing = 30;

        function init() {
            particlesArray.length = 0;
            const cols = Math.floor(canvas!.width / gridSpacing);
            const rows = Math.floor(canvas!.height / gridSpacing);

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const posX = x * gridSpacing + gridSpacing / 2;
                    const posY = y * gridSpacing + gridSpacing / 2;
                    particlesArray.push(new Particle(posX, posY));
                }
            }
        }

        // Connect nearby particles
        function connectParticles() {
            for (let i = 0; i < particlesArray.length; i++) {
                for (let j = i + 1; j < particlesArray.length; j++) {
                    const dx = particlesArray[i].x - particlesArray[j].x;
                    const dy = particlesArray[i].y - particlesArray[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < gridSpacing * 1.5) {
                        const opacity = 1 - (distance / (gridSpacing * 1.5));
                        ctx!.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
                        ctx!.lineWidth = 1;
                        ctx!.beginPath();
                        ctx!.moveTo(particlesArray[i].x, particlesArray[i].y);
                        ctx!.lineTo(particlesArray[j].x, particlesArray[j].y);
                        ctx!.stroke();
                    }
                }
            }
        }

        let animationFrameId: number;

        // Animation loop
        function animate() {
            ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

            // Draw line connections
            connectParticles();

            // Draw particles
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].draw();
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        // Mouse move event
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleResize = () => {
            setSize();
            init();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        // Initialize and start
        init();
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 0
            }}
        />
    );
};

export default CursorEffect;
