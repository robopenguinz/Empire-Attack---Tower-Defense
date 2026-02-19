const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const TOWER_COST = 50;
const TOWER_COSTS = {
    rock : 50,
    sniper: 75,
    rapid: 40
}

const UPGRADE_COSTS = [75, 100];
const SELL_REFUND_Percent = 0.5;
let hoveredBuildingForSell = null;
let selectedBuilding = null;
let selectedTowerType = 'rock';

canvas.width = 1280
canvas.height = 768

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

class DamageNumber {
    constructor(x, y, damage, isCrit = false) {
        this.x = x
        this.y = y
        this.damage = damage
        this.isCrit = isCrit
        this.opacity = 1
        this.vel = -2
        this.lifetime = 60
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.font = this.isCrit ? 'bold 32px "Changa One"' : 'bold 20px "Chnaga One"'
        c.textAlign = 'center'

        if (this.isCrit) {
            c.fillStyle = '#ff0000'
            c.shadowColor = '#ff0000'
            c.shadowBlur = 10
        } else {
            c.fillStyle = '#ffff00'
        }

        c.strokeStyle = 'black'
        c.lineWidth = 3
        const text = this.isCrit ? `CRIT! ${this.damage}` : this.damage.toString()
        c.strokeText(text, this.x, this.y)
        c.fillText(text, this.x, this.y)
        c.restore()
    }

    update() {
        this.y += this.vel
        this.lifetime--
        this.opacity = this.lifetime / 60
    }
}

console.log(placementTilesData)
const placementTilesData2D = []

for (let i = 0; i < placementTilesData.length; i += 20) {
    placementTilesData2D.push(placementTilesData.slice(i, i + 20))
}

const placementTiles = []

placementTilesData2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 14) {
            placementTiles.push(new PlacementTile({
                position: {
                    x: x * 64,
                    y: y * 64
                }
            }))
        }
    })
})

const image = new Image()

image.onload = () => {
    animate()
}
image.src = 'img/map1.png'

const enemies = []  

function spawnEnemies(spawnCount, isFinalWave = false) {
    for (let i = 1; i < spawnCount + 1; i++) {
        const xOffset = isFinalWave ? Math.random() * 300: i * 150

        let enemyType
        let enemySpeed

        const typeRoll = Math.random()
        if (typeRoll < 0.7) {
            enemyType = 'tank'
            enemySpeed = Math.random() * 1.5 + 2
        } else if (typeRoll < 0.95) {
            enemyType = 'scout'
            enemySpeed = Math.random() * 2 + 4
        } else {
            enemyType = 'boss'
            enemySpeed = 3
        }

        enemies.push(
            new Enemy({
                position: {x: waypoints[0].x - xOffset, y: waypoints[0].y},
                speed: enemySpeed,
                type: enemyType
            })
        ) 
    }

    const hasBoss = enemies.some(enemy => enemy.type === 'boss')

    if (!hasBoss && spawnCount > 2) {
        const xOffset = isFinalWave ? Math.random() * 75 : (spawnCount + 1) * 25
        enemies.push (
            new Enemy({
                position: {x: waypoints[0].x - (spawnCount + 1) * 150, y: waypoints[0].y},
                speed: 3,
                type: 'boss'
            })
        )
    }
}

const buildings = []
let activeTile = undefined
let enemyCount = 3
let hearts = 10
let coins = 150
let waveStarted = false
let currentWave = 1
const maxWaves = 6
let fusionCount = 0
const maxFusions = 3
let selectedFusionTower = null
let fusionMode = false
const explosions = [] 
let waveStartTime = 0
let waveBonusCoins = 0
let comboCount = 0
let lastKillTime = 0
let comboMultiplier = 1
let critStreak = 0
let damageNumbers = []

