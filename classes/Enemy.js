class Enemy extends Sprite{
    constructor({position = {x:0, y:0}, speed = 3, type = 'tank'}) {
        //Different sprites for different types
        let imageSrc = 'img/orc.png'
        if (type === 'scout') imageSrc = 'img/orc.png'
        if (type === 'boss') imageSrc = 'img/orc.png'

        super({ 
            position, 
            imageSrc: imageSrc, 
            frames: {
                max: 7
            }
        })
        this.position = position
        this.width = 100
        this.height = 100
        this.waypointIndex = 0
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }
        this.type = type
        this.speed = speed

        // Stats based on type
        if (type === 'tank') {
            this.radius = 50
            this.health = Math.round(100 + (3.5 - speed) * 30)
            this.maxHealth = this.health
            this.color = 'rgba(255, 0, 0, 0.3)'
            this.coinValue = 50
        } else if (type === 'scout') {
            this.radius = 45
            this.health = 50
            this.maxHealth = 50
            this.color = 'rgba(0, 100, 255, 0.3)'
            this.dodgeChance = 0.2
            this.coinValue = 25
        } else if (type === 'boss') {
            this.radius = 70
            this.health = 300
            this.maxHealth = 300
            this.shield = 150
            this.maxShield = 150
            this.color = 'rgba(150, 0, 255, 0.3)'
            this.regenRate = 0.5
            this.coinValue = 100
        }

        this.velocity = {
            x:0,
            y: 0
        }
        
    }

    draw() {
        c.save()
        c.globalAlpha = 0.5
        c.fillStyle = this.color
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.restore()

        super.draw()

    // Status effect overlays
    if (this.frozen) {
        c.save()
        c.globalAlpha = 0.6
        c.fillStyle = 'cyan'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.restore()
    }

    if (this.poisoned) {
        c.save()
        c.globalAlpha = 0.4
        c.fillStyle = 'green'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.restore()
    }

    if (this.slowed) {
        c.save()
        c.globalAlpha = 0.4
        c.fillStyle = 'purple'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.restore()
    }
        // Boss shield bar
        if (this.type === 'boss' && this.shield > 0) {
            c.fillStyle = 'cyan'
            c.fillRect(this.position.x, this.position.y - 30, this.width, 8)
            c.fillStyle = 'blue'
            c.fillRect(this.position.x, this.position.y - 30, this.width * (this.shield / this.maxShield), 8)
        }

        //health bar
        c.fillStyle = 'red'
        c.fillRect(this.position.x, this.position.y - 15, this.width, 10)
    
        c.fillStyle = 'green'
        c.fillRect(this.position.x, this.position.y - 15, this.width * (this.health / this.maxHealth), 10)

        //label for boss
        if (this.type === 'boss') {
            c.fillStyle = 'white'
            c.font = 'bold 12px Arial'
            c.textAlign = 'center'
            c.strokeStyle = 'black'
            c.lineWidth = 3
            c.strokeText('BOSS', this.position.x + this.width / 2, this.position.y - 35)
            c.fillText('BOSS', this.position.x + this.width / 2, this.position.y - 35)
        }
    }

    update() {
        this.draw()
        super.update()

        if (this.type === 'boss' && this.health < this.maxHealth && this.health > 0) {
            this.health = Math.min(this.health + this.regenRate, this.maxHealth)
        }
       
    // Handle freeze
    if (this.frozen) {
        this.frozenTimer--
        if (this.frozenTimer <= 0) {
            this.frozen = false
        }
        return // Don't move while frozen
    }

    // Handle poison
    if (this.poisoned) {
        this.poisonTimer--
        this.poisonTickCounter++
        
        if (this.poisonTickCounter >= this.poisonTickRate) {
            this.takeDamage(this.poisonDamage)
            this.poisonTickCounter = 0
        }
        
        if (this.poisonTimer <= 0) {
            this.poisoned = false
        }
    }

    // Handle slow
    if (this.slowed) {
        this.slowTimer--
        if (this.slowTimer <= 0) {
            this.slowed = false
            this.speed = this.originalSpeed
        }
    }
   
        const waypoint = waypoints[this.waypointIndex]
        const yDistance = waypoint.y - this.center.y
        const xDistance = waypoint.x - this.center.x
        const angle = Math.atan2(yDistance, xDistance)
        
        this.velocity.x = Math.cos(angle) * this.speed
        this.velocity.y = Math.sin(angle) * this.speed

        this.position.x += this.velocity.x 
        this.position.y += this.velocity.y 

        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }

        if (
            Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) < 
            Math.abs(this.velocity.x) &&
            Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) < 
            Math.abs(this.velocity.y) && 
            this.waypointIndex < waypoints.length - 1
        ) {
            this.waypointIndex++
        }
    }

takeDamage(damage) {
    if (this.type === 'scout' && Math.random() < this.dodgeChance) {
        // dodge indicator
        return false 
    }

    if (this.type === 'boss' && this.shield > 0) {
        this.shield -= damage
        if (this.shield < 0) {
            this.health += this.shield
            this.shield = 0
        }
    } else {
        this.health -= damage
    }
    return true
}
}