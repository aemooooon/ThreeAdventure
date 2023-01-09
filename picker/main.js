"use strict";

import * as THREE from "three";

function main() {
    const canvas = document.querySelector("#app");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas });

    const fov = 60;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 200;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 30;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("black");

    // put the camera on a pole (parent it to an object)
    // so we can spin the pole to move the camera around the scene
    const cameraPole = new THREE.Object3D();
    scene.add(cameraPole);
    cameraPole.add(camera);

    {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        camera.add(light);
    }

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    function rand(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + (max - min) * Math.random();
    }

    function randomColor() {
        return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
    }

    const numObjects = 10;
    for (let i = 0; i < numObjects; ++i) {
        const material = new THREE.MeshPhongMaterial({
            color: randomColor(),
        });

        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
        cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
        cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    let boxes = [];

    class PickHelper {
        constructor() {
            this.raycaster = new THREE.Raycaster();
            this.pickedObject = null;
            this.pickedObjectSavedColor = 0;
        }
        pick(normalizedPosition, scene, camera, time) {
            if (this.pickedObject) {
                boxes = [];
            }

            this.raycaster.setFromCamera(normalizedPosition, camera);
            const intersectedObjects = this.raycaster.intersectObjects(scene.children);

            if (intersectedObjects.length) {
                this.pickedObject = intersectedObjects[0].object;
                boxes.push(this.pickedObject);
            }
            const box = new THREE.BoxHelper(boxes[0], 0xffff00);
            scene.add(box);
        }
    }

    const pickPosition = { x: 0, y: 0 };
    const pickHelper = new PickHelper();
    clearPickPosition();

    function render(time) {
        time *= 0.001; // convert to seconds;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cameraPole.rotation.y = time * 0.1;

        pickHelper.pick(pickPosition, scene, camera, time);

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    function getCanvasRelativePosition(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }

    function setPickPosition(event) {
        const pos = getCanvasRelativePosition(event);
        pickPosition.x = (pos.x / canvas.clientWidth) * 2 - 1;
        pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1; // note we flip Y
    }

    function clearPickPosition() {
        // unlike the mouse which always has a position
        // if the user stops touching the screen we want
        // to stop picking. For now we just pick a value
        // unlikely to pick something
        pickPosition.x = -100000;
        pickPosition.y = -100000;
    }
    window.addEventListener("click", setPickPosition);
    // window.addEventListener("mouseout", clearPickPosition);
    // window.addEventListener("mouseleave", clearPickPosition);

    // window.addEventListener(
    //     "touchstart",
    //     (event) => {
    //         // prevent the window from scrolling
    //         event.preventDefault();
    //         setPickPosition(event.touches[0]);
    //     },
    //     { passive: false }
    // );

    // window.addEventListener("touchmove", (event) => {
    //     setPickPosition(event.touches[0]);
    // });

    // window.addEventListener("touchend", clearPickPosition);
}

main();