const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const TOWER_COST = 50;
const UPGRADE_COSTS = [75, 100];
const SELL_REFUND_Percent = 0.5;
let hoveredBuildingForSell = null;
let selectedBuilding = null;

canvas.width = 1280
canvas.height = 768

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

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

function spawnEnemies(spawnCount) {
    for (let i = 1; i < spawnCount + 1; i++) {
        const xOffset = i * 150 

        const randomSpeed = Math.random() * 3 + 2

        enemies.push(
            new Enemy({
                position: {x: waypoints[0].x - xOffset, y: waypoints[0].y},
                speed: randomSpeed
            })
        ) 
    }
}

const buildings = []
let activeTile = undefined
let enemyCount = 3
let hearts = 10
let coins = 100
let waveStarted = false
let currentWave = 1
const maxWaves = 4
const explosions = [] 

let animationId
function animate() {
    animationId = requestAnimationFrame(animate)

    c.drawImage(image, 0, 0)

    if (!gameStarted) return

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i]
        enemy.update()

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

    placementTiles.forEach(tile => {
        tile.update(mouse)
    })
    
    buildings.forEach(building => {
        building.update()
        building.target = null
        const validEnemies = enemies.filter(enemy => {
            const xDifference = enemy.center.x - building.center.x
            const yDifference = enemy.center.y - building.center.y
            const distance = Math.hypot(xDifference, yDifference)
            return distance < enemy.radius + building.radius
        })
        building.target = validEnemies[0]

        if (building === hoveredBuildingForSell) {
           c.beginPath()
           c.arc(building.center.x, building.center.y, building.radius, 0, Math.PI * 2)
           c.fillStyle = 'rgba(0, 0, 255, 0.2)'
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

            const towerName = `Level ${building.level} Rock Launcher`
            c.strokeText(towerName, building.center.x, building.y - 30)
            c.fillText(towerName, building.center.x, building.position.y - 30)

            if (building.level < 3) {
                const upgradeCost = `Upgrade: ${building.getUpgradeCost()} coins`
                c.font = 'bold 16px "Changa One"'
                c.strokeText(upgradeCost, building.center.x, building.position.y - 10)
                c.fillText(upgradeCost, building.center.x, building.position.y - 10)
            } else {
                c.font = 'bold 16px "Changa One"'
                c.fillStyle = 'gold'
                c.strokeText('MAX LEVEL', building.center.x, building.position.y - 10)
                c.fillText('MAX LEVEL', building.center.x, building.position.y - 10)
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
                projectile.enemy.health -= projectile.damage
                if (projectile.enemy.health <= 0) {
                    const enemyIndex = enemies.findIndex((enemy) => {
                        return projectile.enemy === enemy
                    })

                    if (enemyIndex > -1) {
                        enemies.splice(enemyIndex, 1)
                        coins += 15
                        document.querySelector('#coins').innerHTML = coins
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
                building.projectiles.splice(i, 1)
            }
        }
    })

    // Check if wave is complete
    if (enemies.length === 0 && waveStarted && currentWave <= maxWaves) {
        waveStarted = false
        currentWave++
        
        if (currentWave > maxWaves) {
            cancelAnimationFrame(animationId)
            document.querySelector('#youWin').style.display = 'flex'
        } else {
            const waveDisplay = document.querySelector('#waveDisplay')
            if (currentWave === maxWaves) {
                waveDisplay.innerHTML = 'FINAL ROUND'
            } else {
                waveDisplay.innerHTML = `ROUND ${currentWave}`
            }
            waveDisplay.style.display = 'block'
            
            setTimeout(() => {
                waveDisplay.style.display = 'none'
                if (currentWave == maxWaves) {
                    spawnEnemies(enemyCount * 5) 
                } else {
                    enemyCount += 2
                    spawnEnemies(enemyCount)
                }
                waveStarted = true
            }, 2000)
        }
    }
}

const mouse = {
    x: undefined,
    y: undefined
}

canvas.addEventListener('click', (event) => {
    if (hoveredBuildingForSell) {
        if (event.shiftKey) {
             sellTower(hoveredBuildingForSell)
        } else {
             upgradeTower(hoveredBuildingForSell);
        }
        return;
    }

    if (activeTile && !activeTile.isOccupied && coins - 50 >= 0) {  
        coins -= 50
        document.querySelector('#coins').innerHTML = coins
        buildings.push(
            new Building ({
                position: {
                    x: activeTile.position.x,
                    y: activeTile.position.y
                }
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

let gameStarted = false

document.querySelector('#startButton').addEventListener('click', () => {
    gameStarted = true
    document.querySelector('#startScreen').style.display = 'none'

    const waveDisplay = document.querySelector('#waveDisplay')
    waveDisplay.innerHTML = 'ROUND 1'
    waveDisplay.style.display = 'block'

    setTimeout(() => {
        waveDisplay.style.display = 'none'
        spawnEnemies(enemyCount)
        waveStarted = true
    }, 2000)
})

function restartGame() {
    enemies.length = 0
    buildings.length = 0
    explosions.length = 0
    coins = 100
    hearts = 10
    currentWave = 1
    enemyCount = 3
    gameStarted = false
    waveStarted = false

    placementTiles.forEach(tile => {
        tile.isOccupied = false
    })
    
    document.querySelector('#coins').innerHTML = coins
    document.querySelector('#hearts').innerHTML = hearts
    document.querySelector('#gameOver').style.display = 'none'
    document.querySelector('#youWin').style.display = 'none'
    document.querySelector('#startScreen').style.display = 'flex'
    
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

document.querySelector('#tryAgainLose').addEventListener('click', restartGame)
document.querySelector('#tryAgainWin').addEventListener('click', restartGame)