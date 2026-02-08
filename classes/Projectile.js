class Projectile extends Sprite {
    constructor({position = {x:0, y:0}, enemy}) {
        super({ position, imageSrc: 'img/projectile.png' })
        this.velocity = {
        x: 0,
        y: 0
    }
    this.enemy = enemy
    this.radius = 10
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
}
}
