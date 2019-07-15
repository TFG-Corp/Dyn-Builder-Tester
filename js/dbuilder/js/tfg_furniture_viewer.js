'use strict';

if (WEBGL.isWebGLAvailable() === false) {

    document.body.appendChild(WEBGL.getWebGLErrorMessage());

}

window.ImageBitmap = window.ImageBitmap || function () {
    return null
};

var container, stats, clock;
var camera, controls, scene, renderer, furniture;
var GlobalFullscreenMode = false;

var defaults = {
    // environment: options.preset === Preset.ASSET_GENERATOR
    //     ? 'Footprint Court (HDR)'
    //     : environments[1].name,
    background: false,
    playbackSpeed: 1.0,
    actionStates: {},
    // camera: DEFAULT_CAMERA,
    wireframe: false,
    skeleton: false,
    grid: false,

    // Lights
    addLights: true,
    exposure: 1.0,
    // exposure: 1.4,
    gammaOutput: true,
    // textureEncoding: 'sRGB',
    textureEncoding: 'linear',
    ambientIntensity: 0.3,
    // ambientIntensity: 1.25,
    ambientColor: 0xFFFFFF,
    directIntensity: 0.8 * Math.PI, // TODO(#116)
    directColor: 0xFFFFFF,
    bgColor1: '#ffffff',
    bgColor2: '#353535'
};

init();
animate();

function init() {
    container = document.getElementById('container-3D');

    scene = new THREE.Scene();

    // CAMERA
    camera = new THREE.PerspectiveCamera(15, container.clientWidth / container.clientHeight, 0.1, 50000);
    camera.position.set(640, 800, 640);
    camera.lookAt(0, 3, 0);
    controls = new THREE.OrbitControls(camera, container);
    scene.add(camera);


    // var scene_color = 0xffffff;
    // scene.background = new THREE.Color(scene_color);
    scene.background = new THREE.TextureLoader().load("image/3d-bg.jpg");
    clock = new THREE.Clock();

    // LIGHTS
    var hemiLight = new THREE.HemisphereLight();
    hemiLight.name = 'hemi_light';
    scene.add(hemiLight);

    var light1 = new THREE.AmbientLight(defaults.ambientColor, defaults.ambientIntensity);
    light1.name = 'ambient_light';
    camera.add(light1);

    var light2 = new THREE.DirectionalLight(defaults.directColor, defaults.directIntensity);
    light2.position.set(0.5, 0, 0.866); // ~60º
    light2.name = 'main_light';
    camera.add(light2);


    //RENDERER
    renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.physicallyCorrectLights = true;
    renderer.setClearColor(0xcccccc);
    renderer.gammaOutput = defaults.gammaOutput;
    renderer.gammaFactor = 2.2;
    renderer.toneMappingExposure = defaults.exposure;

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
    var sceneWidth, sceneHeight;

    if (GlobalFullscreenMode) {
        sceneWidth = window.innerWidth;
        sceneHeight = window.innerHeight;

    } else {
        sceneWidth = container.clientWidth;
        sceneHeight = container.clientHeight;
    }
    camera.aspect = sceneWidth / sceneHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneWidth, sceneHeight);
}

function animate() {
    requestAnimationFrame(animate);
    // var delta = clock.getDelta();
    // if (mixer) mixer.update(delta);
    if (furniture !== undefined) {
        // furniture.rotation.y += delta * 0.5;
    }

    renderer.render(scene, camera);
    if (typeof (Stats) != 'undefined') {
        stats.update();
    }
}

function loadFurniture(url) {
    var myRegex = /([^/]+)(\.\w+$)/;
    var fileRegex = /^.+\//;
    var filePath = fileRegex.exec(url)[0];
    var fileName = myRegex.exec(url)[1];
    var fileExtension = myRegex.exec(url)[2];

    var loader;
    switch (fileExtension) {
        // Collada DAE
        case ".dae":

            loader = new THREE.ColladaLoader();
            loader.load(url, function (collada) {
                removeFromScene(furniture);
                furniture = collada.scene;
                furniture.traverse(function (child) {
                    if (child.isMesh) {
                        // child.castShadow = true;
                        // child.receiveShadow = true;
                    }
                });
                update3D();
                scene.add(furniture);
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
                            removeFromScene(furniture);
                            furniture = object;
                            furniture.traverse(function (child) {
                                if (child.isMesh) {
                                    // child.castShadow = true;
                                    // child.receiveShadow = true;
                                }
                            });
                            update3D();
                            scene.add(furniture);
                            $(".customizer").addClass("open")
                        }, onProgress, onError);
                });
            break;
        // AutoDesk FBX
        case ".fbx":
            loader = new THREE.FBXLoader();
            loader.load(url, function (object) {
                removeFromScene(furniture);
                furniture = object;
                furniture.traverse(function (child) {
                    if (child.isMesh) {
                        // child.castShadow = true;
                        // child.receiveShadow = true;
                    }
                });
                update3D();
                scene.add(furniture);
                $(".customizer").addClass("open")
            });
            break;
        // GLTF
        case ".gltf":
        case ".glb":
            loader = new THREE.GLTFLoader().setPath(filePath);
            loader.load(fileName + fileExtension, function (object) {
                removeFromScene(furniture);
                furniture = object.scenes[0];
                object.scene.traverse(function (child) {
                    if (child.isMesh) {
                        // child.material.envMap = envMap;
                        // child.castShadow = true;
                        // child.receiveShadow = true;
                    }
                });
                scene.add(object.scene);
                update3D();
                $(".customizer").addClass("open")
            });
            break;
        default:
            console.log("Not Supported 3D model format");
            break;
    }

    updateTextureEncoding();
    // controls.target.copy( furniture.position );
    // fitCameraToFurniture(1.3);

}

