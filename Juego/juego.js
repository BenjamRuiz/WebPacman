import * as THREE from '../libs/three.module.js'
import { GLTFLoader } from '../libs/loaders/GLTFLoader.js';
import { FirstPersonControls } from '../libs/controls/FirstPersonControls.js';
import { OBJLoader } from '../libs/loaders/OBJLoader.js';
import { MTLLoader } from '../libs/loaders/MTLLoader.js';

//declaracion de entidades y variables globales
let cameraControllsFirstPerson = null, renderer = null, scene = null, score = null, camera = null, cameraFollow = null, LEVEL = [];
let directionalLight = null, spotLight = null, ambientLight = null, sound = null;
let dotsArray = [];
let powerArray = [];
let wallsArray = [];
let ghostArray = [];
let ghostAmmount = 4;
let endOfGame = false;

let SHADOW_MAP_WIDTH = 4096, SHADOW_MAP_HEIGHT = 4096;

let textureMap = null;
let materials = {};
let wallmap = "../images/Wall.jpeg";

var clock = new THREE.Clock();

// Animation
let dotsgroup = null, wallsgroup = null, powergroup = null; 
let animator = null, animator2 = null, loopAnimation = true,loopAnimation2 = true; 
let duration = 5000; 
const canvas = document.getElementById("webglcanvas");

class GhostObject{
    constructor(ghostNumber, modelAddress){
        
        this.ghostNumber = ghostNumber;

        // movement logic 0=up 1=right 2=down 3=left
        this.direction = 0;
        this.forward = true;
        this.moveSpeed = 0.01;

        this.ghostObject = new THREE.Object3D();
        this.box = new THREE.Box3().setFromObject(this.ghostObject);

        const gltfLoadGhost = new GLTFLoader();
        gltfLoadGhost.load(modelAddress, (gltf, el) =>{
            this.ghostObject = gltf.scene;
            this.name = 'ghost' + ghostNumber;
            this.ghostObject.position.set(11.75, -0.4, -9);
            this.ghostObject.scale.set(0.3, 0.3, 0.3);
        });

        this.movement = function () {
            if(this.forward == false){
                this.moveSpeed *= -1;
            }
            if(this.direction == 0){
                this.ghostObject.translateZ(this.moveSpeed);
            }else if(this.direction == 1){
                this.ghostObject.translateX(this.moveSpeed);
            }else if(this.direction == 2){
                this.ghostObject.translateZ(-this.moveSpeed);
            }else if(this.direction == 3){
                this.ghostObject.translateX(-this.moveSpeed);
            }else{
                console.error("Error in ghost movement ");
            }
            if(this.forward == false){
                this.moveSpeed *= -1; 
            }
        };

        this.changeDirection = function(){
            let randomize = Math.floor(Math.random() * 3);
            this.direction = (this.direction + 1 + randomize) % 4 ;
        };
    }
}

function main(){
    if(!endOfGame){
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        createScene(canvas);
        sound.play();
        const mapa = createMap(scene, LEVEL);

        //////////////////////////
        initAnimations();
        playAnimations();
        //////////////////////////

        update();
    }
}

