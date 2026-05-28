const STATIC_IMAGE = 'logo.png'
  
// Target resolution (Keep it low, e.g., 60x60, because 60x60 = 3,600 individual 3D cubes!)
const TARGET_WIDTH = 37; 

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// --- Mobile & Desktop Controls ---
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth motion
controls.dampingFactor = 0.05;

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 100);
scene.add(directionalLight);

// --- Load Image and Process Pixels ---
const img = new Image();
img.crossOrigin = "Anonymous"; // Crucial for reading pixel data from an external URL
img.src = STATIC_IMAGE;

const cubeGroup = new THREE.Group();
scene.add(cubeGroup);
const cubes = [];

img.onload = function() {
    // Remove loading text
    document.getElementById('loading').style.opacity = 0;

    // Create a hidden canvas to extract pixel colors
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Scale image down so we don't melt your GPU
    const scale = TARGET_WIDTH / img.width;
    canvas.width = TARGET_WIDTH;
    canvas.height = img.height * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Geometry shared by all cubes for performance
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);

    // Center the grid alignment
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 2;

    // Loop through pixels
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            // Each pixel has 4 array segments: Red, Green, Blue, Alpha
            const index = (y * canvas.width + x) * 4;
            const r = imgData[index];
            const g = imgData[index + 1];
            const b = imgData[index + 2];
            const a = imgData[index + 3];

            // Skip mostly transparent pixels
            if (a < 128) continue;

            // Create material with the pixel's color
            const color = new THREE.Color(`rgb(${r}, ${g}, ${b})`);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.4,
                metalness: 0.1
            });

            const cube = new THREE.Mesh(geometry, material);

            // Position cubes in 3D space (flipping Y so image isn't upside down)
            cube.position.set(x - offsetX, offsetY - y, 0);
            
            // Give each cube a random unique rotation speed offset
            cube.userData = {
                rotSpeedX: (Math.random() - 0.5) * 0.05,
                rotSpeedY: (Math.random() - 0.5) * 0.05
            };

            cubeGroup.add(cube);
            cubes.push(cube);
        }
    }

    // Position camera based on image size
    camera.position.z = Math.max(canvas.width, canvas.height) * 1.2;
};

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Spin individual cubes
    for (let i = 0; i < cubes.length; i++) {
        cubes[i].rotation.x += cubes[i].userData.rotSpeedX;
        cubes[i].rotation.y += cubes[i].userData.rotSpeedY;
    }

    // Slowly rotate the entire image assembly over time
    cubeGroup.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2;

    // Update controls (required for damping effect)
    controls.update();

    renderer.render(scene, camera);
}
animate();

// --- Handle Window Resize ---
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}