(function ($) {

  function core(id, preset, options) {
    var canvas = $(id)[0];
    var ctx = canvas.getContext('2d');
    var bound = canvas.height;
    var safepad = 0;
    if (preset.hasShadow) {
      safepad = preset.shadowBlur;
    }
    var radius = canvas.height / 2 - safepad;
    var secondStep = 2 * Math.PI / 60;
    var hourStep = 2 * Math.PI / 12;

    var initialize = function () {
      $(canvas).css('max-width', '100%');
      $(canvas).css('width', $(canvas).css('height'));
      canvas.width = canvas.height;
      if (preset.hasShadow) {
        ctx.shadowOffsetX = 0.0;
        ctx.shadowOffsetY = 0.0;
        ctx.shadowBlur = preset.shadowBlur;
        ctx.shadowColor = preset.shadowColor;
      }

      draw();
    };


    var p2v = function (value) {
      return value / 100.0 * radius;
    };


    var drawMajorLines = function () {
      ctx.lineWidth = p2v(preset.majorTicksLength);
      ctx.strokeStyle = preset.majorTicksColor;

      for (var i = 1; i <= 12; i++) {
        ctx.beginPath();
        ctx.arc(radius + safepad, radius + safepad, radius - ctx.lineWidth / 2, i * hourStep - p2v(preset.majorTicksWidth) / 2, i * hourStep + p2v(preset.majorTicksWidth) / 2);
        ctx.stroke();
      }
    };


    var drawMinorLines = function () {
      ctx.lineWidth = p2v(preset.minorTicksLength);
      ctx.strokeStyle = preset.minorTicksColor;

      for (var i = 1; i <= 60; i++) {
        ctx.beginPath();
        ctx.arc(radius + safepad, radius + safepad, radius - ctx.lineWidth / 2, i * secondStep - p2v(preset.minorTicksWidth) / 2, i * secondStep + p2v(preset.minorTicksWidth) / 2);
        ctx.stroke();
      }
    };


    var drawBorder = function () {
      ctx.strokeStyle = preset.borderColor;
      ctx.lineWidth = p2v(preset.borderWidth);
      ctx.beginPath();
      ctx.arc(radius + safepad, radius + safepad, radius - ctx.lineWidth / 2, 0.0, 2 * Math.PI);
      ctx.stroke();
    };


    var drawFill = function () {
      ctx.fillStyle = preset.fillColor;
      ctx.lineWidth = p2v(preset.borderWidth);
      ctx.beginPath();
      ctx.arc(radius + safepad, radius + safepad, radius - ctx.lineWidth, 0.0, 2 * Math.PI);
      ctx.fill();
    };


    var drawHandle = function (angle, lengthPercent, widthPercent, color) {
      var x = angle - Math.PI / 2;
      x = Math.cos(x) * p2v(lengthPercent);
      var x_1 = angle - Math.PI / 2;
      var y = Math.sin(x_1) * p2v(lengthPercent);
      ctx.lineWidth = p2v(widthPercent);
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(radius + safepad, radius + safepad);
      ctx.lineTo(radius + safepad + x, radius + safepad + y);
      ctx.stroke();
    };


    var drawTexts = function () {
      for (var i = 1; i <= 12; i++) {
        var angle = i * hourStep;
        var x = angle - Math.PI / 2;
        x = Math.cos(x) * p2v(80.0);
        var x_1 = angle - Math.PI / 2;
        var y = Math.sin(x_1) * p2v(80.0);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = p2v(preset.fontSize).toString() + 'px ' + preset.fontName;
        ctx.fillStyle = preset.fontColor;
        ctx.beginPath();
        ctx.fillText(i.toString(), radius + safepad + x, radius + safepad + y);
        ctx.stroke();
      }
    };


    var drawPin = function () {
      ctx.fillStyle = preset.pinColor;
      ctx.beginPath();
      ctx.arc(radius + safepad, radius + safepad, p2v(preset.pinRadius), 0.0, 2 * Math.PI);
      ctx.fill();
    };


    var changeTimezone = function (date, ianatz) {
      var invdate = new Date(date.toLocaleString('en-US', {timeZone: ianatz}));
      var diff = date.getTime() - invdate.getTime();
      return new Date(date.getTime() - diff);
    };


    var draw = function () {
      ctx.clearRect(0.0, 0.0, bound, bound);
      ctx.lineCap = 'butt';

      if (preset.drawFill) {
        drawFill();
      }

      if (preset.drawMinorTicks) {
        drawMinorLines();
      }

      if (preset.drawMajorTicks) {
        drawMajorLines();
      }

      if (preset.drawBorder) {
        drawBorder();
      }

      if (preset.drawTexts) {
        drawTexts();
      }

      var date = new Date();
      if (options.timezone) {
        date = changeTimezone(date, options.timezone);
      }

      var s = date.getSeconds();
      var m = date.getMinutes();
      var h = date.getHours();
      m += s / 60.0;
      h += m / 60.0;
      ctx.lineCap = 'round';
      drawHandle(h * hourStep, preset.hourHandLength, preset.hourHandWidth, preset.hourHandColor);
      drawHandle(m * secondStep, preset.minuteHandLength, preset.minuteHandWidth, preset.minuteHandColor);
      if (preset.drawSecondHand) {
        drawHandle(s * secondStep, preset.secondHandLength, preset.secondHandWidth, preset.secondHandColor);
      }

      if (preset.drawPin) {
        drawPin();
      }

      window.requestAnimationFrame(function () {
        draw(this);
      });
    };


    initialize();
  }


  $.fn.htAnalogClock = function (preset, options) {
    return this.each(function () {
      var _preset = $.extend({}, htAnalogClock.preset_default, preset || {});
      var _options = $.extend({}, $.fn.htAnalogClock.defaultOptions, options || {});
      core(this, _preset, _options);
    });
  };


  $.fn.htAnalogClock.defaultOptions = {
    timezone: null
  };

}(jQuery));


