import * as THREE from '../libs/three.module.js'
import { GLTFLoader } from '../libs/loaders/GLTFLoader.js';
import { FirstPersonControls } from '../libs/controls/FirstPersonControls.js';
import { OrbitControls } from '../libs/controls/OrbitControls.js';
import { OBJLoader } from '../libs/loaders/OBJLoader.js';
import { MTLLoader } from '../libs/loaders/MTLLoader.js';

//declaracion de entidades y variables globales
let cameraControllsFirstPerson = null, renderer = null, scene = null, score = null, camera = null, cameraFollow = null, LEVEL = [];
let gh1 = null, gh1Dir = null,gh2 = null, gh2Dir = null,gh3 = null, gh3Dir = null,gh4 = null, gh4Dir = null;
let directionalLight = null, spotLight = null, ambientLight = null, sound = null;
let dotsArray = [];
let powerArray = [];
let wallsArray = [];
let ghostArray = [];
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
/*  falta poner scene.add(ghostx.ghostObject) en create scene
    falta borrar ghostMovement después de ponerlo en la clase como método
    falta integrar change movement dentro de ghostMovement
    falta arreglar las colisiones en el update
*/
class GhostObject{
    constructor(object, ghostNumber, modelAddress){
        
        this.object = object;
        this.ghostNumber = ghostNumber;

        // movement logic 0=up 1=right 2=down 3=left
        this.direction = 0;
        this.forward = true;
        this.moveSpeed = 0.01;

        this.ghostObject = THREE.Object3D();
        this.box = new THREE.Box3().setFromObject(ghostObject);

        const gltfLoadGhost = new GLTFLoader();
        gltfLoadGhost.load(modelAddress, (gltf, el) =>{
            this.ghostObject = gltf.scene;
            this.name = 'ghost' + ghostNumber;
            this.ghostObject.position.set(11.75, -0.4, -9);
            this.ghostObject.scale.set(0.3, 0.3, 0.3);
        });

        this.movement = function () {
            if(forward == false){
                this.moveSpeed *= -1;
            }
            if(this.direction == 0){
                this.ghostObject.translateZ(moveSpeed);
            }else if(this.direction == 1){
                this.ghostObject.translateX(moveSpeed);
            }else if(this.direction == 2){
                this.ghostObject.translateZ(-moveSpeed);
            }else if(this.direction == 3){
                this.ghostObject.translateX(-moveSpeed);
            }else{
                console.error("Error in ghost movement ")
            }
            if(forward == false){
                this.moveSpeed *= -1; 
            }
        };

        this.changeDirection = function(){
            let randomize = Math.floor(Math.random() * 3);
            this.direction = (this.direction + 1 + randomize) % 4 ;
        };
    }

}

