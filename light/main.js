import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import gsap from "gsap";
import gate from "../images/gate.jpg";
import "../style.css";
import checker from "../images/checker.png";

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const loader = new THREE.TextureLoader();

const canvas = document.querySelector("#app");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(2);

const scene = new THREE.Scene();
scene.background = new THREE.Color("black");

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 10, 20);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

const planeSize = 40;

const texture = loader.load(checker);
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);

const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
const r = Math.PI * -0.5;
console.log(r);
mesh.rotation.x = r;
scene.add(mesh);

{
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({ color: "#8AC" });
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    scene.add(mesh);
}

{
    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
    const sphereMat = new THREE.MeshPhongMaterial({ color: "#CA8" });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(mesh);
}

class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

// 环境光
// const color = 0xffffff;
// const intensity = 1;
// const light = new THREE.AmbientLight(color, intensity);
// scene.add(light);

// 半球光
// const skyColor = 0xb2e1ff;
// const groundColor = 0xb97a20;
// const intensity = 1;
// const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
// scene.add(light);

// 平行光
const color = 0xffffff;
const intensity = 1;
const light = new THREE.PointLight(color, intensity);
light.position.set(0, 10, 0);
// light.target.position.set(-5, 0, 0);
scene.add(light);
// scene.add(light.target);

const helper = new THREE.PointLightHelper(light);
scene.add(helper);

function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, "x", -10, 10).onChange(onChangeFn);
    folder.add(vector3, "y", 0, 10).onChange(onChangeFn);
    folder.add(vector3, "z", -10, 10).onChange(onChangeFn);
    folder.open();
}

function updateLight() {
    // light.target.updateMatrixWorld();
    helper.update();
}
updateLight();

const gui = new dat.GUI();
gui.addColor(new ColorGUIHelper(light, "color"), "value").name("颜色");
// gui.addColor(new ColorGUIHelper(light, "color"), "value").name("skyColor");
// gui.addColor(new ColorGUIHelper(light, "groundColor"), "value").name("groundColor");
gui.add(light, "intensity", 0, 2, 0.01).name("强度");

makeXYZGUI(gui, light.position, "position", updateLight);
// makeXYZGUI(gui, light.target.position, "target", updateLight);

renderer.render(scene, camera);

window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

const loop = () => {
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(loop);
};

loop();
