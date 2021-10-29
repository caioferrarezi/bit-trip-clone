import {
  Engine,
  Canvas,
  Keyboard
} from 'frame-draft'

import { createMap } from './helpers/create-map'

const MAP = createMap`
  ##################################
  ##################################
  ##################################
  ####............vvvvvv........####
  ####..........................####
  ####..........................####
  ####..........................####
  ####............^^^^^^........####
  #########################.....####
  #########################.....####
  ####..........................####
  ####..........................####
  ####..........................####
  ####..........................####
  ####.$..................^^^^^^####
  ##################################
  ##################################
  ##################################
`

const COLUMNS = 34
const ROWS = 18

const SIZE = 12

const WIDTH = COLUMNS * SIZE
const HEIGHT = ROWS * SIZE

const engine = new Engine()
const canvas = new Canvas(WIDTH, HEIGHT, 'pixelated')
const keyboard = new Keyboard()

let playerVelocityX = 0
let playerVelocityY = 0

let playerPositionX = 60
let playerPositionY = 60

let playerJumpCount = 0
let isPlayerOnTheGround = false
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
    const shouldJump = isPlayerOnTheGround && playerJumpCount === 0

    if (shouldJump) {
      gravity = -1.5
    }

    if (playerJumpCount > 0 || shouldJump) {
      playerJumpCount = Math.min(playerJumpCount + 1, 2)
    }
  } else {
    gravity = 0.2
  }

  gravitySpeed += gravity

  if (keyboard.isDown('Space')) {
    if (
      playerJumpCount === 1 &&
      accumulatedTime < 800
    ) {
      accumulatedTime += elapsedTime
      gravitySpeed = Math.min(gravitySpeed, -0.2)
    }

    if (
      playerJumpCount === 2 &&
      accumulatedTime < 800
    ) {
      accumulatedTime += elapsedTime
      gravitySpeed = 0
    }
  }

  gravitySpeed = Math.min(gravitySpeed, 1.2)

  playerVelocityY += gravitySpeed

  let playerNewPositionX = playerPositionX + round(playerVelocityX)
  let playerNewPositionY = playerPositionY + round(playerVelocityY)

  let topLeftTile, topRightTile, bottomLeftTile, bottomRightTile

  if (playerVelocityX < 0) { // Left
    topLeftTile = getTile(playerNewPositionX, playerPositionY)
    bottomLeftTile = getTile(playerNewPositionX, playerPositionY + SIZE)

    if (topLeftTile !== '.' || bottomLeftTile !== '.') {
      playerNewPositionX = (Math.floor(playerNewPositionX / SIZE) * SIZE) + SIZE
      playerVelocityX = 0
    }

    if (['^', 'v'].includes(topLeftTile) || ['^', 'v'].includes(bottomLeftTile)) {
      isPlayerDead = true
    }
  } else { // Right
    topRightTile = getTile(playerNewPositionX + SIZE, playerPositionY)
    bottomRightTile = getTile(playerNewPositionX + SIZE, playerPositionY + SIZE - 1)

    if (topRightTile !== '.' || bottomRightTile !== '.') {
      playerNewPositionX = (Math.floor(playerNewPositionX / SIZE) * SIZE) - 0.01
      playerVelocityX = 0
    }

    if (['^', 'v'].includes(topRightTile) || ['^', 'v'].includes(bottomRightTile)) {
      isPlayerDead = true
    }
  }

  if (playerVelocityY < 0) { // Up
    topLeftTile = getTile(playerPositionX + 1, playerNewPositionY)
    topRightTile = getTile(playerPositionX + SIZE - 1, playerNewPositionY)

    if (topLeftTile !== '.' || topRightTile !== '.') {
      playerNewPositionY = (Math.floor(playerNewPositionY / SIZE) * SIZE) + SIZE
      playerVelocityY = 0
    }

    if (topLeftTile === 'v' || topRightTile === 'v') {
      isPlayerDead = true
    }
  } else { // Down
    bottomLeftTile = getTile(playerPositionX + 1, playerNewPositionY + SIZE)
    bottomRightTile = getTile(playerPositionX + SIZE - 1, playerNewPositionY + SIZE)

    if (bottomLeftTile !== '.' || bottomRightTile !== '.') {
      playerNewPositionY = (Math.floor(playerNewPositionY / SIZE) * SIZE) - 0.01
      playerVelocityY = 0

      playerJumpCount = 0
      gravitySpeed = 0
      accumulatedTime = 0
      isPlayerOnTheGround = true
    } else {
      isPlayerOnTheGround = false
    }

    if (bottomLeftTile === '^' || bottomRightTile === '^') {
      isPlayerDead = true
    }
  }

  playerVelocityX *= 0.8
  playerVelocityY *= 0.8

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
      case '^':
      case 'v':
        canvas.context.fillStyle = '#ff0000'
        canvas.context.fillRect(x, y, SIZE, SIZE)

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
