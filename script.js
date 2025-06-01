import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls} from 'three/addons/controls/OrbitControls.js';

//Basic Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc0f1ee);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('globeCanvas'), alpha: true });
renderer.setSize(500, 500);
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadows = true;
renderer.shadowType = 1;
renderer.shadowMap.enabled = true;
renderer.toneMapping = 0;
renderer.toneMappingExposure = 1
renderer.useLegacyLights  = false;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setClearColor(0xffffff, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace 
document.getElementsByClassName('globe')[0].appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
camera.position.set(0, -5, 10);

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableZoom = false;

scene.add(camera);

controls.update();

// Lights
const Alight = new THREE.AmbientLight(0xffffff, 8);
Alight.position.set(2, 2, 2);
scene.add(Alight);

const Dlight1 = new THREE.DirectionalLight(0xffffff, 3);
Dlight1.position.set(0, 10, -5);
scene.add(Dlight1);

const Dlight2 = new THREE.DirectionalLight(0xffffff, 3);
Dlight2.position.set(-5, -10, -5);
scene.add(Dlight2);

// Load Globe model
const loader = new GLTFLoader();

loader.load('globe.glb', function (gltf) {
    const model = gltf.scene;
    model.scale.set(3, 3, 3);
    model.position.set(0, 0, 0);
    camera.lookAt(model.position);
    scene.add(model);

    animate();
}, undefined, function (error) {
    console.error(error);
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    
}