let animationId
function animate() {
    animationId = requestAnimationFrame(animate)

    c.drawImage(image, 0, 0)

    if (!gameStarted) return

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i]
        enemy.update()

        // Remove dead enemies
        if (enemy.health <= 0) {
            enemies.splice(i, 1)
            coins += enemy.coinValue
            document.querySelector('#coins').innerHTML = coins
            continue
        }

        if (enemy.position.x > canvas.width) {
            hearts -= 1
            enemies.splice(i, 1)
            document.querySelector('#hearts').innerHTML = hearts
            if (hearts === 0) {
                console.log('Game Over')
                cancelAnimationFrame(animationId)
                document.querySelector('#gameOver').style.display = 'flex'
            }
        }
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i]
        explosion.draw()
        explosion.update()

        if (explosion.frames.current >= explosion.frames.max - 1) {
            explosions.splice(i, 1)
        }
    }

    // Display combo counter
    if (comboCount > 0) {
        // Check if combo should break ( 3 sec w/o kill)
        if (Date.now() - lastKillTime > 3000) {
            comboCount = 0
            comboMultiplier = 1
        } else {
            // Draw combo display
            const comboX = canvas.width - 150
            const comboY = 100

            c.save()
            c.font = 'bold 40px "Changa One"'
            c.textAlign = 'right'

            // Glow effect based on combo size
            if (comboCount >= 20) {
                c.shadowColor = 'gold'
                c.shadowBlur = 20
                c.fillStyle = 'gold'
            } else if (comboCount >= 10) {
                c.shadowColor = 'orange'
                c.shadowBlur = 15 
                c.fillStyle = 'orange'
            } else if (comboCount >= 5) {
                c.shadowColor = 'yellow'
                c.shadowBlur = 10
                c.fillStyle = 'yellow'
            } else {
                c.fillStyle = 'white'
            }

            c.strokeStyle = 'black'
            c.lineWidth = 3
            c.strokeText(`${comboCount}x`, comboX, comboY)
            c.fillText(`${comboCount}x` , comboX, comboY)

            c.font = 'bold 16px "Changa One"'
            c.strokeText('COMBO', comboX, comboY + 25)
            c.fillText('COMBO', comboX, comboY + 25)
            c.restore()
        }
    }

    for (let i = damageNumbers.length - 1; i >= 0; i--) {
        const dmgNum = damageNumbers[i]
        dmgNum.draw()
        dmgNum.update()
        if (dmgNum.lifetime <= 0) {
            damageNumbers.splice(i, 1)
        }
    }

    placementTiles.forEach(tile => {
        tile.update(mouse)
    })
    
    buildings.forEach(building => {
        building.update()
        building.target = null


        let validEnemies = enemies.filter(enemy => {
            const xDifference = enemy.center.x - building.center.x
            const yDifference = enemy.center.y - building.center.y
            const distance = Math.hypot(xDifference, yDifference)
            return distance < enemy.radius + building.radius
        })

        if (validEnemies.length > 0) {
            switch(building.targetingMode) {
                case 'first':
                    validEnemies.sort((a, b) => b.waypointIndex - a.waypointIndex)
                    break
                case 'last':
                    validEnemies.sort((a, b) => a.waypointIndex - b.waypointIndex)
                    break
                case 'strongest':
                    validEnemies.sort((a, b) => b.health - a.health)
                    break
                case 'weakest':
                    validEnemies.sort((a, b) => a.health - b.health)
                    break
            }
            building.target = validEnemies[0]
        }

        if (building === hoveredBuildingForSell) {
           c.beginPath()
           c.arc(building.center.x, building.center.y, building.radius, 0, Math.PI * 2)
           c.fillStyle = building.color
           c.fill()
            
            c.strokeStyle = 'red';
            c.lineWidth = 3;
            c.strokeRect(
                building.position.x,
                building.position.y,
                building.width,
                building.height
            )
            c.fillStyle = 'white'
            c.font = 'bold 20px "Changa One"'
            c.textAlign = 'center'
            c.strokeStyle = 'black'
            c.lineWidth = 3

            const towerName = `Level ${building.level} ${building.name}`
            c.strokeText(towerName, building.center.x, building.position.y - 30)
            c.fillText(towerName, building.center.x, building.position.y - 30)

            // Show kill count
            if (building.killCount > 0) {
                c.font = 'bold 14px "Changa One"'
                c.fillStyle = 'yellow'
                c.strokeText(`💀 ${building.killCount} kills`, building.center.x, building.position.y - 50)
                c.fillText(`💀 ${building.killCount} kills`, building.center.x, building.position.y - 50)
            }

            // Show targeting mode
            c.font = 'bold 12px "Changa One"'
            c.fillStyle = 'cyan'
            const targetText = `Target: ${building.targetingMode.toUpperCase()}`
            c.strokeText(targetText, building.center.x, building.position.y - 65)
            c.fillText(targetText, building.center.x, building.position.y - 65)

            if (building.level < 3) {
                const upgradeCost = `Upgrade: ${building.getUpgradeCost()} coins`
                c.font = 'bold 16px "Changa One"'
                c.strokeText(upgradeCost, building.center.x, building.position.y - 10)
                c.fillText(upgradeCost, building.center.x, building.position.y - 10)
            } else if (!building.isFusion) {
               //Check if can fuse
               const canMerge = buildings.some(b =>
                b !== building &&
                b.level === 3 &&
                !b.isFusion &&
                Math.abs(b.position.x - building.position.x) + Math.abs(b.position.y - building.position.y) === 64
               )

               if (canMerge && fusionCount < maxFusions && coins >= 200) {
                c.font = 'bold 16px "Changa One"'
                c.fillStyle = 'gold'
                c.strokeText('CLICK TO MERGE', building.center.x, building.position.y - 10)
                c.fillText('CLICK TO MERGE', building.center.x, building.position.y - 10)
             } else {
                c.font = 'bold 16px "Changa One"'
                c.fillStyle = 'gold'
                c.strokeText('MAX LEVEL', building.center.x, building.position.y - 10)
                c.fillText('MAX LEVEL', building.center.x, building.position.y - 10)
            }    
        } else {
            c.font = 'bold 14px "Changa One"'
            c.fillStyle = 'magenta'
            c.strokeText('FUSION TOWER', building.center.x, building.position.y - 10)
            c.fillText('FUSION TOWER', building.center.x, building.position.y - 10)
        }
    }
        for (let i = building.projectiles.length - 1; i >= 0; i--) {
            const projectile = building.projectiles[i] 
            
            projectile.update()
            
            if (!projectile.enemy || projectile.enemy.health <= 0) {
                building.projectiles.splice(i, 1)
                continue
            }

            const xDifference = projectile.enemy.center.x - projectile.position.x
            const yDifference = projectile.enemy.center.y - projectile.position.y
            const distance = Math.hypot(xDifference, yDifference)
            
            if (distance < projectile.enemy.radius + projectile.radius) {

                if (projectile.isPiercing && projectile.hasHit.includes(projectile.enemy)) {
                    continue
                }

                const hit = projectile.enemy.takeDamage(projectile.damage)

                if (!hit) {
                    building.projectiles.splice(i, 1)
                    continue
                }

                // Play hit sound
                const hitSound = document.querySelector('#hitSound')
                if (hitSound) {
                    hitSound.currentTime = 0
                    hitSound.volume = 0.12
                    hitSound.play().catch(e => {})
                }

                // Critical Hit System
                let actualDamage = projectile.damage
                let isCrit = false
                const critChance = 0.15 + (critStreak * 0.05) 

                if (Math.random() < critChance) {
                    isCrit = true
                    critStreak++
                    const critMultiplier = 2 + (critStreak * 0.5)
                    actualDamage = Math.floor(projectile.damage * Math.min(critMultiplier, 5))

                    // Screen shake on big crits
                    if (critStreak >= 3) {
                        const shakeAmount = Math.min(critStreak, 8)
                        c.translate(
                            (Math.random() - 0.5) * shakeAmount,
                            (Math.random() - 0.5) * shakeAmount
                        )

                    }

                    console.log(`💥 CRITICAL HIT! ${critStreak}x STREAK! ${actualDamage} damage!`)
                } else {
                    critStreak = 0
                }

                projectile.enemy.health -= actualDamage

                damageNumbers.push(new DamageNumber(
                    projectile.enemy.center.x,
                    projectile.enemy.center.y - 20,
                    actualDamage,
                    isCrit
                ))
            
                //Chain effect
                if (projectile.isChainLightning) {
                     
                    //Find 2 nearest enemies
                    const nearbyEnemies = enemies
                        .filter(e => e !== projectile.enemy && e.health > 0)
                        .sort((a, b) => {
                            const distA = Math.hypot(a.center.x - projectile.enemy.center.x, a.center.y - projectile.enemy.center.y)
                            const distB = Math.hypot(b.center.x - projectile.enemy.center.x, b.center.y - projectile.enemy.center.y)
                            return distA - distB
                        })
                    .slice(0, 2)

                    nearbyEnemies.forEach(enemy => {
                        c.save()
                        c.strokeStyle = 'cyan'
                        c.lineWidth = 3
                        c.beginPath()
                        c.moveTo(projectile.enemy.center.x, projectile.enemy.center.y)
                        c.lineTo(enemy.center.x, enemy.center.y)
                        c.stroke()
                        c.restore()

                        enemy.takeDamage(15)

                        if (enemy.health <= 0) {
                            const enemyIndex = enemies.indexOf(enemy)
                            if (enemyIndex > -1) {
                                enemies.splice(enemyIndex, 1)
                                coins += enemy.coinValue
                                document.querySelector('#coins').innerHTML = coins
                            }
                        }
                    })
                }
        
            if (projectile.enemy.health <= 0) {
                const enemyIndex = enemies.findIndex((enemy) =>{
                    return projectile.enemy === enemy
                })

                if (enemyIndex > -1) {
                    building.killCount++ // Track tower kills

                    // Combo System
                    comboCount ++
                    lastKillTime = Date.now()

                    // Bonus Coins at combo milestones
                    let comboBonus = 0
                    if (comboCount === 5) {
                        comboBonus = 25
                        comboMultiplier = 1.2
                    }   else if (comboCount === 10) {
                        comboBonus = 50
                        comboMultiplier = 1.5
                    } else if (comboCount === 15) {
                        comboBonus = 100
                        comboMultiplier = 2
                    } else if (comboCount == 20) {
                        comboBonus = 200
                        comboMultiplier = 2.5
                    } else if (comboCount % 10 === 0 && comboCount > 20) {
                        comboBonus = comboCount * 10
                        comboMultiplier = 3
                    }

                    enemies.splice(enemyIndex, 1)

                    // Combo multiplier to coin value
                     const coinValue = Math.floor(projectile.enemy.coinValue * comboMultiplier) + comboBonus
                    coins += coinValue  
                    document.querySelector('#coins').innerHTML = coins

                    // Show floating text
                    if (comboBonus > 0) {
                        console.log(`🔥${comboCount}x COMBO! +${comboBonus} BONUS COINS!`)
                    }
                }
            }

                explosions.push(
                    new Sprite({
                        position: {x: projectile.position.x, y: projectile.position.y}, 
                        imageSrc: 'img/explosion.png', 
                        frames: {max: 4}, 
                        offset: {x: 0, y: 0} 
                    })
                )
      if (projectile.isPiercing) {
        projectile.hasHit.push(projectile.enemy)

        const nextEnemy = enemies.find(e =>
            !projectile.hasHit.includes(e) &&
            e.health > 0 &&
            Math.hypot(e.center.x - projectile.position.x, e.center.y - projectile.position.y) < 300
        )

        if (nextEnemy && projectile.hasHit.length < 3) {
            projectile.enemy = nextEnemy
        } else {
            building.projectiles.splice(i, 1)
        }
      } else {
        building.projectiles.splice(i, 1)
      }
    }
  }
})
    // Check if wave is complete
    if (enemies.length === 0 && waveStarted && currentWave <= maxWaves) {
        waveStarted = false

        //Calculate wave completion bonus
        const waveTime = Math.floor((Date.now() - waveStartTime) / 1000)
        if (waveTime < 30) {
            waveBonusCoins = 100
        } else if (waveTime < 60) {
            waveBonusCoins = 50
        } else {
            waveBonusCoins = 25
        }
        coins += waveBonusCoins
        document.querySelector('#coins').innerHTML = coins
        
        currentWave++

        if (currentWave > maxWaves) {
            cancelAnimationFrame(animationId)
            document.querySelector('#youWin').style.display = 'flex'
        } else {
            const waveDisplay = document.querySelector('#waveDisplay')
            if (currentWave === maxWaves) {
                waveDisplay.innerHTML = `<div style="text-align: center;">WAVE COMPLETE!<br><span style="font-size: 4vmin; color: gold;">+${waveBonusCoins} BONUS!</span><br><span style="font-size: 5vmin;">FINAL ROUND</span>`
            } else {
                waveDisplay.innerHTML = `<div style="text-align: center;">WAVE COMPLETE!<br><span style="font-size: 4vmin; color: gold;">+${waveBonusCoins} BONUS!</span><br><span style="font-size: 5vmin;">ROUND ${currentWave}</span>`
            }
            waveDisplay.style.display = 'block'
            
            setTimeout(() => {
                waveDisplay.style.display = 'none'
                waveStartTime = Date.now() // Reset timer for next wave
                comboCount = 0 // Reset combo between waves
                comboMultiplier = 1

                if (currentWave == maxWaves) {
                    // Grand Final Wave
                    spawnEnemies(enemyCount * 8, true) 
                } else {
                    enemyCount = Math.floor(3 * Math.pow(1.8, currentWave - 1))
                    spawnEnemies(enemyCount, false)
                }
                waveStarted = true
            }, 3000)
        }
    }
}

