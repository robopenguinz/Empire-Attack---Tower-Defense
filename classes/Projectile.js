class Projectile extends Sprite {
    constructor({position = {x:0, y:0}, enemy, damage = 20}) {
        super({ position, imageSrc: 'img/projectile.png' })
        this.velocity = {
        x: 0,
        y: 0
    }
    this.enemy = enemy
    this.radius = 10
    this.damage = damage
    this.isChainLightning = isChainLightning
    this.isPiercing = this.isPiercing
    this.source = source
    this.hasHit = []
}

update() {
    this.draw()

    // Check if enemy still exists
    if (!this.enemy || this.enemy.health <= 0) {
        return // Stop updating if enemy is dead/gone
    }

    const angle = Math.atan2(
        this.enemy.center.y - this.position.y,
        this.enemy.center.x - this.position.x 
    )

    const power = 5
    this.velocity.x = Math.cos(angle) * power
    this.velocity.y = Math.sin(angle) * power

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.isChainLightning) {
        c.save()
        c.strokeStyle = 'cyan'
        c.lineWidth = 2
        c.beginPath()
        c.arc(this.position.x, this.position.y, 15, 0, Math.PI * 2)
        c.stroke()
        c.restore()
    }

    if (this.isPiercing) {
        c.save()
        c.strokeStyle = 'yellow'
        c.lineWidth = 3
        c.beginPath()
        c.arc(this.position.x, this.position.y, 12, 0, Math.PI * 2)
        c.stroke()
        c.restore()
    }
}
}
