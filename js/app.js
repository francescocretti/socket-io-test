const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

var oscillator;
var gain;

var username;

const cleanInput = (input) => {
  return $('<div/>').text(input).html();
}

$(function() {
  var socket = io();

  $('form').submit(function(e) {
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

  $(window).keydown(event => {
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if ($('#usernameIn').is(':focus')) {
        username = $('#usernameIn').val();
        if (username) {
          socket.emit('add user', username);
          initApp(socket);
        }
        console.log(username);
        $('#usernameForm').hide();
      }
    }
  });
});

function initOscillator(ctx) {
  var osc = ctx.createOscillator();
  gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  osc.type = 'square';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  // osc.gain.setValueAtTime(0, ctx.currentTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  return osc;
}

function playSoundSignal(freq) {
  console.log('playing sound at ' + freq);
  oscillator.frequency.setTargetAtTime(freq, audioContext.currentTime, 1);
  gain.gain.setValueAtTime(1, audioContext.currentTime);
}

function initApp(socket) {
  // socket listeners
  socket.on('chat message', function(msg) {
    $('#messages').append($('<li>').text(msg));
  });

  socket.on('play sound', function(baseFreq) {
    var intervals = [0, 2, 4, 5, 7, 9, 11];
    var i = intervals[Math.floor(Math.random() * intervals.length)];
    var freq = baseFreq * Math.pow(Math.pow(2, i), 1/12);
    playSoundSignal(freq);
  });

  // postiion
  function success(pos) {
    console.log(pos);
    var crd = {};
    crd.lat = pos.coords.latitude;
    crd.lng = pos.coords.longitude;
    crd.acc = pos.coords.accuracy;
    socket.emit('new pos', crd);
  }
  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  }

  options = {
    enableHighAccuracy: false,
    timeout: 1000,
    maximumAge: 0
  };

  id = navigator.geolocation.watchPosition(success, error, options);
  // audio
  oscillator = initOscillator(audioContext);
  audioContext.resume().then(() => {
    console.log('Playback resumed successfully');
  });
}
