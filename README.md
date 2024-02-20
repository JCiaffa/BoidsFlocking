"# BoidsFlocking" 
Boids is an artificial life program, developed by Craig Reynolds in 1986, which simulates the flocking behaviour of birds. The name “boid” corresponds to a shortened version of “bird-oid object”, which refers to a bird-like object.

As with most artificial life simulations, Boids is an example of emergent behavior; that is, the complexity of Boids arises from the interaction of individual agents (the boids, in this case) adhering to a set of simple rules. 

Simple boids follow three main rules:

Separation: steer to avoid crowding local flockmates
Alignment: steer towards the average heading of local flockmates
Cohesion: steer towards the average position of local flockmates

Containing the boids to a box, or any shape for that matter, is as simple as flipping the sign of an individual boids velocity when it encounters 
the boundary of its container. 

By tweaking the degree to which boids attempt to adhere to these rules we can change the general behavior of the flock. The basic model has been extended in many ways since Reynolds proposed it. For example, Delgado-Mata et al. extended the basic model to incorporate the effects of fear. Olfaction was used to transmit emotion between boids, through pheromones modelled as particles in a free expansion gas. 
