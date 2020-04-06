const UPDATES_PER_SEC = 20;
const SHAPE_WIDTH = 10;

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
    if ((this.x + this.vector_x * t) > 20 && (this.x + this.vector_x * t < 980)) {
      this.x = this.x + (this.vector_x * t);
    }
    if ((this.y + this.vector_y * t > 20) && (this.y + this.vector_y * t < 980)) {
      this.y = this.y + (this.vector_y * t);
    }
    // this.x = this.x + (this.vector_x * t);
    // this.y = this.y + (this.vector_y * t);
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
    for (var shape of allShapes) {
      if ((shape.x == this.x) && (shape.y == this.y)) {
        continue;
      }
      let repulsionCoefficient = 1;
      let distsq = ((this.x - shape.x) / repulsionCoefficient) ** 2 + ((this.y - shape.y) / repulsionCoefficient) ** 2;
      let force_x = Math.sign(this.x - shape.x) / distsq;
      let force_y = Math.sign(this.y - shape.y) / distsq;
      if (shape.type != this.type) {
        force_x = force_x * 3;
        force_y = force_y * 3;
      }
      proximity_x = proximity_x - force_x;
      proximity_y = proximity_y - force_y;
    }
    // let unitVector = getUnitVector({x: proximity_x, y: proximity_y});
    this.vector_x = (500-this.x)/55000-proximity_x;
    this.vector_y = (500-this.y)/55000-proximity_y;
  }
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function genRandomShape() {
  return new Shape (['yellow', 'blue', 'red', 'green'][Math.floor(Math.random()*4)], {x: 500, y: 500}, {x: 3*Math.random()-0.5, y: 3*Math.random()-0.5}, 10);
}

collection = new ShapeCollection({
  'red': 100,
  'blue': 100,
  'green': 100
});
let shapes = collection.getAll();
const start = new Date().getTime() / 1000;

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
    ctx.fillStyle = shape.type;
    ctx.fill();
  }

  window.requestAnimationFrame(draw);

}

window.requestAnimationFrame(draw);
