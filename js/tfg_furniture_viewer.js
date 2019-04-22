'use strict';

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

    var scene_color = 0xc9c9c9;
    var HemisphereLightIntensity = 0.6;
    var DirectionalLightIntensity = 1;

    var light_multiplier = 14 / 16;

    HemisphereLightIntensity = HemisphereLightIntensity * light_multiplier;
    DirectionalLightIntensity = DirectionalLightIntensity * light_multiplier;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(scene_color);
    scene.add(camera);

    clock = new THREE.Clock();

    scene.fog = new THREE.Fog(scene_color);

    // ground
    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({
        color: scene_color,
        depthWrite: false,
        specular: 0x101010,
        shininess: 20
    }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // LIGHTS
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, HemisphereLightIntensity);
    hemiLight.position.set(0, 5, 0);
    hemiLight.position.multiplyScalar(2.5);
    scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, DirectionalLightIntensity);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(7.5);
    camera.add(dirLight);
    dirLight.castShadow = true;
    // Shadow Map size
    dirLight.shadow.mapSize.width = 10000;
    dirLight.shadow.mapSize.height = 10000;
    // Set up shadow properties for the light
    dirLight.shadow.camera.near = 0.1;    // default
    dirLight.shadow.camera.far = 1000;     // default
    var d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;

    //RENDERER

    renderer = new THREE.WebGLRenderer(
        {
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true
        }
    );

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMapType = THREE.PCFSoftShadowMap; // options are THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
    renderer.shadowMap.enabled = true;
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
    var delta = clock.getDelta();
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
                        child.castShadow = true;
                        child.receiveShadow = true;
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
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                }
                            });
                            update3D();
                            scene.add(furniture);
                            $(".customizer").addClass("open")
                        }, onProgress, onError);
                });
            break;
        case ".fbx":
            loader = new THREE.FBXLoader();
            loader.load(url, function (object) {
                removeFromScene(furniture);
                furniture = object;
                furniture.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                update3D();
                scene.add(furniture);
                $(".customizer").addClass("open")
            });
            break;
        case ".gltf" || ".gbl":
            loader = new THREE.GLTFLoader().setPath(filePath);
            loader.load(fileName + fileExtension, function (object) {
                removeFromScene(furniture);
                furniture = object;
                furniture.scene.traverse(function (child) {
                    if (child.isMesh) {
                        // child.material.envMap = envMap;
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                update3D();
                furniture = scene.add(furniture.scene);
                $(".customizer").addClass("open")
            });
            break;
        default:
            console.log("Not Supported 3D model format");
            break;
    }


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

function exportGLTF() {
    var gltfExporter = new THREE.GLTFExporter();
    var options = {
        trs: false,
        onlyVisible: true,
        truncateDrawRange: true,
        binary: false,
        forceIndices: false,
        forcePowerOfTwoTextures: false
    };
    gltfExporter.parse(scene, function (result) {
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
