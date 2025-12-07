document.addEventListener('DOMContentLoaded', () => {


    console.log("Initializing Loader Animation");

    // Ensure GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.error("GSAP not loaded!");
        document.body.classList.remove("no-scroll");
        const container = document.getElementById("loader-container");
        if (container) container.style.display = "none";
    } else {
        const loaderTimeline = gsap.timeline({
            onComplete: () => {
                console.log("Loader Animation Complete");
                document.body.classList.remove("no-scroll");
                const container = document.getElementById("loader-container");
                if (container) container.style.display = "none";
            }
        });

        // Initial state
        gsap.set("#loader-content", { opacity: 1 });

        // Fill animation
        loaderTimeline.to("#fill-rect", {
            attr: { y: 45 }, // Move up to y=45 (top of circle)
            duration: 3,
            ease: "power1.inOut"
        })
            .to("#reveal-circle", {
                attr: { r: 150 }, // Expand mask to reveal full screen
                duration: 2.5,
                ease: "power3.inOut"
            }, "-=0.5") // Overlap slightly with the end of the fill
            .to("#loader-content", {
                opacity: 0, // Fade out the wave and stroke
                duration: 0.5,
                ease: "power2.inOut"
            }, "<")
            .to("#loader-circle-stroke", {
                opacity: 0,
                duration: 0.5,
                ease: "power2.inOut"
            }, "<")
            .to("#loader-container", {
                opacity: 0,
                duration: 0.5
            });
    }


    (function initThreeJSArcade() {
        if (typeof THREE === 'undefined') {
            console.warn('Three.js library not loaded');
            return;
        }

        const canvas = document.getElementById('bg-canvas');
        if (!canvas) {
            console.warn('Canvas element not found');
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;

        // Camera positioned to view depth
        camera.position.z = 25;
        camera.position.y = 6;
        camera.fov = 70;
        camera.updateProjectionMatrix();

        // Create Game Boy
        function createGameBoy() {
            const group = new THREE.Group();

            const gbBody = new THREE.Mesh(
                new THREE.BoxGeometry(5, 7.5, 1.2),
                new THREE.MeshPhongMaterial({ color: 0x00ff88, shininess: 35 })
            );
            group.add(gbBody);

            const screenBezel = new THREE.Mesh(
                new THREE.BoxGeometry(3.8, 3.4, 0.2),
                new THREE.MeshPhongMaterial({ color: 0x1a1a1a, shininess: 20 })
            );
            screenBezel.position.set(0, 1.8, 0.61);
            group.add(screenBezel);

            const gbScreen = new THREE.Mesh(
                new THREE.BoxGeometry(3.4, 3, 0.15),
                new THREE.MeshPhongMaterial({ color: 0x0080ff, emissive: 0x0040aa, shininess: 100 })
            );
            gbScreen.position.set(0, 1.8, 0.7);
            group.add(gbScreen);

            const dpadVertical = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 1.5, 0.4),
                new THREE.MeshPhongMaterial({ color: 0x0080ff, shininess: 60 })
            );
            dpadVertical.position.set(-1.5, -0.75, 0.7);
            group.add(dpadVertical);

            const dpadHorizontal = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.4, 0.4),
                new THREE.MeshPhongMaterial({ color: 0x0080ff, shininess: 60 })
            );
            dpadHorizontal.position.set(-1.5, -0.75, 0.7);
            group.add(dpadHorizontal);

            const buttonRadius = 0.35;
            const buttonPositions = [
                { x: 1.2, y: -0.3 },
                { x: 1.8, y: -0.75 },
                { x: 1.2, y: -1.3 },
                { x: 0.6, y: -0.75 }
            ];
            const buttonColors = [0xff0000, 0xffff00, 0x0080ff, 0x00ff00];

            buttonPositions.forEach((pos, idx) => {
                const button = new THREE.Mesh(
                    new THREE.CylinderGeometry(buttonRadius, buttonRadius, 0.25, 32),
                    new THREE.MeshPhongMaterial({ color: buttonColors[idx], shininess: 70 })
                );
                button.rotation.x = Math.PI / 2;
                button.position.set(pos.x, pos.y, 0.7);
                group.add(button);
            });

            const startButton = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.3, 0.2),
                new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 50 })
            );
            startButton.position.set(0.6, -2.5, 0.7);
            group.add(startButton);

            const selectButton = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.3, 0.2),
                new THREE.MeshPhongMaterial({ color: 0xffff00, shininess: 50 })
            );
            selectButton.position.set(-0.6, -2.5, 0.7);
            group.add(selectButton);

            const speakerGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
            const speakerMaterial = new THREE.MeshPhongMaterial({ color: 0x005544, shininess: 20 });
            const speaker = new THREE.Mesh(speakerGeometry, speakerMaterial);
            speaker.position.set(0, -3, 0.7);
            group.add(speaker);

            return group;
        }

        // Create Arcade Cabinet
        function createArcadeCabinet() {
            const group = new THREE.Group();

            const cabBody = new THREE.Mesh(
                new THREE.BoxGeometry(4, 7, 2.5),
                new THREE.MeshPhongMaterial({ color: 0xff4444, shininess: 30 })
            );
            group.add(cabBody);

            const cabScreen = new THREE.Mesh(
                new THREE.BoxGeometry(3.2, 3.2, 0.3),
                new THREE.MeshPhongMaterial({ color: 0x1a1a1a, emissive: 0xff00ff, shininess: 120 })
            );
            cabScreen.position.set(0, 1.5, 1.26);
            group.add(cabScreen);

            const cabPanel = new THREE.Mesh(
                new THREE.BoxGeometry(3.2, 1.8, 0.4),
                new THREE.MeshPhongMaterial({ color: 0x0080ff, shininess: 35 })
            );
            cabPanel.position.set(0, -1.8, 1.26);
            group.add(cabPanel);

            const cabJoystick = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.4, 1, 32),
                new THREE.MeshPhongMaterial({ color: 0xffff00, shininess: 70 })
            );
            cabJoystick.position.set(-1, -1.5, 1.5);
            group.add(cabJoystick);

            const cabButtonPositions = [
                { x: 0.3, y: -1.2 },
                { x: 1, y: -1.2 },
                { x: 1, y: -1.8 },
                { x: 0.3, y: -1.8 }
            ];
            const cabButtonColors = [0xff0000, 0xffff00, 0x0080ff, 0x00ff00];

            cabButtonPositions.forEach((pos, idx) => {
                const button = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.35, 0.35, 0.25, 32),
                    new THREE.MeshPhongMaterial({ color: cabButtonColors[idx], shininess: 70 })
                );
                button.rotation.x = Math.PI / 2;
                button.position.set(pos.x, pos.y, 1.5);
                group.add(button);
            });

            return group;
        }

        // Create Space Invader
        function createSpaceInvader() {
            const group = new THREE.Group();
            const boxSize = 0.8;

            const invHead = new THREE.Mesh(
                new THREE.BoxGeometry(boxSize * 6, boxSize * 4, boxSize),
                new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 45 })
            );
            invHead.position.set(0, 2.5, 0);
            group.add(invHead);

            const invLeftEye = new THREE.Mesh(
                new THREE.BoxGeometry(boxSize * 1.5, boxSize * 1.5, boxSize),
                new THREE.MeshPhongMaterial({ color: 0x0080ff, shininess: 55 })
            );
            invLeftEye.position.set(-boxSize * 1.5, 3.2, boxSize * 0.5);
            group.add(invLeftEye);

            const invRightEye = new THREE.Mesh(
                new THREE.BoxGeometry(boxSize * 1.5, boxSize * 1.5, boxSize),
                new THREE.MeshPhongMaterial({ color: 0x0080ff, shininess: 55 })
            );
            invRightEye.position.set(boxSize * 1.5, 3.2, boxSize * 0.5);
            group.add(invRightEye);

            const invBody = new THREE.Mesh(
                new THREE.BoxGeometry(boxSize * 5, boxSize * 3, boxSize),
                new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 45 })
            );
            invBody.position.set(0, 0.5, 0);
            group.add(invBody);

            const invLeftLeg = new THREE.Mesh(
                new THREE.BoxGeometry(boxSize * 1.5, boxSize * 2, boxSize),
                new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 45 })
            );
            invLeftLeg.position.set(-boxSize * 2.5, -1.5, 0);
            group.add(invLeftLeg);

            const invRightLeg = new THREE.Mesh(
                new THREE.BoxGeometry(boxSize * 1.5, boxSize * 2, boxSize),
                new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 45 })
            );
            invRightLeg.position.set(boxSize * 2.5, -1.5, 0);
            group.add(invRightLeg);

            return group;
        }

        // Create Game Controller
        function createGameController() {
            const group = new THREE.Group();

            const bodyGeometry = new THREE.BoxGeometry(6, 3.5, 1);
            const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a, shininess: 40 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            group.add(body);

            const leftGrip = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 3, 1.2),
                new THREE.MeshPhongMaterial({ color: 0x0a0a0a, shininess: 35 })
            );
            leftGrip.position.set(-2.8, -0.5, 0);
            group.add(leftGrip);

            const rightGrip = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 3, 1.2),
                new THREE.MeshPhongMaterial({ color: 0x0a0a0a, shininess: 35 })
            );
            rightGrip.position.set(2.8, -0.5, 0);
            group.add(rightGrip);

            const leftStickBase = new THREE.Mesh(
                new THREE.CylinderGeometry(0.6, 0.6, 0.2, 32),
                new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 30 })
            );
            leftStickBase.rotation.x = Math.PI / 2;
            leftStickBase.position.set(-1.5, -0.8, 0);
            group.add(leftStickBase);

            const leftStick = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.4, 1, 32),
                new THREE.MeshPhongMaterial({ color: 0x444444, shininess: 50 })
            );
            leftStick.position.set(-1.5, -0.8, 0.3);
            group.add(leftStick);

            const rightStickBase = new THREE.Mesh(
                new THREE.CylinderGeometry(0.6, 0.6, 0.2, 32),
                new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 30 })
            );
            rightStickBase.rotation.x = Math.PI / 2;
            rightStickBase.position.set(1.5, -0.8, 0);
            group.add(rightStickBase);

            const rightStick = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.4, 1, 32),
                new THREE.MeshPhongMaterial({ color: 0x444444, shininess: 50 })
            );
            rightStick.position.set(1.5, -0.8, 0.3);
            group.add(rightStick);

            const dpadColors = [0x0080ff, 0x0080ff, 0x0080ff, 0x0080ff];

            const dpadUp = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 0.15, 32),
                new THREE.MeshPhongMaterial({ color: dpadColors[0], shininess: 60 })
            );
            dpadUp.rotation.x = Math.PI / 2;
            dpadUp.position.set(-2, 0.8, 0.6);
            group.add(dpadUp);

            const dpadDown = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 0.15, 32),
                new THREE.MeshPhongMaterial({ color: dpadColors[1], shininess: 60 })
            );
            dpadDown.rotation.x = Math.PI / 2;
            dpadDown.position.set(-2, 0.2, 0.6);
            group.add(dpadDown);

            const dpadLeft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 0.15, 32),
                new THREE.MeshPhongMaterial({ color: dpadColors[2], shininess: 60 })
            );
            dpadLeft.rotation.x = Math.PI / 2;
            dpadLeft.position.set(-2.4, 0.5, 0.6);
            group.add(dpadLeft);

            const dpadRight = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 0.15, 32),
                new THREE.MeshPhongMaterial({ color: dpadColors[3], shininess: 60 })
            );
            dpadRight.rotation.x = Math.PI / 2;
            dpadRight.position.set(-1.6, 0.5, 0.6);
            group.add(dpadRight);

            const buttonPositionsController = [
                { x: 2, y: 0.8, color: 0xff0000 },
                { x: 2.4, y: 0.5, color: 0xffff00 },
                { x: 2, y: 0.2, color: 0x0080ff },
                { x: 1.6, y: 0.5, color: 0x00ff00 }
            ];

            buttonPositionsController.forEach((pos) => {
                const button = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.25, 0.25, 0.15, 32),
                    new THREE.MeshPhongMaterial({ color: pos.color, shininess: 70 })
                );
                button.rotation.x = Math.PI / 2;
                button.position.set(pos.x, pos.y, 0.6);
                group.add(button);
            });

            const shoulderButtonGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.2);
            const shoulderButtonMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 50 });

            const leftShoulder = new THREE.Mesh(shoulderButtonGeometry, shoulderButtonMaterial);
            leftShoulder.position.set(-1.5, 1.8, 0);
            group.add(leftShoulder);

            const rightShoulder = new THREE.Mesh(shoulderButtonGeometry, shoulderButtonMaterial);
            rightShoulder.position.set(1.5, 1.8, 0);
            group.add(rightShoulder);

            const centerButton = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 0.15, 32),
                new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 70 })
            );
            centerButton.rotation.x = Math.PI / 2;
            centerButton.position.set(0, -1.5, 0.6);
            group.add(centerButton);

            return group;
        }

        // Mobile responsive positioning
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth < 1024;

        function getResponsivePositions() {
            if (isMobile) {
                return {
                    gameBoy: { x: -8, y: 4, z: 2, scale: 0.8 },
                    cabinet: { x: -2.5, y: 5.5, z: -16, scale: 0.7 },
                    invader: { x: 2.5, y: 5.5, z: -16, scale: 0.7 },
                    controller: { x: 8, y: 4, z: 2, scale: 0.8 }
                };
            } else if (isTablet) {
                return {
                    gameBoy: { x: -16, y: 4, z: 2, scale: 1.1 },
                    cabinet: { x: -6, y: 5.5, z: -16, scale: 0.9 },
                    invader: { x: 6, y: 5.5, z: -16, scale: 0.9 },
                    controller: { x: 16, y: 4, z: 2, scale: 1.1 }
                };
            } else {
                return {
                    gameBoy: { x: -20, y: -4, z: 2, scale: 1.4 },
                    cabinet: { x: -15, y: 9, z: -16, scale: 1.1 },
                    invader: { x: 15, y: 9, z: -16, scale: 1.1 },
                    controller: { x: 20, y: -4, z: 2, scale: 1.4 }
                };
            }
        }

        const positions = getResponsivePositions();

        // Create objects with DEPTH OF FIELD - facing play button
        const gameBoyGroup = createGameBoy();
        gameBoyGroup.userData.initialRotation = { x: 0, y: 0.35, z: 0 };
        gameBoyGroup.userData.initialPosition = positions.gameBoy;
        gameBoyGroup.position.copy(gameBoyGroup.userData.initialPosition);
        gameBoyGroup.rotation.set(gameBoyGroup.userData.initialRotation.x, gameBoyGroup.userData.initialRotation.y, gameBoyGroup.userData.initialRotation.z);
        gameBoyGroup.scale.set(positions.gameBoy.scale, positions.gameBoy.scale, positions.gameBoy.scale);
        scene.add(gameBoyGroup);

        const cabinetGroup = createArcadeCabinet();
        cabinetGroup.userData.initialRotation = { x: 0, y: 0.12, z: 0 };
        cabinetGroup.userData.initialPosition = positions.cabinet;
        cabinetGroup.position.copy(cabinetGroup.userData.initialPosition);
        cabinetGroup.rotation.set(cabinetGroup.userData.initialRotation.x, cabinetGroup.userData.initialRotation.y, cabinetGroup.userData.initialRotation.z);
        cabinetGroup.scale.set(positions.cabinet.scale, positions.cabinet.scale, positions.cabinet.scale);
        scene.add(cabinetGroup);

        const invaderGroup = createSpaceInvader();
        invaderGroup.userData.initialRotation = { x: 0, y: -0.12, z: 0 };
        invaderGroup.userData.initialPosition = positions.invader;
        invaderGroup.position.copy(invaderGroup.userData.initialPosition);
        invaderGroup.rotation.set(invaderGroup.userData.initialRotation.x, invaderGroup.userData.initialRotation.y, invaderGroup.userData.initialRotation.z);
        invaderGroup.scale.set(positions.invader.scale, positions.invader.scale, positions.invader.scale);
        scene.add(invaderGroup);

        const controllerGroup = createGameController();
        controllerGroup.userData.initialRotation = { x: 0, y: -0.35, z: 0 };
        controllerGroup.userData.initialPosition = positions.controller;
        controllerGroup.position.copy(controllerGroup.userData.initialPosition);
        controllerGroup.rotation.set(controllerGroup.userData.initialRotation.x, controllerGroup.userData.initialRotation.y, controllerGroup.userData.initialRotation.z);
        controllerGroup.scale.set(positions.controller.scale, positions.controller.scale, positions.controller.scale);
        scene.add(controllerGroup);

        const arcadeObjects = [gameBoyGroup, cabinetGroup, invaderGroup, controllerGroup];

        // Create controller symbols
        function createTriangle() {
            const shape = new THREE.Shape();
            shape.moveTo(0, 1);
            shape.lineTo(1, -1);
            shape.lineTo(-1, -1);
            shape.closePath();
            const extrudeSettings = {
                steps: 2,
                depth: 0.2,
                bevelEnabled: false,
            };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 60, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            return mesh;
        }

        function createSquare() {
            const geometry = new THREE.BoxGeometry(1.5, 1.5, 0.2);
            const edges = new THREE.EdgesGeometry(geometry);
            const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
            const mesh = new THREE.LineSegments(edges, material);
            return mesh;
        }

        function createCircle() {
            const shape = new THREE.Shape();
            shape.absarc(0, 0, 1, 0, Math.PI * 2, false);
            const hole = new THREE.Path();
            hole.absarc(0, 0, 0.8, 0, Math.PI * 2, true);
            shape.holes.push(hole);
            const extrudeSettings = {
                steps: 2,
                depth: 0.2,
                bevelEnabled: false,
            };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const material = new THREE.MeshPhongMaterial({ color: 0x0000ff, shininess: 60, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            return mesh;
        }

        function createCross() {
            const group = new THREE.Group();
            const geometry1 = new THREE.BoxGeometry(0.5, 2, 0.5);
            const geometry2 = new THREE.BoxGeometry(2, 0.5, 0.5);
            const material = new THREE.MeshPhongMaterial({ color: 0xffff00, shininess: 60 });
            const mesh1 = new THREE.Mesh(geometry1, material);
            const mesh2 = new THREE.Mesh(geometry2, material);
            group.add(mesh1);
            group.add(mesh2);
            return group;
        }

        const symbols = [];
        const symbolTypes = [createTriangle, createSquare, createCircle, createCross];
        for (let i = 0; i < 80; i++) {
            const symbol = symbolTypes[i % 4]();
            symbol.position.set(
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80 - 40
            );
            symbol.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            const scale = Math.random() * 1.5 + 0.5;
            symbol.scale.set(scale, scale, scale);
            symbol.userData.initialPosition = symbol.position.clone();
            symbol.userData.initialRotation = symbol.rotation.clone();
            scene.add(symbol);
            symbols.push(symbol);
        }

        // Lighting with enhanced depth perception
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
        directionalLight.position.set(12, 14, 10);
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0x0080ff, 0.7);
        fillLight.position.set(-12, 7, 6);
        scene.add(fillLight);

        const ambientLight = new THREE.AmbientLight(0x505050, 0.6);
        scene.add(ambientLight);

        // Add subtle scene fog for depth effect
        scene.fog = new THREE.Fog(0x1a1a2e, 80, 150);

        let scrollProgress = 0;
        const heroSection = document.querySelector('.hero');
        let time = 0;

        function animate() {
            requestAnimationFrame(animate);
            time += 0.016; // ~60fps

            if (heroSection) {
                const heroHeight = heroSection.offsetHeight;
                const scrollY = window.scrollY;
                scrollProgress = Math.min(scrollY / heroHeight, 1);
            }

            // Outer models (Game Boy, Controller) - Move UP, FORWARD, ROTATE on scroll
            [gameBoyGroup, controllerGroup].forEach((obj) => {
                // Floating animation (subtle up/down movement)
                const floatOffset = Math.sin(time * 1.5) * 0.5;
                const baseY = obj.userData.initialPosition.y + floatOffset;

                // Scroll-based animations
                obj.position.y = baseY + scrollProgress * 5;
                obj.position.z = obj.userData.initialPosition.z + scrollProgress * 12;

                obj.rotation.y = obj.userData.initialRotation.y + scrollProgress * Math.PI * 2;
                obj.rotation.x = obj.userData.initialRotation.x + scrollProgress * 0.6;

                const currentScale = 1.4 * (1 - scrollProgress * 0.5);
                obj.scale.set(currentScale, currentScale, currentScale);

                obj.traverse((child) => {
                    if (child.isMesh) {
                        child.material.transparent = true;
                        child.material.opacity = Math.max(0, 1 - scrollProgress * 0.9);
                    }
                });
            });

            // Center models (Cabinet, Invader) - Original scroll animation with float
            [cabinetGroup, invaderGroup].forEach((obj) => {
                // Floating animation (subtle up/down movement)
                const floatOffset = Math.sin(time * 1.5 + Math.PI) * 0.5;
                const baseY = obj.userData.initialPosition.y + floatOffset;

                // Original scroll animations
                obj.rotation.y = obj.userData.initialRotation.y + scrollProgress * Math.PI * 1.5;
                obj.rotation.x = obj.userData.initialRotation.x + scrollProgress * 0.6;

                obj.position.y = baseY - scrollProgress * 4;
                obj.position.z = obj.userData.initialPosition.z - scrollProgress * 8;

                const currentScale = 1.1 * (1 - scrollProgress * 0.5);
                obj.scale.set(currentScale, currentScale, currentScale);

                obj.traverse((child) => {
                    if (child.isMesh) {
                        child.material.transparent = true;
                        child.material.opacity = Math.max(0, 1 - scrollProgress * 0.9);
                    }
                });
            });

            // Animate symbols
            symbols.forEach((obj) => {
                const floatOffset = Math.sin(time * 1.5 + obj.userData.initialPosition.x) * 0.5;
                const baseY = obj.userData.initialPosition.y + floatOffset;

                // Depth effect
                const depth = obj.position.z;
                const speed = (depth > 0) ? (depth / 40) * 20 : (1 - (depth / -40)) * 20; // Increased speed multiplier
                obj.position.y = baseY - scrollProgress * speed;

                obj.rotation.y = obj.userData.initialRotation.y + scrollProgress * 4;
                obj.rotation.x = obj.userData.initialRotation.x + scrollProgress * 4;
                obj.rotation.z = obj.userData.initialRotation.z + scrollProgress * 4;
            });

            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });

        animate();
    })();

    // --- Sound Engine using Tone.js ---
    const synth = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 0.2,
        },
    }).toDestination();

    Tone.Destincation.volume.value = -10;
    function playSound(note, duration) {
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
        synth.triggerAttackRelease(note, duration);
    }

    document.querySelectorAll('a, button').forEach(element => {
        element.addEventListener('click', () => playSound('C4', '8n'));
    });

    document.querySelectorAll('.game-card, .nav-links a').forEach(card => {
        card.addEventListener('mouseenter', () => {
            playSound('C5', '16n');
        });
    });

    // --- Terminal Typing Effect ---
    const terminalOutput = document.getElementById('terminal-output');
    let currentLine = 0;
    let currentChar = 0;
    let terminalHasTyped = false;

    function typeLine() {
        if (currentLine < lines.length) {
            const line = lines[currentLine];
            if (currentChar < line.length) {
                if (terminalOutput.innerHTML.endsWith('█')) {
                    terminalOutput.innerHTML = terminalOutput.innerHTML.slice(0, -28);
                }
                terminalOutput.innerHTML += line[currentChar];
                terminalOutput.innerHTML += '█';
                currentChar++;
                setTimeout(typeLine, 20);
            } else {
                currentChar = 0;
                currentLine++;
                if (terminalOutput.innerHTML.endsWith('█')) {
                    terminalOutput.innerHTML = terminalOutput.innerHTML.slice(0, -28);
                }
                terminalOutput.innerHTML += '\n\n';
                setTimeout(typeLine, 300);
            }
        }
    }

    const terminalObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !terminalHasTyped) {
            typeLine();
            terminalHasTyped = true;
            terminalObserver.disconnect();
        }
    }, { threshold: 0.1 });

    if (terminalOutput) {
        terminalObserver.observe(terminalOutput);
    }

    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (synth.volume.value === -Infinity) {
                synth.volume.value = 0;
                muteBtn.innerHTML = '<i class="fa fa-volume-up"></i>';
            } else {
                synth.volume.value = -Infinity;
                muteBtn.innerHTML = '<i class="fa fa-volume-mute"></i>';
            }
        });
    }

    // --- Mobile Menu Functions ---
    function faBars() {
        const submenu = document.querySelector('.nav-submenu');
        const barsIcon = document.querySelector('.nav-menu i');
        const closeIcon = document.querySelector('.nav-menu span');

        if (submenu && barsIcon && closeIcon) {
            submenu.style.left = '0px';
            submenu.style.opacity = '1';
            barsIcon.style.display = 'none';
            closeIcon.style.display = 'block';
            document.body.classList.add('no-scroll');
        }
    }

    function materialSymbolsOutlines() {
        const submenu = document.querySelector('.nav-submenu');
        const barsIcon = document.querySelector('.nav-menu i');
        const closeIcon = document.querySelector('.nav-menu span');

        if (submenu && barsIcon && closeIcon) {
            submenu.style.left = '2000px';
            submenu.style.opacity = '0.5';
            barsIcon.style.display = 'block';
            closeIcon.style.display = 'none';
            document.body.classList.remove('no-scroll');
        }
    }

    // Close submenu when clicking on a link
    document.querySelectorAll('.nav-submenu a').forEach(link => {
        link.addEventListener('click', () => {
            materialSymbolsOutlines();
        });
    });

    // Make functions globally accessible
    window.faBars = faBars;
    window.materialSymbolsOutlines = materialSymbolsOutlines;

    // --- Konami Code Easter Egg ---
    const konamiModal = document.getElementById('konami-modal');
    const closeKonamiBtn = document.getElementById('close-konami');
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);
        if (konamiCode.join('').toLowerCase() === konamiSequence.join('')) {
            playSound('C5', '8n');
            setTimeout(() => playSound('E5', '8n'), 150);
            setTimeout(() => playSound('G5', '4n'), 300);
            konamiModal.style.display = 'flex';
            konamiCode = [];
        }
    });

    if (closeKonamiBtn) {
        closeKonamiBtn.addEventListener('click', () => {
            konamiModal.style.display = 'none';
        });
    }

    // --- Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('.game-section');
    const navLinks = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
        let current = 'home';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref && linkHref.includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- Countdown Timer ---
    const countDownDate = new Date("Jan 5, 2026 00:00:00").getTime();
    const countdownFunction = setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");

        if (daysEl) { daysEl.innerText = String(days).padStart(2, '0'); }
        if (hoursEl) { hoursEl.innerText = String(hours).padStart(2, '0'); }
        if (minutesEl) { minutesEl.innerText = String(minutes).padStart(2, '0'); }
        if (secondsEl) { secondsEl.innerText = String(seconds).padStart(2, '0'); }

        if (distance < 0) {
            clearInterval(countdownFunction);
            const countdownEl = document.getElementById("countdown");
            if (countdownEl) { countdownEl.innerHTML = "EVENT STARTED!"; }
        }
    }, 1000);

    // --- Event Modal ---
    const eventModal = document.getElementById('event-modal');
    if (eventModal) {
        const eventTitle = document.getElementById('event-title');
        const eventDescription = document.getElementById('event-description');
        const eventDate = document.getElementById('event-date');
        const eventRules = document.getElementById('event-rules');
        const eventRulesDesc = document.getElementById('event-rules-desc');
        const eventMatch = document.getElementById('event-match');
        const eventMatchDesc = document.getElementById('event-match-desc');
        const eventPrize = document.getElementById('event-prize');
        const eventPrizeDesc = document.getElementById('event-prize-desc');
        const eventRegFees = document.getElementById('event-reg-fees');

        document.querySelectorAll('.game-card').forEach(card => {
            const title = card.querySelector('h3').innerText;
            const description = card.querySelector('#main-p').innerText;
            const date = card.querySelector('#main-date').innerText;
            const mainRules1 = card.querySelector('#main-rules1').innerText;
            const mainRulesData1 = card.querySelector('#main-rules-data1').innerHTML;
            const mainRules2 = card.querySelector('#main-rules2').innerText;
            const mainRulesData2 = card.querySelector('#main-rules-data2').innerHTML;
            const mainRules3 = card.querySelector('#main-rules3').innerText;
            const mainRulesData3 = card.querySelector('#main-rules-data3').innerHTML;
            const mainRules4 = card.querySelector('#main-rules-data4').innerHTML;

            const previewButton = card.querySelector('.pixel-button-preview');
            if (previewButton) {
                previewButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    eventTitle.innerText = title + " - " + description;
                    eventDate.innerText = date;
                    eventRules.innerText = mainRules1;
                    eventRulesDesc.innerHTML = mainRulesData1;
                    eventMatch.innerText = mainRules2;
                    eventMatchDesc.innerHTML = mainRulesData2;
                    eventPrize.innerText = mainRules3;
                    eventPrizeDesc.innerHTML = mainRulesData3;
                    eventRegFees.innerHTML = mainRules4;
                    eventModal.style.display = 'flex';
                    document.body.style.overflow = "hidden";
                });
            }


            const enterButton = card.querySelector('.pixel-button');
            if (enterButton) {
                enterButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = '/reg/reg.html';
                });
            }
        });

        const closeEventBtn = document.getElementById('close-event');
        if (closeEventBtn) {
            closeEventBtn.addEventListener('click', () => {
                document.body.style.overflow = "auto";
                eventModal.style.display = 'none';
            });
        }

        // Function for inline onclick handler
        window.closeEventBtnHere = function () {
            document.body.style.overflow = "auto";
            if (eventModal) {
                eventModal.style.display = 'none';
            }
        };


        window.addEventListener('click', (e) => {
            if (e.target === eventModal) {
                eventModal.style.display = 'none';
            }
        });
    }


}); // End DOMContentLoaded
