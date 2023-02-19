

// take the canvas from document
var canvas = document.getElementById("canvas");
// get the context of the canvas
var ctx = canvas.getContext("2d");


// get canvas width and height
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;

var fieldWidth = 768;
var fieldHeight = 720;

var panelWidth = 256;
var panelHeight = 720;

var buttonBorder = 5;

var PLANT_MAX_SIZE = 4;
var PLANT_MAX_AGE = 1;

// BUTTONS
var AUTO_HARVEST = false;
var AUTO_PLANT = false;
var ROTTEN_GONE = false;
var VALID_PLANTING = false


var money = 10;
var auto_harvest_time = 1;
var auto_plant_time = .0001;
var rotten_gone_time = 15;


// Create a plant class
function Plant(x, y, seed_size, max_age, max_size, color, ripe_color) {
    this.x = x;
    this.y = y;
    this.seed_size = seed_size;
    this.size = seed_size;
    this.max_age = max_age;
    this.max_size = max_size;
    this.color = color;
    this.born_time = Date.now();
    this.is_ripe = false;
    this.ripe_color = ripe_color;
    this.is_rotten = false;
}

var plants = [];

var start_time = Date.now();

function update_plants() {
    if (AUTO_HARVEST) {
        auto_harvest();
    }
    if(ROTTEN_GONE) {
        remove_rotten_plants();
    }
    for (var i = 0; i < plants.length; i++) {
        var plant = plants[i];
        if (plant.is_ripe) {
            continue;
        }
        var time_since_start = (Date.now() - plant.born_time)/1000; // Dividing by 1000 transforms milliseconds to seconds
        // logs all plant data
        // console.log("Plant " + i + " size: " + plant.size + " max_age: " + plant.max_age + " max_size: " + plant.max_size);
        if (!not_colliding(plant)) {
            plant.is_rotten = true;
        }
        if (plant.is_rotten) {
            continue;
        }
        if (time_since_start > plant.max_age) {
            plant.size = plant.max_size;
            plant.is_ripe = true;
        } else {
            plant.size = (time_since_start / plant.max_age) * (plant.max_size - plant.seed_size) + plant.seed_size;
        }
    }
}

function colliding_with_border(plant) {
    if (plant.x - plant.size < 0 || plant.x + plant.size > fieldWidth || plant.y - plant.size < 0 || plant.y + plant.size > fieldHeight) {
        return true;
    }
    return false;
}

function not_colliding(plant) {
    if (colliding_with_border(plant)) {
        return false;
    }

    for (var i = 0; i < plants.length; i++) {
        var other_plant = plants[i];
        if (plant == other_plant) {
            continue;
        }
        distance = Math.sqrt(Math.pow(plant.x - other_plant.x, 2) + Math.pow(plant.y - other_plant.y, 2));
        if (distance < plant.size + other_plant.size) {
            return false;
        }
    }
    return true;
}

function draw_plants() {
    for (var i = 0; i < plants.length; i++) {
        var plant = plants[i];
        if (plant.is_rotten) {
            ctx.fillStyle = "brown";
        } else if (plant.is_ripe) {
            ctx.fillStyle = plant.ripe_color;
        } else {
            ctx.fillStyle = plant.color;
        }
        ctx.beginPath();
        ctx.arc(plant.x, plant.y, plant.size, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }
}

function draw_panel() {
    ctx.fillStyle = "darkgray";
    ctx.fillRect(fieldWidth, 0, panelWidth, panelHeight);
    ctx.fillStyle = "black";
    ctx.strokeRect(fieldWidth + buttonBorder, buttonBorder, 128 - 2*buttonBorder, 128 - 2*buttonBorder);
    // Put text centered in the button
    ctx.save();
    var button_loc = first_button_field();
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Recycle", fieldWidth + 64, 64);
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("10s", button_loc[0][0] + 5, button_loc[0][1] + 5);
    ctx.font = "18px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "ideographic"
    ctx.fillText("10$", button_loc[1][0], button_loc[1][1]);
    ctx.restore();

}

function draw_field() {
    ctx.fillStyle = "lightgray";
    ctx.fillRect(0, 0, fieldWidth, fieldHeight);
    draw_plants();
    draw_money();
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    update_plants();
    draw_field();
    draw_panel();
}

function auto_harvest() {
    for (var i = 0; i < plants.length; i++) {
        var plant = plants[i];
        if (plant.is_ripe && (Date.now() - plant.born_time)/1000 > auto_harvest_time) {
            money += 2;
            plants.splice(i, 1);
        }
    }
}

    // function draw_border() {
    //     ctx.strokeStyle = "black";
    //     ctx.lineWidth = 5;
    //     ctx.strokeRect(0, 0, fieldWidth, fieldHeight);
    // }

function draw_money() {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Money: " + money, 10, 30);
}

function first_button_field() {
    // returns x and y coordinates of the first button
    return [[fieldWidth + buttonBorder, buttonBorder],
            [fieldWidth + 128 - buttonBorder, 128 - buttonBorder]];
}

function plant_at_location(x, y){
    if (money >= 1) {
        money -= 1;
        plants.push(new Plant(x, y, .1, PLANT_MAX_AGE, PLANT_MAX_SIZE, "green", "yellow"));
    }
}



// add plants where the user clicks
canvas.addEventListener("click", function (e) {
    var x = e.pageX - canvas.offsetLeft;
    var y = e.pageY - canvas.offsetTop;

    // If user clicks on panel
    if (x > fieldWidth) {
        if (x )
        return;
    }

    // Mouse collision
    for (var i = 0; i < plants.length; i++) {
        var plant = plants[i];
        var distance = Math.sqrt(Math.pow(plant.x - x, 2) + Math.pow(plant.y - y, 2));
        if (distance < plant.size) {
            if (plant.is_rotten) {
                plants.splice(i, 1);
            } else if (plant.is_ripe) {
                money += 2;
                plants.splice(i, 1);
            }
            return;
        }
    }
// function Plant(x, y, seed_size, growth_rate, max_age, max_size, color) {
    plant_at_location(x, y);
});

// if key is == 1, 2, 3 or 4 trigger event
document.addEventListener("keydown", function (e) {
    console.log("key pressed: " + e.key);
    if (e.key == '1') {
        AUTO_HARVEST = !AUTO_HARVEST;
    } else if (e.key == '2') {
        AUTO_PLANT = !AUTO_PLANT;
    } else if (e.key == '3') {
        ROTTEN_GONE = !ROTTEN_GONE;
    } else if (e.key == '4') {
        VALID_PLANTING = !VALID_PLANTING;
    }
});


function random_planter() {
    if (AUTO_PLANT) {
        var random_pos = [Math.random() * fieldWidth, Math.random() * fieldHeight]
        if (VALID_PLANTING) {
            // TODO: check border collision

            // checks if the future plant has room to growth
            for (var i = 0; i < plants.length; i++) {
                var plant = plants[i];
                var distance = Math.sqrt(Math.pow(plant.x - random_pos[0], 2) + Math.pow(plant.y - random_pos[1], 2));
                if (distance < 2 * plant.max_size) {
                    return;
                }
            }
        }
        plant_at_location(random_pos[0], random_pos[1]);
    }
}

function remove_rotten_plants() {
    for (var i = 0; i < plants.length; i++) {
        var plant = plants[i];
        if (plant.is_rotten && (Date.now() - plant.born_time)/1000 > rotten_gone_time) {
            plants.splice(i, 1);
        }
    }
}

setInterval(draw, 1000/60);
setInterval(random_planter, auto_plant_time * 1000);


