/*globals requirejs*/

requirejs.config({
    'paths': {
        'facade': '../libs/facade.min',
        'facadejs-Box2D': '../libs/facadejs-Box2D',
        'game': '../libs/game',
        'gamepad': '../libs/gamepad.min',
        'jquery': '../libs/jquery.min',
        'box2dweb': '../libs/box2dweb.min',
        'buzz': '../libs/buzz.min',
        'randomColor': '../libs/randomColor'
    },
    'shim': {
        'box2dweb': {
            'exports': 'Box2D'
        }
    }
});

define(function (require) {

    'use strict';

    var Facade = require('facade'),
        Game = require('game'),
        buzz = require('buzz'),
        titleScene = require('js/title.js'),
        // gameScene = require('js/game.js'),
        app = new Game(new Facade('stage', 1400, 750)),
        backgroundLoop = new buzz.sound('audio/loop', { formats: [ 'ogg' ] });

    backgroundLoop.fadeIn().loop();

    app.stage.draw(app.callback.bind(app, app.stage));

    // app.stage.resizeForHDPI();

    app.pushScene(titleScene);
    // app.pushScene(gameScene);

    document.body.appendChild(app.stage.canvas);

});
