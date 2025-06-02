import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

//Basic Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('globeCanvas'), alpha: true });
renderer.setSize(350, 350);
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
document.getElementsByClassName('globe')[0].appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
camera.position.set(0, -5, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;

scene.add(camera);

controls.update();

// environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load('environment.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    // scene.background = null;
    renderer.setClearColor(0x000000, 0);
});

// Lights
const Dlight1 = new THREE.DirectionalLight(0xffffff, 3);
Dlight1.position.set(0, 10, -5);
scene.add(Dlight1);

const Dlight2 = new THREE.DirectionalLight(0xffffff, 3);
Dlight2.position.set(-5, -10, -5);
scene.add(Dlight2);

//Post-Processing 
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(350, 350), 0.5, 0.3, 0.5));

const loader = new GLTFLoader();

// Load Globe model and add interest points
loader.load('globe.glb', function (gltf) {

    const globe = new THREE.Group();

    const model = gltf.scene;
    model.scale.set(3, 3, 3);
    model.position.set(0, 0, 0);
    camera.lookAt(model.position);
    globe.add(model);

    const sphere = new THREE.SphereGeometry(0.2);
    const off_color = new THREE.MeshStandardMaterial({ color: 0xbde643 });
    const on_color = new THREE.MeshStandardMaterial({ color: 0x4ceb34 });

    const points = new THREE.Group();

    const point1 = new THREE.Mesh(sphere, off_color);
    point1.position.set(-1, -1, 2.8);
    const point2 = point1.clone();
    const point3 = point1.clone();
    const point4 = point1.clone();

    points.add(point1, point2, point3, point4);

    point2.position.set(2.4, -2, 0);
    point3.position.set(2.5, 2, 0);
    point4.position.set(0, 1.5, -2.8);

    globe.add(points);

    scene.add(globe);

    var interest_points = [point1, point2, point3, point4];
    var interests = ["<h2> Web Development </h2> <p> I have been making websites since I was 11 years old. I've always felt that making websites is a way a child like me can get their ideas out into the world.</p>",
        "<h2>Music</h2><p>My habit of listening to music whenever possible is enough to imply that it has, kind of, become my daily routine. Some of my favourite artists are Twenty One pilots, Halsey, Lana Del Rey and Taylor Swift, among many others.",
        "<h2>3D Animation</h2><p>Though it's one of my more recently discovered interests, its the most important one. I've always been interested in art, of different forms, from quilling to clay and painting to origami, creating things that mimic the real world always caught my eye.</p>",
        "<h2>Learning</h2><p>Yep! Besides being a compulsion (PCM students can understand), learning new stuff is something I always look up to, in hopes of upgrading myself and my projects.</p>"];

    const assets = new THREE.Group();
    var interest_models = [];
    let Laptop, Headphone, Geometry, Books;

    function loadAsset(url) {
        return new Promise((resolve, reject) => {
            loader.load(url, gltf => {
                const model = gltf.scene;
                model.visible = false;
                assets.add(model);
                resolve(model);
            }, undefined, reject);
        });
    }

    Promise.all([
        loadAsset('laptop.glb'),       // for Web Dev
        loadAsset('headphone.glb'),    // for Music
        loadAsset('geometry.glb'),     // for 3D
        loadAsset('books.glb')         // for Learning
    ]).then(([laptop, headphone, geometry, books]) => {
        Laptop = laptop;
        Headphone = headphone;
        Geometry = geometry;
        Books = books;

        Laptop.rotation.x = Math.PI / 3;
        Laptop.rotation.y = Math.PI / 2;
        Laptop.position.set(0, 6, 0);
        Laptop.scale.set(2, 2, 2);
        Laptop.truY = -3;

        Headphone.scale.set(4.5, 4.5, 4.55);
        Headphone.position.set(0, 7, 0);
        Headphone.truY = -3;
        Headphone.rotation.x = Math.PI / 4;

        Geometry.rotation.y = Math.PI / 3;
        Geometry.rotation.x = -Math.PI / 1.2;
        Geometry.rotation.z = -Math.PI;
        Geometry.position.set(-0.75, 7, 0);
        Geometry.truY = -1.5;
        Geometry.scale.set(1.75, 1.75, 1.75);

        Books.scale.set(10, 10, 10);
        Books.position.set(0.25, 6, 0);
        Books.truY = -3.3;

        interest_models.push(Laptop, Headphone, Geometry, Books);
        assets.add(Laptop, Headphone, Geometry, Books);
    });

    scene.add(assets);

    const originalRotation = new THREE.Euler(0, 0, 0);

    const raycaster = new THREE.Raycaster();

    document.addEventListener('mousedown', onMouseDown);

    function onMouseDown(e) {
        const rect = renderer.domElement.getBoundingClientRect();

        const coords = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        raycaster.setFromCamera(coords, camera);

        const intersections = raycaster.intersectObjects(points.children, true);

        if (intersections.length > 0) {
            const clickedPoint = intersections[0].object;
            const index = interest_points.indexOf(clickedPoint);

            document.getElementById("interest").innerHTML = (interests[index]);
            document.getElementById("interest").style.animation = 'none';
            document.getElementById("interest").offsetHeight;
            document.getElementById("interest").style.animation = 'popup 0.25s';

            for (let point of interest_points) {
                point.material = off_color;
            }
            clickedPoint.material = on_color;

            // gsap.to(globe.rotation, {
                // x: originalRotation.x,
                // y: originalRotation.y,
                // z: originalRotation.z,
                // duration: 0.1,
                // onComplete: () => {
                    gsap.to(globe.position, {
                        x: 2.8,
                        y: -2.8,
                        z: -1,
                        duration: 0.5
                    });
                    gsap.to(globe.scale, {
                        x: 0.5,
                        y: 0.5,
                        z: 0.5,
                        duration: 0.5,
                        onComplete: () => {
                            interest_models.forEach(e => {
                                e.visible = false;
                            });
                            interest_models[index].visible = true;

                            // gsap.to(interest_models[index].rotation, {
                            //     x: interest_models[index].orientation.x,
                            //     y: interest_models[index].orientation.y,
                            //     z: interest_models[index].orientation.z,
                            //     duration: 0.1,
                            //     onComplete: () => {
                                    gsap.to(interest_models[index].position, {
                                        x: 0,
                                        y: interest_models[index].truY,
                                        z: 0,
                                        duration: 0.5
                                    });
                                // }
                            // });
                        }
                    });
                // }
            // });

            controls.enableRotate = false;



        }
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);

        globe.rotation.z += 0.003;
        globe.rotation.x += 0.003;

        composer.render();
    }
    animate();
}, undefined, function (error) {
    console.error(error);
});

