var mazeGenerator = require('maze.js')

// Represents a maze
function Maze () {
  this.rooms = {}

  // Generate a new maze with specified width & height
  this.generate = function (width, height) {
    this.from(mazeGenerator(width, height))
  }

  // Parse a maze.js linkset
  this.from = function (links) {
    for (var key in links) {
      var link = links[key]

      var roomOne = link[0]
      var roomTwo = link[1]

      if (this.rooms[roomOne.x + ',' + roomOne.y] == null) {
        this.rooms[roomOne.x + ',' + roomOne.y] = new Room(roomOne.x, roomOne.y)
      }

      if (this.rooms[roomTwo.x + ',' + roomTwo.y] == null) {
        this.rooms[roomTwo.x + ',' + roomTwo.y] = new Room(roomTwo.x, roomTwo.y)
      }

      this.rooms[roomOne.x + ',' + roomOne.y].linkedTo[roomTwo.x + ',' + roomTwo.y] = roomTwo
      this.rooms[roomTwo.x + ',' + roomTwo.y].linkedTo[roomOne.x + ',' + roomOne.y] = roomOne
    }
  }

  // Add this maze to phaser
  this.addToPhaser = function (phaser) {
    // For every room
    for (var key in this.rooms) {
      var room = this.rooms[key]

      // Work out the key for the Phaser sprite.
      // The key is in this format, for a room open in north and south: roomNS
      var sprite_key = 'room'

      var openNorth = false
      var openEast = false
      var openSouth = false
      var openWest = false

      for (var lkey in room.linkedTo) {
        var linkedRoom = room.linkedTo[lkey]
        if (linkedRoom.x > room.x) openEast = true
        if (linkedRoom.x < room.x) openWest = true
        if (linkedRoom.y < room.y) openNorth = true
        if (linkedRoom.y > room.y) openSouth = true
      }

      if (openNorth) sprite_key += 'N'
      if (openEast) sprite_key += 'E'
      if (openSouth) sprite_key += 'S'
      if (openWest) sprite_key += 'W'

      if (room.x === 5 && room.y === 5) console.log(sprite_key)

      room.sprite = phaser.add.sprite((room.x * 7) - 3, (room.y * 7) - 3, sprite_key)
      room.sprite.smoothed = false
    }
    for (var opt in opts) console.log(opt)
  }
}

// Represents a room
function Room (x, y) {
  // Other Rooms this is linked to
  this.linkedTo = {}
  this.sprite = null
  this.x = x
  this.y = y
}

module.exports.Maze = Maze
