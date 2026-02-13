class Building extends Sprite {
    constructor({position = {x: 0, y: 0}, type = 'rock'}) {
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
        this.type = type
        this.level = 1

        this.shotsFired = 0
        this.ultimateCooldown = 0

        this.updateStats()
    }

updateStats() {
    // base stats by tower type
    if (this.type === 'rock') {
        this.name = 'Rock Launcher'
        this.color = 'rgba(0, 0, 255, 0.2)'
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
        this.ultimateAbility = 'chain_lightning'
    }
} else if (this.type === 'sniper') {
    this.name = 'Sniper Tower'
    this.color = 'rgba(255, 0, 0, 0.2)'
    if (this.level === 1) {
        this.radius = 400
        this.damage = 50
        this.fireRate = 8
    } else if (this.level === 2) {
        this.radius = 450
        this.damage = 75
        this.fireRate = 6
    } else if (this.level === 3) {
        this.radius = 500
        this.damage = 100
        this.fireRate = 4
        this.ultimateAbility = 'piercing_shot'
    } 
} else if (this.type === 'rapid') {
    this.name = 'Rapid Fire'
    this.color = 'rgba(0, 255, 0, 0.2)'
    if (this.level === 1) {
        this.radius = 180
        this.damage = 8
        this.fireRate = 1
    } else if (this.level === 2) {
        this.radius = 220
        this.damage = 12
        this.fireRate = 1
    } else if (this.level === 3) {
        this.radius = 260
        this.damage = 16
        this.fireRate = 1
        this.ultimateAbility = 'bullet_storm'
    }
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

    //Max level glow effect
    if (this.level === 3) {
        c.save()
        c.globalAlpha = 0.3
        c.beginPath()
        c.arc(this.center.x, this.center.y, 40, 0, Math.PI * 2)
        if (this.type === 'rock') c.fillStyle ='blue'
        if (this.type === 'sniper') c.fillStyle = 'red'
        if (this.type === 'rapid') c.fillStyle = 'green'
        c.fill()
        c.restore()
    }
}

    update() {
        this.draw()

        if (this.ultimateCooldown > 0) {
            this.ultimateCooldown--
        }

        if (this.target || !this.target && this.frames.current !== 0) 
            super.update()

        if (
            this.target && this.frames.current === 6 && this.frames.elapsed % this.frames.hold === 0) 
            this.shoot()

        if (this.level === 3 && this.type === 'rapid' && this.ultimateCooldown <= 0) {
            this.bulletStorm()
            this.ultimateCooldown = 300
        }
    }

    shoot() {
        this.shotsFired++

        const isChainLightning = this.level === 3 && this.type === 'rock' && this.shotsFired % 5 === 0

        this.projectiles.push(
            new Projectile({
                position: {
                    x: this.center.x - 20,
                    y: this.center.y - 110
                },
                enemy: this.target,
                damage: this.damage,
                isChainLightning: isChainLightning,
                isPiercing: this.level === 3 && this.type === 'sniper',
                source: this
            })
        )
    }

    bulletStorm() {
        //Fires 10 shots fast 
        for (let i = 0; i < 10; i++) {
            if (this.target) {
                this.projectiles.push(
                    new Projectile({
                        position: {
                            x: this.center.x - 20 + (Math.random() - 0.5) * 20,
                            y: this.center.y - 110 + (Math.random() - 0.5) * 20
                        },
                        enemy: this.target,
                        damage: this.damage,
                        source: this
                    })
                )
            }
        }  
    }
}
