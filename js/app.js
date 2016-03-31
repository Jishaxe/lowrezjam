var $ = require('jquery')

$(document).ready(function () {
  window.app = new App('#game-container')
  window.app.start()
})

// Main app class
function App (gameContainer) {
  this.gameContainer = gameContainer

  // Start game
  this.start = function () {
    // Assign resize handler and trigger it once.
    // Keeps the game container in proportion!
    $(window).resize(this.onResize)
    this.onResize()

    // Fade in the game
    $('#container').css('opacity', 1)
  }

  // Gamecontainer resize handler
  this.onResize = function (stuff) {
    // Resize with a ratio of 1:1
    $(gameContainer).height($(gameContainer).width())
  }
}

module.exports = App
