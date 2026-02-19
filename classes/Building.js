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
        this.pulseValue = 0
        this.killCount = 0
        this.targetingMode = 'first'

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
        this.damage = 300
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
        this.damage = 750
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
        this.damage = 120
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

    //Max level glow effect with pulse
    if (this.level === 3) {
        this.pulseValue += 0.05
        const pulseAlpha = 0.3 + Math.sin(this.pulseValue) * 0.15
        const pulseRadius = 40 + Math.sin(this.pulseValue) * 5
        
        c.save()
        c.globalAlpha = pulseAlpha
        c.beginPath()
        c.arc(this.center.x, this.center.y, pulseRadius, 0, Math.PI * 2)
        if (this.type === 'rock') c.fillStyle ='blue'
        if (this.type === 'sniper') c.fillStyle = 'red'
        if (this.type === 'rapid') c.fillStyle = 'green'
        c.fill()
        c.restore()
    }

    // Fusion tower epic glow
    if (this.isFusion) {
        c.save()
        c.globalAlpha = 0.4
        c.beginPath()
        c.arc(this.center.x, this.center.y, 60, 0, Math.PI * 2)
        const gradient = c.createRadialGradient(this.center.x, this.center.y, 0, this.center.x, this.center.y, 60)
        gradient.addColorStop(0, 'rgba(255,0,255,0.8)')
        c.fillStyle = gradient
        c.fill()
        c.restore()
    }
}

    update() {
        this.draw()
        

        if (this.ultimateCooldown > 0) {
            this.ultimateCooldown--
        }

       // Activate fusion ultimate when ready
    if (this.isFusion && this.ultimateAbility && this.ultimateCooldown === 0) {
        this.activateUltimate(enemies)
    }

    if (this.target || !this.target && this.frames.current !== 0) 
        super.update()

    if (this.target && this.frames.current === 6 && this.frames.elapsed % this.frames.hold === 0) 
        this.shoot()

    if (this.level === 3 && this.type === 'rapid' && this.frames.current === 6 && this.frames.elapsed % this.frames.hold === 0 && this.ultimateCooldown <= 0) {
        this.bulletStorm()
        this.ultimateCooldown = 300
    }
}

    shoot() {
        this.shotsFired++

        // Play shoot sound
        const shootSound = document.querySelector('#shootSound')
        if (shootSound) {
            shootSound.currentTime = 0
            shootSound.volume = 0.15
            shootSound.play().catch(e => {})
        }

        const isChainLightning = this.level === 3 && this.type === 'rock' && this.shotsFired % 5 === 0

        // Minigun multi-shot
        if (this.multiShot && this.isFusion) {
            const nearbyEnemies = enemies.filter(enemy => {
                const dist = Math.hypot(enemy.center.x - this.center.x, enemy.center.y - this.center.y)
                return distance < this.radius && enemy.health > 0
            }).slice(0, 3)

            nearbyEnemies.forEach(enemy => {
                this.projectiles.push(
                    new Projectile({
                        position: {
                            x: this.center.x - 20,
                            y: this.center.y - 110
                        },
                        enemy: enemy,
                        damage: this.damage,
                        source: this
                    })
                )
            })
            return
        }

        this.projectiles.push(
            new Projectile({
                position: {
                    x: this.center.x - 20,
                    y: this.center.y - 110
                },
                enemy: this.target,
                damage: this.damage,
                isChainLightning: isChainLightning,
                isPiercing: (this.level === 3 && this.type === 'sniper') || this.fusionType === 'railgun_destroyer',
                splashDamage: this.splashDamage,
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

canFuse() {
    return this.level === 3 && !this.isFusion
}

getFusionType(otherTower) {
    const types = [this.type, otherTower.type].sort().join('_')

    const fusionMap = {
        'rock_rock': 'earthquake_titan',
        'sniper_sniper': 'orbital_cannon',
        'rapid_rapid': 'minigun_fortress',
        'rock_sniper': 'railgun_destroyer',
        'rapid_rock': 'grenade_launcher',
        'rapid_sniper': 'smart_turret'
    }

    return fusionMap[types] || null
}

fuseWith(otherTower) {
    const fusionType = this.getFusionType(otherTower)
    if (!fusionType) return false

    this.isFusion = true
    this.fusionType = fusionType
    this.level = 4 // Special level for fusions

    // Fusion Stats
    if (fusionType === 'earthquake_titan') {
        this.name = 'Earthquake Titan'
        this.radius = 450
        this.damage = 10000
        this.fireRate = 0.2
        this.color = 'rgba(0, 0, 255, 0.5)'
        this.ultimateAbility = 'freeze'
        this.ultimateCooldownMax = 600
        this.ultimateCooldown = 0 
    } else if (fusionType === 'orbital_cannon') {
        this.name = 'Orbital Cannon'
        this.radius = 999999
        this.damage = 4000
        this.fireRate = 1
        this.color = 'rgba(255, 0, 0, 0.5)'
        this.ultimateAbility = 'mass_damage'
        this.ultimateCooldownMax = 450
        this.ultimateCooldown = 0
    }  else if (fusionType === 'minigun_fortress') {
        this.name = 'Minigun Fortress'
        this.radius = 300
        this.damage = 500
        this.fireRate = 0.05
        this.color = 'rgba(0, 255, 0, 0.5)'
        this.multiShot = true
        this.ultimateAbility = 'poison'
        this.ultimateCooldownMax = 750
        this.ultimateCooldown = 0
    } else if (fusionType === 'railgun_destroyer') {
        this.name = 'Railgun Destroyer'
        this.radius = 600
        this.damage = 1000
        this.fireRate = 0.6
        this.color = 'rgba(255, 255, 0, 0.5)'
        this.chargingShot = false
        this.chargeTime = 0
        this.ultimateAbility = 'push_back'
        this.ultimateCooldownMax = 900
        this.ultimateCooldown = 0
    } else if (fusionType === 'grenade_launcher') {
        this.name = 'Grenade Launcher'
        this.radius = 350
        this.damage = 1200
        this.splashDamage = 30
        this.fireRate = 0.3
        this.color = 'rgba(255, 165, 0, 0.5)'
        this.ultimateAbility = 'mass_damage'
        this.ultimateCooldownMax = 450
        this.ultimateCooldown = 0
    } else if (fusionType === 'smart_turret') {
        this.name = 'Smart Turret'
        this.radius = 450
        this.damage = 1600
        this.fireRate = 0.2
        this.color = 'rgba(128, 0, 128, 0.5)'
        this.targetingMode = 'speed' //could be speed, health, or boss
        this.ultimateAbility = 'slow'
        this.ultimateCooldownMax = 600
        this.ultimateCooldown = 0
    }

    this.frames.hold = this.fireRate
    return true
}

activateUltimate(enemies) {
    if (!this.ultimateAbility) return 

    console.log(`${this.name} activated ${this.ultimateAbility}!`)

    if (this.ultimateAbility === 'freeze') {
        // Freeze all enemies
        enemies.forEach(enemy => {
            enemy.frozen = true
            enemy.frozenTimer = 300
        })
    } else if (this.ultimateAbility === 'push_back') {
        // Push enemies back
        enemies.forEach(enemy => {
            if (enemy.waypointIndex > 0) {
                // move back
                const prevWaypoint = waypoints[Math.max(0, enemy.waypointIndex - 2)]
                enemy.position.x = prevWaypoint.x - 100
                enemy.position.y = prevWaypoint.y
                enemy.waypointIndex = Math.max(0, enemy.waypointIndex - 2)
                enemy.center = {
                    x: enemy.position.x + enemy.width / 2,
                    y: enemy.position.y + enemy.height / 2
                }
            }
        })
     } else if (this.ultimateAbility === 'mass_damage') {
        // Deal 150 damage to all enemies
        enemies.forEach(enemy => {
            enemy.takeDamage(1500)
        })
    } else if (this.ultimateAbility === 'poison') {
        // Poison all enemies (10 damage per second for 5 seconds)
        enemies.forEach(enemy => {
            enemy.poisoned = true
            enemy.poisonTimer = 300 // 5 seconds
            enemy.poisonDamage = 100
            enemy.poisonTickRate = 60 // Damage every second
            enemy.poisonTickCounter = 0
        })
    } else if (this.ultimateAbility === 'slow') {
        // Slow all enemies by 50% for 10 seconds
        enemies.forEach(enemy => {
            if (!enemy.originalSpeed) {
                enemy.originalSpeed = enemy.speed
            }
            enemy.slowed = true
            enemy.slowTimer = 600 // 10 seconds
            enemy.speed = enemy.originalSpeed * 0.5
        })
    }

    this.ultimateCooldown = this.ultimateCooldownMax
}
}