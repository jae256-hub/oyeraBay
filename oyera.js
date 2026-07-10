//Home Page
let serviceBayName = 'Oyera Auto Service Bay Ltd';
console.log(serviceBayName);
let heavyCars = document.getElementById('heavyDuty');
let smallCars = document.getElementById('smallDuty');
let commercialCars = document.getElementById('commercialDuty');

heavyCars.addEventListener('click',function(){
    console.log('Need heavy spare parts and advanced machinery.');
});

smallCars.addEventListener('click',function(){
    console.log('Need small spare parts and advanced machinery.');
});

commercialCars.addEventListener('click',function(){
    console.log('Need reasonably heavy spare parts and advanced machinery.');
});


let carTypesServiced = [
    heavyCars = {
        model : `${model}`,
        color : `${color}`,
        numberPlate: `${numberPlate}`,
        carStart(){
            console.log('Vroom');
        },
        carStop(){
            console.log('Skrrr');
        }
    },
   
     smallCars = {
        model : `${model}`,
        color : `${color}`,
        numberPlate: `${numberPlate}`,
        carStart(){
            console.log('Vroom');
        },
        carStop(){
            console.log('Skrrr');
        }
    },
     commercialCars = {
        model : `${model}`,
        color : `${color}`,
        numberPlate: `${numberPlate}`,
        carStart(){
            console.log('Vroom');
        },
        carStop(){
            console.log('Skrrr');
        }
    },
]