function htAnalogClock() {}
htAnalogClock.preset_default = {
  hasShadow: true,
  shadowColor: "#000",
  shadowBlur: 10,

  drawSecondHand: true,
  drawMajorTicks: true,
  drawMinorTicks: true,
  drawBorder: true,
  drawFill: true,
  drawTexts: true,
  drawPin: true,

  majorTicksColor: "#f88",
  minorTicksColor: "#fa0",

  majorTicksLength: 10.0,
  minorTicksLength: 7.0,
  majorTicksWidth: 0.005,
  minorTicksWidth: 0.0025,

  fillColor: "#333",
  pinColor: "#f88",
  pinRadius: 5.0,

  borderColor: "#000",
  borderWidth: 2.0,

  secondHandColor: "#f00",
  minuteHandColor: "#fff",
  hourHandColor: "#fff",

  fontColor: "#fff",
  fontName: "Tahoma",
  fontSize: 10.0,

  secondHandLength: 90.0,
  minuteHandLength: 70.0,
  hourHandLength: 50.0,

  secondHandWidth: 1.0,
  minuteHandWidth: 2.0,
  hourHandWidth: 3.0
};


htAnalogClock.preset_gray_fantastic = {
  minorTicksLength: 100.0,
  minorTicksColor: "rgba(255, 255, 255, 0.2)",
  majorTicksLength: 100.0,
  majorTicksColor: "rgba(255, 255, 255, 0.6)",
  pinColor: "#aaa",
  pinRadius: 5.0,
  hourHandColor: "#fff",
  hourHandWidth: 5.0,
  minuteHandColor: "#eee",
  minuteHandWidth: 3.0,
  secondHandLength: 95.0
};


htAnalogClock.preset_black_bolded = {
  drawBorder: false,
  majorTicksColor: "rgba(255, 150, 150, 0.8)",
  majorTicksWidth: 0.05,
  drawMinorTicks: false,
  fillColor: "#000"
};


htAnalogClock.preset_white_nice = {
  fillColor: "#fff",
  hourHandColor: "#000",
  minuteHandColor: "#000",
  fontColor: "#333",
  majorTicksColor: "#222",
  minorTicksColor: "#555"
};


htAnalogClock.preset_ocean_blue = {
  fillColor: "#4460cb",
  hourHandColor: "#fff",
  minuteHandColor: "#fff",
  fontColor: "#ddd",
  majorTicksColor: "#bbb",
  minorTicksColor: "#aaa",
  fontName: "Sahel FD",
  fontSize: 15.0,
  secondHandColor: "#f80"
};


htAnalogClock.preset_nice_bolded = {
  secondHandWidth: 5.0,
  hourHandWidth: 10.0,
  minuteHandWidth: 7.0,
  pinRadius: 10.0,
  pinColor: "#fff",
  fillColor: "#444",
  drawTexts: false,
  majorTicksWidth: 0.07,
  minorTicksWidth: 0.03,
  majorTicksLength: 50.0,
  minorTicksLength: 25.0,
  majorTicksColor: "rgba(255, 150, 0, 0.6)",
  minorTicksColor: "rgba(0, 150, 250, 0.5)"
};

htAnalogClock.preset_modern_dark = {
  majorTicksLength: 50.0,
  minorTicksLength: 50.0,
  majorTicksWidth: 0.02,
  minorTicksWidth: 0.0075,

  fillColor: "#333",
  pinColor: "#000",
  pinRadius: 90.0,

  borderColor: "transparent",

  secondHandColor: "#0f0",
  minuteHandColor: "#fff",
  hourHandColor: "#fff",

  secondHandLength: 100.0,
  minuteHandLength: 100.0,
  hourHandLength: 97.0,

  secondHandWidth: 5.0,
  minuteHandWidth: 3.0,
  hourHandWidth: 10.0
};
