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
  #############ˆˆˆˆˆˆˆ.......#####
  ####################.......#####
  #####......................#####
  #####......................#####
  #####......................#####
  #####......................#####
  #####.$....................#####
  #####################ˆˆˆˆˆˆ#####
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

let playerJumpCount = 0
let isPlayerDead = false

let gravity = 0
let gravitySpeed = 0

let accumulatedTime = 0

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
    playerVelocityX = playerJumpCount ? -3 : -3
  }

  if (keyboard.isDown('ArrowRight')) {
    playerVelocityX = playerJumpCount ? 3 : 3
  }

  if (keyboard.isHeld('Space')) {
    if (playerJumpCount === 0) {
      gravity = -1.5
    }

    playerJumpCount = Math.min(playerJumpCount + 1, 2)
  } else {
    gravity = 0.2
  }

  gravitySpeed += gravity

  if (keyboard.isDown('Space')) {
    if (
      playerJumpCount === 2 &&
      accumulatedTime < 500
    ) {
      accumulatedTime += elapsedTime
      gravitySpeed = Math.min(gravitySpeed, 0.01)
    }
  }

  gravitySpeed = Math.min(gravitySpeed, 2)

  playerVelocityY += gravitySpeed

  let playerNewPositionX = playerPositionX + round(playerVelocityX)
  let playerNewPositionY = playerPositionY + round(playerVelocityY)

  let topTile, bottomTile

  if (playerVelocityX < 0) { // Left
    topTile = getTile(playerNewPositionX, playerPositionY)
    bottomTile = getTile(playerNewPositionX, playerPositionY + SIZE)

    if (topTile !== '.' || bottomTile !== '.') {
      playerNewPositionX = (Math.floor(playerNewPositionX / SIZE) * SIZE) + SIZE
      playerVelocityX = 0
    }
  } else { // Right
    topTile = getTile(playerNewPositionX + SIZE, playerPositionY)
    bottomTile = getTile(playerNewPositionX + SIZE, playerPositionY + SIZE)

    if (topTile !== '.' || bottomTile !== '.') {
      playerNewPositionX = (Math.floor(playerNewPositionX / SIZE) * SIZE) - 0.01
      playerVelocityX = 0
    }
  }

  let leftTile, rightTile

  if (playerVelocityY < 0) { // Up
    leftTile = getTile(playerPositionX, playerNewPositionY)
    rightTile = getTile(playerPositionX + SIZE, playerNewPositionY)

    if (leftTile !== '.' || rightTile !== '.') {
      playerNewPositionY = (Math.floor(playerNewPositionY / SIZE) * SIZE) + SIZE
      playerVelocityY = 0
    }
  } else { // Down
    leftTile = getTile(playerPositionX, playerNewPositionY + SIZE)
    rightTile = getTile(playerPositionX + SIZE, playerNewPositionY + SIZE)

    if (leftTile !== '.' || rightTile !== '.') {
      playerNewPositionY = (Math.floor(playerNewPositionY / SIZE) * SIZE) - 0.01
      playerVelocityY = 0

      playerJumpCount = 0
      gravitySpeed = 0
      accumulatedTime = 0
    }
  }

  if (
    ['ˆ', 'v'].includes(leftTile) ||
    ['ˆ', 'v'].includes(rightTile)
  ) {
    isPlayerDead = true
  }

  playerVelocityX *= 0.9
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
      case '$':
        canvas.context.fillStyle = '#ff33ff'
        canvas.context.fillRect(x, y, SIZE, SIZE)
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