const mouse = {
    x: undefined,
    y: undefined
}

canvas.addEventListener('click', (event) => {
    // Fusion mode
    if (fusionMode && selectedFusionTower) {
        if (hoveredBuildingForSell && hoveredBuildingForSell !== selectedFusionTower && hoveredBuildingForSell.level === 3 && !hoveredBuildingForSell.isFusion) {
            
            const dx = Math.abs(hoveredBuildingForSell.position.x - selectedFusionTower.position.x)
            const dy = Math.abs(hoveredBuildingForSell.position.y - selectedFusionTower.position.y)

            if ((dx === 64 && dy === 0) || (dx === 0 && dy === 64)) {
                // Fusion being preformed
                coins -= 200
                document.querySelector('#coins').innerHTML = coins

                selectedFusionTower.fuseWith(hoveredBuildingForSell)

                // Remove other tower
                const otherIndex = buildings.indexOf(hoveredBuildingForSell)
                buildings.splice(otherIndex, 1)

                // Free the tile up
                const tileIndex = placementTiles.findIndex(tile =>
                    tile.position.x === hoveredBuildingForSell.position.x &&
                    tile.position.y === hoveredBuildingForSell.position.y
                )
                if (tileIndex !== -1) {
                    placementTiles[tileIndex].isOccupied = false
                }

                fusionCount++
                fusionMode = false
                selectedFusionTower = null
                document.querySelector('#fusionOverlay').style.display = 'none'
                document.querySelector('#fusionOverlay').style.pointerEvents = 'none'

                console.log('Fusion successful!')
            } else {
                console.log('Towers must be afjacent!')
            }
        } else {
            // Cancel fusion mode if clicked elsewhere
            fusionMode = false
            selectedFusionTower = null
            document.querySelector('#fusionOverlay').style.display = 'none'
            document.querySelector('#fusionOverlay').style.pointerEvents = 'none'
        }
        return
    }
    // Click on max tower
    if (hoveredBuildingForSell && hoveredBuildingForSell.level === 3 && !hoveredBuildingForSell.isFusion) {
        // Check if can merge
        const canMerge = buildings.some(b =>
            b !== hoveredBuildingForSell &&
            b.level === 3 &&
            !b.isFusion &&
            Math.abs(b.position.x - hoveredBuildingForSell.position.x) + Math.abs(b.position.y - hoveredBuildingForSell.position.y) === 64
        )

        if (canMerge && fusionCount < maxFusions && coins >= 200) {
            // Fusion Mode
            fusionMode = true
            selectedFusionTower = hoveredBuildingForSell
            document.querySelector('#fusionOverlay').style.display = 'none'
            //document.querySelector('#fusionOverlay').style.pointerEvents = 'auto'
            return
        }
    }

    // Other code
    if (hoveredBuildingForSell) {
        if (event.shiftKey) {
             sellTower(hoveredBuildingForSell)
        } else {
            if (hoveredBuildingForSell.level < 3 || hoveredBuildingForSell.isFusion) {
                 upgradeTower(hoveredBuildingForSell)
            }
        }
        return
    }

    // Place new tower
    if (activeTile && !activeTile.isOccupied && coins >= TOWER_COSTS[selectedTowerType]) {  
        coins -= TOWER_COSTS[selectedTowerType]
        document.querySelector('#coins').innerHTML = coins
        buildings.push(
            new Building ({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y
                },
                type: selectedTowerType
            })
        )
        activeTile.isOccupied = true  
        buildings.sort((a, b) => {
            return a.position.y - b.position.y
        })
    }
})

