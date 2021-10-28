import {
  Engine,
  Canvas,
  Keyboard
} from 'frame-draft'

import { createMap } from './helpers/create-map'

const MAP = createMap`
  ################################
  ################################
  ################################
  #####......................#####
  #####......................#####
  #####......................#####
  #####......................#####
  #####......................#####
  ##################ˆˆ.......#####
  ####################.......#####
  #####......................#####
  #####......................#####
  #####......................#####
  #####......................#####
  #####......................#####
  ################################
  ################################
  ################################
`

const COLUMNS = 32
const ROWS = 18

const SIZE = 12

const WIDTH = COLUMNS * SIZE
const HEIGHT = ROWS * SIZE

const engine = new Engine()
const canvas = new Canvas(WIDTH, HEIGHT, 'pixelated')
const keyboard = new Keyboard()

let playerVelocityX = 0
let playerVelocityY = 0

let playerPositionX = 70
let playerPositionY = 60

let isPlayerDead = false
let isPlayerJumping = false

let gravity = 0
let gravitySpeed = 0

const getTile = (x, y) => {
  x = Math.floor(x / SIZE)
  y = Math.floor(y / SIZE)

  return MAP[y * COLUMNS + x]
}

const round = value => {
  return +value.toFixed(3)
}

const update = elapsedTime => {
  if (isPlayerDead) return

  if (keyboard.isDown('ArrowLeft')) {
    playerVelocityX = -3
  }

  if (keyboard.isDown('ArrowRight')) {
    playerVelocityX = 3
  }

  if (keyboard.isHeld('Space')) {
    if (!isPlayerJumping) {
      isPlayerJumping = true
      gravity = -2
    }
  } else {
    gravity = 0.2
  }

  gravitySpeed += gravity
  playerVelocityY += gravitySpeed

  let playerNewPositionX = playerPositionX + round(playerVelocityX)
  let playerNewPositionY = playerPositionY + round(playerVelocityY)

  let firstTile, lastTile

  if (playerVelocityX < 0) { // Left
    firstTile = getTile(playerNewPositionX, playerPositionY)
    lastTile = getTile(playerNewPositionX, playerPositionY + SIZE)

    if (firstTile !== '.' || lastTile !== '.') {
      playerNewPositionX = (Math.floor(playerNewPositionX / SIZE) * SIZE) + SIZE
      playerVelocityX = 0
    }
  } else { // Right
    firstTile = getTile(playerNewPositionX + SIZE, playerPositionY)
    lastTile = getTile(playerNewPositionX + SIZE, playerPositionY + SIZE)

    if (firstTile !== '.' || lastTile !== '.') {
      playerNewPositionX = (Math.floor(playerNewPositionX / SIZE) * SIZE) - 0.01
      playerVelocityX = 0
    }
  }

  if (playerVelocityY < 0) { // Up
    firstTile = getTile(playerPositionX, playerNewPositionY)
    lastTile = getTile(playerPositionX + SIZE, playerNewPositionY)

    if (firstTile !== '.' || lastTile !== '.') {
      playerNewPositionY = (Math.floor(playerNewPositionY / SIZE) * SIZE) + SIZE
      playerVelocityY = 0
    }
  } else { // Down
    firstTile = getTile(playerPositionX, playerNewPositionY + SIZE)
    lastTile = getTile(playerPositionX + SIZE, playerNewPositionY + SIZE)

    if (firstTile !== '.' || lastTile !== '.') {
      playerNewPositionY = (Math.floor(playerNewPositionY / SIZE) * SIZE) - 0.01
      playerVelocityY = 0

      isPlayerJumping = false
      gravitySpeed = 0
    }
  }

  if (firstTile === 'ˆ' || lastTile === 'ˆ') {
    isPlayerDead = true
  }

  playerVelocityX *= 0.82
  playerVelocityY *= 0.82

  playerPositionX = playerNewPositionX
  playerPositionY = playerNewPositionY
}

const render = () => {
  canvas.context.fillStyle = '#640063'
  canvas.context.fillRect(0, 0, WIDTH, HEIGHT)

  for (let index in MAP) {
    let x = (index % COLUMNS) * SIZE
    let y = Math.floor(index / COLUMNS) * SIZE

    switch(MAP[index]) {
      case '#':
        canvas.context.fillStyle = '#cd33ff'
        canvas.context.fillRect(x, y, SIZE, SIZE)
        break;
      case 'ˆ':
        canvas.context.fillStyle = '#cd33ff'
        canvas.context.fillRect(x, y, SIZE, SIZE)

        canvas.context.fillStyle = '#ff0000'
        canvas.context.fillRect(x, y, SIZE, SIZE / 2)
        break;
    }
  }

  canvas.context.fillStyle = isPlayerDead ? '#ff0000' : '#000000'
  canvas.context.fillRect(Math.round(playerPositionX), Math.round(playerPositionY), SIZE, SIZE)
}

engine.start(elapsedTime => {
  update(elapsedTime)
  render()
})
