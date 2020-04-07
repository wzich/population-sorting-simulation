const UPDATES_PER_SEC = 20;
const SHAPE_WIDTH = 10;
const MAX_SPEED = 30;
const ATTRACTOR_STRENGTH = 50000;

const ATTRACTOR_STRENGTH_MINIMUM = 5000;
const ATTRACTOR_STRENGTH_MAXIMUM = 95000;

const RACISM_SEVERITY_MIN = 1;
const RACISM_SEVERITY_MAX = 5;

const palette = {
  'blue': '#00B9AE',
  'black': '#03120E',
  'green': '#71B340',
  'coral': '#FA824C',
  'red': '#D7263D',
  'yellow': '#FFFB46'
};

function getHex(name) {
  return palette[name];
}

function getValueOf(input) {
  let value = document.getElementById(input).value;
  switch (input) {
    case 'ATTRACTOR_STRENGTH':
      return (1 - value/100) * (ATTRACTOR_STRENGTH_MAXIMUM - ATTRACTOR_STRENGTH_MINIMUM) + ATTRACTOR_STRENGTH_MINIMUM;
      break;
    case 'RACISM_SEVERITY':
      return (value/100) * (RACISM_SEVERITY_MAX - RACISM_SEVERITY_MIN) + RACISM_SEVERITY_MIN;
      break;
    default:
      console.log('Unknown input: ' + input);
      break;
  }
}

function getDistance(point1, point2) {
  let vector_x = point1.x-point2.x;
  let vector_y = point1.y-point2.y;
  return Math.sqrt(vector_x**2 + vector_y**2);
}

function getUnitVector(vector) {
  let magnitude = Math.sqrt(vector.x*vector.x+vector.y*vector.y);
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude
  };
}

class ShapeCollection {
  constructor(distribution) {
    this.distrubtion = distribution;
    this.shapes = {};
    for (var type in distribution) {
      let pos = {
        x: 500 + 700 * (Math.random() - 0.5),
        y: 500 + 700 * (Math.random() - 0.5)
      };
      this.shapes[type] = new Array(distribution[type]).fill(null).map(() => new Shape(type, {x: 500 + 700 * (Math.random() - 0.5), y: 500 + 700 * (Math.random() - 0.5)}, {x: 3*Math.random()-0.5, y: 3*Math.random()-0.5}, SHAPE_WIDTH));
    }
  }

  getAll() {
    let allShapes = [];
    for (var type in this.shapes) {
      for (var shape of this.shapes[type]) {
        allShapes.push(shape);
      }
    }
    return allShapes;
  }
}

class Shape extends ShapeCollection {
  constructor(type, position, vector, size) {
    super();
    this.type = type;
    this.position = position;
    this.x = position.x;
    this.y = position.y;
    this.vector_x = vector.x;
    this.vector_y = vector.y;
    this.size_x = size.x;
    this.size_y = size.y;
    this.getAllShapes = super.getAll;
  }

  updatePosition(t) {
    // if ((this.x + this.vector_x * t) > 20 && (this.x + this.vector_x * t < 980)) {
    //   this.x = this.x + (this.vector_x * t);
    // }
    // if ((this.y + this.vector_y * t > 20) && (this.y + this.vector_y * t < 980)) {
    //   this.y = this.y + (this.vector_y * t);
    // }
    this.x = this.x + (this.vector_x * t);
    this.y = this.y + (this.vector_y * t);
  }

  getPosition() {
    return {x: this.x, y: this.y};
  }

  updateAndGetPosition(t) {
    this.updatePosition(t * UPDATES_PER_SEC);
    return this.getPosition();
  }

  updateVector(allShapes) {
    let proximity_x = 0;
    let proximity_y = 0;
    let currentRacismSeverity = getValueOf('RACISM_SEVERITY');
    for (var shape of allShapes) {
      if ((shape.x == this.x) && (shape.y == this.y)) {
        continue;
      }
      let repulsionCoefficient = 1;
      let distsq = ((this.x - shape.x) / repulsionCoefficient) ** 2 + ((this.y - shape.y) / repulsionCoefficient) ** 2;
      let force_x = Math.sign(this.x - shape.x) / distsq;
      let force_y = Math.sign(this.y - shape.y) / distsq;
      if (shape.type != this.type) {
        force_x = force_x * currentRacismSeverity;
        force_y = force_y * currentRacismSeverity;
      }
      proximity_x = proximity_x - force_x;
      proximity_y = proximity_y - force_y;
    }
    let currentAttractorStrength = getValueOf('ATTRACTOR_STRENGTH');
    this.vector_x = (500-this.x)/currentAttractorStrength-proximity_x;
    this.vector_y = (500-this.y)/currentAttractorStrength-proximity_y;
    let magnitude = Math.sqrt(this.vector_x ** 2 + this.vector_y ** 2)
    if (magnitude * currentAttractorStrength > MAX_SPEED) {
      let unitVector = getUnitVector({x: this.vector_x, y: this.vector_y});
      this.vector_x = unitVector.x * MAX_SPEED / currentAttractorStrength;
      this.vector_y = unitVector.y * MAX_SPEED / currentAttractorStrength;
      magnitude = Math.sqrt(this.vector_x ** 2 + this.vector_y ** 2);
    }
    if (Math.random() < (1/10000)) {
      // console.log(magnitude * ATTRACTOR_STRENGTH);
    }
  }
}



// Draw all shapes on canvas
function draw() {
  var now = new Date().getTime() / 1000;
  timeElapsed = now - start;

  ctx.clearRect(0, 0, 1000, 1000);
  for (var shape of shapes) {
    ctx.beginPath();
    // avgPositionsByType = collection.getAvgPositionsByType()
    shape.updateVector(collection.getAll());
    var circPos = shape.updateAndGetPosition(timeElapsed);
    ctx.arc(circPos.x, circPos.y, SHAPE_WIDTH, 0, 2*Math.PI);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = getHex(shape.type);
    ctx.fill();
  }

  window.requestAnimationFrame(draw);

}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function genRandomShape() {
  return new Shape (['yellow', 'blue', 'red', 'green'][Math.floor(Math.random()*4)], {x: 500, y: 500}, {x: 3*Math.random()-0.5, y: 3*Math.random()-0.5}, 10);
}

let collection = new ShapeCollection({
  'red': 100,
  'blue': 70
});

let shapes = collection.getAll();

function generate() {
  let RED_POPULATION = parseInt(document.getElementById('RED_POPULATION').value);
  let BLUE_POPULATION = parseInt(document.getElementById('BLUE_POPULATION').value);
  let YELLOW_POPULATION = parseInt(document.getElementById('YELLOW_POPULATION').value);
  let GREEN_POPULATION = parseInt(document.getElementById('GREEN_POPULATION').value);
  let CORAL_POPULATION = parseInt(document.getElementById('CORAL_POPULATION').value);
  console.log([RED_POPULATION, BLUE_POPULATION, YELLOW_POPULATION]);
  collection = new ShapeCollection({
    'red': RED_POPULATION,
    'blue': BLUE_POPULATION,
    'yellow': YELLOW_POPULATION,
    'green': GREEN_POPULATION,
    'coral': CORAL_POPULATION
  });
  shapes = collection.getAll();
  console.log(shapes.length);
}

const start = new Date().getTime() / 1000;

window.requestAnimationFrame(draw);