//funcion que maneja el movimiento de los fantasmas, se recibe el número del fantasma a mover
function ghostMovement(number, forward){
    //velocidad de movimiento de los fantasmas
    let moveSpeed = 0.01;
    switch(number){
        case 1:
            if(forward == false){
                moveSpeed *= -1;
            }
            if(gh1Dir=='u'){
                gh1.translateZ(moveSpeed);
            }else if(gh1Dir=='r'){
                gh1.translateX(moveSpeed);
            }else if(gh1Dir=='d'){
                gh1.translateZ(-moveSpeed);
            }else if(gh1Dir=='l'){
                gh1.translateX(-moveSpeed);
            }else{
                console.error("error in ghost movement");
            }
            break;
        case 2:
            if(forward == false){
                moveSpeed *= -1;
            }
            if(gh2Dir=='u'){
                gh2.translateZ(moveSpeed);
            }else if(gh2Dir=='r'){
                gh2.translateX(moveSpeed);
            }else if(gh2Dir=='d'){
                gh2.translateZ(-moveSpeed);
            }else if(gh2Dir=='l'){
                gh2.translateX(-moveSpeed);
            }else{
                console.error("error in ghost movement");
            }
            break;
        case 3:
            if(forward == false){
                moveSpeed *= -1;
            }
            if(gh3Dir=='u'){
                gh3.translateZ(moveSpeed);
            }else if(gh3Dir=='r'){
                gh3.translateX(moveSpeed);
            }else if(gh3Dir=='d'){
                gh3.translateZ(-moveSpeed);
            }else if(gh3Dir=='l'){
                gh3.translateX(-moveSpeed);
            }else{
                console.error("error in ghost movement");
            }
            break;
        case 4:
            if(forward == false){
                moveSpeed *= -1;
            }
            if(gh4Dir=='u'){
                gh4.translateZ(moveSpeed);
            }else if(gh4Dir=='r'){
                gh4.translateX(moveSpeed);
            }else if(gh4Dir=='d'){
                gh4.translateZ(-moveSpeed);
            }else if(gh4Dir=='l'){
                gh4.translateX(-moveSpeed);
            }else{
                console.error("error in ghost movement");
            }
            break;
    }
    
}
//function for changing directions where u=up r=right d=down l=left and number is the number of the ghost
function changeDir(number){
    if(number == 1){
        let direc = Math.floor(Math.random() * 3);
        switch(gh1Dir){
            // if the ghost was moving up it 
            case 'u':
                if(direc == 0) gh1Dir = 'r';
                else if(direc == 1) gh1Dir = 'd';
                else if(direc == 2) gh1Dir = 'l';
                break;
            case 'r':
                if(direc == 0) gh1Dir = 'd';
                else if(direc == 1) gh1Dir = 'l';
                else if(direc == 2) gh1Dir = 'u';
                break;
            case 'd':
                if(direc == 0) gh1Dir = 'l';
                else if(direc == 1) gh1Dir = 'u';
                else if(direc == 2) gh1Dir = 'r';
                break;
            case 'l':
                if(direc == 0) gh1Dir = 'u';
                else if(direc == 1) gh1Dir = 'r';
                else if(direc == 2) gh1Dir = 'd';
                break;
                default:
                    console.error("error in ghost direction");

            
        }
        
    }
    if(number == 2){
        let direc = Math.floor(Math.random() * 3);
        switch(gh2Dir){
            // if the ghost was moving up it 
            case 'u':
                if(direc == 0) gh2Dir = 'r';
                else if(direc == 1) gh2Dir = 'd';
                else if(direc == 2) gh2Dir = 'l';
                break;
            case 'r':
                if(direc == 0) gh2Dir = 'd';
                else if(direc == 1) gh2Dir = 'l';
                else if(direc == 2) gh2Dir = 'u';
                break;
            case 'd':
                if(direc == 0) gh2Dir = 'l';
                else if(direc == 1) gh2Dir = 'u';
                else if(direc == 2) gh2Dir = 'r';
                break;
            case 'l':
                if(direc == 0) gh2Dir = 'u';
                else if(direc == 1) gh2Dir = 'r';
                else if(direc == 2) gh2Dir = 'd';
                break;
                default:
                    console.error("error in ghost direction");

            
        }
        
    }
    if(number == 3){
        let direc = Math.floor(Math.random() * 3);
        switch(gh3Dir){
            // if the ghost was moving up it 
            case 'u':
                if(direc == 0) gh3Dir = 'r';
                else if(direc == 1) gh3Dir = 'd';
                else if(direc == 2) gh3Dir = 'l';
                break;
            case 'r':
                if(direc == 0) gh3Dir = 'd';
                else if(direc == 1) gh3Dir = 'l';
                else if(direc == 2) gh3Dir = 'u';
                break;
            case 'd':
                if(direc == 0) gh3Dir = 'l';
                else if(direc == 1) gh3Dir = 'u';
                else if(direc == 2) gh3Dir = 'r';
                break;
            case 'l':
                if(direc == 0) gh3Dir = 'u';
                else if(direc == 1) gh3Dir = 'r';
                else if(direc == 2) gh3Dir = 'd';
                break;
                default:
                    console.error("error in ghost direction");

            
        }
    }
    if(number == 4){
        let direc = Math.floor(Math.random() * 3);
        switch(gh4Dir){
            // if the ghost was moving up it 
            case 'u':
                if(direc == 0) gh4Dir = 'r';
                else if(direc == 1) gh4Dir = 'd';
                else if(direc == 2) gh4Dir = 'l';
                break;
            case 'r':
                if(direc == 0) gh4Dir = 'd';
                else if(direc == 1) gh4Dir = 'l';
                else if(direc == 2) gh4Dir = 'u';
                break;
            case 'd':
                if(direc == 0) gh4Dir = 'l';
                else if(direc == 1) gh4Dir = 'u';
                else if(direc == 2) gh4Dir = 'r';
                break;
            case 'l':
                if(direc == 0) gh4Dir = 'u';
                else if(direc == 1) gh4Dir = 'r';
                else if(direc == 2) gh4Dir = 'd';
                break;
                default:
                    console.error("error in ghost direction");
        }
        
    }
}

