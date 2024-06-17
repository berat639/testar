import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";

let camera, scene, renderer;
let hiroMarkerMesh, earthNFTMesh;

init();



async function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setAnimationLoop(render);
  renderer.xr.enabled = true;

  const container = document.querySelector("#scene-container");
container.appendChild(renderer.domElement);

const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
ambient.position.set(0.5, 1, 0.25);
scene.add(ambient);

// setup the image targets
const imgMarkerHiro = document.getElementById("imgMarkerHiro");
const imgMarkerHiroBitmap = await createImageBitmap(imgMarkerHiro);
console.log(imgMarkerHiroBitmap);

const imgNTFEarth = document.getElementById("imgNTFEarth");
const imgNTFEarthBitmap = await createImageBitmap(imgNTFEarth);
console.log(imgNTFEarthBitmap);
const button = ARButton.createButton(renderer, {
  requiredFeatures: ["image-tracking"], // notice a new required feature
  trackedImages: [
      {
          image: imgMarkerHiroBitmap, // tell webxr this is the image target we want to track
          widthInMeters: 0.2, // in meters what the size of the PRINTED image in the real world
      },
      {
          image: imgNTFEarthBitmap, // tell webxr this is the image target we want to track
          widthInMeters: 0.2, // in meters what the size of the PRINTED image in the real world
      },
  ],
  // this is for the mobile debug
  optionalFeatures: ["dom-overlay"],
  domOverlay: {
      root: document.body,
  },
});

document.body.appendChild(button);
// add object for our hiro marker image
const hiroMarkerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
hiroMarkerGeometry.translate(0, 0.1, 0);

const hiroMarkerMaterial = new THREE.MeshNormalMaterial({
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
});

hiroMarkerMesh = new THREE.Mesh(hiroMarkerGeometry, hiroMarkerMaterial);
hiroMarkerMesh.name = "HiroMarkerCube";
hiroMarkerMesh.matrixAutoUpdate = false;
hiroMarkerMesh.visible = false;

scene.add(hiroMarkerMesh);

// add object for our earth marker image
const earthNFTGeometry = new THREE.SphereGeometry (0.2); 
earthNFTGeometry.translate(0, 0.2, 0);
const earthNFTMaterial = new THREE.MeshNormalMaterial({
transparent: true,
opacity: 0.5,
side: THREE.DoubleSide,
}); 
earthNFTMesh = new THREE.Mesh (earthNFTGeometry, earthNFTMaterial);
earthNFTMesh.name = "EarthNFTSphere";
earthNFTMesh.matrixAutoUpdate = false;
earthNFTMesh.visible = false;
 scene.add(earthNFTMesh);
}
function render(timestamp, frame) {
  if (frame) {
      const results = frame.getImageTrackingResults(); // checking if there are any images we track

      console.log(results);

      // if we have more than one image the results are an array
      for (const result of results) {
          // The result's index is the image's position in the trackedImages array specified at session creation
          const imageIndex = result.index;

          // Get the pose of the image relative to a reference space.
          const referenceSpace = renderer.xr.getReferenceSpace();
          const pose = frame.getPose(result.imageSpace, referenceSpace);

          // checking the state of the tracking
          const state = result.trackingState;
          console.log(state);

          if (state == "tracked") {
            console.log("ImageIndex: ", imageIndex);
        
            if (imageIndex == 0) {
                hiroMarkerMesh.visible = true;
                // update the target mesh when the hiro image target is found
                hiroMarkerMesh.matrix.fromArray(pose.transform.matrix);
                console.log("Hiro Image target has been found", hiroMarkerMesh.position);
            }
        
            if (imageIndex == 1) {
                earthNFTMesh.visible = true;
                // update the target mesh when the earth image target is found
                earthNFTMesh.matrix.fromArray(pose.transform.matrix);
                console.log("EarthNFT Image target has been found", earthNFTMesh.position);
            }
            else{
              hiroMarkerMesh.visible = false;
          earthNFTMesh.visible = false;
            }
        }
        else if (state=="emulated") {
        
        }
        
        
      }
  }
  renderer.render(scene, camera);
}
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});