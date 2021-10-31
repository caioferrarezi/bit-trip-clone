import {
  Engine,
  Canvas,
  Keyboard
} from 'frame-draft'

import { createMap } from '@/helpers/create-map'

import soundtrackAudio from '@/soundtrack.mp3'

// Create the platform map tile with createMap
// that returns an array based on this string
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

// It has 34 columns by 18 rows
const COLUMNS = 34
const ROWS = 18

// Each tile has 12 as its size
const SIZE = 12

// Screen width and height are calculated
// by columns and rows time size
const WIDTH = COLUMNS * SIZE
const HEIGHT = ROWS * SIZE

// Instantiate frame-draft classes
const engine = new Engine()
const canvas = new Canvas(WIDTH, HEIGHT, 'pixelated')
const keyboard = new Keyboard()

// Create the audio that plays the soundtrack
const soundtrack = new Audio(soundtrackAudio)

soundtrack.loop = true
soundtrack.volume = 0.2

// Global state

// Constrols weather the user is playing
let isUserPlaying = false

// Controls wheater the soundtrack
// is already playing
let isSoundtrackPlaying = false

// Controls player's velocity for
// the X and Y axis
let playerVelocityX = 0
let playerVelocityY = 0

// This is the player's position
// that will be rendered
let playerPositionX = 60
let playerPositionY = 60

// Controls the player's jump count
let playerJumpCount = 0

// Controls wheater the player
// is on the ground
let isPlayerOnTheGround = false

// Controls wheater the player
// is dead or not
let isPlayerDead = false

// Controls wheater the player
// has won or not
let hasPlayerWon = false

// Controls gravity value that will
// increment to gravity's speed
let gravity = 0
let gravitySpeed = 0

// Controls the time passed by
// incremeting the elapsedTime
let accumulatedTime = 0

// Picks a random color from an array
const randomColor = (colors = []) => {
  const index = Math.floor(Math.random() * colors.length)

  return colors[index]
}

// This function gets the respective tile
// in the tile maps based on the player's
// next position
const getTile = (x, y) => {
  x = Math.floor(x / SIZE)
  y = Math.floor(y / SIZE)

  return MAP[y * COLUMNS + x]
}

// This is just to prevent a huge number
// of floating point by limiting it by 3
const round = value => {
  return +value.toFixed(3)
}

// Reset the global state
const respawn = () => {
  playerVelocityX = 0
  playerVelocityY = 0

  playerPositionX = 60
  playerPositionY = 60

  playerJumpCount = 0
  isPlayerOnTheGround = false
  isPlayerDead = false
  hasPlayerWon = false

  gravity = 0
  gravitySpeed = 0

  accumulatedTime = 0
}

