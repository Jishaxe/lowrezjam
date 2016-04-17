/* globals Phaser */

function CreditsScreen () {
  this.credits = null

  this.addToPhaser = function (phaser) {
    this.credits = phaser.add.bitmapText(2, 50, 'pixel',
    'Credits\n\nmade with\n\nlove by\n\njshxe\n\nand\n\nlolly\n\nthanks for\n\ncleaning\n\nthe\n\npetals', 8)

    phaser.physics.enable(this.credits, Phaser.Physics.ARCADE)
  }

  this.onKey = function (phaser, keys) {
    if (keys.space.isDown) {
      this.credits.body.velocity.y = -50
    } else {
      this.credits.body.velocity.y = 0
    }
  }
}

module.exports = CreditsScreen
