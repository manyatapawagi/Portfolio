import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

//Basic Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

//Renderer setup 
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bgCanvas'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadows = true;
renderer.shadowType = 1;
renderer.shadowMap.enabled = true;
renderer.toneMapping = 0;
renderer.toneMappingExposure = 1
renderer.useLegacyLights = false;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setClearColor(0xffffff, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace
document.getElementsByClassName('bg')[0].appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
camera.position.set(0, -5, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;

scene.add(camera);

controls.update();

const rgbeLoader = new RGBELoader();
rgbeLoader.load('environment.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    renderer.setClearColor(0x000000, 0);
});

// Lights
const Dlight1 = new THREE.DirectionalLight(0xffffff, 3);
Dlight1.position.set(0, 10, -5);
scene.add(Dlight1);

const Dlight2 = new THREE.DirectionalLight(0xffffff, 3);
Dlight2.position.set(-5, -10, -5);
scene.add(Dlight2);

//Mesh

//Resize canvas on window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    animate();
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}
animate();