import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function FlappyBird() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("ready"); // ready | playing | gameover

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#202020");

    const camera = new THREE.PerspectiveCamera(
      40,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const WORLD_TOP = 3;
    const WORLD_BOTTOM = -3;
    const PIPE_GAP = 2;
    const PIPE_WIDTH = 1;
    const PIPE_SPEED = -2;

    const birdGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const birdMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const bird = new THREE.Mesh(birdGeometry, birdMaterial);
    scene.add(bird);

    bird.position.set(-3, 0, 0);

    let birdVelocity = 0;
    const GRAVITY = -12;
    const JUMP_VELOCITY = 5;

    const pipes = [];

    function createPipePair(x) {
      const gapY = (Math.random() - 0.5) * 3;
      const gapSize = PIPE_GAP;

      const bottomHeight = gapY - gapSize / 2 - WORLD_BOTTOM;
      const bottomGeometry = new THREE.BoxGeometry(PIPE_WIDTH, bottomHeight, 1);
      const bottomMaterial = new THREE.MeshStandardMaterial({ color: 0x00aa44 });
      const bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);
      bottomMesh.position.set(
        x,
        WORLD_BOTTOM + bottomHeight / 2,
        0
      );

      const topHeight = WORLD_TOP - (gapY + gapSize / 2);
      const topGeometry = new THREE.BoxGeometry(PIPE_WIDTH, topHeight, 1);
      const topMaterial = new THREE.MeshStandardMaterial({ color: 0x00aa44 });
      const topMesh = new THREE.Mesh(topGeometry, topMaterial);
      topMesh.position.set(
        x,
        WORLD_TOP - topHeight / 2,
        0
      );

      scene.add(bottomMesh);
      scene.add(topMesh);

      pipes.push({
        topMesh,
        bottomMesh,
        passed: false,
      });
    }

    for (let i = 0; i < 4; i++) {
      createPipePair(4 + i * 4);
    }



    let currentState = "ready";
    setGameState("ready");

    let lastTime = null;

    const birdBox = new THREE.Box3();
    const pipeBox = new THREE.Box3();

    function startGame() {
      if (currentState === "playing") return;
      currentState = "playing";
      setGameState("playing");
      birdVelocity = JUMP_VELOCITY;
    }

    function gameOver() {
      if (currentState !== "playing") return;
      currentState = "gameover";
      setGameState("gameover");

    }

    function resetGame() {
      for (const pipe of pipes) {
        scene.remove(pipe.topMesh);
        scene.remove(pipe.bottomMesh);
        pipe.topMesh.geometry.dispose();
        pipe.topMesh.material.dispose();
        pipe.bottomMesh.geometry.dispose();
        pipe.bottomMesh.material.dispose();
      }
      pipes.length = 0;

      for (let i = 0; i < 4; i++) {
        createPipePair(4 + i * 4);
      }

      bird.position.set(-3, 0, 0);
      birdVelocity = 0;
      setScore(0);

      currentState = "ready";
      setGameState("ready");
      lastTime = null;
    }

    function handleInput() {
      if (currentState === "ready") {
        startGame();
      } else if (currentState === "playing") {
        birdVelocity = JUMP_VELOCITY;
      } else if (currentState === "gameover") {
        resetGame();
        startGame();
      }
    }


    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleInput();
      }
    };

    const handlePointerDown = (e) => {
      e.preventDefault();
      handleInput();
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("pointerdown", handlePointerDown);

    let animationFrameId;

    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);

      if (lastTime === null) {
        lastTime = time;
        renderer.render(scene, camera);
        return;
      }

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (currentState === "ready") {
        bird.position.y = Math.sin(time * 0.003) * 0.3;
      }

      if (currentState === "playing" || currentState === "gameover") {
        birdVelocity += GRAVITY * delta;
        bird.position.y += birdVelocity * delta;
      }

      if (currentState === "playing") {

        for (let i = pipes.length - 1; i >= 0; i--) {
          const pipe = pipes[i];

          pipe.topMesh.position.x += PIPE_SPEED * delta;
          pipe.bottomMesh.position.x += PIPE_SPEED * delta;

          if (!pipe.passed && pipe.topMesh.position.x < bird.position.x) {
            pipe.passed = true;
            setScore((prev) => prev + 1);
          }

          if (pipe.topMesh.position.x < -10) {
            scene.remove(pipe.topMesh);
            scene.remove(pipe.bottomMesh);
            pipe.topMesh.geometry.dispose();
            pipe.topMesh.material.dispose();
            pipe.bottomMesh.geometry.dispose();
            pipe.bottomMesh.material.dispose();
            pipes.splice(i, 1);

            let maxX = 4;
            for (const p of pipes) {
              if (p.topMesh.position.x > maxX) {
                maxX = p.topMesh.position.x;
              }
            }
            createPipePair(maxX + 4);
          }
        }

        birdBox.setFromObject(bird);

        for (const pipe of pipes) {
          pipeBox.setFromObject(pipe.topMesh);
          if (birdBox.intersectsBox(pipeBox)) {
            gameOver();
            break;
          }
          pipeBox.setFromObject(pipe.bottomMesh);
          if (birdBox.intersectsBox(pipeBox)) {
            gameOver();
            break;
          }
        }

        if (bird.position.y > WORLD_TOP || bird.position.y < WORLD_BOTTOM) {
          gameOver();
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

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
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("pointerdown", handlePointerDown);

      for (const pipe of pipes) {
        scene.remove(pipe.topMesh);
        scene.remove(pipe.bottomMesh);
        pipe.topMesh.geometry.dispose();
        pipe.topMesh.material.dispose();
        pipe.bottomMesh.geometry.dispose();
        pipe.bottomMesh.material.dispose();
      }

      birdGeometry.dispose();
      birdMaterial.dispose();
      renderer.dispose();
    };
  }, [setScore, setGameState]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "white",
          fontFamily: "sans-serif",
          fontSize: 24,
          zIndex: 1,
          userSelect: "none",
        }}
      >
        Счёт: {score}
      </div>

      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          color: "white",
          fontFamily: "sans-serif",
          fontSize: 16,
          zIndex: 1,
          textAlign: "right",
          maxWidth: 260,
          userSelect: "none",
        }}
      >
        {gameState === "ready" && (
          <>
            Кликни мышкой или нажми пробел,
            <br />
            чтобы начать
          </>
        )}
        {gameState === "gameover" && (
          <>
            Проигрыш
            <br />
            Клик или пробел — сыграть ещё раз
          </>
        )}
      </div>

      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
