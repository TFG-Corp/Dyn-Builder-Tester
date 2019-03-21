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

  scene.add(new THREE.AmbientLight(0x555555));

  //RENDERER

  renderer = new THREE.WebGLRenderer(
    {
      alpha: true,
      preserveDrawingBuffer: true
    }
  );
  renderer.setClearColor(0xffffff, 0);
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

function loadFurniture(url) {
  scene.remove(furniture);

  // var myRegex = /(.+)(\.\w+$)/;
  var myRegex = /([^/]+)(\.\w+$)/;
  var fileRegex = /^.+\//;
  var filePath = fileRegex.exec(url)[0];
  var fileName = myRegex.exec(url)[1];
  var fileExtension = myRegex.exec(url)[2];

  switch (fileExtension) {
    // Collada DAE
    case ".dae":
      // loading manager
      var loadingManager = new THREE.LoadingManager(function () {
        scene.add(furniture);
      });

      var loader = new THREE.ColladaLoader(loadingManager);
      loader.load(url, function (collada) {
        furniture = collada.scene;
        update3D();
        $(".customizer").addClass("open")
      });
      break;
    // OBJ MTL
    case ".obj":
      var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
          var percentComplete = xhr.loaded / xhr.total * 100;
          console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
      };
      var onError = function () {
      };
      THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

      new THREE.MTLLoader()
        .setPath(filePath)
        .load(fileName + '.mtl', function (materials) {
          materials.preload();
          new THREE.OBJLoader()
            .setMaterials(materials)
            .setPath(filePath)
            .load(fileName + '.obj', function (object) {
              furniture = object;
              scene.add(furniture);
              // update3D();
              $(".customizer").addClass("open")
            }, onProgress, onError);
        });
      break;
    default:
    // code block
  }


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

function saveAsImage() {
  var imgData, imgNode;
  var strDownloadMime = "image/octet-stream";
  try {
    var strMime = "image/jpeg";
    imgData = renderer.domElement.toDataURL(strMime);

    saveFile(imgData.replace(strMime, strDownloadMime), "furniture.jpg");

  } catch (e) {
    console.log(e);
    return;
  }

}

var saveFile = function (strData, filename) {
  var link = document.createElement('a');
  if (typeof link.download === 'string') {
    document.body.appendChild(link); //Firefox requires the link to be in the body
    link.download = filename;
    link.href = strData;
    link.click();
    document.body.removeChild(link); //remove the link when done
  } else {
    location.replace(uri);
  }
};