function update(){
    var delta = clock.getDelta();
    
    requestAnimationFrame(function() { update(); });
    
    // renderizar a partir de la camara
    renderer.render( scene, camera );
    
    //Actualiza el control de la camara
    let previousPos = new THREE.Vector3();
    previousPos.copy(camera.position);
    cameraControllsFirstPerson.update(delta);
    
    //Mueve a cada fantasma, true es movimiento hacia adelante y false es que regrese una posición
    ghostArray.forEach((ghost)=>{
        ghost.movement();
    });
    
    //Detección de colisiones con items donde Box3 es el collider del objeto
    let cameraBox = new THREE.Box3().setFromObject(cameraFollow);

    cameraFollow.position.copy(camera.position);
    // cameraFollow.rotation.copy(camera.rotation);
    // cameraFollow.position.z += .5;
    // Revisa intersecciones con objetos para eliminarlos del mapa
    for(let i = 0; i<dotsArray.length;i++){
        let dotCollision = new THREE.Box3().setFromObject(dotsArray[i]);
        if(cameraBox.intersectsBox(dotCollision)){
            score += 10;
            document.getElementById("title").innerHTML = score;
            // console.log("Score: ",score);
            dotsgroup.remove(dotsArray[i]);
            dotsArray.splice(i,1);
        } 
    }
    for(let i = 0; i<powerArray.length;i++){
        let powerCollision = new THREE.Box3().setFromObject(powerArray[i]);
        if(cameraBox.intersectsBox(powerCollision)){
            score += 50;
            document.getElementById("title").innerHTML = score;
            // console.log("Score: ",score);
            powergroup.remove(powerArray[i]);
            powerArray.splice(i,1);
        } 
    }
    if((powerArray.length + dotsArray.length) <= 0){
        console.log("¡¡Ganaste!!");
        endOfGame = true;
        final();
    }
    // Seccion colisiones con muros
    let collisionCheck = false;
    for(let i = 0; i<wallsArray.length;i++){
        let wallCollision = new THREE.Box3().setFromObject(wallsArray[i]);
        // camera wall collision
        if(cameraBox.intersectsBox(wallCollision)){
            camera.position.copy(previousPos);
            // console.log("prev: ",previousPos);
            // console.log("camera: ",camera.position);
        }
        // ghost wall collision
        ghostArray.forEach((ghost)=>{
            if(ghost.box.intersectsBox(wallCollision) && collisionCheck == false){
                collisionCheck = true;
                ghost.forward = false;
                ghost.changeDirection();
            }
        });
    }
    ghostArray.forEach((ghost)=>{
        if(ghost.box.intersectsBox(cameraBox)){
            console.log("Game Over");
            endOfGame = true;
            final();
        }
    });
    KF.update();
}

function createMaterials(){
    //Para cargar el material de las paredes se hace un map 
    textureMap = new THREE.TextureLoader().load(wallmap);
    //Se guarda el material "wall" en el arreglo
    materials["wall"] = new THREE.MeshPhongMaterial({map: textureMap});
}
function createScene(canvas){
    //Se crean los materiales
    createMaterials();
    //Se crea el renderer asignandose al canvas del documento html y con sus parametros
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    renderer.setSize(canvas.width, canvas.height);

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type = THREE.BasicShadowMap;
    
    //Se asigna un fondo a la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color (0, 0, 0 );
    //Se crea la camara
    camera = new THREE.PerspectiveCamera( 70, canvas.width / canvas.height, 0.1, 400 );
    camera.position.set(14, 0.5, -23);


    var listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    sound = new THREE.Audio( listener );

    var audioLoader = new THREE.AudioLoader();  

    //Load a sound and set it as the Audio object's buffer
    let audioPromise = new Promise(()=>audioLoader.load( '../sounds/music.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop(true);
        sound.setVolume(.3);
    },
        // onProgress callback
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },

        // onError callback
        function ( err ) {
            console.log( 'Un error ha ocurrido' );
        }

    ));
    audioPromise.then(sound.play());


    cameraControllsFirstPerson = new FirstPersonControls(camera,canvas);
    cameraControllsFirstPerson.lookSpeed = .1;
    cameraControllsFirstPerson.movementSpeed = 3;
    cameraControllsFirstPerson.lookVertical = false;

    // Se crea una caja que funcionará para las colisiones
    const material1 = new THREE.MeshBasicMaterial( {color: 0xf00000} );
    // const cameraBox = new THREE.BoxGeometry(0.4,2,0.4);
    const cameraBox = new THREE.CylinderGeometry(0.5,0.5,2,6);
    cameraFollow = new THREE.Mesh( cameraBox, material1 );
    cameraFollow.position.copy(camera.position);
    // cameraFollow.rotation.copy(camera.rotation);
    scene.add(cameraFollow);
      
    /* 
    * Luz direccional
    * Esta luz se posiciona en un plano infinitamente lejano y ilumina hacia una dirección
    */
    directionalLight = new THREE.DirectionalLight( 0xaaaaaa, 0);

    directionalLight.position.set(.5, 1, -3);
    directionalLight.target.position.set(0,0,0);
    directionalLight.castShadow = true;
    // scene.add(directionalLight);

    spotLight = new THREE.SpotLight (0xaaaaaa);
    spotLight.position.set(6, 8, 15);
    spotLight.target.position.set(-2, 0, -2);
    // scene.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    
    // Creation of ghost
    let ghost = new GhostObject(1,'../models/Fblue.gltf');
    ghostArray.push(ghost)
    ghost = new GhostObject(2,'../models/Fgreen.gltf');
    ghostArray.push(ghost)
    ghost = new GhostObject(3,'../models/Fred.gltf');
    ghostArray.push(ghost)
    ghost = new GhostObject(4,'../models/Fyellowgltf.gltf');
    ghostArray.push(ghost)

    ghostArray.forEach((ghost)=>{
        scene.add(ghost.ghostObject)
    });

    // Ambient Light ilumina todos los elementos de la escena de manera pareja
    ambientLight = new THREE.AmbientLight ( 0x444444, 0.3);
    scene.add(ambientLight);
    
}