// Function responsible for update
// the game state
const update = elapsedTime => {
  // Does nothing if the user is not playing
  // or if the player has won
  if (!isUserPlaying || hasPlayerWon) return

  // If the player is dead, it resets
  // the global state within 500 accumulated time
  if (isPlayerDead) {
    if (accumulatedTime < 500) {
      accumulatedTime += elapsedTime

      return
    } else {
      respawn()
    }
  }

  // Moves the player to the left
  if (keyboard.isDown('ArrowLeft')) {
    playerVelocityX = -3
  }

  // Moves the player to the right
  if (keyboard.isDown('ArrowRight')) {
    playerVelocityX = 3
  }

  // This verification is true when this
  // keydown event is not repeated, so it
  // runs only once per interaction
  if (keyboard.isHeld('Space')) {
    const shouldJump = isPlayerOnTheGround && playerJumpCount === 0

    if (shouldJump) {
      // Jumping is controle by reversing the gravity
      // this might not be ideal, but works fine
      // with this mechanics
      gravity = -1.5
    }

    if (playerJumpCount > 0 || shouldJump) {
      // Limits the player jump count by 2
      playerJumpCount = Math.min(playerJumpCount + 1, 2)
    }
  } else {
    // When the player is not jumping, gravity value is 0.2
    gravity = 0.2
  }

  // Updates the gravity speed
  gravitySpeed += gravity

  // Now it's considering the holding space
  // to enable other mechanics for the player
  if (keyboard.isDown('Space')) {
    if (
      playerJumpCount === 1 &&
      accumulatedTime < 800
    ) {
      // On the first jump, gravity will
      // still decrease by 0.2 causing the
      // player to fly. But player will fall
      // after 800 accumulated time
      accumulatedTime += elapsedTime
      gravitySpeed = Math.min(gravitySpeed, -0.2)
    }

    if (
      playerJumpCount === 2 &&
      accumulatedTime < 800
    ) {
      // The second jump will park the player
      // in the Y axis. But player will fall
      // after 800 accumulated time
      accumulatedTime += elapsedTime
      gravitySpeed = 0
    }
  }

  // Limits gravitySpeed by 1.2 to
  // prevent unawanted side effects
  gravitySpeed = Math.min(gravitySpeed, 1.2)

  // Updates player's velocity in the Y axis
  playerVelocityY += gravitySpeed

  // Finds the player's next position
  let playerNewPositionX = playerPositionX + round(playerVelocityX)
  let playerNewPositionY = playerPositionY + round(playerVelocityY)

  let firstTile, lastTile

  if (playerVelocityX < 0) { // Left
    // Gets tile from top left, ignoring new
    // Y position, so this doesn't cause side
    // effect when colliding with left tile
    firstTile = getTile(playerNewPositionX, playerPositionY)
    // Gets tile from bottom left, also
    // ignoring new Y position
    lastTile = getTile(playerNewPositionX, playerPositionY + SIZE)

    // Collides if the tile is different the '.'
    // which represents the blank space
    if (firstTile !== '.' || lastTile !== '.') {
      // Reset player's new X position to be
      // right next to the collided left tile
      playerNewPositionX = (Math.floor(playerNewPositionX / SIZE) * SIZE) + SIZE
      // Stop moving
      playerVelocityX = 0
    }
  } else { // Right
    // Gets tile from top right, ignoring new
    // Y position, so this doesn't cause side
    // effect when colliding with right tile
    firstTile = getTile(playerNewPositionX + SIZE, playerPositionY)
    // Gets tile from bottom right, also
    // ignoring new Y position. There's also
    // a correction by 1 unit so the player
    // can easily enter thin spaces.
    lastTile = getTile(playerNewPositionX + SIZE, playerPositionY + SIZE - 1)

    // Collides if the tile is different the '.'
    // which represents the blank space
    if (firstTile !== '.' || lastTile !== '.') {
      // Reset player's new X position to be
      // right next to the collided right tile,
      // decresing 0.01, so this does not cause
      // side effects on up or down collision
      playerNewPositionX = (Math.floor(playerNewPositionX / SIZE) * SIZE) - 0.01
      // Stop moving
      playerVelocityX = 0
    }
  }

  // Player is dead when hitting
  // tiles with those patterns
  if (['^', 'v'].includes(firstTile) || ['^', 'v'].includes(lastTile)) {
    isPlayerDead = true
    accumulatedTime = 0
  }

  // Player wins when hitting
  // tiles with those patterns
  if (firstTile === '$' || lastTile === '$') {
    hasPlayerWon = true
  }

  if (playerVelocityY < 0) { // Up
    // Gets tile from top left. There's also
    // a correction by 1 unit so the player
    // can enter thin spaces easily
    firstTile = getTile(playerPositionX + 1, playerNewPositionY)
    // Gets tile from top right. There's also
    // a correction by 1 unit so the player
    // can easily enter thin spaces.
    lastTile = getTile(playerPositionX + SIZE - 1, playerNewPositionY)

    // Collides if the tile is different the '.'
    // which represents the blank space.
    if (firstTile !== '.' || lastTile !== '.') {
      // Reset player's new Y position to be
      // right below to the collided up tile.
      playerNewPositionY = (Math.floor(playerNewPositionY / SIZE) * SIZE) + SIZE
      // Stop moving
      playerVelocityY = 0
    }
  } else { // Down
    // Gets tile from bottom left. There's also
    // a correction by 1 unit so the player
    // can easily enter thin spaces.
    firstTile = getTile(playerPositionX + 1, playerNewPositionY + SIZE)
    // Gets tile from bottom right. There's also
    // a correction by 1 unit so the player
    // can easily enter thin spaces.
    lastTile = getTile(playerPositionX + SIZE - 1, playerNewPositionY + SIZE)

    // Collides if the tile is different the '.'
    // which represents the blank space.
    if (firstTile !== '.' || lastTile !== '.') {
      // Reset player's new Y position to be
      // right above to the collided down tile.
      playerNewPositionY = (Math.floor(playerNewPositionY / SIZE) * SIZE) - 0.01
      // Stop moving
      playerVelocityY = 0

      // When player hits the ground
      // it resets the jump count
      playerJumpCount = 0
      // the gravity speep
      gravitySpeed = 0
      // the accumulatedTime
      accumulatedTime = 0

      // At the end, we tell that
      // the player is on the ground
      isPlayerOnTheGround = true
    } else {
      // If the player is jumping it is
      // important to set this variable to false
      isPlayerOnTheGround = false
    }
  }

  // Player is dead when hitting
  // tiles with those patterns
  if (['^', 'v'].includes(firstTile) || ['^', 'v'].includes(lastTile)) {
    isPlayerDead = true
    accumulatedTime = 0
  }

  // Player wins when hitting
  // tiles with those patterns
  if (firstTile === '$' || lastTile === '$') {
    hasPlayerWon = true
  }

  // Adds some friction for the
  // next game loop iteration
  playerVelocityX *= 0.8
  playerVelocityY *= 0.8

  // Finally, updates the player X and Y position
  playerPositionX = playerNewPositionX
  playerPositionY = playerNewPositionY
}

