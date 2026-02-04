const canvas = document.querySelector('canvas' )
const c = canvas.getContext('2d')

canvas.width = 1280
canvas.height = 768

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

const image = new Image()

image.onload = () => {
    animate()
}
image.src = 'img/map1.png'

class Ememy {
    constructor({position = {x:0, y:0}}) {
    this.position = position
    this.width = 100
    this.height = 100
    this.waypointIndex = 0
    }

draw() {
    c.fillStyle = 'red'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
}

update() {
    this.draw()
   
    const waypoint = waypoints[this.waypointIndex]
    const yDistance = waypoint.y -this.position.y
    const xDistance = waypoint.x -this.position.x
    const angle = Math.atan2(yDistance, xDistance)
    this.position.x += Math.cos(angle)
    this.position.y += Math.sin(angle)

    console.log(Math.round(this.position.x))

    if (
        this.position.x === waypoint.x && 
        this.position.y === waypoint.y
    ) {
        this.waypointIndex++
    }
}
}

const ememy = new Ememy({position: {x:200, y:400}})
const ememy2 = new Ememy({position: {x:400, y:400}})


function animate() {
    requestAnimationFrame(animate)

    c.drawImage(image, 0, 0)
    ememy.update()
    ememy2.update()
}

let x = 200
function animate() {
    requestAnimationFrame(animate)

    c.drawImage(image, 0, 0)

    c.fillStyle = 'red'
    c.fillRect(200, 400, 100, 100)
    x++
}
