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
        this.level = 1
        this.updateStats()
    }

updateStats() {

    if (this.level === 1) {
        this.radius = 250
        this.damage = 20
        this.fireRate = 3
    } else if (this.level === 2) {
        this.radius = 300
        this.damage = 30
        this.fireRate = 2
    } else if (this.level === 3) {
        this.radius = 350
        this.damage = 40
        this.fireRate = 1
    }

    this.frames.hold = this.fireRate
}

upgrade() {
    if (this.level < 3) {
        this.level++
        this.updateStats()
        return true
    }
    return false
}

getUpgradeCost() {
    if (this.level === 1) return 75
    if (this.level === 2) return 100
    return 0
}

draw() {
    super.draw()
}

    update() {
        this.draw()
        if (this.target || !this.target && this.frames.current !== 0) 
            super.update()

        if (
            this.target && this.frames.current === 6 && this.frames.elapsed % this.frames.hold === 0) this.shoot()
    }

    shoot() {
        this.projectiles.push(
            new Projectile({
                position: {
                    x: this.center.x - 20,
                    y: this.center.y - 110
                },
                enemy: this.target,
                damage: this.damage
            })
        )
    }
}