window.addEventListener('mousemove', (event) => {
   const rect = canvas.getBoundingClientRect()
   const scaleX = canvas.width / rect.width
   const scaleY = canvas.height / rect.height

   mouse.x = (event.clientX - rect.left) * scaleX
   mouse.y = (event.clientY - rect.top) * scaleY
    
    activeTile = null
    for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i]
        if (
            mouse.x > tile.position.x && 
            mouse.x < tile.position.x + tile.size &&
            mouse.y > tile.position.y && 
            mouse.y < tile.position.y + tile.size
        ){
            activeTile = tile
            break
        }
    }

    hoveredBuildingForSell = null;

    if (activeTile && !activeTile.isOccupied) {
        canvas.style.cursor = 'crosshair'
        return;
    }

    for (let i = buildings.length - 1; i >= 0; i--) {
        const building = buildings[i];

        if (
            mouse.x > building.position.x &&
            mouse.x < building.position.x + building.width &&
            mouse.y > building.position.y && 
            mouse.y < building.position.y + building.height
        ) {
            hoveredBuildingForSell = building;
            canvas.style.cursor = 'pointer';
            break;
        }
    }

    if (!hoveredBuildingForSell && !activeTile) {
        canvas.style.cursor = 'default';
    }
})

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && fusionMode) {
        // Cancel fusion mode
        fusionMode = false
        selectedFusionTower = null
        document.querySelector('#fusionOverlay').style.display = 'none'
        console.log('Fusion cancelled')
    }

