
Component({
  properties: {
    text: {
      type: String,
      value: "text"
    }
  },

  data: {
    left: 200,
    pace: 2,
    windowWidth: 200,
    length: 20,
    interval: 500
  },

  methods: {
    moveBullet: function() {
      var thisPage = this;
      var timer = setInterval(()=> {
        if(-thisPage.data.left < thisPage.data.length) {
          thisPage.setData({
            left: thisPage.data.left - thisPage.data.pace
          });
          console.log("move left");
        } else {
          clearInterval(timer);
          thisPage.setData({
            left: thisPage.data.windowWidth
          });
          console.log("reset");
          thisPage.moveBullet();
        }
      }, thisPage.data.interval);
    }
  },

  ready() {
    this.moveBullet();
  },
})
