let flock;
let radius;
let radiusCoefficients = [0.65, 0.8, 1, 1.25, 1.75];
let colors = ["#f89c44", "#ef6085", "#f0ba45", "#cd5fa1"];
let boidsCount = 50;
var boidsCanvas = document.getElementById("boidsCanvas");
var boidsCanvasInfo = boidsCanvas.getBoundingClientRect();
var size = {
  width: boidsCanvasInfo.width,
  height: boidsCanvasInfo.height,
};
if (size.width / 200 > 4) {
  radius = 16;
} else if (size.width / 200 < 4) {
  radius = 8;
} else {
  radius = size.width / 200;
}

function randomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)];
}
function radiusCoefficient(coefficients) {
  return coefficients[Math.floor(Math.random() * coefficients.length)];
}

function setup() {
  class Utils {
    // Calculate the Width in pixels of a Dom element
    static elementWidth(element) {
      return (
        element.clientWidth -
        parseFloat(
          window
            .getComputedStyle(element, null)
            .getPropertyValue("padding-left")
        ) -
        parseFloat(
          window
            .getComputedStyle(element, null)
            .getPropertyValue("padding-right")
        )
      );
    }

    // Calculate the Height in pixels of a Dom element
    static elementHeight(element) {
      return (
        element.clientHeight -
        parseFloat(
          window.getComputedStyle(element, null).getPropertyValue("padding-top")
        ) -
        parseFloat(
          window
            .getComputedStyle(element, null)
            .getPropertyValue("padding-bottom")
        )
      );
    }
  }

  // Create Canvas
  p5Div = document.getElementById("boidsCanvas");
  const p5Canvas = createCanvas(
    Utils.elementWidth(p5Div),
    Utils.elementHeight(p5Div)
  );
  p5Canvas.parent(p5Div);
  startingx = boidsCanvasInfo.width / 2 - 75;
  startingy = boidsCanvasInfo.height / 2 - 75;
  cheight = boidsCanvasInfo.height;
  flock = new Flock();
  for (let i = 0; i < boidsCount; i++) {
    cwidth = boidsCanvasInfo.width;
    cheight = boidsCanvasInfo.height;
    //   initial boid positioning
    let b = new Boid(startingx, startingy);
    flock.addBoid(b);
  }

  function windowResized() {
    resizeCanvas(Utils.elementWidth(p5Div), Utils.elementHeight(p5Div), true);
  }

  let resizeObserver = new ResizeObserver(() => {
    windowResized();
  });

  resizeObserver.observe(boidsCanvas);
}

function draw() {
  clear();
  flock.run();
}

// Manages Boids Array
function Flock() {
  this.boids = [];
}
Flock.prototype.run = function () {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids); // Passing the entire list of boids to each boid individually
  }
};
Flock.prototype.addBoid = function (b) {
  this.boids.push(b);
};

// Boid class
function Boid(x, y) {
  radius = radius;
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.fillColor = randomColor(colors);
  this.r = radius * radiusCoefficient(radiusCoefficients);
  this.mass = (4 / 3) * Math.PI * Math.pow(this.r, 3);
  this.maxspeed = 2; // Maximum speed 1.75
  this.maxforce = 0.03; // Maximum steering force 0.03
}

Boid.prototype.run = function (boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.render();
};

Boid.prototype.applyForce = function (force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
};

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function (boids) {
  let sep = this.separate(boids); // Separation
  let ali = this.align(boids); // Alignment
  let coh = this.cohesion(boids); // Cohesion

  // Arbitrarily weight these forces
  sep.mult(8);
  ali.mult(0.5);
  coh.mult(0.5);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
};

// Method to update location
Boid.prototype.update = function () {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset acceleration to 0 each cycle
  this.acceleration.mult(0);
};

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function (target) {
  let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target

  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxforce); // Limit to maximum steering force
  return steer;
};

Boid.prototype.render = function () {
  // Draw a triangle rotated in the direction of velocity
  fill(this.fillColor);
  stroke(this.fillColor);
  push();
  translate(this.position.x, this.position.y);
  beginShape();
  circle(this.position.x, this.position.y, this.r);
  endShape(CLOSE);
  pop();
};

// Boundary
Boid.prototype.borders = function () {
  let buffer = 5;
  let bump = 1;

  // boundaries & sticking prevention
  // left
  if (this.position.x < this.r + buffer) this.velocity.x = this.velocity.x * -1;
  if (this.position.x < this.r + buffer - 1) this.position.x += bump;
  // top
  if (this.position.y < this.r + buffer) this.velocity.y = this.velocity.y * -1;
  if (this.position.y < this.r + buffer - 1) this.position.y += bump;
  // right
  if (this.position.x > width / 2 - this.r - buffer)
    this.velocity.x = this.velocity.x * -1;
  if (this.position.x > width / 2 - this.r - buffer - 1)
    this.position.x -= bump;
  // bottom
  if (this.position.y > height / 2 - this.r - buffer)
    this.velocity.y = this.velocity.y * -1;
  if (this.position.y > height / 2 - this.r - buffer - 1) {
    this.position.y -= bump;
  }
  //  prevent sticking
};

// Separation
Boid.prototype.separate = function (boids) {
  let desiredseparation = 20;
  let steer = createVector(0, 0);
  let count = 0;
  // For every boid in the system, check if it's too close
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if (d > 0 && d < desiredseparation) {
      // Calculate vector pointing away from neighbor
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d); // Weight by distance
      steer.add(diff);
      count++; // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }
  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
};

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function (boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < neighbordist) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function (boids) {
  let neighbordist = 75;
  let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < neighbordist) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum); // Steer towards the location
  } else {
    return createVector(0, 0);
  }
};