if (event.key === 't' || event.key === 'T') {
    if (hoveredBuildingForSell) {
    const modes=['first', 'last', 'strongest', 'weakest']
    const currentIndex = modes.indexOf(hoveredBuildingForSell.targetingMode)
    const nextIndex = (currentIndex + 1) % modes.length
    hoveredBuildingForSell.targetingMode = modes[nextIndex]
    console.log(`🎯 Targeting mode: ${modes[nextIndex].toUpperCase()}`)
}
}
})

let gameStarted = false

document.querySelector('#startButton').addEventListener('click', () => {
    gameStarted = true
    document.querySelector('#startScreen').style.display = 'none'
    document.querySelector('#towerMenu').style.display = 'flex'

    const bgMusic = document.querySelector('#bgMusic')
    bgMusic.volume = 0.5
    bgMusic.play().then(() => {
        console.log('Music playing!')
    }).catch(err => {
        console.error('Music failed:', err)
    })

    const waveDisplay = document.querySelector('#waveDisplay')
    waveDisplay.innerHTML = 'ROUND 1'
    waveDisplay.style.display = 'block'

    setTimeout(() => {
        waveDisplay.style.display = 'none'
        waveStartTime = Date.now()
        spawnEnemies(enemyCount)
        waveStarted = true
    }, 2000)
})

