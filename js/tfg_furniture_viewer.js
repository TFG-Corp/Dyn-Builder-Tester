// import * as THREE from 'three';
// 'use strict';

/* global THREE */

if (WEBGL.isWebGLAvailable() === false) {

  document.body.appendChild(WEBGL.getWebGLErrorMessage());

}

var container, stats, clock;
var camera, scene, renderer, furniture;

init();
animate();

function init() {

  container = document.getElementById('container-3D');

  camera = new THREE.PerspectiveCamera(15, container.clientWidth / container.clientHeight, 0.1, 2000);
  camera.position.set(8, 10, 8);
  camera.lookAt(0, 3, 0);


  var controls = new THREE.OrbitControls(camera, container);
  controls.maxPolarAngle = Math.PI / 2;
  // controls.minDistance = 150;
  controls.maxDistance = 100;

  scene = new THREE.Scene();
  // scene.background = new THREE.Color( 0xffffff );

  clock = new THREE.Clock();

  // LIGHTS

  var light1 = new THREE.PointLight(0xffffff, 1);
  light1.position.set(2, 5, 1);
  light1.position.multiplyScalar(30);
  scene.add(light1);

  var light2 = new THREE.PointLight(0xffffff, 0.75);
  light2.position.set(-12, 4.6, 2.4);
  light2.position.multiplyScalar(30);
  scene.add(light2);

  scene.add(new THREE.AmbientLight(0x050505));

  //RENDERER

  // renderer = new THREE.WebGLRenderer();
  renderer = new THREE.WebGLRenderer( { alpha: true } ); // init like this
  renderer.setClearColor( 0xffffff, 0 );
  // renderer = new THREE.WebGLRenderer({alpha: true, canvas: container});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);


  // Statics
  if (typeof (Stats) != 'undefined') {
    stats = new Stats();
    container.appendChild(stats.dom);
  }

  //Resize Event
  window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);

}

function animate() {

  requestAnimationFrame(animate);

  render();
  if (typeof (Stats) != 'undefined') {
    stats.update();
  }

}

function render() {
  var delta = clock.getDelta();

  if (furniture !== undefined) {
    // furniture.rotation.z += delta * 0.5;
  }


  renderer.render(scene, camera);

}

async function loadFurniture(url) {
  scene.remove(furniture);
  // loading manager
  var loadingManager = new THREE.LoadingManager(async function () {

    await scene.add(furniture);

  });

  // collada
  var loader = new THREE.ColladaLoader(loadingManager);
  loader.load(url, function (collada) {

    furniture = collada.scene;

    for (var i = 0; i < furniture.children.length; i++) {
      furniture.children[i].visible = false;
    }

  });
}

function updateFurniture(layers) {
  for (var i = 0; i < furniture.children.length; i++) {
    furniture.children[i].visible = false;
  }
  for (var i = 0; i < furniture.children.length; i++) {
    for (var j = 0; j < layers.length; j++) {
      if (furniture.children[i].name === layers[j]) {
        furniture.children[i].visible = true;
      }
    }
  }
}

// loadFurniture("3D-models/test-desk/l-shaped-right.dae");
