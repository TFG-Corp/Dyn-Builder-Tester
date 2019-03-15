// import * as THREE from 'three';
// 'use strict';

/* global THREE */

if (WEBGL.isWebGLAvailable() === false) {

  document.body.appendChild( WEBGL.getWebGLErrorMessage() );

}

var container, stats, clock;
var camera, scene, renderer, furniture;

init();
animate();

function init() {

  container = document.getElementById( 'canvas-3D' );


  camera = new THREE.PerspectiveCamera( 15, container.clientWidth / container.clientHeight, 0.1, 2000 );
  camera.position.set( 8, 10, 8 );
  camera.lookAt( 0, 3, 0 );


  var controls = new THREE.OrbitControls( camera, container );
  controls.maxPolarAngle = Math.PI / 2;
  // controls.minDistance = 150;
  controls.maxDistance = 100;

  scene = new THREE.Scene();

  clock = new THREE.Clock();

  // loading manager

  var loadingManager = new THREE.LoadingManager( function () {

    scene.add( furniture );

  } );

  // collada

  var loader = new THREE.ColladaLoader( loadingManager );
  loader.load( './3D-models/120-test/120-test1.dae', function ( collada ) {

    furniture = collada.scene;
  } );

  // // LIGHTS
  //
  // var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.9 );
  // scene.add( ambientLight );
  //
  // var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
  // directionalLight.position.set( 1, 1, 0 ).normalize();
  // scene.add( directionalLight );


  // LIGHTS

  var light = new THREE.PointLight( 0xffffff, 1 );
  light.position.set( 2, 5, 1 );
  light.position.multiplyScalar( 30 );
  scene.add( light );

  var light = new THREE.PointLight( 0xffffff, 0.75 );
  light.position.set( - 12, 4.6, 2.4 );
  light.position.multiplyScalar( 30 );
  scene.add( light );

  scene.add( new THREE.AmbientLight( 0x050505 ) );

  //RENDERER

  // renderer = new THREE.WebGLRenderer();
  renderer = new THREE.WebGLRenderer({canvas: container});
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( container.clientWidth, container.clientHeight );
  // container.appendChild( renderer.domElement );

  //
  // Statics
  if (typeof ( Stats ) != 'undefined') {
    stats = new Stats();
    container.appendChild( stats.dom );
  }
  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( container.clientWidth, container.clientHeight );

}

function animate() {

  requestAnimationFrame( animate );

  render();
  if (typeof ( Stats ) != 'undefined') {
    stats.update();
  }

}

function render() {
  var delta = clock.getDelta();

  if (furniture !== undefined) {
    // furniture.rotation.z += delta * 0.5;
  }


  renderer.render( scene, camera );

}

function loadFurniture( url ) {
  scene.remove( furniture );
  // loading manager
  var loadingManager = new THREE.LoadingManager( function () {

    scene.add( furniture );

  } );

  // collada
  var loader = new THREE.ColladaLoader( loadingManager );
  loader.load( url, function ( collada ) {

    furniture = collada.scene;
  } );
}

function updateFurniture( layers ) {
  for (var i = 0; i < furniture.children.length; i ++) {
    furniture.children[i].visible = false;
  }
  for (var i = 0; i < furniture.children.length; i ++) {
    for (var j = 0; j < layers.length; j ++) {
      if (furniture.children[i].name === layers[j]) {
        furniture.children[i].visible = true;
      }
    }
  }
}

// loadFurniture("./models/test-desk/l-shaped-right.dae");
