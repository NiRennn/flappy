import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function ThreeScene() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#202020");

    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const balls = [];

    const COLORS = [
      0xff5555,
      0x55ff55, 
      0x5555ff, 
      0xffff55, 
      0xff55ff, 
      0x55ffff, 
    ];

    function createBall() {
      const radius = 0.3 + Math.random() * 0.6;
      const geometry = new THREE.SphereGeometry(radius, 32, 32);

      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const material = new THREE.MeshStandardMaterial({ color });

      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = (Math.random() - 0.5) * 10; 
      mesh.position.y = (Math.random() - 0.5) * 6;
      mesh.position.z = -15;

      const speed = 0.03 + Math.random() * 0.05;

      const ball = {
        mesh,
        geometry,
        material,
        speed,
        alive: true,
      };

      balls.push(ball);
      scene.add(mesh);
    }

    for (let i = 0; i < 10; i++) {
      createBall();
    }

    let hoveredBall = null;

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);

      const meshes = balls.filter((b) => b.alive).map((b) => b.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const ball = balls.find((b) => b.mesh === hitMesh);

        if (ball && ball.alive) {
          ball.alive = false;
          scene.remove(ball.mesh);
          ball.geometry.dispose();
          ball.material.dispose();

          setScore((prev) => prev + 1);

          createBall();
        }
      }
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("click", handleClick);

    let animationFrameId;

    const animate = () => {
      for (const ball of balls) {
        if (!ball.alive) continue;

        ball.mesh.position.z += ball.speed;
        ball.mesh.rotation.x += 0.01;
        ball.mesh.rotation.y += 0.02;

        if (ball.mesh.position.z > 2) {
          ball.alive = false;
          scene.remove(ball.mesh);
          ball.geometry.dispose();
          ball.material.dispose();
          createBall();
        }
      }

      raycaster.setFromCamera(mouse, camera);
      const meshes = balls.filter((b) => b.alive).map((b) => b.mesh);
      const intersects = raycaster.intersectObjects(meshes);
      const hitMesh = intersects.length > 0 ? intersects[0].object : null;

      if (hitMesh !== (hoveredBall && hoveredBall.mesh)) {
        if (hoveredBall) {
          hoveredBall.mesh.scale.set(1, 1, 1);
        }

        hoveredBall = balls.find((b) => b.mesh === hitMesh) || null;

        if (hoveredBall) {
          hoveredBall.mesh.scale.set(1.3, 1.3, 1.3);
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("click", handleClick);

      balls.forEach((ball) => {
        if (!ball) return;
        if (ball.mesh) {
          scene.remove(ball.mesh);
        }
        if (ball.geometry) ball.geometry.dispose();
        if (ball.material) ball.material.dispose();
      });

      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "white",
          fontFamily: "sans-serif",
          fontSize: "20px",
          zIndex: 1,
          userSelect: "none",
        }}
      >
        Счёт: {score}
      </div>

      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