LEVEL = [
'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
'W............WW............W',
'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
'WPWWWW.WWWWW.WW.WWWWW.WWWWPW',
'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
'W..........................W',
'W.WWWW.WW.WWWWWWWW.WW.WWWW.W',
'W.WWWW.WW.WWWWWWWW.WW.WWWW.W',
'W......WW....WW....WW......W',
'WWWWWW.WWWWW WW WWWWW.WWWWWW',
'WWWWWW.WWWWW WW WWWWW.WWWWWW',
'WWWWWW.WW          WW.WWWWWW',
'WWWWWW.WW WWWWWWWW WW.WWWWWW',
'WWWWWW.WW W      W WW.WWWWWW',
'W     .   W      W   .     W',
'WWWWWW.WW W      W WW.WWWWWW',
'WWWWWW.WW WWWWWWWW WW.WWWWWW',
'WWWWWW.WW          WW.WWWWWW',
'WWWWWW.WW WWWWWWWW WW.WWWWWW',
'WWWWWW.WW WWWWWWWW WW.WWWWWW',
'W............WW............W',
'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
'WP..WW................WW..PW',
'WWW.WW.WW.WWWWWWWW.WW.WW.WWW',
'WWW.WW.WW.WWWWWWWW.WW.WW.WWW',
'W......WW....WW....WW......W',
'W.WWWWWWWWWW.WW.WWWWWWWWWW.W',
'W.WWWWWWWWWW.WW.WWWWWWWWWW.W',
'W..........................W',
'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
];