function restartGame() {
    enemies.length = 0
    buildings.length = 0
    explosions.length = 0
    coins = 150
    hearts = 10
    currentWave = 1
    enemyCount = 3
    gameStarted = false
    waveStarted = false
    selectedTowerType = 'rock'
    fusionCount = 0
    fusionMode = false
    selectedFusionTower = null
    comboCount = 0
    lastKillTime = 0
    comboMultiplier = 1
    critStreak = 0
    damageNumbers = []

    const bgMusic = document.querySelector('#bgMusic')
    bgMusic.pause()
    bgMusic.currentTime = 0

    placementTiles.forEach(tile => {
        tile.isOccupied = false
    })
    
    document.querySelector('#coins').innerHTML = coins
    document.querySelector('#hearts').innerHTML = hearts
    document.querySelector('#gameOver').style.display = 'none'
    document.querySelector('#youWin').style.display = 'none'
    document.querySelector('#startScreen').style.display = 'flex'
    document.querySelector('#towerMenu').style.display = 'none'
    
    document.querySelectorAll('.tower-option').forEach(opt => {
        opt.style.border = '3px solid rgba(255,255,255,0.3)';
    });
    document.querySelector('[data-type="rock"]').style.border = '3px solid white';
    
    animate()
}

function sellTower(building) {
    const buildingIndex = buildings.indexOf(building);
    if (buildingIndex === -1) return;

    buildings.splice(buildingIndex, 1);

    const tileIndex = placementTiles.findIndex(tile => {
        return tile.position.x === building.position.x &&
        tile.position.y === building.position.y;
    });

    if (tileIndex !== -1) {
        placementTiles[tileIndex].isOccupied = false;
    }

    const refund = Math.floor(TOWER_COST * SELL_REFUND_Percent);
    coins += refund;
    document.querySelector('#coins').innerHTML = coins;
}    

function upgradeTower(building) {
    const upgradeCost = building.getUpgradeCost();

    if (building.level >= 3) {
        console.log('Tower is already max level!');
        return;
    }

    if (coins >= upgradeCost) {
        coins -= upgradeCost;
        building.upgrade();
        document.querySelector('#coins').innerHTML = coins;
        console.log(`Upgraded to level ${building.level}!`);
    } else {
        console.log(`Need ${upgradeCost - coins} more coins to upgrade!`);
    }
}

document.querySelectorAll('.tower-option').forEach(option => {
    option.addEventListener('click', () => {
        selectedTowerType = option.dataset.type;

        document.querySelectorAll('.tower-option').forEach(opt => {
            opt.style.border = '3px solid rgba(255,255,255,0.3)';
        });
        option.style.border = '3px solid white';
    });
});

document.querySelector('#tryAgainLose').addEventListener('click', restartGame)
document.querySelector('#tryAgainWin').addEventListener('click', restartGame)