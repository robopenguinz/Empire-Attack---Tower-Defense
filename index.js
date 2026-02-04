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
    }

draw() {
    c.fillStyle = 'red'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
}

update() {
    this.draw()
    this.position.x += 1
   
    const angle = Math.atan2(yDistance, xDistance)
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