// Function responsible for rendering
// the game on screen
const render = () => {
  // Always resets the canvas screen
  canvas.context.fillStyle = '#640063'
  canvas.context.fillRect(0, 0, WIDTH, HEIGHT)

  // Gets the obstacle color
  const obstacleColor = randomColor([
    '#ff0000', '#ffff00', '#ffffff'
  ])

  // Iterates on the tile map
  for (let index in MAP) {
    // Gets the tile X and Y based on its index
    let x = (index % COLUMNS) * SIZE
    let y = Math.floor(index / COLUMNS) * SIZE

    switch(MAP[index]) {
      // Renders the pink block
      case '#':
        canvas.context.fillStyle = '#cd33ff'
        canvas.context.fillRect(x, y, SIZE, SIZE)
        break;
      // Renders the obstacles block
      case '^':
      case 'v':
        canvas.context.fillStyle = obstacleColor
        canvas.context.fillRect(x, y, SIZE, SIZE)

        break;
      // Renders the target block
      case '$':
        canvas.context.fillStyle = '#ff33ff'
        canvas.context.fillRect(x, y, SIZE, SIZE)
        break;
    }
  }

  // Renders the player
  canvas.context.fillStyle = isPlayerDead ? '#ff0000' : '#000000'
  canvas.context.fillRect(Math.round(playerPositionX), Math.round(playerPositionY), SIZE, SIZE)
}

keyboard.onKeyPress(key => {
  if (key === 'Enter') {
    // In some browsers, it is required some user
    // interaction to enable playing some media,
    // so we try again to play it on keypress
    if (!isSoundtrackPlaying) {
      soundtrack.play()
        .then(() => isSoundtrackPlaying = true)
        .catch(() => isSoundtrackPlaying = false)
    }

    if (hasPlayerWon) {
      respawn()
    }

    isUserPlaying = true
  }
})

engine.start(elapsedTime => {
  update(elapsedTime)
  render()
})