function main()
{
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

function update() 
{
    var delta = clock.getDelta();
    
    requestAnimationFrame(function() { update(); });
    
    // renderizar a partir de la camara
    renderer.render( scene, camera );
    
    //Actualiza el control de la camara
    let previousPos = new THREE.Vector3();
    previousPos.copy(camera.position);
    cameraControllsFirstPerson.update(delta);
    
    //Mueve a cada fantasma, true es movimiento hacia adelante y false es que regrese una posición
    ghostMovement(1,true);
    ghostMovement(2,true);
    ghostMovement(3,true);
    ghostMovement(4,true);
    
    //Detección de colisiones con items donde Box3 es el collider del objeto
    let cameraBox = new THREE.Box3().setFromObject(cameraFollow);
    let gh1Box = new THREE.Box3().setFromObject(gh1);
    let gh2Box = new THREE.Box3().setFromObject(gh2);
    let gh3Box = new THREE.Box3().setFromObject(gh3);
    let gh4Box = new THREE.Box3().setFromObject(gh4);

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
    let collisionCheck1 = false;
    let collisionCheck2 = false;
    let collisionCheck3 = false;
    let collisionCheck4 = false;
    for(let i = 0; i<wallsArray.length;i++){
        let wallCollision = new THREE.Box3().setFromObject(wallsArray[i]);
        if(cameraBox.intersectsBox(wallCollision)){
            camera.position.copy(previousPos);
            // console.log("prev: ",previousPos);
            // console.log("camera: ",camera.position);
        }
        // ghost1 wall collision
        if(gh1Box.intersectsBox(wallCollision) && collisionCheck1 == false){
            collisionCheck1 = true;
            ghostMovement(1,false);
            changeDir(1);
        }
        if(gh2Box.intersectsBox(wallCollision) && collisionCheck2 == false){
            collisionCheck2 = true;
            ghostMovement(2,false);
            changeDir(2);
        }
        if(gh3Box.intersectsBox(wallCollision) && collisionCheck3 == false){
            collisionCheck3 = true;
            ghostMovement(3,false);
            changeDir(3);
        }
        if(gh4Box.intersectsBox(wallCollision) && collisionCheck4 == false){
            collisionCheck4 = true;
            ghostMovement(4,false);
            changeDir(4);
        }
    }
    if(gh1Box.intersectsBox(cameraBox)||gh2Box.intersectsBox(cameraBox)||gh3Box.intersectsBox(cameraBox)||gh4Box.intersectsBox(cameraBox)){
        console.log("Game Over");
        endOfGame = true;
        final();
    }

    KF.update();
}

function createMaterials()
{
    //Para cargar el material de las paredes se hace un map 
    textureMap = new THREE.TextureLoader().load(wallmap);
    //Se guarda el material "wall" en el arreglo
    materials["wall"] = new THREE.MeshPhongMaterial({map: textureMap});

}
function createScene(canvas) 
{
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
    audioLoader.load( '../sounds/music.mp3', function( buffer ) {
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

    );

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
    const gltfLoadGhost1= new GLTFLoader();
    gh1 = new THREE.Object3D();
    gltfLoadGhost1.load('../models/Fblue.gltf', (gltf, el) => {
        gh1  = gltf.scene;
        gh1.name = 'ghost1';
        gh1.position.set(11.75, -0.4, -9)
        gh1.scale.set(.3, .3, .3)
        // gh1.rotation.y =0;
    scene.add(gh1)});
    gh1Dir = 'u';
    
    const gltfLoadGhost2= new GLTFLoader();
    gh2 = new THREE.Object3D();
    gltfLoadGhost2.load('../models/Fgreen.gltf', (gltf, el) => {
        gh2  = gltf.scene;
        gh2.name = 'ghost1';
        gh2.position.set(14.75, -0.4, -9)
        gh2.scale.set(.3, .3, .3)
        // gh2.rotation.y =0;
    scene.add(gh2)});
    gh2Dir = 'u';
    
    const gltfLoadGhost3= new GLTFLoader();
    gh3 = new THREE.Object3D();
    gltfLoadGhost3.load('../models/Fred.gltf', (gltf, el) => {
        gh3  = gltf.scene;
        gh3.name = 'ghost1';
        gh3.position.set(19, -0.4, -14)
        gh3.scale.set(.3, .3, .3)
        // gh3.rotation.y =0;
    scene.add(gh3)});
    gh3Dir = 'u';
   
    const gltfLoadGhost4= new GLTFLoader();
    gh4 = new THREE.Object3D();
    gltfLoadGhost4.load('../models/Fyellowgltf.gltf', (gltf, el) => {
        gh4  = gltf.scene;
        gh4.name = 'ghost1';
        gh4.position.set(8.75, -0.4, -18)
        gh4.scale.set(.3, .3, .3)
        // gh4.rotation.y =0;
    scene.add(gh4)});
    gh4Dir = 'u';


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
function loadGhost(){

}

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
            })

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
    //getAudioContext().pause();
    endOfGame = true;
    canvas.style.display = "none";
    /*let gameOverScreen = document.getElementById("gameover");
    gameOverScreen.style.display = "inline";*/
}
// function touchStarted() {
//     getAudioContext().resume();
// }
main();