function createMap(scene, levelDefinition) {
    var map = {};
    map.bottom = -(levelDefinition.length - 1);
    map.top = 0;
    map.left = 0;
    map.right = 0;

    dotsgroup = new THREE.Object3D();
    powergroup = new THREE.Object3D();
    wallsgroup = new THREE.Object3D();

    let lightArr = [];
    // Lights
    const light = new THREE.PointLight( 0xffccaa, 0.5, 0 );
    const light2 = new THREE.PointLight( 0xffccaa, 0.5, 0 );
    const light3 = new THREE.PointLight( 0xffccaa, 0.5, 0 );
    const light4 = new THREE.PointLight( 0xffccaa, 0.5, 0 );

    lightArr.push(light);
    lightArr.push(light2);
    lightArr.push(light3);
    lightArr.push(light4);
    
    let i = 0; 
    // Se puede leer el mapa como una arreglo de arreglos
    // [ [] , [] ] 
    var x, y, z;
    for (var row = 0; row < levelDefinition.length; row++) {
        /* 
        Se asignan las coordenadas del mapa para que concuerden con
        el sistema de coordenadas para objetos
        */
        z = -row;

        map[z] = {};

        // Se obtiene la longitud de la fila más larga de la definicion del mapa
        var length = Math.floor(levelDefinition[row].length / 2);
        //map.right = Math.max(map.right, length - 1);
        map.right = Math.max(map.right, length);

        // Salta cada segundo elemento, el cual solo es para mejorar la lectura
        for (var column = 0; column < levelDefinition[row].length; column ++) {
            x = column;

            var cell = levelDefinition[row][column];
            var wall = null;
            var dot = null; 
            var power = null;

            // Cada W representa un muro
            if (cell === 'W') {
                wall = createWall();
            // Cada punto representa un punto 
            } else if (cell === '.') {
                dot = createDot();
            // Cada P representa un powerUp
            }else if (cell === 'P') {
                power = createPower();
            }

            if (wall !== null)
            {
                wall.position.set( x, 0.5, z);
                map[z][x] = wall;
                wallsgroup.add(wall);
                wallsArray.push(wall);
            }
            if(dot !== null)
            {
                dot.position.set( x, 0, z);
                map[z][x] = dot;
                dotsgroup.add(dot);
                dotsArray.push(dot);
            }
            if(power !== null)
            {
                power.position.set( x, 0, z);

                // Light
                //light.position.set( x,0,z );
                lightArr[i++].position.set(x, 0, z);
                ////////////
                map[z][x] = power;
                powergroup.add(power);
                powerArray.push(power);
            }
            /*
            if (object !== null) {
                //Se guarda el nuevo objeto al arreglo de mapa
                object.position.set(x, y, 0);
                map[y][x] = object;
                scene.add(object);
            }
            */
        }

        scene.add(wallsgroup);
        scene.add(dotsgroup);
        scene.add(powergroup);

        lightArr.forEach(e =>
            {
                scene.add(e);
            });

    }

    // Despues de crear el mapa se establece el centro del mapa
    map.centerX = (map.left + map.right) / 2;
    map.centerZ = (map.bottom + map.top) / 2;

    return map;
};


// Funciones auxiliares
// Creamos el Muro 
function createWall() {
    var wallGeometry = new THREE.BoxGeometry(1, 2, 1);
    var wall = new THREE.Mesh(wallGeometry, materials["wall"]);
    return wall;
  
};

// Creamos el punto 
function createDot() {
    var dotGeometry = new THREE.SphereGeometry( .1, 20, 20);
    var dotMaterial = new THREE.MeshPhongMaterial({ color: "yellow"}); // Paech color
    var dot = new THREE.Mesh(dotGeometry, dotMaterial);
    return dot;

};

// Creamos el powerUP
function createPower() {
    var formGeometry = new THREE.SphereGeometry( .3, 20, 20 );
    var formMaterial = new THREE.MeshPhongMaterial({ color: "orange" }); // Paech color
    var form = new THREE.Mesh(formGeometry, formMaterial);
    return form;

};


/////////////////////////////
// Animation 
function initAnimations() 
{
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                { 
                    keys:[0, .5, 1], 
                    values:[
                            { y : 0.5 },
                            { y : 0 },
                            { y : 0.5 },
                            ],
                    target:dotsgroup.position
                },
                
            ],
        loop: loopAnimation,
        duration: duration,
    });
    animator2 = new KF.KeyFrameAnimator;
    animator2.init({ 
        interps:
            [
                { 
                    keys:[0, .5, 1], 
                    values:[
                            { y : 0.5 },
                            { y : 0 },
                            { y : 0.5 },
                            ],
                    target:powergroup.position
                },
                
            ],
        loop: loopAnimation2,
        duration: duration,
    });

    /*
    { 
                    keys:[0, .5, 1], 
                    values:[
                            { y : 0 },
                            { y : Math.PI * 2  },
                            { y : 0 },
                            ],
                    target:dotsgroup.rotation
                },
                */
}

function playAnimations()
{
    animator.start();
    animator2.start();
}


//funcion que termina el juego
function final(){
    getAudioContext().pause();
    endOfGame = true;
    canvas.style.display = "none";
    document.getElementById("gameover").style.visibility = "visible"; 
}
function touchStarted() {
    getAudioContext().resume();
}

main();