function updateFurniture(layers) {
    if (furniture !== undefined) {
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

function removeFromScene(object) {
    scene.remove(object);
    animate();
}

function exportGLTF(binary) {
    binary = binary || true;
    var gltfExporter = new THREE.GLTFExporter();
    var options = {
        binary: binary
    };
    gltfExporter.parse(furniture.children, function (result) {
        if (result instanceof ArrayBuffer) {
            saveArrayBuffer(result, 'furniture.glb');
        } else {
            var output = JSON.stringify(result, null, 2);
            console.log(output);
            saveString(output, 'furniture.gltf');
        }
    }, options);
}

function exportCollada() {
    var exporter = new THREE.ColladaExporter();
    var result = exporter.parse(furniture);
    saveString(result.data, 'furniture.dae');
    result.textures.forEach(function (tex) {
        saveArrayBuffer(tex.data, tex.name + '.' + tex.ext);
    });
}

function saveString(text, filename) {
    save(new Blob([text], {type: 'text/plain'}), filename);
}

function saveArrayBuffer(buffer, filename) {
    save(new Blob([buffer], {type: 'application/octet-stream'}), filename);
}

function save(blob, filename) {
    var link = document.createElement('a');
    link.style.display = 'none';
    container.appendChild(link);

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    link.remove();
}

function openFullscreen() {
    var fullscreen_container = document.getElementById('fullscreen-container');
    var snapshot_btn = document.getElementById('take-snapshot-btn');

    if (fullscreen_container.requestFullscreen) {
        fullscreen_container.requestFullscreen();
    } else if (fullscreen_container.mozRequestFullScreen) { /* Firefox */
        fullscreen_container.mozRequestFullScreen();
    } else if (fullscreen_container.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        fullscreen_container.webkitRequestFullscreen();
    } else if (fullscreen_container.msRequestFullscreen) { /* IE/Edge */
        fullscreen_container.msRequestFullscreen();
    }

    GlobalFullscreenMode = true;
    container.style.width = '100%';
    container.style.height = '100%';
    container.classList.remove("mt-3");
    snapshot_btn.style.bottom = "55px";

    window.addEventListener('resize', onWindowResize, false);

}

if (document.addEventListener) {
    document.addEventListener('webkitfullscreenchange', fsChangeHandler, false);
    document.addEventListener('mozfullscreenchange', fsChangeHandler, false);
    document.addEventListener('fullscreenchange', fsChangeHandler, false);
    document.addEventListener('MSFullscreenChange', fsChangeHandler, false);
}

function fsChangeHandler() {
    var snapshot_btn = document.getElementById('take-snapshot-btn');
    if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement !== undefined) {
        /* Run code when going to fs mode */

        GlobalFullscreenMode = true;
        onWindowResize();
    } else {
        /* Run code when going back from fs mode */

        GlobalFullscreenMode = false;
        container.style = null;
        container.classList.add("mt-3");
        snapshot_btn.style.bottom = "145px";
        // snapshot_btn.style.bottom = "90px";
        onWindowResize();
    }
}


function fitCameraToFurniture(offset) {

    offset = offset || 1.25;

    var boundingBox = new THREE.Box3();

    // get bounding box of object - this will be used to setup controls and camera
    boundingBox.setFromObject(furniture);

    var center = boundingBox.getCenter();

    var size = boundingBox.getSize();

    // get the max side of the bounding box (fits to width OR height as needed )
    var maxDim = Math.max(size.x, size.y, size.z);
    var fov = camera.fov * (Math.PI / 180);
    var cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));

    cameraZ *= offset; // zoom out a little so that objects don't fill the screen

    camera.position.z = cameraZ;

    var minZ = boundingBox.min.z;
    var cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

    camera.far = cameraToFarEdge * 3;
    camera.updateProjectionMatrix();

    if (controls) {

        // set camera to rotate around center of loaded object
        controls.target = center;

        // prevent camera from zooming out far enough to create far plane cutoff
        controls.maxDistance = cameraToFarEdge * 2;

        controls.saveState();

    } else {

        camera.lookAt(center)

    }
}

function traverseMaterials (object, callback) {
    object.traverse((node) => {
        if (!node.isMesh) return;
    const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];
    materials.forEach(callback);
});
}

function updateTextureEncoding () {
    let encoding = defaults.textureEncoding === 'sRGB' ? THREE.sRGBEncoding : THREE.LinearEncoding;
    traverseMaterials(furniture, (material) => {
        if (material.map) material.map.encoding = encoding;
    if (material.emissiveMap) material.emissiveMap.encoding = encoding;
    if (material.map || material.emissiveMap) material.needsUpdate = true;
});
}

