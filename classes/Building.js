class Building extends Sprite {
    constructor({position = {x: 0, y: 0}}) {
        super({
            position, 
            imageSrc: './img/tower.png', 
            frames: {
                max: 19
            },
            offset: {
                x:0,
                y: -80
            }
        })
        
        this.width = 64*2
        this.height = 64
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }
        this.projectiles = []
       this.radius = 250 
       this.target = null
       this.elapsedSpawnTime = 0
    }

    update() {
        super.draw()

         c.beginPath()
         c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2)
         c.fillStyle = 'rgba(0, 0, 255, .2)'
         c.fill()

        if (this.elapsedSpawnTime % 100 === 0 && this.target) {
        this.projectiles.push(
            new Projectile({
                position: {
                    x: this.center.x,
                    y: this.center.y
                },
                enemy: this.target
            })
        )
        }

        this.elapsedSpawnTime++
    }
}